from collections.abc import Mapping
from enum import Enum

from ._prompt import Prompt
from .cluster_title import ClusterEmailsTitlePrompt, ClusterTitlePrompt
from .email_summary import EmailSummaryPrompt
from .messages_group_summary import MessagesGroupSummaryPrompt


class PromptKey(str, Enum):
    EMAIL_SUMMARY = "email_summary"
    MESSAGES_GROUP_SUMMARY = "messages_group_summary"
    CLUSTER_TITLE = "cluster_title"
    EMAILS_CLUSTER_TITLE = "cluster_emails_title"


DEFAULT_PROMPTS: dict[PromptKey, type[Prompt]] = {
    PromptKey.EMAIL_SUMMARY: EmailSummaryPrompt,
    PromptKey.MESSAGES_GROUP_SUMMARY: MessagesGroupSummaryPrompt,
    PromptKey.CLUSTER_TITLE: ClusterTitlePrompt,
    PromptKey.EMAILS_CLUSTER_TITLE: ClusterEmailsTitlePrompt,
}


class PromptRegistry:
    def __init__(self, prompts: Mapping[PromptKey, type[Prompt]] | None = None) -> None:
        self._prompt_classes = dict(prompts or DEFAULT_PROMPTS)
        self._instances: dict[PromptKey, Prompt] = {}

    def register(self, key: PromptKey, prompt_cls: type[Prompt], overwrite: bool = False) -> None:
        if not overwrite and key in self._prompt_classes:
            raise ValueError(f"Prompt key '{key.value}' is already registered")
        self._prompt_classes[key] = prompt_cls
        self._instances.pop(key, None)

    def get(self, key: PromptKey) -> Prompt:
        if key not in self._prompt_classes:
            raise KeyError(f"Prompt key '{key.value}' is not registered")

        if key not in self._instances:
            self._instances[key] = self._prompt_classes[key]()
        return self._instances[key]

    def render(self, key: PromptKey, *args, **kwargs) -> str:
        return self.get(key)(*args, **kwargs)
