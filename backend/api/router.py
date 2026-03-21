
from contextlib import asynccontextmanager
import logging
from api.core.db import create_db_engine, create_session_factory
from application.auto_events import sync_events_to_db
from infrastructure.events_scheduler import run_automatic_events, start_scheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import Request
from dotenv import load_dotenv



from .routers import admin, auth, dataset, email, account, user, secrets, meta, telegram, nlp

from .core.config import settings
from .core.docs import API_DESCRIPTION, API_TITLE, API_VERSION
from .core.logger import setup_logging

from application.exceptions import  ApplicationError, InfrastructureError, NotAuthenticatedError
from infrastructure.ner.spacy_model import get_nlp


setup_logging()

requests_logger = logging.getLogger("requests_logger")
error_logger = logging.getLogger("error_logger")
warning_logger = logging.getLogger("warning_logger")

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    get_nlp()
    if settings.backend_secrets_encryption_key.get_secret_value() is None:
        error_logger.error(
            "Critical error: Backend secrets encryption key is not set. The application cannot run without it."
        )
        raise Exception("Backend secrets encryption key is not set.")
    engine = create_db_engine(settings.database_url)
    localSession = create_session_factory(engine)
    db = localSession()
    try:
        sync_events_to_db(db)
    except Exception as ex:
        error_logger.error(
            f"APPLICATION ERROR | Cannot sync events to db | ",
            exc_info=True
        )
    run_automatic_events()
    start_scheduler()


    yield
    # Shutdown logic (optional)
    scheduler.shutdown()

app = FastAPI(
    lifespan=lifespan,
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
)







origins = [
    settings.frontend_url.rstrip("/"),
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ? temporary until google will use the new callback
app.include_router(auth.router, prefix="/auth", tags=["auth"])


app.include_router(user.router, prefix="/user", tags=["auth"])
app.include_router(account.router, prefix="/account", tags=["account"])
app.include_router(dataset.router, prefix="/dataset", tags=["dataset"])
app.include_router(secrets.router, prefix="/secretes", tags=["secrets"])
app.include_router(meta.router, prefix="/meta", tags=["meta"])
app.include_router(email.router, prefix="/email", tags=["gmail", "email"])
app.include_router(telegram.router, prefix="/telegram", tags=["telegram"])
app.include_router(nlp.router, prefix="/nlp", tags=["nlp"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])



print(f"API router initialized")

@app.get("/health")
def health_check():
    return {"message": "API is healthy", "success": True}

@app.get("/")
def read_root():
    """Return a basic health response for the API.

    Authentication:
        Not required.

    Request Body:
        None.

    Returns:
        message: str - Human-readable status message.
        success: bool - True when the API process is reachable.
    """
    return {"message": f"API is running ", "success": True}



@app.exception_handler(NotAuthenticatedError)
async def not_authenticated_handler(request: Request, ex: NotAuthenticatedError):
    ip = request.client.host
    method = request.method
    path = request.url.path

    error_logger.error(
        f"Not authenticated error | Layer: Authentication | "
        f"{ip} | {method} {path} | "
        f"Message: Not authenticated | Message: {ex.message} | Only back message : {ex.only_back_message} "
    )

    response = JSONResponse(
        status_code=401, 
        content={"message": "Not authenticated"}
    )
    response.delete_cookie("local_app_token")
    response.delete_cookie("google_token")
    return response

# 2. Handle ApplicationError
@app.exception_handler(ApplicationError)
async def application_error_handler(request: Request, ex: ApplicationError):
    ip = request.client.host
    method = request.method
    path = request.url.path
    
    error_logger.error(
        f"APPLICATION ERROR | Layer: {ex.layer} | "
        f"{ip} | {method} {path} | "
        f"Priority: {ex.priority} | "
        f"Message: {ex.message} | "
        f"Details: {ex.details} | "
        f"Only back: {ex.only_back_message}",
        exc_info=(type(ex.ex), ex.ex, ex.ex.__traceback__) if ex.ex else True
    )
    
    return JSONResponse(
        status_code=490,
        content={"message": ex.message}
    )

# 3. Handle InfrastructureError
@app.exception_handler(InfrastructureError)
async def infrastructure_error_handler(request: Request, ex: InfrastructureError):
    ip = request.client.host
    method = request.method
    path = request.url.path

    error_logger.error(
        f"INFRASTRUCTURE ERROR | Layer: {ex.layer} | "
        f"{ip} | {method} {path} | "
        f"Priority: {ex.priority} | "
        f"Message: {ex.message} | "
        f"Details: {ex.details} | "
        f"Only back: {ex.only_back_message}",
        exc_info=(type(ex.ex), ex.ex, ex.ex.__traceback__) if ex.ex else True
    )

    return JSONResponse(
        status_code=491,
        content={"message": ex.message}
    )

# 4. Handle all other unexpected errors
@app.exception_handler(Exception)
async def general_exception_handler(request: Request, ex: Exception):
    ip = request.client.host
    method = request.method
    path = request.url.path
    error_logger.error(
            f"UNHANDLED EXCEPTION | {ip} | {method} {path} | ex: {str(ex)}",
            exc_info=True
        )
    return JSONResponse(
        status_code=500, # Use 500 for true internal errors
        content={"message": "Internal server error"}
    )

@app.middleware("http")
async def error_middleware(request, call_next):
    ip = request.client.host
    method = request.method
    path = request.url.path

    response = await call_next(request)
    requests_logger.info(
        f"[bold green]REQUEST DONE[/bold green] "
        f"{ip} - {method} {path} - "
        f"[cyan]{response.status_code}[/cyan]"
    )
    return response