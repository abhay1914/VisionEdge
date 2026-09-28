import asyncio
from typing import Any

from ultralytics import YOLO

from backend.app.pipelines.base import BasePipeline
from backend.app.services.yolo_classes import get_class_name

class YOLOPipeline(BasePipeline):
    def __init__(
        self,
        model_path: str = "yolo11n.pt",
    ):
        self.model = YOLO(model_path)

    async def process(
        self,
        frame: Any,
    ) -> Any:
        image = frame.to_ndarray(format="bgr24")

        results = await asyncio.to_thread(
            self.model,
            image,
            conf=0.10,
            verbose=False,
        )

        result = results[0]

        detections = []

        for box in result.boxes:
            class_id = int(box.cls.item())
            confidence = float(box.conf.item())

            x1, y1, x2, y2 = box.xyxy[0].tolist()

            detections.append(
                {
                    "class_id": class_id,
                    "class_name": get_class_name(class_id),
                    "confidence": confidence,
                    "bbox": [
                        float(x1),
                        float(y1),
                        float(x2),
                        float(y2),
                    ],
                }
            )

        return {
            "detections": detections,
            "frame_width": image.shape[1],
            "frame_height": image.shape[0],
        }