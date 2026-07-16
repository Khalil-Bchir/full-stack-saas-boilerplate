from __future__ import annotations

import logging
import signal
import sys
import time
from typing import Any

from app.config import Settings, load_settings
from app.db import mark_failed, mark_running, mark_succeeded
from app.processors import get_processor
from app.queue import JobQueue

logger = logging.getLogger(__name__)


class AiWorker:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.queue = JobQueue(
            redis_url=settings.redis_url,
            stream_key=settings.stream_key,
            consumer_group=settings.consumer_group,
            consumer_name=settings.consumer_name,
            block_ms=settings.block_ms,
            claim_idle_ms=settings.claim_idle_ms,
        )
        self._running = True

    def stop(self, *_args: Any) -> None:
        logger.info("Shutdown signal received — stopping worker loop")
        self._running = False

    def run_forever(self) -> None:
        self.queue.ensure_group()
        logger.info(
            "AI worker online group=%s consumer=%s stream=%s",
            self.settings.consumer_group,
            self.settings.consumer_name,
            self.settings.stream_key,
        )

        while self._running:
            messages = self.queue.reclaim(count=self.settings.worker_concurrency)
            if not messages:
                messages = self.queue.read(count=self.settings.worker_concurrency)
            if not messages:
                continue

            for message_id, data in messages:
                self._handle_message(message_id, data)

    def _handle_message(self, message_id: str, data: dict[str, Any]) -> None:
        job_id = data.get("jobId")
        job_type = data.get("type")
        if not job_id or not job_type:
            logger.error("Invalid stream message %s — acking poison pill", message_id)
            self.queue.ack(message_id)
            return

        logger.info("Processing job id=%s type=%s msg=%s", job_id, job_type, message_id)
        row = mark_running(self.settings.database_url, job_id)
        if not row:
            logger.warning("Job %s missing or not claimable — acking", job_id)
            self.queue.ack(message_id)
            return

        try:
            processor = get_processor(str(job_type))
            payload = data.get("payload") or row.get("payload") or {}
            if isinstance(payload, str):
                payload = {}
            result = processor(payload)
            mark_succeeded(self.settings.database_url, job_id, result)
            self.queue.ack(message_id)
            logger.info("Job succeeded id=%s", job_id)
        except Exception as exc:  # noqa: BLE001 — worker must never crash the loop
            attempts = int(row.get("attempts") or 1)
            max_attempts = int(row.get("maxAttempts") or 3)
            terminal = attempts >= max_attempts
            mark_failed(self.settings.database_url, job_id, str(exc), terminal=terminal)
            if terminal:
                self.queue.ack(message_id)
                logger.exception("Job failed permanently id=%s error=%s", job_id, exc)
            else:
                # Leave unacked so xautoclaim can retry after idle timeout.
                logger.exception(
                    "Job failed id=%s attempt=%s/%s — will retry",
                    job_id,
                    attempts,
                    max_attempts,
                )
                time.sleep(0.5)


def main() -> int:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )
    settings = load_settings()
    worker = AiWorker(settings)
    signal.signal(signal.SIGINT, worker.stop)
    signal.signal(signal.SIGTERM, worker.stop)
    worker.run_forever()
    return 0


if __name__ == "__main__":
    sys.exit(main())
