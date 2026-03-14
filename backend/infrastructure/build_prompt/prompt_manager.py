from enum import Enum
from importlib import import_module
import re

from application.prompts import PromptKey, PromptRegistry


_PROMPT_REGISTRY = PromptRegistry()


def get_prompt(prompt_key: PromptKey):
    return _PROMPT_REGISTRY.get(prompt_key)


def render_prompt(prompt_key: PromptKey, *args, **kwargs) -> str:
    return _PROMPT_REGISTRY.render(prompt_key, *args, **kwargs)


def estimate_text_tokens(text: str) -> int:
    """Estimate token count for text.

    Uses `tiktoken` when available for model-aware counting.
    Falls back to a simple heuristic (~4 chars/token) when unavailable.
    """
    try:
        tiktoken = import_module("tiktoken")
        encoding = tiktoken.get_encoding("cl100k_base")
        return len(encoding.encode(text))
    except Exception:
        # Heuristic fallback when tiktoken is not installed or model is unknown.
        compact_text = re.sub(r"\s+", " ", text).strip()
        if not compact_text:
            return 0
        return max(1, round(len(compact_text) / 4))




class PROMPTS(Enum):
    EMAIL_SUMMARY = PromptKey.EMAIL_SUMMARY
    MESSAGES_GROUP_SUMMARY = PromptKey.MESSAGES_GROUP_SUMMARY
    CLUSTER_TITLE = PromptKey.CLUSTER_TITLE

    def __call__(self, *args, **kwargs):
        return render_prompt(self.value, *args, **kwargs)

