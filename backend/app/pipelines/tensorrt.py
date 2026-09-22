from typing import Any

import cv2
import numpy as np
import tensorrt as trt
import torch

from backend.app.pipelines.base import BasePipeline


class TensorRTPipeline(BasePipeline):
    def __init__(
        self,
        engine_path: str = "yolo11n.engine",
        confidence_threshold: float = 0.10,
        nms_threshold: float = 0.45,
    ):
        self.engine_path = engine_path
        self.confidence_threshold = confidence_threshold
        self.nms_threshold = nms_threshold

        self.input_width = 640
        self.input_height = 640

        self.logger = trt.Logger(
            trt.Logger.WARNING
        )

        self.runtime = trt.Runtime(
            self.logger
        )

        with open(
            self.engine_path,
            "rb",
        ) as engine_file:
            engine_data = engine_file.read()

        self.engine = (
            self.runtime.deserialize_cuda_engine(
                engine_data
            )
        )

        if self.engine is None:
            raise RuntimeError(
                "Failed to load TensorRT engine."
            )

        self.context = (
            self.engine.create_execution_context()
        )

        self.input_name = None
        self.output_name = None

        for index in range(
            self.engine.num_io_tensors
        ):
            name = self.engine.get_tensor_name(
                index
            )

            mode = self.engine.get_tensor_mode(
                name
            )

            if mode == trt.TensorIOMode.INPUT:
                self.input_name = name

            elif mode == trt.TensorIOMode.OUTPUT:
                self.output_name = name

        if self.input_name is None:
            raise RuntimeError(
                "TensorRT input tensor not found."
            )

        if self.output_name is None:
            raise RuntimeError(
                "TensorRT output tensor not found."
            )

        self.cuda_stream = torch.cuda.Stream()

    def _preprocess(
        self,
        frame: Any,
    ) -> tuple[np.ndarray, float, int, int]:

        image = frame

        if hasattr(frame, "to_ndarray"):
            image = frame.to_ndarray(
                format="bgr24"
            )

        original_height, original_width = (
            image.shape[:2]
        )

        scale = min(
            self.input_width / original_width,
            self.input_height / original_height,
        )

        resized_width = int(
            round(original_width * scale)
        )

        resized_height = int(
            round(original_height * scale)
        )

        resized = cv2.resize(
            image,
            (resized_width, resized_height),
            interpolation=cv2.INTER_LINEAR,
        )

        padded = np.full(
            (
                self.input_height,
                self.input_width,
                3,
            ),
            114,
            dtype=np.uint8,
        )

        pad_x = (
            self.input_width - resized_width
        ) // 2

        pad_y = (
            self.input_height - resized_height
        ) // 2

        padded[
            pad_y : pad_y + resized_height,
            pad_x : pad_x + resized_width,
        ] = resized

        padded = cv2.cvtColor(
            padded,
            cv2.COLOR_BGR2RGB,
        )

        padded = (
            padded.astype(np.float32)
            / 255.0
        )

        padded = np.transpose(
            padded,
            (2, 0, 1),
        )

        padded = np.expand_dims(
            padded,
            axis=0,
        )

        return (
            np.ascontiguousarray(padded),
            scale,
            pad_x,
            pad_y,
        )

    def _decode(
        self,
        output: torch.Tensor,
        original_width: int,
        original_height: int,
        scale: float,
        pad_x: int,
        pad_y: int,
    ) -> list[dict[str, Any]]:

        predictions = (
            output[0]
            .detach()
            .cpu()
            .numpy()
            .T
        )

        boxes: list[list[float]] = []
        scores: list[float] = []
        class_ids: list[int] = []

        for prediction in predictions:

            x_center = float(
                prediction[0]
            )

            y_center = float(
                prediction[1]
            )

            width = float(
                prediction[2]
            )

            height = float(
                prediction[3]
            )

            class_scores = prediction[4:]

            class_id = int(
                np.argmax(class_scores)
            )

            confidence = float(
                class_scores[class_id]
            )

            if confidence < self.confidence_threshold:
                continue

            # Convert xywh to xyxy in
            # letterboxed 640x640 coordinates.
            x1 = (
                x_center - width / 2
            )

            y1 = (
                y_center - height / 2
            )

            x2 = (
                x_center + width / 2
            )

            y2 = (
                y_center + height / 2
            )

            # Remove letterbox padding.
            x1 -= pad_x
            y1 -= pad_y
            x2 -= pad_x
            y2 -= pad_y

            # Convert to original frame coordinates.
            x1 /= scale
            y1 /= scale
            x2 /= scale
            y2 /= scale

            x1 = max(
                0.0,
                min(
                    float(original_width),
                    x1,
                ),
            )

            y1 = max(
                0.0,
                min(
                    float(original_height),
                    y1,
                ),
            )

            x2 = max(
                0.0,
                min(
                    float(original_width),
                    x2,
                ),
            )

            y2 = max(
                0.0,
                min(
                    float(original_height),
                    y2,
                ),
            )

            boxes.append(
                [
                    x1,
                    y1,
                    x2 - x1,
                    y2 - y1,
                ]
            )

            scores.append(confidence)
            class_ids.append(class_id)

        if not boxes:
            return []

        # Apply NMS separately for each class.
        detections: list[dict[str, Any]] = []

        unique_classes = sorted(
            set(class_ids)
        )

        for class_id in unique_classes:

            class_indices = [
                index
                for index, value in enumerate(
                    class_ids
                )
                if value == class_id
            ]

            class_boxes = [
                boxes[index]
                for index in class_indices
            ]

            class_scores = [
                scores[index]
                for index in class_indices
            ]

            kept = cv2.dnn.NMSBoxes(
                class_boxes,
                class_scores,
                self.confidence_threshold,
                self.nms_threshold,
            )

            if len(kept) == 0:
                continue

            for kept_index in kept:

                local_index = int(
                    kept_index
                )

                original_index = (
                    class_indices[local_index]
                )

                x, y, width, height = boxes[
                    original_index
                ]

                detections.append(
                    {
                        "class_id": class_id,
                        "confidence": scores[
                            original_index
                        ],
                        "bbox": [
                            float(x),
                            float(y),
                            float(x + width),
                            float(y + height),
                        ],
                    }
                )

        detections.sort(
            key=lambda detection: detection[
                "confidence"
            ],
            reverse=True,
        )

        return detections

    async def process(
        self,
        frame: Any,
    ) -> Any:

        if hasattr(frame, "to_ndarray"):
            original = frame.to_ndarray(
                format="bgr24"
            )
        else:
            original = frame

        original_height, original_width = (
            original.shape[:2]
        )

        (
            input_data,
            scale,
            pad_x,
            pad_y,
        ) = self._preprocess(
            original
        )

        with torch.cuda.stream(
            self.cuda_stream
        ):
            input_tensor = (
                torch.from_numpy(
                    input_data
                ).cuda()
            )

            self.context.set_input_shape(
                self.input_name,
                input_tensor.shape,
            )

            output_shape = (
                self.context.get_tensor_shape(
                    self.output_name
                )
            )

            output_tensor = torch.empty(
                tuple(output_shape),
                dtype=torch.float32,
                device="cuda",
            )

            self.context.set_tensor_address(
                self.input_name,
                input_tensor.data_ptr(),
            )

            self.context.set_tensor_address(
                self.output_name,
                output_tensor.data_ptr(),
            )

            success = (
                self.context.execute_async_v3(
                    self.cuda_stream.cuda_stream
                )
            )

        self.cuda_stream.synchronize()

        if not success:
            raise RuntimeError(
                "TensorRT inference failed."
            )

        detections = self._decode(
            output_tensor,
            original_width,
            original_height,
            scale,
            pad_x,
            pad_y,
        )

        return {
            "detections": detections,
            "frame_width": original_width,
            "frame_height": original_height,
        }
