import asyncio
import fractions
import time
import cupy as cp
from aiortc import MediaStreamTrack, RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaRelay
from av import VideoFrame
import logging

logger = logging.getLogger("WebRTCStreamer")


class GPUVideoTrack(MediaStreamTrack):
    kind = "video"

    def __init__(self, fps: int = 60, width: int = 3840, height: int = 2160):
        super().__init__()
        self.fps = fps
        self.width = width
        self.height = height
        self._queue = asyncio.Queue(maxsize=2)
        self._start_time = None
        self._frame_count = 0

    async def put_gpu_frame(self, gpu_frame: cp.ndarray):
        """Put frame into track queue, dropping oldest if pipeline runs faster than network."""
        if self._queue.full():
            try:
                self._queue.get_nowait()
            except asyncio.QueueEmpty:
                pass
        await self._queue.put(gpu_frame)

    async def recv(self):
        gpu_frame = await self._queue.get()

        # Wrap GPU buffer into an AV VideoFrame for hardware encoder (NVENC)
        # In full production NVENC integration, this passes the dma_buf / cudaArray directly
        frame = VideoFrame.from_ndarray(gpu_frame.get(), format="bgr24")
        
        pts, time_base = await self.next_timestamp()
        frame.pts = pts
        frame.time_base = time_base
        return frame

    async def next_timestamp(self):
        if self._start_time is None:
            self._start_time = time.time()
        pts = int((time.time() - self._start_time) * 90000)
        time_base = fractions.Fraction(1, 90000)
        return pts, time_base


class WebRTCManager:
    def __init__(self):
        self.pcs = set()
        self.tracks = {}

    def get_or_create_track(self, camera_id: str) -> GPUVideoTrack:
        if camera_id not in self.tracks:
            self.tracks[camera_id] = GPUVideoTrack()
        return self.tracks[camera_id]

    async def handle_offer(self, camera_id: str, sdp: str, sdp_type: str) -> dict:
        pc = RTCPeerConnection()
        self.pcs.add(pc)

        track = self.get_or_create_track(camera_id)
        pc.addTrack(track)

        @pc.on("connectionstatechange")
        async def on_connectionstatechange():
            logger.info(f"PeerConnection for {camera_id} state: {pc.connectionState}")
            if pc.connectionState in ["failed", "closed"]:
                await pc.close()
                self.pcs.discard(pc)

        offer = RTCSessionDescription(sdp=sdp, type=sdp_type)
        await pc.setRemoteDescription(offer)
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        return {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
