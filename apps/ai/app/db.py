from __future__ import annotations

import json
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any, Iterator

import psycopg
from psycopg.rows import dict_row


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


@contextmanager
def connect(database_url: str) -> Iterator[psycopg.Connection]:
    with psycopg.connect(database_url, row_factory=dict_row) as conn:
        yield conn


def mark_running(database_url: str, job_id: str) -> dict[str, Any] | None:
    with connect(database_url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                '''
                UPDATE "AiJob"
                   SET status = 'RUNNING',
                       "startedAt" = COALESCE("startedAt", %s),
                       attempts = attempts + 1,
                       "updatedAt" = %s
                 WHERE id = %s
                   AND status IN ('QUEUED', 'RUNNING', 'FAILED')
             RETURNING id, type, status, payload, attempts, "maxAttempts"
                ''',
                (_utcnow(), _utcnow(), job_id),
            )
            row = cur.fetchone()
        conn.commit()
        return row


def mark_succeeded(database_url: str, job_id: str, result: dict[str, Any]) -> None:
    with connect(database_url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                '''
                UPDATE "AiJob"
                   SET status = 'SUCCEEDED',
                       result = %s::jsonb,
                       error = NULL,
                       "finishedAt" = %s,
                       "updatedAt" = %s
                 WHERE id = %s
                ''',
                (json.dumps(result), _utcnow(), _utcnow(), job_id),
            )
        conn.commit()


def mark_failed(database_url: str, job_id: str, error: str, *, terminal: bool) -> None:
    status = "FAILED" if terminal else "QUEUED"
    finished_at = _utcnow() if terminal else None
    with connect(database_url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                '''
                UPDATE "AiJob"
                   SET status = %s,
                       error = %s,
                       "finishedAt" = %s,
                       "updatedAt" = %s
                 WHERE id = %s
                ''',
                (status, error, finished_at, _utcnow(), job_id),
            )
        conn.commit()


def get_job(database_url: str, job_id: str) -> dict[str, Any] | None:
    with connect(database_url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                '''
                SELECT id, type, status, payload, result, error, attempts, "maxAttempts"
                  FROM "AiJob"
                 WHERE id = %s
                ''',
                (job_id,),
            )
            return cur.fetchone()
