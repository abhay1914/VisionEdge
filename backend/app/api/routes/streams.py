from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, status

from backend.app.schemas.stream import (
    StreamCreate,
    StreamResponse,
    StreamStatusResponse,
)


router = APIRouter(
    prefix="/api/v1/streams",
    tags=["Streams"],
)


streams = {}


@router.post(
    "/",
    response_model=StreamResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_stream(stream: StreamCreate):
    stream_id = uuid4()

    stream_data = {
        "id": stream_id,
        "name": stream.name,
        "url": stream.url,
        "status": "stopped",
    }

    streams[stream_id] = stream_data

    return stream_data


@router.get(
    "/",
    response_model=list[StreamResponse],
)

async def list_streams():
    return list(streams.values())


@router.get(
    "/{stream_id}",
    response_model=StreamResponse,
)
async def get_stream(stream_id: UUID):
    stream = streams.get(stream_id)

    if not stream:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stream not found",
        )

    return stream


@router.post(
    "/{stream_id}/start",
    response_model=StreamStatusResponse,
)
async def start_stream(stream_id: UUID):
    stream = streams.get(stream_id)

    if not stream:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stream not found",
        )

    stream["status"] = "running"

    return {
        "id": stream["id"],
        "name": stream["name"],
        "status": stream["status"],
    }


@router.post(
    "/{stream_id}/stop",
    response_model=StreamStatusResponse,
)
async def stop_stream(stream_id: UUID):
    stream = streams.get(stream_id)

    if not stream:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stream not found",
        )

    stream["status"] = "stopped"

    return {
        "id": stream["id"],
        "name": stream["name"],
        "status": stream["status"],
    }