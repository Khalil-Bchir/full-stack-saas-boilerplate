#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${1:-saas-staging}"
ENV_FILE="${2:-.env.staging.example}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Env file not found: ${ENV_FILE}"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

: "${NODE_ENV:?NODE_ENV is required}"
: "${SERVER_PORT:?SERVER_PORT is required}"
: "${SERVER_HOST:?SERVER_HOST is required}"
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${ACCESS_TOKEN_SECRET:?ACCESS_TOKEN_SECRET is required}"
: "${ACCESS_TOKEN_TTL:?ACCESS_TOKEN_TTL is required}"
: "${COOKIE_SECRET:?COOKIE_SECRET is required}"
: "${NEXT_PUBLIC_API_URL:?NEXT_PUBLIC_API_URL is required}"
: "${REDIS_URL:?REDIS_URL is required}"

AI_STREAM_KEY="${AI_STREAM_KEY:-ai:jobs}"
AI_CONSUMER_GROUP="${AI_CONSUMER_GROUP:-ai-workers}"
AI_CACHE_TTL_SECONDS="${AI_CACHE_TTL_SECONDS:-300}"
AI_SERVICE_HOST="${AI_SERVICE_HOST:-0.0.0.0}"
AI_SERVICE_PORT="${AI_SERVICE_PORT:-5000}"
AI_ENABLE_WORKER="${AI_ENABLE_WORKER:-true}"
AI_WORKER_CONCURRENCY="${AI_WORKER_CONCURRENCY:-1}"
AI_INTERNAL_TOKEN="${AI_INTERNAL_TOKEN:-}"
LOG_LEVEL="${LOG_LEVEL:-INFO}"

kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -

kubectl -n "${NAMESPACE}" create secret generic saas-api-env \
  --from-literal=NODE_ENV="${NODE_ENV}" \
  --from-literal=SERVER_PORT="${SERVER_PORT}" \
  --from-literal=SERVER_HOST="${SERVER_HOST}" \
  --from-literal=DATABASE_URL="${DATABASE_URL}" \
  --from-literal=ACCESS_TOKEN_SECRET="${ACCESS_TOKEN_SECRET}" \
  --from-literal=ACCESS_TOKEN_TTL="${ACCESS_TOKEN_TTL}" \
  --from-literal=COOKIE_SECRET="${COOKIE_SECRET}" \
  --from-literal=REDIS_URL="${REDIS_URL}" \
  --from-literal=AI_STREAM_KEY="${AI_STREAM_KEY}" \
  --from-literal=AI_CONSUMER_GROUP="${AI_CONSUMER_GROUP}" \
  --from-literal=AI_CACHE_TTL_SECONDS="${AI_CACHE_TTL_SECONDS}" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl -n "${NAMESPACE}" create secret generic saas-ai-env \
  --from-literal=NODE_ENV="${NODE_ENV}" \
  --from-literal=DATABASE_URL="${DATABASE_URL}" \
  --from-literal=REDIS_URL="${REDIS_URL}" \
  --from-literal=AI_SERVICE_HOST="${AI_SERVICE_HOST}" \
  --from-literal=AI_SERVICE_PORT="${AI_SERVICE_PORT}" \
  --from-literal=AI_STREAM_KEY="${AI_STREAM_KEY}" \
  --from-literal=AI_CONSUMER_GROUP="${AI_CONSUMER_GROUP}" \
  --from-literal=AI_ENABLE_WORKER="${AI_ENABLE_WORKER}" \
  --from-literal=AI_WORKER_CONCURRENCY="${AI_WORKER_CONCURRENCY}" \
  --from-literal=AI_INTERNAL_TOKEN="${AI_INTERNAL_TOKEN}" \
  --from-literal=LOG_LEVEL="${LOG_LEVEL}" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl -n "${NAMESPACE}" create secret generic saas-app-env \
  --from-literal=NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL}" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Secrets applied in namespace: ${NAMESPACE}"
echo "  - saas-api-env"
echo "  - saas-ai-env"
echo "  - saas-app-env"
