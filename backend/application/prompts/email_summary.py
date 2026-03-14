from abc import abstractmethod

from application.exceptions import INFRA_ERROR_LAYERS, InfrastructureError
from ._prompt import Prompt



class EmailSummaryPrompt(Prompt):
    def get_prompt(self, main_email: dict, context_emails: list[dict]) -> str:
            """
            Parameters:
            --------------
            main_email_dict: should have date, sender_signature, subject, content_clean
            similar_emails_dicts: usually 3 emails dicts, each should have the same attributes


            Returns:
            ----------------
            Prompt to use for summarizing the main email
            """
            if not "subject" in main_email or not "date" in main_email or not "sender_signature" in main_email or not "content_clean" in main_email:
                raise InfrastructureError(
                    "Main email dict needs to have [date, sender_signature, subject, content_clean] keys",
                    layer=INFRA_ERROR_LAYERS.BUILD_PROMPT,
                    priority=3,
                )

            similar_emails_content = ""
            for idx, em in enumerate(context_emails):
                if not "date" in main_email or not "sender_signature" in main_email or not "content_clean" in main_email:
                    raise InfrastructureError(
                        "Context email dict needs to have [date, sender_signature, subject, content_clean] keys",
                        layer=INFRA_ERROR_LAYERS.BUILD_PROMPT,
                        priority=3,
                    )
                similar_emails_content += f"""
                    Context email {idx + 1}:
                        Date: {em['date']}
                        Sender Signature: {em['sender_signature']}
                        Subject: {em['subject']}
                        Body: {em['content_clean']}

                """

                return f"""
            You are an email summarization agent.
            Your task is to generate exactly one concise sentence summarizing the Body of the MAIN EMAIL.

            Content: Rules, MAIN EMAIL, {len(context_emails)} context emails.
            MAIN EMAIL and each context email having: Date, Sender, Subject, Body.

            Rules:
                -Focus only on the main email’s core intent, request, or key information.
                - Use context emails only to clarify missing details if necessary.
                - Do not summarize or mention context emails explicitly.
                - Do not speculate or infer beyond the provided content.
                - Output exactly one single-line sentence.
                - Do not include labels, explanations, or extra text.
                - Be factual and concise.
                - The answer should be precised in 1 line

            Main Email:
                Date: {main_email['date']}
                Sender Signature: {main_email['sender_signature']}
                Subject: {main_email['subject']}
                Body: {main_email['content_clean']}

            Context Emails:
                    {similar_emails_content}
                """