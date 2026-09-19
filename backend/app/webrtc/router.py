from pathlib import Path

from aiortc import RTCPeerConnection, RTCSessionDescription
from fastapi import APIRouter
from pydantic import BaseModel

from backend.app.webrtc.video_track import FileVideoTrack


router = APIRouter(
    prefix="/api/v1/webrtc",
    tags=["WebRTC"],
)


VIDEO_PATH = (
    Path(__file__).resolve().parents[3]
    / "data"
    / "videos"
    / "test.mp4"
)


class OfferRequest(BaseModel):
    sdp: str
    type: str


@router.post("/offer")
async def create_offer(offer: OfferRequest):
    peer_connection = RTCPeerConnection()

    video_track = FileVideoTrack(
        str(VIDEO_PATH)
    )

    peer_connection.addTrack(video_track)

    await peer_connection.setRemoteDescription(
        RTCSessionDescription(
            sdp=offer.sdp,
            type=offer.type,
        )
    )

    @peer_connection.on("connectionstatechange")
    async def on_connectionstatechange():
        if peer_connection.connectionState in {
            "failed",
            "closed",
        }:
            video_track.stop()
            await peer_connection.close()

    answer = await peer_connection.createAnswer(
        
    )

    await peer_connection.setLocalDescription(answer)

    return {
        "sdp": peer_connection.localDescription.sdp,
        "type": peer_connection.localDescription.type,
    }