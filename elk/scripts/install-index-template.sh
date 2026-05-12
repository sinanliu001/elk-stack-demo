#!/usr/bin/env sh
# Install the node-logs composable index template against Elasticsearch on localhost.
# Run from repo root or anywhere; defaults to http://localhost:9200
set -e
ELASTICSEARCH_URL="${ELASTICSEARCH_URL:-http://localhost:9200}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
curl -sS -f -X PUT "${ELASTICSEARCH_URL}/_index_template/node-logs" \
  -H "Content-Type: application/json" \
  --data-binary @"${ROOT_DIR}/templates/node-logs-index-template.json"
echo
echo "Index template 'node-logs' installed (or updated)."
