from dataclasses import dataclass
import spacy

from application.exceptions import INFRA_ERROR_LAYERS, InfrastructureError
from infrastructure.utils.config_hash import hash_config


from .tokenizer import Tokenizer



@dataclass
class SpacyTokenizerConfig:
    batch_size: int=500
    get_lemmas : bool=True
    only_alpha : bool=True
    remove_stop_words : bool=True
    min_token_length :int= 2
    spacy_model :str = "en_core_web_md"



class SpacyTokenizer(Tokenizer):
    def __init__(self, cfg: SpacyTokenizerConfig):
        self.cfg = cfg



    def tokenize(self, texts):
        """
        args:
            list_texts: list of strings to be tokenized
        Return:
            list of tokens lists (n_docs, n_tokens)
        """
        try:
            nlp = spacy.load(self.cfg.spacy_model , disable=["parser", "ner"])

            tokenized_docs = [
                [
                    (token.lemma_.lower() if self.cfg.get_lemmas else token.text)
                    for token in doc
                    if (not self.cfg.only_alpha or token.is_alpha)
                    and (not self.cfg.remove_stop_words or not token.is_stop)
                    and (len(token) >= self.cfg.min_token_length)
                ]
                for doc in nlp.pipe(texts, batch_size=self.cfg.batch_size)
            ]
            return tokenized_docs
        except OSError as e:
            raise InfrastructureError(
                f"spacy model {self.cfg.spacy_model}, needs to be downloaded using python -m spacy download",
                layer=INFRA_ERROR_LAYERS.INSTALLING,
                priority=1,
                ex=e
            )
        except Exception as e:
            raise InfrastructureError(
                "Error tokenizing", 
                layer=INFRA_ERROR_LAYERS.TOKENIZER,
                priority=3,
                ex=e
            )

    def get_config_hash(self) -> str:
        return hash_config(self.cfg)
