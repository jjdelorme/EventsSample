#!/bin/bash
###############################################################################
#
# Use this to build locally and do a canary deploy instead of Cloud Build.
#
###############################################################################
set -e

PROJECT_ID=$(gcloud config list --format 'value(core.project)')
REGION=$(gcloud config list --format 'value(run.region)')
SUFFIX=$(git rev-parse --short HEAD)

if [ -z $PROJECT_ID ]
then
  echo "ERROR.  Please ensure that your core.project is set with gcloud config."
  exit
fi

if [ -z $REGION ] 
then
  echo "ERROR.  Please ensure that your run/region, for example: gcloud config set run/region us-central1"
  exit
fi

IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/eventssample/eventssample:$SUFFIX"

docker build --build-arg COMMIT_SHA=${SUFFIX} -t $IMAGE .
docker push $IMAGE

gcloud run deploy \
        --image $IMAGE \
        --tag test \
        --no-traffic \
        eventssample
# #To restore sending traffic to new builds: 
# gcloud run services update-traffic --to-latest eventssample