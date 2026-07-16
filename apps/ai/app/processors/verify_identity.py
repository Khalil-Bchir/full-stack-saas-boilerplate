from __future__ import annotations

from typing import Any


def process_verify_identity(payload: dict[str, Any]) -> dict[str, Any]:
    """Placeholder face / liveness verification."""
    return {
        "ok": True,
        "processor": "verify_identity",
        "verified": bool(payload.get("forceVerified", True)),
        "livenessScore": float(payload.get("livenessScore", 0.99)),
        "matchScore": float(payload.get("matchScore", 0.98)),
        "reason": "Stub verification — replace with DeepFace / liveness pipeline.",
    }
