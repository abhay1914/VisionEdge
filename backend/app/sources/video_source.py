import asyncio
from collections.abc import AsyncGenerator
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import av


class VideoSource:
    def __init__(self, source: str):
        self.source = source
        self.fps = 0.0

    def _is_network_source(self) -> bool:
        parsed = urlparse(self.source)

        return parsed.scheme in {
            "rtsp",
            "rtmp",
            "http",
            "https",
        }

    async def frames(
        self,
        realtime: bool = True,
    ) -> AsyncGenerator[Any, None]:

        if not self._is_network_source():
            source_path = Path(self.source)

            if not source_path.exists():
                raise FileNotFoundError(
                    f"Video source not found: {self.source}"
                )

        container = av.open(self.source)

        try:
            video_stream = container.streams.video[0]

            fps = float(video_stream.average_rate)
            self.fps = fps

            if fps <= 0:
                fps = 30.0

            frame_interval = 1 / fps

            for frame in container.decode(video=0):
                yield frame

                if realtime:
                    await asyncio.sleep(frame_interval)

        finally:
            container.close()