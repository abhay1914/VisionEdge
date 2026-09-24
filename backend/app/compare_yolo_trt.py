import asyncio

import av
import numpy as np
import torch
from ultralytics import YOLO

from backend.app.pipelines.tensorrt import TensorRTPipeline


VIDEO_PATH = "data/videos/video.mp4"


async def main():
    print("Reading first video frame...")

    container = av.open(VIDEO_PATH)

    try:
        frame = next(container.decode(video=0))
    finally:
        container.close()

    image = frame.to_ndarray(format="bgr24")

    print("Frame:", image.shape)

    # -----------------------------
    # Ultralytics YOLO
    # -----------------------------
    print()
    print("Running Ultralytics YOLO...")

    model = YOLO("yolo11n.pt")

    results = model.predict(
        source=image,
        device=0,
        imgsz=640,
        conf=0.01,
        verbose=False,
    )

    result = results[0]

    print("Ultralytics detections:", len(result.boxes))

    for box in result.boxes[:10]:
        print(
            "YOLO:",
            {
                "class_id": int(box.cls.item()),
                "confidence": float(box.conf.item()),
                "bbox": box.xyxy[0].tolist(),
            }
        )

    # -----------------------------
    # TensorRT
    # -----------------------------
    print()
    print("Running TensorRT...")

    pipeline = TensorRTPipeline(
        engine_path="yolo11n.engine",
        confidence_threshold=0.01,
    )

    trt_result = await pipeline.process(frame)

    print("TensorRT detections:", len(trt_result["detections"]))

    for detection in trt_result["detections"][:10]:
        print(
            "TRT:",
            detection
        )

    print()
    print("CUDA available:", torch.cuda.is_available())
    print(
        "GPU:",
        torch.cuda.get_device_name(0)
    )


if __name__ == "__main__":
    asyncio.run(main())