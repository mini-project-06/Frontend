#!/usr/bin/env bash

set -eu

OUTPUT_FILE=".env.production"

cat > "$OUTPUT_FILE" <<EOF
VITE_API_URL=${VITE_API_URL:-}
EOF

echo "Created ${OUTPUT_FILE} for Vite build."

if [ -z "${VITE_API_URL:-}" ]; then
  echo "Warning: VITE_API_URL is empty."
fi
