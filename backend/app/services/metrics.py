from dataclasses import dataclass
from datetime import datetime, timezone



@dataclass
class StreamMetrics:
    frames_processed: int = 0
    errors: int = 0
    started_at: datetime | None = None
    last_frame_at: datetime | None = None

    source_fps: float = 0.0

    total_processing_time: float = 0.0
    total_inference_time: float = 0.0
    last_inference_latency_ms: float = 0.0

    def start(self) -> None:
        self.started_at = datetime.now(timezone.utc)

        self.frames_processed = 0
        self.errors = 0
        self.total_processing_time = 0.0
        self.total_inference_time = 0.0
        self.last_inference_latency_ms = 0.0

    def set_source_fps(self, fps: float) -> None:
        self.source_fps = fps

    def record_frame(
        self,
        processing_time: float = 0.0,
        inference_time: float = 0.0,
    ) -> None:
        self.frames_processed += 1
        self.last_frame_at = datetime.now(timezone.utc)

        self.total_processing_time += processing_time
        self.total_inference_time += inference_time

        self.last_inference_latency_ms = (
            inference_time * 1000
        )

    def record_error(self) -> None:
        self.errors += 1

    def processing_fps(self) -> float:
        if self.total_processing_time <= 0:
            return 0.0

        return (
            self.frames_processed
            / self.total_processing_time
        )

    def average_inference_latency_ms(self) -> float:
        if self.frames_processed <= 0:
            return 0.0

        return (
            self.total_inference_time
            / self.frames_processed
        ) * 1000

    def to_dict(self) -> dict:
        return {
            "frames_processed": self.frames_processed,
            "errors": self.errors,
            "started_at": self.started_at,
            "last_frame_at": self.last_frame_at,
            "processing_fps": round(
                self.processing_fps(),
                2,
            ),
            "average_inference_latency_ms": round(
                self.average_inference_latency_ms(),
                2,
            ),
            "last_inference_latency_ms": round(
                self.last_inference_latency_ms,
                2,
            ),
            "source_fps": round(
                self.source_fps,
                2,
            ),
        }