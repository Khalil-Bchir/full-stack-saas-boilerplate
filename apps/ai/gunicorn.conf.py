import os

bind = f"0.0.0.0:{os.getenv('AI_SERVICE_PORT', '5000')}"
workers = int(os.getenv('AI_GUNICORN_WORKERS', '1'))
threads = int(os.getenv('AI_GUNICORN_THREADS', '2'))
timeout = int(os.getenv('AI_GUNICORN_TIMEOUT', '120'))
accesslog = "-"
errorlog = "-"
loglevel = os.getenv('LOG_LEVEL', 'info').lower()
