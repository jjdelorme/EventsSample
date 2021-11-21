#!/bin/bash
set -e

PROJECT_ID=$(gcloud config list --format 'value(core.project)')
REGION=$(gcloud config list --format 'value(run.region)')
SUFFIX=$(git rev-parse --short HEAD)
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/eventssample/eventssample:$SUFFIX"

pushd $PWD
cd ../
docker build --build-arg COMMIT_SHA=${SUFFIX} -t $IMAGE .
docker push $IMAGE
popd
gcloud run deploy \
        --image $IMAGE \
        eventssample
