"""Setup logging for our application. Logging will log into logs/. We have 3 loggers: requests_logger, warning_logger and error_logger.
    requests_logger will log all incoming requests with info level.
    warning_logger will log all warnings with warning level.
    error_logger will log all errors with error level.
"""


import logging
import os
from logging.handlers import RotatingFileHandler
from rich.console import Console

console = Console()

LOG_FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"
MAX_LOG_BYTES = 5_000_000
BACKUP_COUNT = 3

REQUESTS_LOGGER_NAME = "requests_logger"
WARNING_LOGGER_NAME = "warning_logger"
ERROR_LOGGER_NAME = "error_logger"

_LOGGING_CONFIGURED = False


class _ConsoleMessageOnlyFormatter(logging.Formatter):
    def format(self, record):
        current_exc_info = record.exc_info
        current_exc_text = record.exc_text
        current_stack_info = record.stack_info
        record.exc_info = None
        record.exc_text = None
        record.stack_info = None
        try:
            return super().format(record)
        finally:
            record.exc_info = current_exc_info
            record.exc_text = current_exc_text
            record.stack_info = current_stack_info


def _remove_handlers(logger: logging.Logger):
    for handler in list(logger.handlers):
        logger.removeHandler(handler)
        try:
            handler.close()
        except Exception:
            pass


def _create_rotating_handler(file_path: str, level: int) -> RotatingFileHandler:
    handler = RotatingFileHandler(
        file_path,
        maxBytes=MAX_LOG_BYTES,
        backupCount=BACKUP_COUNT,
        encoding="utf-8"
    )
    handler.setLevel(level)
    handler.setFormatter(logging.Formatter(LOG_FORMAT, DATE_FORMAT))
    return handler


def _create_console_handler(level: int) -> logging.StreamHandler:
    handler = logging.StreamHandler()
    handler.setLevel(level)
    handler.setFormatter(_ConsoleMessageOnlyFormatter("%(levelname)s - %(message)s"))
    return handler


def _configure_root_logger():
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.WARNING)
    _remove_handlers(root_logger)


def _configure_third_party_loggers() -> None:
    logging.getLogger("telethon.network.connection.connection").setLevel(logging.ERROR)
    logging.getLogger("telethon.network.mtprotosender").setLevel(logging.ERROR)


def _configure_requests_logger(log_dir: str):
    logger = logging.getLogger(REQUESTS_LOGGER_NAME)
    logger.setLevel(logging.INFO)
    logger.propagate = False
    _remove_handlers(logger)
    logger.addHandler(
        _create_rotating_handler(os.path.join(log_dir, "requests.log"), logging.INFO)
    )
    handler.addFilter(_HealthCheckFilter())
    logger.addHandler(handler)


def _configure_warning_logger(log_dir: str):
    logger = logging.getLogger(WARNING_LOGGER_NAME)
    logger.setLevel(logging.WARNING)
    logger.propagate = False
    _remove_handlers(logger)
    logger.addHandler(
        _create_rotating_handler(os.path.join(log_dir, "warning_logs.log"), logging.WARNING)
    )
    logger.addHandler(_create_console_handler(logging.WARNING))


def _configure_error_logger(log_dir: str):
    logger = logging.getLogger(ERROR_LOGGER_NAME)
    logger.setLevel(logging.ERROR)
    logger.propagate = False
    _remove_handlers(logger)
    logger.addHandler(
        _create_rotating_handler(os.path.join(log_dir, "error_logs.log"), logging.ERROR)
    )
    logger.addHandler(_create_console_handler(logging.ERROR))


def setup_logging(log_dir: str = "./logs"):
    global _LOGGING_CONFIGURED
    if _LOGGING_CONFIGURED:
        return

    os.makedirs(log_dir, exist_ok=True)

    _configure_root_logger()
    _configure_third_party_loggers()
    _configure_requests_logger(log_dir)
    _configure_warning_logger(log_dir)
    _configure_error_logger(log_dir)
    _LOGGING_CONFIGURED = True

def print_info_message(message):
    console.print(message)
