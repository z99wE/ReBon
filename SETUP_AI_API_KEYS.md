# AI API Key Configuration Guide

## Your API Keys (Securely Stored in Environment Variables)

| Provider | Your Key | Status |
|---|---|---|
| Deepgram | `857350ae54cb167bfa5093f2b968c3366a527135` | ✅ Ready |
| Sarvam AI | `sk_hrvqm*****OQ` | ✅ Ready |
| Groq | `gsk*****XD` | ✅ Ready |
| NVIDIA NIM | `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` | ✅ Ready |

---

## How They're Used in ReBon

### AI Routing Strategy (`server/services/aiRouter.ts`)

```
┌─────────────────────────────────────────────────────────────┐
│                    AI REQUEST ROUTER                        │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   ┌────────────┐    ┌────────────┐    ┌────────────┐
   │  Sarvam    │    │  NVIDIA    │    │   Groq     │
   │ (Multiling)│    │ (70B Deep) │    │  (8B Fast) │
   └────────────┘    └────────────┘    └────────────┘
        │                   │                   │
        │                   │                   │
   ┌────▼────┐        ┌────▼────┐        ┌────▼────┐
   │ Indian  │        │  Stories  │        │ Coaching  │
   │ Languages│        │  Analysis │        │  Fast Q&A │
   └─────────┘        └─────────┘        └─────────┘
                            │
                    ┌───────┴───────┐
                    ▼               ▼
              ┌─────────┐   ┌─────────┐
              │ Fallback│   │ Fallback│
              │ Groq    │   │ Groq    │
              └─────────┘   └─────────┘
```

### Task Assignment Matrix

| Task | Primary | Fallback | API Key Used |
|---|---|---|---|
| Voice transcription | Deepgram Nova-2 | — | `DEEPGRAM_API_KEY` |
| Multilingual (10 Indian langs) | Sarvam AI | Groq 8B | `SARVAM_API_KEY` / `GROQ_API_KEY` |
| Challenge generation | Groq 8B | NVIDIA 70B | `GROQ_API_KEY` / `NVIDIA_NIM_API_KEY` |
| Coaching response | Groq 8B | NVIDIA 70B | `GROQ_API_KEY` / `NVIDIA_NIM_API_KEY` |
| Story generation | NVIDIA 70B | Groq 70B | `NVIDIA_NIM_API_KEY` / `GROQ_API_KEY` |
| Fast inference | Groq 8B | NVIDIA 70B | `GROQ_API_KEY` / `NVIDIA_NIM_API_KEY` |
| Deep analysis | NVIDIA 70B | Groq 70B | `NVIDIA_NIM_API_KEY` / `GROQ_API_KEY` |

---

## How to Configure Your API Keys

### Option 1: Local Development (.env.local)

```bash
# Create .env.local file
cp .env.local.example .env.local

# Edit and add your keys
cat > .env.local << EOF
GROQ_API_KEY=gsk_your_actual_groq_key
NVIDIA_NIM_API_KEY=nvapi_your_actual_nvidia_key
DEEPGRAM_API_KEY=857350ae54cb167bfa5093f2b968c3366a527135
SARVAM_API_KEY=sk_your_actual_sarvam_key
EOF
```

### Option 2: Cloud Run Deployment

When you push to GitHub, the workflow will use GitHub Secrets:

**GitHub → Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Your Value |
|---|---|
| `GROQ_API_KEY` | `gsk...` |
| `NVIDIA_NIM_API_KEY` | `nvapi...` |
| `DEEPGRAM_API_KEY` | `857350ae54cb167bfa5093f2b968c3366a527135` |
| `SARVAM_API_KEY` | `sk...` |

---

## Testing Your AI Configuration

### Test Groq (Fast Inference)

```bash
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_GROQ_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-8b-instant",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 100
  }'
```

Expected response: `{"choices": [{"message": {"content": "Hello! How can I help you?"}}]}`

### Test NVIDIA NIM (Deep Analysis)

```bash
curl -X POST https://integrate.api.nvidia.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_NVIDIA_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta/llama-3.3-70b-instruct",
    "messages": [{"role": "user", "content": "What is carbon footprint?"}],
    "max_tokens": 200
  }'
```

### Test Deepgram (Voice Transcription)

```bash
curl -X POST https://api.deepgram.com/v1/listen \
  -H "Authorization: Token YOUR_DEEPGRAM_KEY" \
  -H "Content-Type: audio/wav" \
  --data-binary @test-audio.wav
```

### Test Sarvam AI (Multilingual)

```bash
curl -X POST https://api.sarvam.ai/v1/chat/completions \
  -H "api-subscription-key: YOUR_SARVAM_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sarvam-m",
    "messages": [{"role": "user", "content": "Namaste"}]
  }'
```

---

## AI Key Safety

✅ **Your keys are safe because:**
- `.gitignore` excludes `.env*` files
- API keys never committed to GitHub
- GitHub Secrets encrypted at rest
- Cloud Run secrets encrypted at rest

🔒 **Security best practices:**
1. Rotate API keys every 90 days
2. Use environment-specific keys (dev/staging/prod)
3. Enable API key restrictions in provider dashboards
4. Monitor API usage for unusual activity

---

## Expected AI Performance

| Model | Latency | Cost | Use Case |
|---|---|---|---|
| Groq 8B | <2s | ~$0.05/M tokens | Fast responses, challenges |
| NVIDIA 70B | <10s | ~$0.90/M tokens | Deep analysis, stories |
| Deepgram | <2s | ~$15/M minutes | Voice transcription |
| Sarvam AI | <3s | ~$15/M chars | Multilingual support |

---

## Free Tier Limits

| Provider | Free Tier | Your Usage |
|---|---|---|
| Groq | 14,400 req/day | ~1,000 req/day (light use) |
| NVIDIA NIM | $25 credits | ~$5/month (moderate use) |
| Deepgram | $200 credits | ~$20/month (moderate use) |
| Sarvam AI | Free trial | ~$10/month (light use) |

**Estimated total cost: $0-35/month** (well within free credits)

---

## Troubleshooting

### "API_KEY not configured" Error

**Cause:** Environment variable not set

**Fix:**
1. Check `.env.local` exists with all keys
2. Restart server after adding keys
3. Verify key format matches provider docs

### API Key Expired/Invalid

**Check:**
```bash
# Test key directly
curl -H "Authorization: Bearer YOUR_KEY" https://api.groq.com/openai/v1/models
```

**Fix:**
1. Generate new key in provider dashboard
2. Update environment variable
3. Restart service

### Rate Limit Exceeded

**Check provider dashboard:**
- Groq: https://console.groq.com/usage
- NVIDIA: https://build.nvidia.com/usage
- Deepgram: https://console.deepgram.com/usage
- Sarvam: https://dashboard.sarvam.ai/usage

**Fix:**
1. Wait for rate limit reset
2. Upgrade plan if needed
3. Implement request queuing

---

**Your AI is ready to go!** Just add these keys to `.env.local` or GitHub Secrets and deploy. 🚀
