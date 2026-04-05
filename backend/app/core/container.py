"""Dependency Injection Container."""

from openai import AsyncOpenAI

from .config import settings


class AppContainer:
    """Manages the lifecycle of all application-level singletons."""

    def __init__(self) -> None:
        self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def shutdown(self) -> None:
        await self.openai_client.close()


_container: AppContainer | None = None


def get_container() -> AppContainer:
    """Lazily initialize and return the global container."""
    global _container
    if _container is None:
        _container = AppContainer()
    return _container


async def reset_container() -> None:
    """Shut down and clear the global container."""
    global _container
    if _container is not None:
        await _container.shutdown()
    _container = None
