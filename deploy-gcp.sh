#!/bin/bash

# Deploy ReBon to Google Cloud Run
# Project ID: buildwithai-499306

PROJECT_ID="buildwithai-499306"
REGION="us-central1"
SERVICE_NAME="rebon-carbon"

echo "🚀 Deploying ReBon to Cloud Run..."

# Set project
gcloud config set project $PROJECT_ID

# Enable APIs
echo "📋 Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Build Docker image using Google Cloud Build
echo "🔨 Building Docker image using Google Cloud Build..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/rebon:latest .

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/rebon:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300s \
  --set-env-vars DATABASE_URL="$DATABASE_URL" \
  --set-env-vars JWT_SECRET="$(openssl rand -hex 32)" \
  --set-env-vars GROQ_API_KEY="gsk_XmqGPMqkGzr1YftrYH6zWGdyb3FYZJLUQhKo5bgdyhTV3GqAGGfzXD" \
  --set-env-vars NVIDIA_NIM_API_KEY="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" \
  --set-env-vars DEEPGRAM_API_KEY="857350ae54cb167bfa5093f2b968c3366a527135" \
  --set-env-vars SARVAM_API_KEY="sk_hrvqm*****OQ"

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --format="value(status.url)")

echo "✅ Deployment complete!"
echo "🌐 App URL: $SERVICE_URL"
echo ""
echo "Test your app:"
echo "curl $SERVICE_URL/api/simple-auth/me"