from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


def _required(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


@dataclass(frozen=True, slots=True)
class Settings:
    host: str
    port: int
    redis_url: str
    database_url: str
    stream_key: str
    consumer_group: str
    consumer_name: str
    worker_concurrency: int
    block_ms: int
    claim_idle_ms: int
    internal_token: str
    log_level: str
    enable_worker: bool


def load_settings() -> Settings:
    return Settings(
        host=os.getenv("AI_SERVICE_HOST", "0.0.0.0"),
        port=int(os.getenv("AI_SERVICE_PORT", "5000")),
        redis_url=_required("REDIS_URL"),
        database_url=_required("DATABASE_URL"),
        stream_key=os.getenv("AI_STREAM_KEY", "ai:jobs"),
        consumer_group=os.getenv("AI_CONSUMER_GROUP", "ai-workers"),
        consumer_name=os.getenv("AI_CONSUMER_NAME", f"worker-{os.getpid()}"),
        worker_concurrency=max(1, int(os.getenv("AI_WORKER_CONCURRENCY", "1"))),
        block_ms=int(os.getenv("AI_STREAM_BLOCK_MS", "5000")),
        claim_idle_ms=int(os.getenv("AI_STREAM_CLAIM_IDLE_MS", "60000")),
        internal_token=os.getenv("AI_INTERNAL_TOKEN", ""),
        log_level=os.getenv("LOG_LEVEL", "INFO").upper(),
        enable_worker=os.getenv("AI_ENABLE_WORKER", "true").lower() in {"1", "true", "yes"},
    )
