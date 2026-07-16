from __future__ import annotations

from hashlib import sha256
from typing import Any


def process_embed(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Placeholder embedding generator.

    Returns a deterministic pseudo-vector so API/integration tests are stable.
    Replace with Ollama / sentence-transformers in production Matchy wiring.
    """
    text = str(payload.get("text") or "")
    digest = sha256(text.encode("utf-8")).digest()
    vector = [round(b / 255.0, 6) for b in digest[:32]]
    return {
        "ok": True,
        "processor": "embed",
        "model": payload.get("model", "stub-embed-v1"),
        "dimensions": len(vector),
        "embedding": vector,
    }
