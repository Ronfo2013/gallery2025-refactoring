#!/usr/bin/env bash

set -euo pipefail

BRAND_DOC_ID="$1"
if [[ -z "$BRAND_DOC_ID" ]]; then
  echo "Usage: $0 <brandDocumentId>"
  exit 1
fi

if [[ -z "${GOOGLE_APPLICATION_CREDENTIALS:-}" ]]; then
  echo "Set GOOGLE_APPLICATION_CREDENTIALS to the service account key"
  exit 1
fi

ACCESS_TOKEN=$(gcloud auth application-default print-access-token)
BRAND_PATH="projects/gallery-app-972f9/databases/(default)/documents/brands/${BRAND_DOC_ID}"
BRAND_JSON=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" "https://firestore.googleapis.com/v1/${BRAND_PATH}")
BRAND_ID=$(echo "$BRAND_PATH" | cut -d'/' -f6)
BRAND_SLUG=$(echo "$BRAND_JSON" | jq -r '.fields.slug.stringValue')
SUPERUSER_UID=$(echo "$BRAND_JSON" | jq -r '.fields.superuserId.stringValue')
SUPERUSER_EMAIL=$(echo "$BRAND_JSON" | jq -r '.fields.ownerEmail.stringValue')

node scripts/ensure-superuser-doc.cjs "$SUPERUSER_UID" "$BRAND_ID" "$SUPERUSER_EMAIL"

echo "Superuser doc ensured."
echo "Dashboard: https://gallery-app-972f9.web.app/${BRAND_SLUG}/#/dashboard"
echo "Gallery: https://gallery-app-972f9.web.app/${BRAND_SLUG}/"
