


from api.core.config import settings
from api.core.db import create_db_engine, create_session_factory
from application.factories.DatasetFactory import get_current_dataset
from domain.domain_models.Email import Email


def main():
    user_id = 1
    dataset_id = 5
    email_id = "412"
    engine = create_db_engine(settings.database_url)
    sessionLocale = create_session_factory(engine)
    db = sessionLocale()

    current_dataset = get_current_dataset(db, user_id=user_id, dataset_id=dataset_id, load_not_only_front=True)
    ds_content = current_dataset["content"]
    if ds_content and len(ds_content) > 0:
        id_type = type(ds_content[0].email_id)

    if id_type == int:
        email_id = int(email_id)


    email : Email = next((e for e in ds_content if e.email_id == email_id), None)
    email_html = email.content_html if email else None
    print(f"Email HTML content: {email_html}")