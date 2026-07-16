FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

FROM base AS runner

RUN groupadd --gid 1001 ai \
  && useradd --system --uid 1001 --gid ai aiuser

COPY --from=deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

COPY app ./app
COPY gunicorn.conf.py .

USER aiuser

EXPOSE 5000

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["python", "-m", "app.entrypoint"]
