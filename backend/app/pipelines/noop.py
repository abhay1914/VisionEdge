from typing import Any

from backend.app.pipelines.base import BasePipeline


class NoOpPipeline(BasePipeline):
    async def process(
        self,
        frame: Any,
    ) -> Any:
        return frame