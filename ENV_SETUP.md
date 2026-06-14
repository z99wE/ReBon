# Environment Setup for ReBon

## Required Environment Variables

Copy and configure the following environment variables for your deployment:

```bash
# AI Provider API Keys
GROQ_API_KEY=gsk_...          # https://console.groq.com
NVIDIA_NIM_API_KEY=nvapi-...  # https://build.nvidia.com
DEEPGRAM_API_KEY=...          # https://console.deepgram.com
SARVAM_API_KEY=sk_...         # https://dashboard.sarvam.ai

# Database
DATABASE_URL=mysql://user:password@host:3306/rebon_carbon

# Auth
JWT_SECRET=<random-32-char-string>

# OAuth (replace with your provider)
VITE_APP_ID=<your-oauth-app-id>
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im
```

## Getting API Keys

| Provider | Free Tier | Sign Up |
|---|---|---|
| Groq | 14,400 req/day | https://console.groq.com |
| NVIDIA NIM | $25 free credits | https://build.nvidia.com |
| Deepgram | $200 free credits | https://console.deepgram.com |
| Sarvam AI | Free trial | https://dashboard.sarvam.ai |
