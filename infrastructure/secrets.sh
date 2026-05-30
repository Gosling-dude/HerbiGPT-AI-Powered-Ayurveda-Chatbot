#!/bin/bash
# HerbiGPT Secret Manager configuration script.
# This script initializes the required LLM API keys in Secret Manager.

set -e

# Load project configuration
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: Google Cloud Project ID not detected. Run 'gcloud config set project <PROJECT_ID>' first."
  exit 1
fi

echo "🚀 Bootstrapping Secret Manager secrets for Project: $PROJECT_ID"

# 1. Enable Secret Manager API
echo "Enabling Secret Manager API..."
gcloud services enable secretmanager.googleapis.com

# 2. Create GROQ_API_KEY secret
if gcloud secrets describe GROQ_API_KEY &>/dev/null; then
  echo "✓ Secret GROQ_API_KEY already exists."
else
  echo "Creating secret GROQ_API_KEY..."
  gcloud secrets create GROQ_API_KEY --replication-policy="automatic"
fi

# 3. Create GOOGLE_API_KEY secret
if gcloud secrets describe GOOGLE_API_KEY &>/dev/null; then
  echo "✓ Secret GOOGLE_API_KEY already exists."
else
  echo "Creating secret GOOGLE_API_KEY..."
  gcloud secrets create GOOGLE_API_KEY --replication-policy="automatic"
fi

# 4. Prompt to add versions if not automated
echo ""
echo "=========================================================="
echo "✓ Secrets created. Now add values to your secrets:"
echo "----------------------------------------------------------"
echo "To add Groq API Key:"
echo "  echo -n 'YOUR_GROQ_API_KEY' | gcloud secrets versions add GROQ_API_KEY --data-file=-"
echo ""
echo "To add Google Generative AI API Key:"
echo "  echo -n 'YOUR_GOOGLE_API_KEY' | gcloud secrets versions add GOOGLE_API_KEY --data-file=-"
echo "=========================================================="
