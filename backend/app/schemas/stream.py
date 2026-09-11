from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field


class StreamStatus(str, Enum):
    CREATED = "created"
    STARTING = "starting"
    RUNNING = "running"
    STOPPING = "stopping"
    STOPPED = "stopped"
    ERROR = "error"


class StreamCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Name of the video stream",
    )

    url: str = Field(
        ...,
        min_length=5,
        description="RTSP or video stream URL",
    )


class StreamResponse(BaseModel):
    id: UUID
    name: str
    url: str
    status: StreamStatus


class StreamStatusResponse(BaseModel):
    id: UUID
    name: str
    status: StreamStatus