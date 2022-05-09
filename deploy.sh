#!/bin/bash
###############################################################################
#
# Use this to build & deploy using Cloud Build.
#
###############################################################################
set -e

gcloud beta run deploy \
--region us-central1 \
--platform managed \
--allow-unauthenticated \
--set-secrets=/app/keys/public/public-key.pem=JwtPublicKey:latest,/app/keys/private/private-key.pem=JwtPrivateKey:latest \
--service-account="eventssample-sa@$PROJECT_ID.iam.gserviceaccount.com" \
--source . \
eventssample