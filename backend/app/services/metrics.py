from dataclasses import dataclass
from datetime import datetime, timezone


@dataclass
class StreamMetrics:
    frames_processed: int = 0
    errors: int = 0
    started_at: datetime | None = None
    last_frame_at: datetime | None = None

    def start(self) -> None:
        self.started_at = datetime.now(timezone.utc)

    def record_frame(self) -> None:
        self.frames_processed += 1
        self.last_frame_at = datetime.now(timezone.utc)

    def record_error(self) -> None:
        self.errors += 1

    def to_dict(self) -> dict:
        return {
            "frames_processed": self.frames_processed,
            "errors": self.errors,
            "started_at": self.started_at,
            "last_frame_at": self.last_frame_at,
        }