from sqlalchemy import select
from datetime import datetime, timedelta, timezone


from application.exceptions import ERRORS_LAYERS, ApplicationError
from domain.db_models.AutomaticEvents import AutomaticEvents
from application.get_meta import save_hf_prompt_models, save_pollinations_text_models
from infrastructure.encryption.rsa import generate_key_pairs


EVENT_REGISTRY = {
    # "save_hf_prompt_models": {
    #     "handler": save_hf_prompt_models,
    #     "repeat_every_n_days": 7
    # },
    # "save_pollinations_text_models": {
    #     "handler": save_pollinations_text_models,
    #     "repeat_every_n_days": 7
    # },
    "generate_rsa_pair": {
        "handler": generate_key_pairs,
        "repeat_every_n_days": 4,
    }
}


def sync_events_to_db(session):
    try:
        for event_name, event_dict in EVENT_REGISTRY.items():
            existing = (
                session.query(AutomaticEvents)
                .filter(AutomaticEvents.event_name == event_name)
                .first()
            )
            if not existing:
                session.add(
                    AutomaticEvents(
                        event_name=event_name,
                        repeat_every_n_days=event_dict['repeat_every_n_days'],
                    )
                )

        session.commit()
    except Exception as ex:
        raise ApplicationError(
            f"Error while trying to save automatic events in db",
            layer=ERRORS_LAYERS.AUTOMATIC_EVENT,
            ex=ex
        )

def should_run(event: AutomaticEvents) -> bool:
    if event.last_update is None:
        return True
    last  = event.last_update
    if last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)
    next_allowed = last + timedelta(days=event.repeat_every_n_days)
    return datetime.now(timezone.utc) >= next_allowed