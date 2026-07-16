from __future__ import annotations

import logging

from flask import Flask, jsonify, request

from app.config import Settings, load_settings
from app.db import get_job
from app.queue import JobQueue

logger = logging.getLogger(__name__)


def create_app(settings: Settings | None = None) -> Flask:
    settings = settings or load_settings()
    app = Flask(__name__)
    app.config["SETTINGS"] = settings

    queue = JobQueue(
        redis_url=settings.redis_url,
        stream_key=settings.stream_key,
        consumer_group=settings.consumer_group,
        consumer_name=f"health-{settings.consumer_name}",
        block_ms=settings.block_ms,
        claim_idle_ms=settings.claim_idle_ms,
    )

    @app.get("/health")
    def health():
        redis_ok = False
        try:
            redis_ok = queue.ping()
        except Exception as exc:  # noqa: BLE001
            logger.warning("Redis health failed: %s", exc)

        status = "ok" if redis_ok else "degraded"
        code = 200 if redis_ok else 503
        return (
            jsonify(
                {
                    "status": status,
                    "service": "saas-ai",
                    "redis": redis_ok,
                    "streamKey": settings.stream_key,
                    "consumerGroup": settings.consumer_group,
                }
            ),
            code,
        )

    @app.get("/ready")
    def ready():
        try:
            queue.ping()
            queue.ensure_group()
            return jsonify({"status": "ready"}), 200
        except Exception as exc:  # noqa: BLE001
            return jsonify({"status": "not_ready", "error": str(exc)}), 503

    @app.get("/internal/jobs/<job_id>")
    def internal_job(job_id: str):
        token = request.headers.get("x-ai-internal-token", "")
        if settings.internal_token and token != settings.internal_token:
            return jsonify({"error": "unauthorized"}), 401

        job = get_job(settings.database_url, job_id)
        if not job:
            return jsonify({"error": "not_found"}), 404
        return jsonify({"job": job}), 200

    return app
