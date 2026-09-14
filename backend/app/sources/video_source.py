import asyncio
from collections.abc import AsyncGenerator
from pathlib import Path
from typing import Any

import av


class VideoSource:
    def __init__(self, source: str):
        self.source = source

    async def frames(
        self,
        realtime: bool = True,
    ) -> AsyncGenerator[Any, None]:
        """
        Open the video source and yield decoded video frames.

        When realtime is enabled, frames are paced according to
        the source video's frames per second.
        """

        source_path = Path(self.source)

        if not source_path.exists():
            raise FileNotFoundError(
                f"Video source not found: {self.source}"
            )

        container = av.open(self.source)

        try:
            video_stream = container.streams.video[0]

            fps = float(video_stream.average_rate)

            if fps <= 0:
                fps = 30.0

            frame_interval = 1 / fps

            for frame in container.decode(video=0):
                yield frame

                if realtime:
                    await asyncio.sleep(frame_interval)

        finally:
            container.close()