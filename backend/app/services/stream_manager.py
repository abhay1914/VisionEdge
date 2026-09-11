import asyncio
from typing import Any
from uuid import UUID, uuid4

from backend.app.schemas.stream import StreamCreate, StreamStatus
from backend.app.services.metrics import StreamMetrics


class StreamManager:
    def __init__(self):
        self.streams: dict[UUID, dict[str, Any]] = {}
        self.tasks: dict[UUID, asyncio.Task] = {}
        self.metrics: dict[UUID, StreamMetrics] = {}

    async def create_stream(self, stream: StreamCreate) -> dict[str, Any]:
        stream_id = uuid4()

        stream_data = {
            "id": stream_id,
            "name": stream.name,
            "url": stream.url,
            "status": StreamStatus.CREATED,
        }

        self.streams[stream_id] = stream_data
        self.metrics[stream_id] = StreamMetrics()

        return stream_data

    async def list_streams(self) -> list[dict[str, Any]]:
        return list(self.streams.values())

    async def get_stream(self, stream_id: UUID) -> dict[str, Any] | None:
        return self.streams.get(stream_id)

    async def start_stream(self, stream_id: UUID) -> dict[str, Any] | None:
        stream = self.streams.get(stream_id)

        if stream is None:
            return None

        if stream["status"] == StreamStatus.RUNNING:
            return stream

        stream["status"] = StreamStatus.STARTING

        metrics = self.metrics.get(stream_id)

        if metrics is not None:
            metrics.start()

        task = asyncio.create_task(
            self._process_stream(stream_id)
        )

        self.tasks[stream_id] = task

        return stream

    async def stop_stream(self, stream_id: UUID) -> dict[str, Any] | None:
        stream = self.streams.get(stream_id)

        if stream is None:
            return None

        stream["status"] = StreamStatus.STOPPING

        task = self.tasks.get(stream_id)

        if task and not task.done():
            task.cancel()

            try:
                await task
            except asyncio.CancelledError:
                pass

        self.tasks.pop(stream_id, None)

        stream["status"] = StreamStatus.STOPPED

        return stream

    async def _process_stream(self, stream_id: UUID) -> None:
        stream = self.streams.get(stream_id)
        metrics = self.metrics.get(stream_id)

        if stream is None or metrics is None:
            return

        try:
            stream["status"] = StreamStatus.RUNNING

            while True:
                await asyncio.sleep(1)
                metrics.record_frame()

        except asyncio.CancelledError:
            raise

        except Exception:
            metrics.record_error()
            stream["status"] = StreamStatus.ERROR