from collections.abc import AsyncGenerator
from pathlib import Path
from typing import Any

import av


class VideoSource:
    def __init__(self, source: str):
        self.source = source

    async def frames(self) -> AsyncGenerator[Any, None]:
        """
        Open the video source and yield decoded video frames.
        """

        source_path = Path(self.source)

        if not source_path.exists():
            raise FileNotFoundError(
                f"Video source not found: {self.source}"
            )

        container = av.open(self.source)

        try:
            for frame in container.decode(video=0):
                yield frame

        finally:
            container.close()