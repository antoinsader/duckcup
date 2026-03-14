
from abc import ABC, abstractmethod




class Prompter(ABC):
    @abstractmethod
    def answer_prompt(self, prompt:str) -> str:
        pass

