"""Helpers and shared metadata for generated API documentation."""

from __future__ import annotations

from typing import Any


API_TITLE = "Mail Final API"
API_DESCRIPTION = (
    "API for authentication, account integrations, dataset management, email access, "
    "secret storage, Telegram ingestion, and NLP workflows."
)
API_VERSION = "1.0.0"


COMMON_ERROR_RESPONSES: dict[int, dict[str, Any]] = {
    401: {"description": "Authentication is required or the current session is invalid."},
    490: {"description": "The request reached the application layer but failed business validation."},
    491: {"description": "The request failed in an infrastructure dependency or external service."},
}


def route_responses(*response_maps: dict[int, dict[str, Any]]) -> dict[int, dict[str, Any]]:
    """Merge response metadata dictionaries for FastAPI route decorators."""

    merged: dict[int, dict[str, Any]] = {}
    for response_map in response_maps:
        merged.update(response_map)
    return merged