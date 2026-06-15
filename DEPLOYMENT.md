# ReBon Deployment Guide

This guide covers local development setup, database migrations, building for production, and deploying ReBon.

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Database Setup](#database-setup)
3. [Environment Variables](#environment-variables)
4. [Running the Development Server](#running-the-development-server)
5. [Building for Production](#building-for-production)
6. [Deploying to Production](#deploying-to-production)
7. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites

Ensure you have the following installed:

- **Node.js 22+** — [Download](https://nodejs.org/)
- **pnpm** — `npm install -g pnpm`
- **MySQL 8+** or **TiDB** — [MySQL](https://dev.mysql.com/downloads/) or [TiDB Cloud](https://tidbcloud.com/)
- **Git** — [Download](https://git-scm.com/)

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/z99wE/ReBon.git
cd ReBon

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local
```

### Edit Environment Variables

Open `.env.local` and fill in the required values:

```bash
# Database connection
DATABASE_URL=mysql://user:password@localhost:3306/rebon

# Auth
JWT_SECRET=your-random-secret-key-here
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/login

# AI Models (get keys from respective providers)
GROQ_API_KEY=your-groq-api-key
NVIDIA_NIM_API_KEY=your-nvidia-nim-key
DEEPGRAM_API_KEY=your-deepgram-api-key
SARVAM_API_KEY=your-sarvam-api-key

# Manus Built-in APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your-forge-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-key

# Owner Info
OWNER_OPEN_ID=your-open-id
OWNER_NAME=Your Name
```

---

## Database Setup

### Create Database

Connect to your MySQL/TiDB instance and create the database:

```sql
CREATE DATABASE rebon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Generate and Apply Migrations

```bash
# Generate migration SQL from schema
pnpm drizzle-kit generate

# This creates a `.sql` file in `drizzle/migrations/`
# Review the generated SQL, then apply it to your database

# Option 1: Using MySQL CLI
mysql -u user -p rebon < drizzle/migrations/0001_*.sql

# Option 2: Using Manus UI (if available)
# Upload the SQL file via the Management UI → Database panel

# Option 3: Using a database client
# Copy the SQL content and execute it in your database client
```

### Verify Schema

```bash
# Check tables were created
mysql -u user -p rebon -e "SHOW TABLES;"

# Expected tables: users, activities, challenges, collectives, collectiveMembers, etc.
```

---

## Environment Variables

All environment variables are defined in `.env.local` for development. For production, set them in your deployment platform (e.g., Cloud Run, Railway, Heroku):

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | MySQL/TiDB connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens (use `openssl rand -hex 32` to generate) |
| `VITE_APP_ID` | Yes | Manus OAuth application ID |
| `OAUTH_SERVER_URL` | Yes | Manus OAuth backend URL |
| `VITE_OAUTH_PORTAL_URL` | Yes | Manus login portal URL |
| `GROQ_API_KEY` | Yes | Groq API key for fast AI inference |
| `NVIDIA_NIM_API_KEY` | Yes | NVIDIA NIM API key for deep analysis |
| `DEEPGRAM_API_KEY` | Yes | Deepgram API key for voice transcription |
| `SARVAM_API_KEY` | No | Sarvam AI key for multilingual support |
| `BUILT_IN_FORGE_API_URL` | Yes | Manus built-in APIs base URL |
| `BUILT_IN_FORGE_API_KEY` | Yes | Bearer token for server-side Manus APIs |
| `VITE_FRONTEND_FORGE_API_URL` | Yes | Manus built-in APIs URL for frontend |
| `VITE_FRONTEND_FORGE_API_KEY` | Yes | Bearer token for frontend Manus APIs |
| `OWNER_OPEN_ID` | Yes | Owner's Manus Open ID |
| `OWNER_NAME` | Yes | Owner's display name |
| `VITE_ANALYTICS_ENDPOINT` | No | Analytics service endpoint |
| `VITE_ANALYTICS_WEBSITE_ID` | No | Analytics website ID |

---

## Running the Development Server

### Start the Dev Server

```bash
pnpm dev
```

This starts:

- **Frontend:** http://localhost:5173 (Vite dev server with HMR)
- **Backend:** http://localhost:3000 (Express server)

The frontend automatically proxies API calls to the backend via `/api/trpc`.

### Watch Mode

Both frontend and backend run in watch mode. Changes are reflected instantly without restarting.

### View Logs

```bash
# Server logs
tail -f .manus-logs/devserver.log

# Browser console logs
tail -f .manus-logs/browserConsole.log

# Network requests
tail -f .manus-logs/networkRequests.log
```

---

## Building for Production

### Build Frontend and Backend

```bash
pnpm build
```

This creates:

- `client/dist/` — Optimized React bundle
- `server/_core/dist/` — Compiled Express server

### Run Production Build Locally

```bash
# Set NODE_ENV to production
export NODE_ENV=production

# Start the server (serves frontend from dist/)
node server/_core/dist/index.js
```

The app will be available at `http://localhost:3000`.

### Verify Build

```bash
# Check bundle size
du -sh client/dist/

# Expected: <5 MB for production bundle
```

---

## Deploying to Production

### Option 1: Manus Hosting (Recommended)

ReBon is built for Manus and deploys automatically:

1. **Save a checkpoint** — In the Management UI, create a checkpoint of your latest code.
2. **Click Publish** — Click the "Publish" button in the Management UI header.
3. **Get public URL** — Your app is live at `https://<project-name>.manus.space`.

### Option 2: Cloud Run (Google Cloud)

```bash
# Create a Dockerfile (if not present)
cat > Dockerfile << 'EOF'
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN pnpm build
EXPOSE 3000
CMD ["node", "server/_core/dist/index.js"]
EOF

# Build and push to Cloud Run
gcloud run deploy rebon \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=<your-db-url>,JWT_SECRET=<your-secret>,... \
  --allow-unauthenticated
```

### Option 3: Railway, Render, or Heroku

1. **Connect your GitHub repository** to the platform.
2. **Set environment variables** in the platform's dashboard.
3. **Deploy** — The platform automatically builds and deploys on every push.

**Example for Railway:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Set environment variables
railway variables set DATABASE_URL=<your-db-url>
railway variables set JWT_SECRET=<your-secret>
# ... set all other variables

# Deploy
railway up
```

---

## Troubleshooting

### Database Connection Fails

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Solution:**

1. Verify MySQL/TiDB is running: `mysql -u user -p -e "SELECT 1;"`
2. Check `DATABASE_URL` in `.env.local` is correct.
3. Ensure the database user has permissions: `GRANT ALL ON rebon.* TO 'user'@'localhost';`

### OTP Not Sending

**Error:** `Error: Failed to send OTP email`

**Solution:**

1. Verify `BUILT_IN_FORGE_API_KEY` is correct.
2. Check email configuration in `server/services/otpAuth.ts`.
3. For production, configure a real SMTP provider (Resend, SendGrid, etc.).

### AI Models Returning Empty Results

**Error:** `challenges.generate` returns empty array

**Solution:**

1. Verify all AI API keys are set correctly in `.env.local`.
2. Check that API keys have sufficient quota/credits.
3. Review server logs: `tail -f .manus-logs/devserver.log | grep -i error`
4. Test AI endpoint directly: `curl -X POST http://localhost:3000/api/trpc/challenges.generate`

### TypeScript Errors After Changes

**Error:** `error TS2304: Cannot find name 'X'`

**Solution:**

```bash
# Rebuild TypeScript
npx tsc --noEmit

# If errors persist, clear build cache
rm -rf node_modules/.vite
pnpm install
pnpm dev
```

### Tests Failing

**Error:** `FAIL server/integration.test.ts`

**Solution:**

```bash
# Run tests with verbose output
pnpm test -- --reporter=verbose

# Run specific test file
pnpm test server/integration.test.ts

# Run tests in watch mode
pnpm test -- --watch
```

---

## Performance Optimization

### Database Indexing

Ensure indexes exist on frequently queried columns:

```sql
CREATE INDEX idx_users_openid ON users(openId);
CREATE INDEX idx_activities_userid ON activities(userId);
CREATE INDEX idx_activities_createdat ON activities(createdAt);
CREATE INDEX idx_challenges_userid ON challenges(userId);
CREATE INDEX idx_collectivemembers_userid ON collectiveMembers(userId);
```

### Caching

Enable Redis caching for leaderboard queries (optional):

```bash
# Install Redis
brew install redis  # macOS
# or
apt-get install redis-server  # Ubuntu

# Start Redis
redis-server
```

Update `server/routers.ts` to cache leaderboard results:

```typescript
const leaderboardCache = new Map<string, any>();
const CACHE_TTL = 60 * 1000; // 1 minute

trpc.leaderboard.current.query(async () => {
  const cacheKey = "leaderboard:current";
  const cached = leaderboardCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  // ... fetch from DB
  leaderboardCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
});
```

### CDN for Static Assets

Use Cloudflare or AWS CloudFront to cache static assets:

1. Upload `client/dist/` to a CDN.
2. Set `VITE_PUBLIC_PATH` to CDN URL in `.env.production`.
3. Update `vite.config.ts` to reference CDN assets.

---

## Monitoring and Logging

### Application Monitoring

Set up monitoring for production:

- **Error tracking:** Sentry, LogRocket, or Rollbar
- **Performance:** New Relic, Datadog, or Prometheus
- **Uptime:** Pingdom, Uptime Robot, or Healthchecks.io

### Log Aggregation

Aggregate logs from production:

```bash
# Example: Send logs to Loggly
npm install winston winston-loggly-bulk

# In server/_core/index.ts
import winston from 'winston';
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.Loggly({ token: process.env.LOGGLY_TOKEN })
  ]
});
```

---

## Support

For issues or questions:

1. Check the [README.md](./README.md) for architecture and feature documentation.
2. Review [GitHub Issues](https://github.com/z99wE/ReBon/issues) for known problems.
3. Run tests to validate your setup: `pnpm test`
4. Contact the ReBon team via GitHub Discussions or email.

---

**Built for Hack2Kill 2026 — Google PromptWars**
