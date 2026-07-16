from __future__ import annotations

from typing import Any


def process_analyze_video(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Placeholder inference for video → structured profile fields.

    Replace this body with Whisper / CV / LLM extraction when wiring Matchy AI.
    """
    media_url = payload.get("mediaUrl") or payload.get("filePath")
    return {
        "ok": True,
        "processor": "analyze_video",
        "mediaUrl": media_url,
        "fields": {
            "selected_interests": payload.get("hintInterests", []),
            "detected_video_lang": payload.get("language", "fr"),
            "summary": "Stub analysis — replace with real model pipeline.",
        },
        "transcription": payload.get("transcriptionStub", ""),
    }
