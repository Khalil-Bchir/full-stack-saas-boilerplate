from __future__ import annotations

import json
import logging
from typing import Any

import redis

logger = logging.getLogger(__name__)


class JobQueue:
    def __init__(
        self,
        *,
        redis_url: str,
        stream_key: str,
        consumer_group: str,
        consumer_name: str,
        block_ms: int,
        claim_idle_ms: int,
    ) -> None:
        self.redis = redis.Redis.from_url(redis_url, decode_responses=True)
        self.stream_key = stream_key
        self.consumer_group = consumer_group
        self.consumer_name = consumer_name
        self.block_ms = block_ms
        self.claim_idle_ms = claim_idle_ms

    def ping(self) -> bool:
        return bool(self.redis.ping())

    def ensure_group(self) -> None:
        try:
            self.redis.xgroup_create(
                name=self.stream_key,
                groupname=self.consumer_group,
                id="0",
                mkstream=True,
            )
            logger.info("Created consumer group %s on %s", self.consumer_group, self.stream_key)
        except redis.ResponseError as exc:
            if "BUSYGROUP" not in str(exc):
                raise

    def read(self, count: int = 1) -> list[tuple[str, dict[str, Any]]]:
        rows = self.redis.xreadgroup(
            groupname=self.consumer_group,
            consumername=self.consumer_name,
            streams={self.stream_key: ">"},
            count=count,
            block=self.block_ms,
        )
        return self._flatten(rows)

    def reclaim(self, count: int = 1) -> list[tuple[str, dict[str, Any]]]:
        try:
            claimed = self.redis.xautoclaim(
                name=self.stream_key,
                groupname=self.consumer_group,
                consumername=self.consumer_name,
                min_idle_time=self.claim_idle_ms,
                start_id="0-0",
                count=count,
            )
        except redis.ResponseError:
            return []

        # redis-py returns (next_id, messages[, deleted])
        messages = claimed[1] if isinstance(claimed, (list, tuple)) and len(claimed) > 1 else []
        result: list[tuple[str, dict[str, Any]]] = []
        for message_id, fields in messages or []:
            result.append((message_id, self._decode_fields(fields)))
        return result

    def ack(self, message_id: str) -> None:
        self.redis.xack(self.stream_key, self.consumer_group, message_id)

    @staticmethod
    def _flatten(rows: Any) -> list[tuple[str, dict[str, Any]]]:
        result: list[tuple[str, dict[str, Any]]] = []
        if not rows:
            return result
        for _stream, messages in rows:
            for message_id, fields in messages:
                result.append((message_id, JobQueue._decode_fields(fields)))
        return result

    @staticmethod
    def _decode_fields(fields: dict[str, str]) -> dict[str, Any]:
        payload_raw = fields.get("payload", "{}")
        try:
            payload = json.loads(payload_raw)
        except json.JSONDecodeError:
            payload = {}
        return {
            "jobId": fields.get("jobId"),
            "type": fields.get("type"),
            "userId": fields.get("userId"),
            "payload": payload,
            "enqueuedAt": fields.get("enqueuedAt"),
        }
