from abc import abstractmethod

from application.exceptions import INFRA_ERROR_LAYERS, InfrastructureError
from ._prompt import Prompt



class ClusterTitlePrompt(Prompt):
    def get_prompt(self, keywords: list) -> str:
        formatted_keywords = "\n".join(
            f"{phrase} ({score:.2f})" for phrase, score in keywords
        )
        prompt = f"""
            You are generating a short topic title for a cluster of documents.

            Below are keywords extracted from the documents with their importance scores.

            Your task:
            - Identify the main theme represented by the keywords
            - Generate a concise and descriptive title (3–6 words)
            - Do not repeat the keywords exactly unless necessary
            - Focus on the core concept that connects them
            - Avoid filler words

            Keywords:
            {formatted_keywords}

            Return only the title.
        """
        return prompt


class ClusterEmailsTitlePrompt(Prompt):
    def get_prompt(self, keywords: list) -> str:
        formatted_subjects = "\n".join(
            f"{keyword} " for keyword in keywords
        )
        prompt = f"""
            You are generating a short topic title for a cluster of emails.

            Below are the subjects and senders of the emails in the shape "Sender: [sender], Subject: [subject]".

            Your task:
            - Identify the main theme represented by the subjects
            - Generate a concise and descriptive title (3–6 words)
            - Focus on the core concept that connects them
            - Avoid filler words

            Subjects:
            {formatted_subjects}

            Return only the title.
        """
        return prompt