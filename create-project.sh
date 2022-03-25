#!/bin/bash
###############################################################################
#
# Use this to create a project and associate the 1st billing account with it.
#
# Usage: ./create-project MyProjectName 0FFFFF-EEEEEE-333333
#
###############################################################################
set -e

# Define project:
[[ -z "$1" ]] && { echo "Project Id empty" ; exit 1; }
PROJECT_ID=$1

if [ -z "$2" ]
then
  echo "Getting the first billing account available."
  # Attempt to get the first Account ID from billing if not passed.
  ACCOUNT_ID=`gcloud alpha billing accounts list --format 'value(name)' --filter=open=true --limit 1 2>/dev/null`
else
    ACCOUNT_ID=$2
fi

[[ -z "$1" ]] && { echo "Account Id empty" ; exit 1; }

gcloud projects create $PROJECT_ID
gcloud alpha billing accounts projects link $PROJECT_ID --billing-account=$ACCOUNT_ID
gcloud config set project $PROJECT_ID