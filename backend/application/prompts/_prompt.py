from abc import ABC, abstractmethod


class Prompt(ABC):
    @abstractmethod
    def get_prompt(self, *args, **kwargs) -> str:
        pass

    def __call__(self, *args, **kwargs) -> str:
        return self.get_prompt(*args, **kwargs)
