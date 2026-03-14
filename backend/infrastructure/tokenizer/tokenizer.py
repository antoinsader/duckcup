from abc import ABC, abstractmethod

class Tokenizer(ABC):
    @abstractmethod
    def tokenize(self, texts:list[str]):
        pass

    @abstractmethod
    def get_config_hash(self) -> str:
        pass