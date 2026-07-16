from __future__ import annotations

from typing import Any, Callable

from app.processors.analyze_video import process_analyze_video
from app.processors.embed import process_embed
from app.processors.match import process_match
from app.processors.verify_identity import process_verify_identity

Processor = Callable[[dict[str, Any]], dict[str, Any]]

PROCESSORS: dict[str, Processor] = {
    "ANALYZE_VIDEO": process_analyze_video,
    "VERIFY_IDENTITY": process_verify_identity,
    "EMBED": process_embed,
    "MATCH": process_match,
}


def get_processor(job_type: str) -> Processor:
    try:
        return PROCESSORS[job_type]
    except KeyError as exc:
        raise ValueError(f"Unsupported AI job type: {job_type}") from exc
