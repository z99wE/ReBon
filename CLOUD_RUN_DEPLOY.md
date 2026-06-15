# Deploy ReBon to Cloud Run (Free Tier)

This guide deploys ReBon to Google Cloud Run with a free tier that scales to zero.

---

## Prerequisites

- Google Cloud account (free tier available)
- `gcloud` CLI installed: https://cloud.google.com/sdk/docs/install
- Docker installed: https://docs.docker.com/get-docker/
- Git repository: https://github.com/z99wE/ReBon

---

## Setup Steps

### 1. Create Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project
gcloud projects create rebon-carbon --name="ReBon Carbon"

# Set the project
gcloud config set project rebon-carbon

# Enable billing (required for Cloud Run, but free tier applies)
gcloud beta billing projects link rebon-carbon --billing-account=YOUR_BILLING_ACCOUNT_ID

# Enable Cloud Run API
gcloud services enable run.googleapis.com containerregistry.googleapis.com
```

### 2. Set Up Database (TiDB Cloud - Free)

Use TiDB Cloud (free tier) for MySQL-compatible database:

1. Sign up: https://tidbcloud.com
2. Create a free cluster
3. Get connection string: `mysql://root@host:4000/rebon`
4. Run migrations:
   ```bash
   pnpm drizzle-kit generate
   mysql -h <host> -P 4000 -u root -p rebon < drizzle/migrations/0001_*.sql
   ```

### 3. Configure Environment Variables

```bash
# Set environment variables in Cloud Run
gcloud run services update rebon \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL="mysql://user:pass@host:4000/rebon", \
  JWT_SECRET="$(openssl rand -hex 32)", \
  GROQ_API_KEY="gsk_...", \
  NVIDIA_NIM_API_KEY="nvapi-...", \
  DEEPGRAM_API_KEY="857350ae54cb167bfa5093f2b968c3366a527135", \
  SARVAM_API_KEY="sk_...", \
  VITE_APP_ID="your-manus-app-id", \
  OAUTH_SERVER_URL="https://api.manus.im", \
  VITE_OAUTH_PORTAL_URL="https://manus.im/login", \
  BUILT_IN_FORGE_API_URL="https://api.manus.im/forge", \
  BUILT_IN_FORGE_API_KEY="your-forge-key", \
  OWNER_OPEN_ID="your-open-id", \
  OWNER_NAME="Your Name"
```

### 4. Build and Deploy

```bash
# Build Docker image
docker build -t gcr.io/rebon-carbon/rebon .

# Push to Google Container Registry
docker push gcr.io/rebon-carbon/rebon

# Deploy to Cloud Run
gcloud run deploy rebon \
  --image gcr.io/rebon-carbon/rebon \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 300s
```

### 5. Get Live URL

```bash
gcloud run services describe rebon --platform managed --region us-central1 --format="value(status.url)"
```

You'll get: `https://rebon-xxxxxx-uc.a.run.app`

---

## Free Tier Limits

| Resource | Free Tier | Your App Usage |
|---|---|---|
| Requests | 2M/month | ~100K/month (estimated) |
| CPU-seconds | 180K/month | ~50K/month (estimated) |
| Memory | 40GB-seconds | ~10GB-seconds (estimated) |
| Storage | 5GB | ~100MB (database) |
| Egress | 1GB/month | ~100MB (estimated) |

**Estimated cost: $0** (well within free tier)

---

## Auto-Deploy from GitHub

### Option 1: Cloud Build Triggers

1. Go to Cloud Build → Triggers
2. Connect GitHub repository: `z99wE/ReBon`
3. Configure trigger:
   - Event: Push to `main` branch
   - Build configuration: `cloudbuild.yaml`

### Option 2: GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
          service_account: ${{ secrets.SA_EMAIL }}

      - name: Build and push Docker image
        run: |
          docker build -t gcr.io/${{ vars.PROJECT_ID }}/rebon:${{ github.sha }} .
          docker push gcr.io/${{ vars.PROJECT_ID }}/rebon:${{ github.sha }}

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy rebon \
            --image gcr.io/${{ vars.PROJECT_ID }}/rebon:${{ github.sha }} \
            --platform managed \
            --region us-central1 \
            --allow-unauthenticated \
            --set-env-vars DATABASE_URL=${{ secrets.DATABASE_URL }}, \
            JWT_SECRET=${{ secrets.JWT_SECRET }}, \
            GROQ_API_KEY=${{ secrets.GROQ_API_KEY }}, \
            NVIDIA_NIM_API_KEY=${{ secrets.NVIDIA_NIM_API_KEY }}, \
            DEEPGRAM_API_KEY=${{ secrets.DEEPGRAM_API_KEY }}, \
            SARVAM_API_KEY=${{ secrets.SARVAM_API_KEY }}, \
            VITE_APP_ID=${{ secrets.VITE_APP_ID }}, \
            OAUTH_SERVER_URL=${{ secrets.OAUTH_SERVER_URL }}, \
            VITE_OAUTH_PORTAL_URL=${{ secrets.VITE_OAUTH_PORTAL_URL }}, \
            BUILT_IN_FORGE_API_URL=${{ secrets.BUILT_IN_FORGE_API_URL }}, \
            BUILT_IN_FORGE_API_KEY=${{ secrets.BUILT_IN_FORGE_API_KEY }}, \
            OWNER_OPEN_ID=${{ secrets.OWNER_OPEN_ID }}, \
            OWNER_NAME=${{ secrets.OWNER_NAME }}
```

---

## Cost Optimization

1. **Region selection**: `us-central1` is cheapest
2. **Memory**: 512Mi is sufficient (free tier allows 2GB)
3. **Timeout**: 300s is max, adjust based on needs
4. **Scale to zero**: Cloud Run automatically scales down when idle

---

## Monitoring

```bash
# View logs
gcloud run services logs read rebon \
  --platform managed \
  --region us-central1

# View metrics
gcloud monitoring dashboards describe cloud-run-rebon
```

---

## SSL/HTTPS

Cloud Run provides free SSL certificates automatically. Your app will be available at:
```
https://rebon-xxxxxx-uc.a.run.app
```

---

## Custom Domain (Optional)

1. Buy domain from Google Domains, Namecheap, etc.
2. In Cloud Run, click "Manage Custom Domains"
3. Add domain and validate DNS
4. Cloud Run provisions free Let's Encrypt certificate

---

## Troubleshooting

### Container fails to start

```bash
# Check logs
gcloud run services logs read rebon --platform managed --region us-central1

# Test locally
docker run -p 3000:3000 gcr.io/rebon-carbon/rebon
```

### Database connection fails

Verify `DATABASE_URL` format:
```
mysql://user:password@host:3306/database
```

### AI keys not working

Verify environment variables are set:
```bash
gcloud run services describe rebon --format="value(spec.template.spec.containers[0].env)"
```

---

## Cost Management

Set up budget alerts:

```bash
gcloud billing budgets create \
  --billing-account=YOUR_ACCOUNT_ID \
  --display-name="ReBon Budget" \
  --amount=0 \
  --threshold-percentages=50,100
```

---

**Expected outcome**: Free, scalable deployment with auto-updates from GitHub.
