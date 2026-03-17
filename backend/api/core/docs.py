"""Helpers and shared metadata for generated API documentation."""

from __future__ import annotations

from typing import Any


API_TITLE = "THREADMIND_API"
API_DESCRIPTION = """
ThreadMind is a production-ready backend application designed to manage, analyze, and process user data from email and messaging platforms. It enables users to authenticate, connect Gmail and Telegram accounts, fetch and filter messages, save filtered data into datasets, and perform advanced NLP operations such as clustering, keyword extraction, summarization, and NER. 
The system is built for maintainability, extensibility, and security, providing robust logging and error handling.
"""

API_VERSION = "1.1.0"


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