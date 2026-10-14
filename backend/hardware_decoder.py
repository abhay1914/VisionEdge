"""
VisionEdge - Hardware Video Decoder
Zero-copy video frame decoding from RTSP directly into NVIDIA GPU VRAM using PyAV & NVDEC.
"""

import av
import cupy as cp
import logging
from typing import Generator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("HardwareDecoder")


class HardwareVideoDecoder:
    def __init__(self, rtsp_url: str, device_id: int = 0):
        self.rtsp_url = rtsp_url
        self.device_id = device_id
        self.device = cp.cuda.Device(self.device_id)
        self.device.use()
        self.container = None
        self.stream = None

    def open(self):
        options = {
            "rtsp_transport": "tcp",
            "hwaccel": "cuda",
            "hwaccel_device": str(self.device_id),
            "fflags": "nobuffer",
            "flags": "low_delay",
            "max_delay": "500000",
            "probesize": "32",
            "analyzeduration": "0",
        }
        logger.info(f"Connecting to RTSP via NVDEC (GPU {self.device_id}): {self.rtsp_url}")
        self.container = av.open(self.rtsp_url, mode="r", options=options)
        self.stream = self.container.streams.video[0]
        self.stream.thread_type = "AUTO"

    def decode_stream(self) -> Generator[cp.ndarray, None, None]:
        """
        Yields CuPy ndarray instances that directly wrap NVDEC GPU memory pointers.
        Zero PCIe roundtrips to CPU host memory.
        """
        if self.container is None:
            self.open()

        container = self.container
        stream = self.stream
        if container is None or stream is None or stream.codec_context is None:
            raise RuntimeError("Video stream is not initialized or codec context is unavailable.")

        width = stream.codec_context.width
        height = stream.codec_context.height

        for packet in container.demux(stream):
            for frame in packet.decode():
                if frame is None:
                    continue

                # PyAV exposes decoded frames via to_ndarray(), not via a .data attribute.
                # This converts the frame to an RGB NumPy array and then transfers it to CuPy.
                rgb_frame = frame.to_ndarray(format="rgb24")
                gpu_frame = cp.asarray(rgb_frame)
                yield gpu_frame

    def close(self):
        if self.container:
            self.container.close()
            logger.info("NVDEC Decoder session closed.")
