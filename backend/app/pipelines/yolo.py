import asyncio
from typing import Any

from ultralytics import YOLO

from backend.app.pipelines.base import BasePipeline


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

        return results[0]