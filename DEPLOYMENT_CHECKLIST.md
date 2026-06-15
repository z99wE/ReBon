# Cloud Run Deployment Checklist

## Pre-Deployment

- [ ] **Project Setup**
  - [ ] Google Cloud project created: `buildwithai-499306`
  - [ ] Cloud Run API enabled
  - [ ] Container Registry API enabled
  - [ ] Billing account linked

- [ ] **Database**
  - [ ] TiDB Cloud account created (or MySQL setup)
  - [ ] Database cluster created
  - [ ] Database `rebon` created
  - [ ] Migrations applied: `pnpm drizzle-kit generate && drizzle/migrations/*.sql`
  - [ ] Database connection string ready

- [ ] **Environment Variables**
  - [ ] GROQ_API_KEY configured
  - [ ] NVIDIA_NIM_API_KEY configured
  - [ ] DEEPGRAM_API_KEY configured
  - [ ] SARVAM_API_KEY configured
  - [ ] DATABASE_URL configured
  - [ ] JWT_SECRET generated
  - [ ] VITE_APP_ID configured
  - [ ] BUILT_IN_FORGE_API_KEY configured
  - [ ] OWNER_OPEN_ID configured

## GitHub Actions Setup

- [ ] **GitHub Secrets** (Settings → Secrets and variables → Actions)
  - [ ] `WIF_PROVIDER` - Workload Identity Provider
  - [ ] `SA_EMAIL` - Service Account Email
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
  - [ ] `GROQ_API_KEY`
  - [ ] `NVIDIA_NIM_API_KEY`
  - [ ] `DEEPGRAM_API_KEY`
  - [ ] `SARVAM_API_KEY`
  - [ ] `VITE_APP_ID`
  - [ ] `OAUTH_SERVER_URL`
  - [ ] `VITE_OAUTH_PORTAL_URL`
  - [ ] `BUILT_IN_FORGE_API_URL`
  - [ ] `BUILT_IN_FORGE_API_KEY`
  - [ ] `OWNER_OPEN_ID`
  - [ ] `OWNER_NAME`

## Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Cloud Run deployment"
   git push origin main
   ```

2. **GitHub Actions** will auto-deploy

3. **Get Live URL**
   ```bash
   gcloud run services describe rebon-carbon \
     --platform managed \
     --region us-central1 \
     --format="value(status.url)"
   ```

## Post-Deployment

- [ ] Test login flow
- [ ] Test AI chat (Groq, NVIDIA, Sarvam routing)
- [ ] Test activity logging
- [ ] Test voice transcription (Deepgram)
- [ ] Test leaderboard
- [ ] Test challenges generation
- [ ] Test multilingual support
- [ ] Check logs for errors
- [ ] Verify SSL certificate

## Monitoring

```bash
# View logs
gcloud run services logs read rebon-carbon \
  --platform managed \
  --region us-central1

# Check deployment status
gcloud run services describe rebon-carbon \
  --platform managed \
  --region us-central1
```

## Cost Management

- [ ] Set up budget alerts
- [ ] Review free tier usage
- [ ] Monitor AI API costs

## Troubleshooting

### Deployment Fails
```bash
# Check logs
gcloud logging read "resource.type=cloud_run_revision AND severity=ERROR" \
  --project=buildwithai-499306

# Check IAM permissions
gcloud projects get-iam-policy buildwithai-499306
```

### AI Keys Not Working
```bash
# Verify env vars in Cloud Run
gcloud run services describe rebon-carbon \
  --platform managed \
  --region us-central1 \
  --format="value(spec.template.spec.containers[0].env)"
```

### Database Connection Issues
```bash
# Test connection from local machine
mysql -h host -u user -p rebon
```

## Emergency Rollback

```bash
# Rollback to previous version
gcloud run services update rebon-carbon \
  --image gcr.io/buildwithai-499306/buildwithai-499306/rebon:previous-sha \
  --platform managed \
  --region us-central1
```
