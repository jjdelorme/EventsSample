#!/bin/bash
###############################################################################
#
# OPTIONALY use this to set the appropriate org policies.
#
###############################################################################
set -e

PROJECT_ID=$(gcloud config list --format 'value(core.project)')

gcloud services enable "orgpolicy.googleapis.com"

ORGANIZATION_ID=`gcloud organizations list --format="value(ID)"`

rm -rf new_policy.yaml

# Inner Loop - Loop Through Policies with Constraints
declare -a policies=("constraints/compute.trustedImageProjects"
                "constraints/compute.vmExternalIpAccess"
                "constraints/compute.restrictSharedVpcSubnetworks"
                "constraints/compute.restrictSharedVpcHostProjects"
                "constraints/compute.restrictVpcPeering"
                "constraints/compute.vmCanIpForward"
                "constraints/run.allowedIngress"
                "constraints/iam.allowedPolicyMemberDomains"
                )
for policy in "${policies[@]}"
do
cat <<EOF > new_policy.yaml
constraint: $policy
listPolicy:
 allValues: ALLOW
EOF
gcloud resource-manager org-policies set-policy new_policy.yaml --project=$PROJECT_ID
done
# End Inner Loop

# Disable Policies without Constraints
gcloud beta resource-manager org-policies disable-enforce compute.requireShieldedVm --project=$PROJECT_ID
gcloud beta resource-manager org-policies disable-enforce compute.requireOsLogin --project=$PROJECT_ID
gcloud beta resource-manager org-policies disable-enforce iam.disableServiceAccountKeyCreation --project=$PROJECT_ID
gcloud beta resource-manager org-policies disable-enforce iam.disableServiceAccountCreation --project=$PROJECT_ID

rm -rf new_policy.yaml