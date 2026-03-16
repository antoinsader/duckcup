from dataclasses import dataclass



@dataclass
class Email:
    """Full email content when we get from IMAP"""
    raw_message: str
    email_id: str
    uid: str
    message_id: str
    subject: str
    sender_name: str
    sender_email: str
    sender_signature: str
    date: str
    content_clean : str
    content_text : str
    content_html : str
    contains_attachement: bool
    flags: list[str]
    language: str

    @staticmethod
    def _to_dict(email: "Email") -> dict:
        return {
            "raw_message": email.raw_message,
            "email_id": email.email_id,
            "uid": email.uid,
            "message_id": email.message_id,
            "subject": email.subject,
            "sender_name": email.sender_name,
            "sender_email": email.sender_email,
            "sender_signature": email.sender_signature,
            "date": email.date,
            "content_clean": email.content_clean,
            "content_text": email.content_text,
            "content_html": email.content_html,
            "contains_attachement": email.contains_attachement,
            "flags": email.flags,
            "language": email.language
        }


@dataclass
class EmailFront:
    """"Subclass from Email to send to the front"""
    email_id: str
    subject: str
    sender_signature: str
    sender_email: str
    date: str
    content_clean : str
    contains_attachement: bool = False
    flags: list[str] = None
    language: str = "en"

    def __getitem__(self, key):
        return getattr(self, key)

    @staticmethod
    def _from_Email(email: Email) -> "EmailFront":
        if email is None:
            return None
        return EmailFront(
            email_id=str(email.email_id),
            subject=email.subject,
            sender_signature=email.sender_signature,
            sender_email=email.sender_email,
            date=email.date,
            content_clean=email.content_clean,
            contains_attachement=email.contains_attachement,
            flags=email.flags,
            language=email.language,
        )
    @staticmethod
    def _from_dict(data: dict) -> "EmailFront":
        if data is None:
            return None
        if data["email_id"] is None:
            raise ValueError("Error parsing email dataset content. Error code: DS111")
        return EmailFront(
            email_id=str(data.get("email_id", "")),
            subject=data.get("subject", ""),
            sender_signature=data.get("sender_signature", ""),
            sender_email=data.get("sender_email", ""),
            date=data.get("date", ""),
            content_clean=data.get("content_clean", ""),
            contains_attachement=data.get("contains_attachement", False),
            flags=data.get("flags", []),
            language=data.get("language", "en"),
        )


@dataclass
class EmailMeta:
    sender_signature: str
    sender_email: str
    subject: str
    date: str

@dataclass
class InboxMeta:
    senders_emails : dict
    subjects : list[str]
    min_date : str
    max_date : str
    top_senders: dict


@dataclass
class InboxCriteriaPageResponse:
    items: list[EmailFront]
    total_count: int
    page_num: int
    num_rows: int