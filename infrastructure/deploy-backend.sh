#!/bin/bash
# HerbiGPT Cloud Run deployment helper script.

set -e

# Load project configuration
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: Google Cloud Project ID not detected. Run 'gcloud config set project <PROJECT_ID>' first."
  exit 1
fi

REGION="us-central1"
SERVICE_NAME="herbigpt-backend"
REPO_NAME="herbigpt-repo"

echo "🚀 Deploying HerbiGPT Backend to Cloud Run..."
echo "Project: $PROJECT_ID, Region: $REGION, Service: $SERVICE_NAME"

# 1. Enable Cloud Run & Artifact Registry
echo "Enabling Cloud Run and Artifact Registry APIs..."
gcloud services enable run.googleapis.com artifactregistry.googleapis.com

# 2. Create Artifact Registry repository if not exists
if gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" &>/dev/null; then
  echo "✓ Artifact Registry repository $REPO_NAME already exists."
else
  echo "Creating Artifact Registry repository $REPO_NAME..."
  gcloud artifacts repositories create "$REPO_NAME" \
    --repository-format=docker \
    --location="$REGION" \
    --description="HerbiGPT Docker Images repository"
fi

# 3. Configure local docker authentication
echo "Configuring Docker authentication..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# 4. Build and Push using Cloud Build
echo "Building and pushing container using Cloud Build..."
IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}:latest"
gcloud builds submit --tag "$IMAGE_TAG" ../backend

# 5. Deploy to Cloud Run
echo "Deploying to Cloud Run service..."
gcloud run deploy "$SERVICE_NAME" \
  --image="$IMAGE_TAG" \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --update-secrets=GROQ_API_KEY=GROQ_API_KEY:latest,GOOGLE_API_KEY=GOOGLE_API_KEY:latest \
  --update-env-vars=NODE_ENV=production,LOG_LEVEL=info

# 6. Print status
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format='value(status.url)')
echo "=========================================================="
echo "✓ Backend deployed successfully!"
echo "----------------------------------------------------------"
echo "Service URL: $SERVICE_URL"
echo "=========================================================="
