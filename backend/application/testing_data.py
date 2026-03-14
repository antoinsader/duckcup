


from collections import defaultdict

from domain.db_models.Accont import AccountFront
from domain.domain_models.Email import InboxMeta, InboxCriteriaPageResponse, EmailFront
from domain.domain_models.Requests import InboxCriteria
from domain.domain_models.Telegram import TelegramEntityFront, TelegramMessageFront
from infrastructure.ner.entity_extractor import extract_entities_from_messages, ENTITY_TYPE_DESCRIPTIONS

testing_accounts = [AccountFront(
            account_id=50,
            user_id=1,
            email="test1@gmail.com",
            email_provider_id="GMAIL",
            provider_type="EMAIL",
            need_to_login=False,
            inbox_count=5
        ),
        AccountFront(
            account_id=51,
            user_id=1,
            email="test2@gmail.com",
            email_provider_id="GMAIL",
            provider_type="EMAIL",
            need_to_login=False,
            inbox_count=2
        ),
        AccountFront(
            account_id=52,
            user_id=1,
            email="test3@gmail.com",
            email_provider_id="GMAIL",
            provider_type="EMAIL",
            need_to_login=False,
            inbox_count=3
        ),
        AccountFront(
            account_id=60,
            user_id=1,
            email="Telegram_account_1",
            email_provider_id="TELEGRAM",
            provider_type="MESSAGING",
            need_to_login=False,
            inbox_count=3
        ),
        AccountFront(
            account_id=70,
            user_id=1,
            email="Telegram_account_2",
            email_provider_id="TELEGRAM",
            provider_type="MESSAGING",
            need_to_login=False,
            inbox_count=3
        ),
    ]


telegram_entities_test = {
    60: [
        TelegramEntityFront(
        chat_id="600",
        chat_name="Test group 1",
        chat_type="group",
    ),
    TelegramEntityFront(
        chat_id="601",
        chat_name="Test group 2",
        chat_type="group",
    ),
    TelegramEntityFront(
        chat_id="602",
        chat_name="Test channel 1",
        chat_type="channel",
    ),
    TelegramEntityFront(
        chat_id="603",
        chat_name="Test channel 2",
        chat_type="channel",
    ),
    TelegramEntityFront(
        chat_id="604",
        chat_name="Test user 1",
        chat_type="user",
    ),
    TelegramEntityFront(
        chat_id="605",
        chat_name="Test user 2",
        chat_type="user",
    ),
    ],
    70: [
         TelegramEntityFront(
        chat_id="700",
        chat_name="Test group 1",
        chat_type="group",
    ),
    TelegramEntityFront(
        chat_id="702",
        chat_name="Test channel 1",
        chat_type="channel",
    ),
    TelegramEntityFront(
        chat_id="703",
        chat_name="Test user 1",
        chat_type="group",
    ),
    ]
}


import random
import datetime

def _random_date():
    start = datetime.datetime(2025, 1, 1, 8, 0, 0)
    end = datetime.datetime(2026, 12, 31, 20, 0, 0)
    delta = end - start
    random_seconds = random.randint(0, int(delta.total_seconds()))
    return (start + datetime.timedelta(seconds=random_seconds)).strftime("%Y-%m-%dT%H:%M:%SZ")


def _random_text(base, message_id, account_id):
    words = ["Hello", "Test", "Sample", "Message", "Content", "Random", "Telegram", "Chat", "Entity", "Text"]
    keywords_persons = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy"]
    people = random.choice(keywords_persons)
    return f"{base} {random.choice(words)} {people} {message_id}"




telegram_messages = defaultdict(list)

_msg_id = 1
for account_id, entities in telegram_entities_test.items():
    for entity in entities:
        for i in range(3):
            msg = TelegramMessageFront(
            message_id=f"msg_{_msg_id}",
            date=_random_date(),
            text=_random_text(entity.chat_name, _msg_id, account_id),
            clean_text="",
            sender_id=entity.chat_id,
            sender_username=entity.chat_name,
            language="en",
            views=random.randint(0, 1000),
            forwards=random.randint(0, 500),
            media=random.choice([True, False]),
            chat_id=entity.chat_id
            )
            msg.clean_text = msg.text
            telegram_messages[account_id].append(msg)
            _msg_id += 1




inbox_metas_test =  {
    50: InboxMeta(
        senders_emails={
            "sender_1@gmail.com": "Sender 1",
            "sender_2@gmail.com": "Sender 2",
            "sender_3@gmail.com": "Sender 3"
        },
        subjects=["Subject 1", "Subject 2", "Subject 3"],
        min_date="2023-01-01T00:00:00Z",
        max_date="2023-12-31T23:59:59Z",
        top_senders={
            "Sender 1": 3,
        }
    ),
    51: InboxMeta(
        senders_emails={
            "sender_4@gmail.com": "Sender 4",
            "sender_5@gmail.com": "Sender 5",
        },
        subjects=["Subject 4", "Subject 5"],
        min_date="2023-01-01T00:00:00Z",
        max_date="2023-12-31T23:59:59Z",
        top_senders={
            "Sender 4": 1, "Sender 5": 1
        }
    ),
    52: InboxMeta(
        senders_emails={
            "sender_7@gmail.com": "Sender 7",
            "sender_8@gmail.com": "Sender 8",
        },
        subjects=["Subject 7", "Subject 8"],
        min_date="2023-01-01T00:00:00Z",
        max_date="2023-12-31T23:59:59Z",
        top_senders={
            "Sender 7": 2,
        }
    ),
}

