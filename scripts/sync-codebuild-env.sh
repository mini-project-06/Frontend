#!/usr/bin/env bash

set -eu

OUTPUT_FILE=".env.production"

if [ -z "${VITE_API_URL:-}" ]; then
  echo "Error: VITE_API_URL is not set in CodeBuild environment."
  echo "Set it either in CodeBuild project environment variables or via SSM Parameter Store."
  exit 1
fi

cat > "$OUTPUT_FILE" <<EOF
VITE_API_URL=${VITE_API_URL:-}
EOF

echo "Created ${OUTPUT_FILE} for Vite build."
