from __future__ import annotations

from typing import Any


def process_match(payload: dict[str, Any]) -> dict[str, Any]:
    """Placeholder semantic matching / rerank."""
    candidates = payload.get("candidateIds") or []
    scored = [
        {
            "id": candidate_id,
            "score": max(0.0, 1.0 - (index * 0.07)),
            "reason": "Stub rank — replace with embedding cosine + rerank.",
        }
        for index, candidate_id in enumerate(candidates)
    ]
    return {
        "ok": True,
        "processor": "match",
        "matches": scored,
        "query": payload.get("query"),
    }
