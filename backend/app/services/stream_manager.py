import asyncio
from time import perf_counter
from typing import Any
from uuid import UUID, uuid4

from backend.app.pipelines.base import BasePipeline
from backend.app.pipelines.yolo import YOLOPipeline
from backend.app.schemas.stream import StreamCreate, StreamStatus
from backend.app.services.metrics import StreamMetrics
from backend.app.sources.video_source import VideoSource


class StreamManager:
    def __init__(
        self,
        pipeline: BasePipeline | None = None,
    ):
        self.streams: dict[UUID, dict[str, Any]] = {}
        self.tasks: dict[UUID, asyncio.Task] = {}
        self.metrics: dict[UUID, StreamMetrics] = {}

        self.pipeline = pipeline or YOLOPipeline()

    async def create_stream(
        self,
        stream: StreamCreate,
    ) -> dict[str, Any]:
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

    async def get_stream(
        self,
        stream_id: UUID,
    ) -> dict[str, Any] | None:
        return self.streams.get(stream_id)

    async def get_metrics(
        self,
        stream_id: UUID,
    ) -> dict[str, Any] | None:
        metrics = self.metrics.get(stream_id)

        if metrics is None:
            return None

        return metrics.to_dict()

    async def start_stream(
        self,
        stream_id: UUID,
    ) -> dict[str, Any] | None:
        stream = self.streams.get(stream_id)

        if stream is None:
            return None

        if stream["status"] in {
            StreamStatus.STARTING,
            StreamStatus.RUNNING,
        }:
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

    async def stop_stream(
        self,
        stream_id: UUID,
    ) -> dict[str, Any] | None:
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

    async def _process_stream(
        self,
        stream_id: UUID,
    ) -> None:
        stream = self.streams.get(stream_id)
        metrics = self.metrics.get(stream_id)

        if stream is None or metrics is None:
            return

        try:
            stream["status"] = StreamStatus.RUNNING

            video_source = VideoSource(
                stream["url"]
            )


            async for frame in video_source.frames():

                if metrics.source_fps <= 0:
                      metrics.set_source_fps(
                          video_source.fps
                    )

                processing_start = perf_counter()

                inference_start = perf_counter()

                await self.pipeline.process(frame)

                inference_time = (
                    perf_counter() - inference_start
                )

                processing_time = (
                    perf_counter() - processing_start
                )

                metrics.record_frame(
                    processing_time=processing_time,
                    inference_time=inference_time,
                )

                await asyncio.sleep(0)

            stream["status"] = StreamStatus.STOPPED

        except asyncio.CancelledError:
            raise

        except Exception:
            metrics.record_error()
            stream["status"] = StreamStatus.ERROR

        finally:
            self.tasks.pop(stream_id, None)