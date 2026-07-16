from __future__ import annotations

import logging
import threading

from gunicorn.app.base import BaseApplication

from app.config import load_settings
from app.main import create_app
from app.worker import AiWorker

logger = logging.getLogger(__name__)


class StandaloneApplication(BaseApplication):
    def __init__(self, app, options=None):
        self.options = options or {}
        self.application = app
        super().__init__()

    def load_config(self):
        for key, value in self.options.items():
            if key in self.cfg.settings and value is not None:
                self.cfg.set(key.lower(), value)

    def load(self):
        return self.application


def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )
    settings = load_settings()
    app = create_app(settings)

    if settings.enable_worker:
        worker = AiWorker(settings)
        thread = threading.Thread(target=worker.run_forever, name="ai-worker", daemon=True)
        thread.start()
        logger.info("Background AI worker thread started")

    options = {
        "bind": f"{settings.host}:{settings.port}",
        "workers": 1,
        "threads": 2,
        "timeout": 120,
        "accesslog": "-",
        "errorlog": "-",
        "loglevel": settings.log_level.lower(),
    }
    StandaloneApplication(app, options).run()


if __name__ == "__main__":
    main()
