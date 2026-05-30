#!/bin/bash
# HerbiGPT GCS Static Website and Cloud CDN configuration script.

set -e

# Load project configuration
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: Google Cloud Project ID not detected. Run 'gcloud config set project <PROJECT_ID>' first."
  exit 1
fi

BUCKET_NAME="herbigpt-frontend-${PROJECT_ID}"
REGION="us-central1"

echo "🚀 Configuring Cloud Storage Bucket: $BUCKET_NAME in region: $REGION"

# 1. Enable APIs
echo "Enabling Compute Engine API (required for Load Balancing/CDN)..."
gcloud services enable compute.googleapis.com

# 2. Create the bucket
if gsutil ls -b "gs://$BUCKET_NAME" &>/dev/null; then
  echo "✓ Bucket gs://$BUCKET_NAME already exists."
else
  echo "Creating bucket gs://$BUCKET_NAME..."
  gsutil mb -c standard -l "$REGION" "gs://$BUCKET_NAME"
fi

# 3. Configure bucket for static website hosting
echo "Configuring bucket website settings..."
gsutil web set -m index.html -e index.html "gs://$BUCKET_NAME"

# 4. Make bucket objects publicly accessible by default
echo "Configuring public read permissions..."
gsutil iam ch allUsers:objectViewer "gs://$BUCKET_NAME"

# 5. Set up Load Balancing with CDN
echo "Setting up Load Balancer with Cloud CDN..."

# Create backend bucket for CDN
if gcloud compute backend-buckets describe herbigpt-backend-bucket &>/dev/null; then
  echo "✓ Backend bucket herbigpt-backend-bucket already exists."
else
  gcloud compute backend-buckets create herbigpt-backend-bucket \
    --gcs-bucket-name="$BUCKET_NAME" \
    --enable-cdn
fi

# Create URL map (Load Balancer)
if gcloud compute url-maps describe herbigpt-lb &>/dev/null; then
  echo "✓ URL map herbigpt-lb already exists."
else
  gcloud compute url-maps create herbigpt-lb \
    --default-backend-bucket=herbigpt-backend-bucket
fi

# Create Target HTTP Proxy
if gcloud compute target-http-proxies describe herbigpt-http-proxy &>/dev/null; then
  echo "✓ Target HTTP proxy herbigpt-http-proxy already exists."
else
  gcloud compute target-http-proxies create herbigpt-http-proxy \
    --url-map=herbigpt-lb
fi

# Reserve a static global IP
if gcloud compute addresses describe herbigpt-global-ip --global &>/dev/null; then
  echo "✓ IP herbigpt-global-ip already reserved."
else
  gcloud compute addresses create herbigpt-global-ip --global
fi

IP_ADDRESS=$(gcloud compute addresses describe herbigpt-global-ip --global --format='value(address)')

# Create forwarding rule
if gcloud compute forwarding-rules describe herbigpt-http-rule --global &>/dev/null; then
  echo "✓ Forwarding rule herbigpt-http-rule already exists."
else
  gcloud compute forwarding-rules create herbigpt-http-rule \
    --address=herbigpt-global-ip \
    --global \
    --target-http-proxy=herbigpt-http-proxy \
    --ports=80
fi

echo "=========================================================="
echo "✓ Frontend Storage & CDN configuration complete!"
echo "----------------------------------------------------------"
echo "Your Frontend Static site is IP: $IP_ADDRESS"
echo "Point your custom domain (e.g. herbigpt.example.com) to this IP via an A-record."
echo "Use bucket name: $BUCKET_NAME in your GitHub Actions secrets as GCP_FRONTEND_BUCKET."
echo "=========================================================="
