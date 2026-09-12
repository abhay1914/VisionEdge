from abc import ABC, abstractmethod
from typing import Any


class BasePipeline(ABC):
    @abstractmethod
    async def process(
        self,
        frame: Any,
    ) -> Any:
        """Process a single video frame."""
        raise NotImplementedError