from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


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
    status: str


class StreamStatusResponse(BaseModel):
    id: UUID
    name: str
    status: str