from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from backend.app.schemas.stream import (
    StreamCreate,
    StreamMetricsResponse,
    StreamResponse,
    StreamStatusResponse,
)
from backend.app.services.stream_manager import StreamManager


router = APIRouter(
    prefix="/api/v1/streams",
    tags=["Streams"],
)


stream_manager = StreamManager()


@router.post(
    "/",
    response_model=StreamResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_stream(stream: StreamCreate):
    """Create a new video stream."""
    return await stream_manager.create_stream(stream)


@router.get(
    "/",
    response_model=list[StreamResponse],
)
async def list_streams():
    """Return all registered streams."""
    return await stream_manager.list_streams()


@router.get(
    "/{stream_id}",
    response_model=StreamResponse,
)
async def get_stream(stream_id: UUID):
    stream = await stream_manager.get_stream(stream_id)

    if stream is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stream not found",
        )

    return stream


@router.get(
    "/{stream_id}/metrics",
    response_model=StreamMetricsResponse,
)
async def get_stream_metrics(stream_id: UUID):
    """Return runtime metrics for a stream."""

    metrics = await stream_manager.get_metrics(stream_id)

    if metrics is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stream metrics not found",
        )

    return metrics


@router.post(
    "/{stream_id}/start",
    response_model=StreamStatusResponse,
)
async def start_stream(stream_id: UUID):
    """Start asynchronous processing for a stream."""

    stream = await stream_manager.start_stream(stream_id)

    if stream is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stream not found",
        )

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
    """Stop asynchronous processing for a stream."""

    stream = await stream_manager.stop_stream(stream_id)

    if stream is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stream not found",
        )

    return {
        "id": stream["id"],
        "name": stream["name"],
        "status": stream["status"],
    }