inbox = {
    50: 
        InboxCriteriaPageResponse(
            items=[
                EmailFront(
                    email_id="email_1",
                    subject="Subject 1",
                    sender_signature="Sender 1",
                    sender_email="sender_1@gmail.com",
                    date="2023-01-01T12:00:00Z",
                    content_clean="This is the content of email 1",
                    language="en",
                    flags="/seen",
                    ),
                
                EmailFront(
                    email_id="email_2",
                    subject="Subject 2",
                    sender_signature="Sender 1",
                    sender_email="sender_1@gmail.com",
                    date="2023-02-01T12:00:00Z",
                    content_clean="This is the content of email 2",
                    language="en",
                    flags="/seen",
                    
                    ),
                
                EmailFront(
                    email_id="email_3",
                    subject="Subject 3",
                    sender_signature="Sender 1",
                    sender_email="sender_1@gmail.com",
                    date="2023-03-01T12:00:00Z",
                    content_clean="This is the content of email 3",
                    language="en",
                    flags="/seen",
                    
                    
                    ),
                
                EmailFront(
                    email_id="email_4",
                    subject="Subject 4",
                    sender_signature="Sender 2",
                    sender_email="sender_2@gmail.com",
                    date="2023-04-01T12:00:00Z",
                    content_clean="This is the content of email 4",
                    language="en",
                    flags="/seen",
                    
                    
                    ),
                
                EmailFront(
                    email_id="email_5",
                    subject="Subject 5",
                    sender_signature="Sender 3",
                    sender_email="sender_3@gmail.com",
                    date="2023-05-01T12:00:00Z",
                    content_clean="This is the content of email 5",
                    language="en",
                    flags="/seen",
                    ),
                ],
            total_count=5,
            page_num = 1,
            num_rows=10
        )
    ,
    51: 
        InboxCriteriaPageResponse(
            items=[
                EmailFront(
                    email_id="email_6",
                    subject="Subject 6",
                    sender_signature="Sender 4",
                    sender_email="sender_4@gmail.com",
                    date="2023-01-01T12:00:00Z",
                    content_clean="This is the content of email 6",
                    language="en",
                    flags="/seen",
                    ),
                
                EmailFront(
                    email_id="email_7",
                    subject="Subject 7",
                    sender_signature="Sender 5",
                    sender_email="sender_5@gmail.com",
                    date="2023-02-01T12:00:00Z",
                    content_clean="This is the content of email 7",
                    language="en",
                    flags="/seen",
                    ),
                
                ],
            total_count=2,
            page_num = 1,
            num_rows=10
        )
,
    52: 
        InboxCriteriaPageResponse(
            items=[
                EmailFront(
                    email_id="email_9",
                    subject="Subject 9",
                    sender_signature="Sender 7",
                    sender_email="sender_7@gmail.com",
                    date="2023-01-01T12:00:00Z",
                    content_clean="This is the content of email 9",
                    language="en",
                    flags="/seen",
                    ),
                EmailFront(
                    email_id="email_10",
                    subject="Subject 10",
                    sender_signature="Sender 7",
                    sender_email="sender_7@gmail.com",
                    date="2023-02-01T12:00:00Z",
                    content_clean="This is the content of email 10",
                    language="en",
                    flags="/seen",
                    ),
                EmailFront(
                    email_id="email_8",
                    subject="Subject 8",
                    sender_signature="Sender 8",
                    sender_email="sender_8@gmail.com",
                    date="2023-02-01T12:00:00Z",
                    content_clean="This is the content of email 8",
                    language="en",
                    flags="/seen",
                    ),
                ],
            total_count=3,
            page_num = 1,
            num_rows=10
        ),
}


def get_testing_accounts():
    return testing_accounts
def get_testing_inbox_meta(account_id: int):
    return inbox_metas_test.get(account_id)

def get_inbox_criteria(account_id, criteria:InboxCriteria =None):

    filtered = inbox.get(account_id, [])
    if criteria is None:
        return filtered
    emails = [e for e in filtered.items]
    sender_email = criteria.sender_email
    subject = criteria.subject
    date_from = criteria.date_from
    date_to = criteria.date_to
    sort_by = criteria.sort_by
    if sender_email is not None:
        emails = [email for email in emails if email.sender_email == sender_email.strip()]

    if subject is not None:
        emails = [email for email in emails if subject in email.subject.strip()]
    if date_from is not None:
        emails = [email for email in emails if email.date >= date_from.strip()]
    if date_to is not None:
        emails = [email for email in emails if email.date <= date_to.strip()]
    if sort_by is not None:
        if sort_by == "newest_first":
            emails = sorted(emails, key=lambda email: email.date, reverse=True)
        elif sort_by == "oldest_first":
            emails = sorted(emails, key=lambda email: email.date)
        elif sort_by == "sender_name":
            emails = sorted(emails, key=lambda email: email.sender_signature)

    filtered.items = emails
    return filtered


def get_testing_telegram_entities(account_id):
    return [entity for entity in telegram_entities_test[account_id]]

def get_testing_telegram_messages(account_id, chat_id):
    return [msg for msg in telegram_messages[account_id] if msg.chat_id == chat_id ]

def get_testing_telegram_messages_multiple_chats(account_id, entities):
    chat_ids = [entity["chat_id"] for entity in entities]
    return [msg for msg in telegram_messages[account_id] if msg.chat_id in chat_ids ]


def get_testing_telegram_analysis_entities(account_id, entities):
    chat_ids = [entity["chat_id"] for entity in entities]
    msgs = [msg for msg in telegram_messages[account_id] if msg.chat_id in chat_ids ]

    messages_texts = [m.clean_text for m in msgs] 
    messages_ids = [m.message_id for m in msgs] 
    account_analysis = extract_entities_from_messages(messages_texts=messages_texts, messages_ids=messages_ids)

    return {
        "analysis_entities": account_analysis,
        "entities_descriptions": ENTITY_TYPE_DESCRIPTIONS
    }