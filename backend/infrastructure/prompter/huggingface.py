import os
from dataclasses import dataclass

from application.exceptions import INFRA_ERROR_LAYERS, InfrastructureError

from .prompter import Prompter

import os
from huggingface_hub import InferenceClient



@dataclass
class HuggingFacePrompterConfig:
    hf_token: str
    model: str = "Qwen/Qwen2-1.5B-Instruct"
    assistant_describe : str = "You are an email summarizer assistant."

class HuggingFacePrompter(Prompter):
    def __init__(self, cfg : HuggingFacePrompterConfig):
        self.cfg = cfg
        try:
            self.client = InferenceClient(
                api_key= self.cfg.hf_token ,
            )
        except Exception as ex:
            raise InfrastructureError(
                f"Error initializing HuggingFace client with model: {self.cfg.model}",
                ex=ex,
                priority=2,
                layer=INFRA_ERROR_LAYERS.PROMPTER
            )


    def answer_prompt(self, prompt):
        try:
            completion = self.client.chat.completions.create(
                model=self.cfg.model,
                messages=[
                    {"role": "system", "content": self.cfg.assistant_describe},
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
            )
            return completion.choices[0].message.content
        except Exception as ex:
            raise InfrastructureError(
                f"Error prompting  using: hugging face {self.cfg.model}",
                ex=ex,
                priority=2,
                layer=INFRA_ERROR_LAYERS.PROMPTER
            )


