from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timezone

from api.core.config import settings
from api.core.db import create_db_engine, create_session_factory
from api.core.logger import print_info_message
from domain.db_models.AutomaticEvents import AutomaticEvents
from application.auto_events import EVENT_REGISTRY, should_run
from application.exceptions import INFRA_ERROR_LAYERS, InfrastructureError, InfrastructureWarning

scheduler = AsyncIOScheduler()


def run_automatic_events():
    engine = create_db_engine(settings.database_url)
    localSession = create_session_factory(engine)
    db = localSession()
    print_info_message("Running automatic events")
    try:
        events = db.query(AutomaticEvents).all()
    except Exception as e:
            raise InfrastructureError(
                f"Error in getting automatic event",
                layer=INFRA_ERROR_LAYERS.UTILS,
                ex=e,
                priority=1
            )

    for event in events:
        if not should_run(event):
            print_info_message(f"event {event.event_name} should not run")
            continue

        event_registry = EVENT_REGISTRY.get(event.event_name)

        if not event_registry:
            InfrastructureWarning(
                f"Event registry {event.event_name} has no row in event registry !",
                layer=INFRA_ERROR_LAYERS.UTILS
            )
            continue
        handler = event_registry.get('handler')
        if not handler:
            InfrastructureWarning(
                f"Event registry {event.event_name} has no handler in event registry !",
                layer=INFRA_ERROR_LAYERS.UTILS
            )
            continue
        try:
            print_info_message(f"Running automatic: {event.event_name}")
            handler()
            event.last_update = datetime.now(timezone.utc)
            db.commit()

        except Exception as e:
            raise InfrastructureError(
                f"Error in running automatic event",
                layer=INFRA_ERROR_LAYERS.UTILS,
                ex=e,
                priority=1
            )
def start_scheduler():
    scheduler.add_job(
        run_automatic_events,
        "interval",
        hours=5,
        max_instances=1
    )
    scheduler.start()