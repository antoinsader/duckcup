import os
from dataclasses import dataclass
import requests

from application.exceptions import INFRA_ERROR_LAYERS, InfrastructureError
from .prompter import Prompter




@dataclass
class PollinationsPrompterConfig:
    pollination_key: str
    model: str = "polly"
    assistant_describe : str = "You are an email summarizer assistant."

class PollinationPrompter(Prompter):
    def __init__(self, cfg : PollinationsPrompterConfig):
        self.cfg = cfg
        self.url = "https://gen.pollinations.ai/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {cfg.pollination_key}",
            "Content-Type": "application/json"
        }

    def answer_prompt(self, prompt):
        try:
            payload = {
                "model": self.cfg.model,
                "messages": [
                    {"role": "system", "content": self.cfg.assistant_describe},
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
            response = requests.post(self.url, headers=self.headers, json=payload, timeout=60)
            response.raise_for_status()

            data = response.json()
            print(f"data:  {data}" )
            choices = data.get("choices") or []
            if not choices:
                return data.get("response") or data.get("text") or response.text

            message = choices[0].get("message") or {}
            content = message.get("content")

            if isinstance(content, list):
                return "".join(
                    item.get("text", "")
                    for item in content
                    if isinstance(item, dict)
                ).strip()

            if isinstance(content, str):
                return content.strip()

            return data.get("response") or data.get("text") or response.text
        except Exception as ex:
            raise InfrastructureError(
                f"Error prompting  using: pollinations, model={self.cfg.model}",
                ex=ex,
                priority=2,
                layer=INFRA_ERROR_LAYERS.PROMPTER
            )




