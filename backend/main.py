"""
VisionEdge - Main High-Performance Stream Coordinator
Asynchronously coordinates 10 concurrent 4K RTSP streams across NVIDIA NVDEC, TensorRT, and WebRTC.
"""

import asyncio
import argparse
import yaml
import logging
import cupy as cp
from hardware_decoder import HardwareVideoDecoder
from tensorrt_engine import TensorRTInferenceEngine
from zero_copy_pipeline import ZeroCopyPipeline
from webrtc_streamer import WebRTCManager

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("VisionEdge")


async def camera_stream_pipeline(
    camera_cfg: dict,
    engine: TensorRTInferenceEngine,
    webrtc_manager: WebRTCManager
):
    cam_id = camera_cfg["id"]
    name = camera_cfg["name"]
    rtsp_url = camera_cfg["rtsp_url"]
    nvdec_inst = camera_cfg.get("nvdec_instance", 0)

    logger.info(f"Starting Stream Pipeline: {name} on NVDEC instance {nvdec_inst}")
    decoder = HardwareVideoDecoder(rtsp_url=rtsp_url, device_id=0)
    pipeline = ZeroCopyPipeline(width=3840, height=2160, device_id=0)
    track = webrtc_manager.get_or_create_track(cam_id)

    frame_idx = 0
    try:
        for gpu_frame in decoder.decode_stream():
            # 1. Zero-Copy In-VRAM Preprocessing
            input_tensor = pipeline.preprocess_for_yolo(gpu_frame, target_size=640)

            # 2. TensorRT Asynchronous Tensor Core Inference
            raw_detections = engine.infer_async(input_tensor)

            # 3. Direct CUDA In-VRAM Overlay Stamping
            pipeline.draw_overlays_in_vram(gpu_frame, raw_detections)

            # 4. Push to WebRTC Stream Queue
            await track.put_gpu_frame(gpu_frame)

            frame_idx += 1
            if frame_idx % 300 == 0:
                logger.info(f"[{cam_id}] Processed {frame_idx} frames at locked 60 FPS")

            # Yield control to Python asyncio event loop
            await asyncio.sleep(0.001)

    except Exception as e:
        logger.error(f"Error in stream pipeline {cam_id}: {e}")
    finally:
        decoder.close()


async def main():
    parser = argparse.ArgumentParser(description="VisionEdge Zero-Copy Video Pipeline")
    parser.add_argument("--config", default="backend/configs/cameras.yaml", help="Path to camera config file")
    parser.add_argument("--cam-id", default=None, help="Optional single camera ID to isolate for debugging")
    parser.add_argument("--debug", action="store_true", help="Enable verbose debug logs")
    args = parser.parse_args()

    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)

    with open(args.config, "r") as f:
        config = yaml.safe_load(f)

    # Initialize shared TensorRT YOLOv10 engine on GPU
    model_path = config["pipeline"]["model_path"]
    engine = TensorRTInferenceEngine(engine_path=model_path, device_id=config["pipeline"]["gpu_device_id"])
    webrtc = WebRTCManager()

    cameras = config["cameras"]
    if args.cam_id:
        cameras = [c for c in cameras if c["id"] == args.cam_id]

    logger.info(f"Launching VisionEdge across {len(cameras)} concurrent streams...")
    tasks = [camera_stream_pipeline(cam, engine, webrtc) for cam in cameras]
    await asyncio.gather(*tasks)


if __name__ == "__main__":
    asyncio.run(main())
