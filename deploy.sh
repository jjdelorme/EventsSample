#!/bin/bash
###############################################################################
#
# Use this to build & deploy using Cloud Build.
#
###############################################################################
set -e

if [ -z "$PROJECT_ID" ]; then
    PROJECT_ID=$(gcloud config list --format 'value(core.project)')
fi

gcloud beta run deploy \
--region us-central1 \
--platform managed \
--allow-unauthenticated \
--set-secrets=/app/keys/public/public-key.pem=JwtPublicKey:latest,/app/keys/private/private-key.pem=JwtPrivateKey:latest \
--service-account="eventssample-sa@$PROJECT_ID.iam.gserviceaccount.com" \
--timeout=10m \
--source . \
eventssample