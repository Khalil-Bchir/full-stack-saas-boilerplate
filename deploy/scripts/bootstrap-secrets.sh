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

kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -

kubectl -n "${NAMESPACE}" create secret generic saas-api-env \
  --from-literal=NODE_ENV="${NODE_ENV}" \
  --from-literal=SERVER_PORT="${SERVER_PORT}" \
  --from-literal=SERVER_HOST="${SERVER_HOST}" \
  --from-literal=DATABASE_URL="${DATABASE_URL}" \
  --from-literal=ACCESS_TOKEN_SECRET="${ACCESS_TOKEN_SECRET}" \
  --from-literal=ACCESS_TOKEN_TTL="${ACCESS_TOKEN_TTL}" \
  --from-literal=COOKIE_SECRET="${COOKIE_SECRET}" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl -n "${NAMESPACE}" create secret generic saas-app-env \
  --from-literal=NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL}" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Secrets applied in namespace: ${NAMESPACE}"
