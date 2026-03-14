from abc import abstractmethod
from ._prompt import Prompt



class MessagesGroupSummaryPrompt(Prompt):
    def get_prompt(self, group_messages : list[dict], sender_attribute, date_attribute, text_attribute) -> str:
        messages = "\n\n".join(
            f"Sender: {doc[sender_attribute]}\nDate: {doc[date_attribute]}\nContent: {doc[text_attribute]}"  for doc in group_messages
        )
        return f"""
            You are a system that summarizes groups of messages.
            Your task: Summarize the key ideas from a group of messages.

            Rules:
            -----------
            - Produce a maximum of 10 bullet points.
            - Each bullet must represent an important idea, decision, or topic.
            - Combine related messages into a single bullet when possible.
            - Ignore greetings, small talk, and repetition.
            - Focus on facts, requests, decisions, or problems discussed.

            Messages format:
            -----------------
            - Sender: <name>
            - Date: <ISO date or timestamp>
            - Content: <message text>

            Length constraints:
            ----------------------
            - Each bullet must be concise.
            - Maximum 20 tokens per bullet (~15 words).
            - Do not exceed the token limit.

            Output format:
            ----------------
            - Bullet point summary 1 (≤20 tokens)
            - Bullet point summary 2 (≤20 tokens)
            ...
            (Maximum 10 bullets)

            Messages:
            -------------
            {messages}

        """

