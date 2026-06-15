# 🚀 Final GCP Deployment - Manus-Free ReBon

## ✅ Manus Dependencies Removed

- ❌ Removed `vitePluginManusRuntime()` 
- ❌ Removed Manus OAuth system
- ❌ Removed Manus Forge API dependencies
- ❌ Removed Manus debug collector
- ✅ Added simple JWT-based authentication
- ✅ Added standalone login system
- ✅ Simplified environment configuration

---

## 🔐 Your API Keys (Hardcoded for Deployment)

| Provider | API Key | Status |
|---|---|---|
| **Groq** | `gsk_XmqGPMqkGzr1YftrYH6zWGdyb3FYZJLUQhKo5bgdyhTV3GqAGGfzXD` | ✅ Ready |
| **NVIDIA NIM** | `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` | ✅ Ready |
| **Deepgram** | `857350ae54cb167bfa5093f2b968c3366a527135` | ✅ Ready |
| **Sarvam AI** | `sk_hrvqm*****OQ` | ✅ Ready |

---

## 🎯 Deploy Options

### Option 1: Manual Deployment (Recommended)

```bash
# 1. Install gcloud CLI
# https://cloud.google.com/sdk/docs/install

# 2. Login and set project
gcloud auth login
gcloud config set project buildwithai-499306

# 3. Run deployment script
./deploy-gcp.sh

# 4. Set DATABASE_URL (required)
export DATABASE_URL="mysql://user:password@host:3306/rebon"
```

### Option 2: GitHub Actions (Requires GCP Service Account)

1. Create service account in GCP Console
2. Download JSON key
3. Add as GitHub Secret: `GCP_SA_KEY`
4. Add GitHub Secret: `DATABASE_URL`
5. Push to main branch

---

## 🗄️ Database Setup (Required)

### TiDB Cloud (Free Tier)

1. Sign up: https://tidbcloud.com
2. Create free MySQL cluster
3. Get connection string: `mysql://user:password@host:4000/rebon`
4. Create database:
   ```sql
   CREATE DATABASE rebon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
5. Apply migrations:
   ```bash
   cd drizzle/migrations
   mysql -h host -P 4000 -u user -p rebon < 0001_*.sql
   ```

### Alternative: Google Cloud SQL

```bash
# Create MySQL instance
gcloud sql instances create rebon-db \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create rebon --instance=rebon-db

# Get connection string
gcloud sql instances describe rebon-db
```

---

## 🏗️ What Gets Deployed

### Frontend
- React 19 + Vite production build
- Static files served by Express
- Simple login form (email + name)

### Backend
- Express + tRPC (type-safe APIs)
- JWT-based authentication (no OAuth)
- AI routing (Groq → NVIDIA → Sarvam → Deepgram)
- MySQL with Drizzle ORM

### Infrastructure
- Google Cloud Run (serverless)
- Auto-scaling (0-1000 instances)
- Free tier: 2M requests/month
- Custom domain support

---

## 🧪 Test Your Deployment

After deployment, test these endpoints:

```bash
# Get app URL
SERVICE_URL=$(gcloud run services describe rebon-carbon \
  --platform managed \
  --region us-central1 \
  --format="value(status.url)")

# Test health
curl $SERVICE_URL/

# Test auth
curl -X POST $SERVICE_URL/api/simple-auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# Test AI (after login with cookie)
curl -X POST $SERVICE_URL/api/trpc/assistant.chat \
  -H "Content-Type: application/json" \
  -H "Cookie: app_session_id=YOUR_TOKEN" \
  -d '{"message":"Hello AI"}'
```

---

## 🔒 Security Features

- **JWT tokens**: Signed with `JWT_SECRET`
- **Rate limiting**: 200 req/min general, 30 req/min AI
- **HTTPS**: Automatic Let's Encrypt certificates
- **Helmet**: Security headers enabled
- **Input validation**: Zod schemas on all inputs

---

## 💰 Cost Estimation

| Resource | Usage | Cost |
|---|---|---|
| Cloud Run | 100K req/month | $0 (free tier) |
| Container Registry | 1GB storage | $0.05/month |
| Cloud SQL | db-f1-micro | $7/month |
| **Total** | | **~$7/month** |

*Use TiDB Cloud free tier for $0 database cost*

---

## 🚨 Troubleshooting

### Build fails
```bash
# Test locally
docker build -t rebon-test .
docker run -p 3000:3000 rebon-test
```

### AI keys not working
```bash
# Test Groq
curl -H "Authorization: Bearer gsk_..." https://api.groq.com/openai/v1/models
```

### Database connection fails
```bash
# Test connection
mysql -h host -u user -p rebon -e "SELECT 1;"
```

---

## 📋 Deployment Checklist

- [ ] gcloud CLI installed and authenticated
- [ ] Docker installed and running
- [ ] Database created and migrations applied
- [ ] `DATABASE_URL` environment variable set
- [ ] All AI API keys verified
- [ ] Cloud Run APIs enabled
- [ ] Service account has necessary permissions

---

**Ready to deploy? Run `./deploy-gcp.sh` and your app will be live!** 🚀