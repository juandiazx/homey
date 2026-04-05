"""Logging infrastructure for the Homey backend.

This module provides structured logging with correlation IDs, JSON output,
and consistent formatting across the application.
"""

import json
import logging
import sys
import traceback
import uuid
from contextvars import ContextVar
from typing import Optional

# Context variable for correlation ID across async calls
correlation_id_var: ContextVar[Optional[str]] = ContextVar(
    "correlation_id", default=None
)


class JsonFormatter(logging.Formatter):
    """Format log records as JSON with proper exception handling."""

    def format(self, record: logging.LogRecord) -> str:
        """Format the log record as JSON.

        Args:
            record: The log record to format

        Returns:
            JSON-formatted log string
        """
        log_data = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "correlation_id": getattr(record, "correlation_id", "N/A"),
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = {
                "type": record.exc_info[0].__name__ if record.exc_info[0] else None,
                "message": str(record.exc_info[1]) if record.exc_info[1] else None,
                "traceback": traceback.format_exception(*record.exc_info),
            }

        return json.dumps(log_data)


class CorrelationIdFilter(logging.Filter):
    """Add correlation ID to log records for request tracking."""

    def filter(self, record: logging.LogRecord) -> bool:
        """Add correlation_id to the log record.

        Args:
            record: The log record to filter

        Returns:
            Always True to allow the record through
        """
        record.correlation_id = correlation_id_var.get() or "N/A"
        return True


def configure_root_logger(
    level: int = logging.INFO,
    json_output: bool = False,
) -> None:
    """Configure the root logger for the entire application.

    This ensures all loggers created with logging.getLogger() inherit
    the custom formatting and correlation ID filter.

    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        json_output: Whether to output logs in JSON format (for production)
    """
    root_logger = logging.getLogger()

    # Clear existing handlers
    root_logger.handlers.clear()

    # Set level
    root_logger.setLevel(level)

    # Create console handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)

    # Add correlation ID filter
    handler.addFilter(CorrelationIdFilter())

    # Set formatter based on output type
    if json_output:
        formatter = JsonFormatter()
    else:
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - [%(correlation_id)s] - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )

    handler.setFormatter(formatter)
    root_logger.addHandler(handler)


def set_correlation_id(correlation_id: Optional[str] = None) -> str:
    """Set or generate a correlation ID for the current context.

    Args:
        correlation_id: Correlation ID to use, or None to generate a new one

    Returns:
        The correlation ID that was set
    """
    if correlation_id is None:
        correlation_id = str(uuid.uuid4())

    correlation_id_var.set(correlation_id)
    return correlation_id


def get_correlation_id() -> Optional[str]:
    """Get the current correlation ID.

    Returns:
        The current correlation ID or None if not set
    """
    return correlation_id_var.get()


def clear_correlation_id() -> None:
    """Clear the correlation ID from the current context."""
    correlation_id_var.set(None)
