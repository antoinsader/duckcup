from dataclasses import dataclass
from google import genai

from application.exceptions import INFRA_ERROR_LAYERS, InfrastructureError

from .prompter import Prompter

@dataclass
class GeminiPrompterConfig:
    gemini_key: str
    model: str = "gemini-3-flash-preview"

class GeminiPrompter(Prompter):
    def __init__(self, cfg : GeminiPrompterConfig):
        self.cfg = cfg

    def answer_prompt(self, prompt):
        try:
            if not self.cfg.gemini_key:
                raise InfrastructureError(
                    f"You should set gemini key",
                    layer=INFRA_ERROR_LAYERS.ENV_CONFIGURATION,
                    priority=1,
                )
            client = genai.Client(api_key=self.cfg.gemini_key)
            response = client.models.generate_content(
                model=self.cfg.model, contents=prompt
            )
            return response.text
        except Exception as ex:
            raise InfrastructureError(
                f"Error prompting  using: gemini {self.cfg.model}",
                ex=ex,
                priority=2,
                layer=INFRA_ERROR_LAYERS.PROMPTER
            )


