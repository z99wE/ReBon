# Test Cloud Run Deployment Locally

Before pushing to Cloud Run, test the Docker build locally.

## Prerequisites

- Docker installed
- Node.js 22+
- pnpm installed

## Steps

### 1. Build Docker Image

```bash
docker build -t rebon-local:latest .
```

### 2. Set Environment Variables

Create a `.env.local` file (already in `.gitignore`):

```bash
# Database (use MySQL or TiDB Cloud)
DATABASE_URL=mysql://user:password@host:3306/rebon

# Auth
JWT_SECRET=$(openssl rand -hex 32)  # Generate a random secret
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/login

# AI Models (your keys)
GROQ_API_KEY=your-groq-key
NVIDIA_NIM_API_KEY=your-nvidia-key
DEEPGRAM_API_KEY=your-deepgram-key
SARVAM_API_KEY=your-sarvam-key

# Manus Forge APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your-forge-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-key

# Owner Info
OWNER_OPEN_ID=your-owner-open-id
OWNER_NAME=Your Name
```

### 3. Run Docker Container Locally

```bash
docker run -p 3000:3000 \
  --env-file .env.local \
  rebon-local:latest
```

### 4. Test the App

Visit: `http://localhost:3000`

Expected behavior:
- Login page appears
- AI chat works (Groq/Sarvam/NVIDIA routing)
- Activities can be logged
- Leaderboard shows users
- Challenges can be generated

### 5. Debug Issues

```bash
# Check container logs
docker logs rebon-local

# Shell into container
docker exec -it rebon-local sh

# Check environment variables
env | grep API_KEY
```

---

## Expected AI Behavior

### Groq (Fast Inference)
- Challenge generation: <3s
- Coaching responses: <2s
- Quick parsing: <1s

### NVIDIA NIM (Deep Analysis)
- Story generation: <15s
- Complex analysis: <10s

### Deepgram (Voice)
- Transcription: <2s

### Sarvam (Multilingual)
- 10 Indian languages: Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Bengali, Punjabi, Urdu

---

## Common Issues

### AI Keys Not Working
- Check `.env.local` has all API keys
- Verify API keys have credits/quota
- Check server logs for timeout errors

### Database Connection Fails
- Verify `DATABASE_URL` format
- Check firewall rules (TiDB Cloud needs IP whitelist)
- Ensure database exists: `mysql -h host -u user -p -e "CREATE DATABASE rebon;"`

### Port Already in Use
- Change port mapping: `docker run -p 8080:3000 ...`
- Or kill existing process: `lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill`

---

## Production-Ready Deployment

Once local testing passes:

1. Push to GitHub main branch
2. GitHub Actions auto-deploys to Cloud Run
3. Test at `https://rebon-xxxxxx-uc.a.run.app`
