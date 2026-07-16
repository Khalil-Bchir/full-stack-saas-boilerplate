#!/usr/bin/env sh
# Resolve a Python interpreter for local (non-Docker) AI runs.
set -eu
cd "$(dirname "$0")/.."

if [ -x .venv/bin/python ]; then
  exec .venv/bin/python "$@"
fi

if command -v python3 >/dev/null 2>&1; then
  exec python3 "$@"
fi

if command -v python >/dev/null 2>&1; then
  exec python "$@"
fi

echo "@saas-boilerplate/ai: Python not found." >&2
echo "Recommended: pnpm infra:up  (Docker Redis + AI worker)" >&2
echo "Or locally:  cd apps/ai && python3 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt" >&2
exit 1
