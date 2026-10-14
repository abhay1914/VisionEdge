import tensorrt as trt
import cupy as cp
import logging
from typing import Dict, List, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TensorRTEngine")


class TensorRTInferenceEngine:
    def __init__(self, engine_path: str, device_id: int = 0):
        self.engine_path = engine_path
        self.device_id = device_id
        self.device = cp.cuda.Device(self.device_id)
        self.device.use()

        logger_cls = getattr(trt, "Logger", None)
        if logger_cls is None:
            class _FallbackLogger:
                WARNING = 0

                def __init__(self, severity: int = 0):
                    self.severity = severity

                def log(self, *args, **kwargs):
                    return None

            logger_cls = _FallbackLogger

        self.logger = logger_cls(getattr(logger_cls, "WARNING", 0))

        runtime_cls = getattr(trt, "Runtime", None)
        if runtime_cls is None:
            raise RuntimeError(
                "TensorRT Runtime API is unavailable in this environment. "
                "Verify the installed TensorRT Python bindings match the engine version."
            )

        self.runtime = runtime_cls(self.logger)

        logger.info(f"Deserializing TensorRT Engine: {self.engine_path}")
        with open(self.engine_path, "rb") as f:
            self.engine = self.runtime.deserialize_cuda_engine(f.read())

        self.context = self.engine.create_execution_context()
        self.cuda_stream = cp.cuda.Stream(non_blocking=True)

        self.bindings: Dict[str, cp.ndarray] = {}
        self.input_names: List[str] = []
        self.output_names: List[str] = []

        self._allocate_io_buffers()

    def _allocate_io_buffers(self):
        """Pre-allocate static CuPy device buffers to eliminate runtime allocation overhead."""
        for i in range(self.engine.num_io_tensors):
            tensor_name = self.engine.get_tensor_name(i)
            shape = self.engine.get_tensor_shape(tensor_name)
            dtype = trt.nptype(self.engine.get_tensor_dtype(tensor_name))

            # Allocate in GPU VRAM
            buf = cp.empty(shape, dtype=dtype)
            self.bindings[tensor_name] = buf
            self.context.set_tensor_address(tensor_name, int(buf.data.ptr))

            tensor_mode = self.engine.get_tensor_mode(tensor_name)
            input_mode = getattr(getattr(trt, "TensorIOMode", None), "INPUT", 0)
            if tensor_mode == input_mode:
                self.input_names.append(tensor_name)
            else:
                self.output_names.append(tensor_name)

        logger.info(f"TensorRT Engine initialized. Inputs: {self.input_names}, Outputs: {self.output_names}")

    def infer_async(self, preprocessed_batch: cp.ndarray) -> cp.ndarray:
        """
        Executes asynchronous inference directly within VRAM on a non-blocking CUDA stream.
        """
        in_name = self.input_names[0]
        out_name = self.output_names[0]

        # Copy inside VRAM to binding buffer (GPU-to-GPU, sub-microsecond)
        cp.copyto(self.bindings[in_name], preprocessed_batch)

        # Enqueue inference kernel without blocking Python GIL
        self.context.execute_async_v3(self.cuda_stream.ptr)

        return self.bindings[out_name]

    def synchronize(self):
        self.cuda_stream.synchronize()
