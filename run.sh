#!/bin/bash
###############################################################################
#
# Use this script to run the docker container locally.
#
###############################################################################
set -e

PROJECT_ID=$(gcloud config list --format 'value(core.project)')
REGION=$(gcloud config list --format 'value(run.region)')
SUFFIX=$(git rev-parse --short HEAD)

IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/eventssample/eventssample:$SUFFIX"

docker run --rm -it -p 8080:8080 \
    -v $PWD/api/keys:/app/keys \
    -e GOOGLE_APPLICATION_CREDENTIALS=/app/keys/key.json \
    -e ProjectId=$PROJECT_ID \
    $IMAGE
