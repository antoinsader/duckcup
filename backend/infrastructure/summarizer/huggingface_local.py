import os
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

from application.exceptions import INFRA_ERROR_LAYERS, InfrastructureError
from ._summarizer import Summarizer





class HuggingFaceLocalSummarizer(Summarizer):
    def __init__(self, model_name = 'Falconsai/text_summarization'):
        self.model_name = model_name

    def summarize(self, txt):
        try:
            tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            model = AutoModelForSeq2SeqLM.from_pretrained(self.model_name)
        except Exception as e:
            raise InfrastructureError(
                f"Error loading summarize models: {self.model_name}", 
                details = {"model": self.model_name},
                layer=INFRA_ERROR_LAYERS.SUMMARIZER,
                priority=2,
                ex=e
            )
        if not txt:
            return None
        if len(txt) < 70:
            max_tokens = 30

        try:
            inputs = tokenizer(
                txt,
                return_tensors="pt",
                truncation=True,
                padding=True
            )

            with torch.no_grad():
                output_tokens = model.generate(
                    **inputs,
                    max_new_tokens=max_tokens,
                    min_length=10,
                    do_sample=False
                )

            summary = tokenizer.decode(
                output_tokens[0],
                skip_special_tokens=True
            )

            return summary if summary else None

        except Exception as ex:
            raise InfrastructureError(
                f"Error  summarizing, model = {self.model_name}", 
                details = {"model": self.model_name},
                layer=INFRA_ERROR_LAYERS.SUMMARIZER,
                priority=3,
                ex=e
            )




