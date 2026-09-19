from pathlib import Path

import av
from aiortc import VideoStreamTrack
from av import VideoFrame


class FileVideoTrack(VideoStreamTrack):
    """
    WebRTC video track that streams frames from a local video file.
    """

    kind = "video"

    def __init__(self, video_path: str):
        super().__init__()

        self.video_path = Path(video_path)

        if not self.video_path.exists():
            raise FileNotFoundError(
                f"Video file not found: {self.video_path}"
            )

        self.container = av.open(str(self.video_path))
        self.stream = self.container.streams.video[0]
        self.frame_iterator = self.container.decode(video=0)

    async def recv(self) -> VideoFrame:
        """
        Return the next video frame to WebRTC.
        """

        try:
            frame = next(self.frame_iterator)

        except StopIteration:
            self.container.close()
            self.container = None
            self.stop()

            raise

        pts, time_base = await self.next_timestamp()

        frame.pts = pts
        frame.time_base = time_base

        return frame

    def stop(self) -> None:
        """
        Stop the track and close the video container.
        """

        if self.container is not None:
            self.container.close()
            self.container = None

        super().stop()