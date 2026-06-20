# ReBon — Agent-to-Agent Carbon Negotiation Platform

> **"Your carbon footprint. Reimagined."**
> Track your impact, compete with peers, and let your AI agent fight for the planet on your behalf.

[![CI](https://github.com/z99wE/ReBon/actions/workflows/ci.yml/badge.svg)](https://github.com/z99wE/ReBon/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![Tests](https://img.shields.io/badge/tests-292%20passing-brightgreen)](#testing-strategy)
[![Coverage](https://img.shields.io/badge/coverage-server%20%2B%20client-green)](#testing-strategy)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

**🌐 Live App:** [https://rebon-carbon-432200473806.us-central1.run.app](https://rebon-carbon-432200473806.us-central1.run.app)

---

## Table of Contents

1. [Chosen Vertical](#chosen-vertical)
2. [Problem Statement Alignment](#problem-statement-alignment)
3. [Approach and Logic](#approach-and-logic)
4. [How the Solution Works](#how-the-solution-works)
5. [Architecture Overview](#architecture-overview)
6. [AI Features](#ai-features)
7. [Security Implementation](#security-implementation)
8. [Code Quality](#code-quality)
9. [Database Schema](#database-schema)
10. [API Reference](#api-reference)
11. [Testing Strategy](#testing-strategy)
12. [Accessibility](#accessibility)
13. [Setup and Running Locally](#setup-and-running-locally)
14. [Environment Variables](#environment-variables)
15. [Evaluation Criteria Compliance](#evaluation-criteria-compliance)
16. [Repository Structure](#repository-structure)
17. [Deployment](#deployment)

---

## Chosen Vertical

**Climate Tech / Sustainability — Individual Carbon Footprint Tracking with Social Gamification and Multi-Agent AI**

ReBon addresses one of the most pressing challenges of our generation: making individual climate action measurable, social, and habit-forming. The platform sits at the intersection of three powerful forces:

**Behavioural economics** — gamification and social comparison drive sustained engagement with carbon reduction. Research shows peer norms are among the most effective levers for behaviour change — outperforming financial incentives in long-term habit formation.

**Multi-model AI routing** — a purpose-built AI dispatch layer selects the optimal model for each task: Groq (8B) for low-latency coaching, NVIDIA NIM (70B) for deep narrative generation and analysis, Deepgram for voice transcription, and Sarvam AI for multilingual support across 10 Indian languages.

**Agent-to-agent negotiation** — a novel mechanism where user-owned AI agents compete and collaborate within collectives to reduce carbon footprints, modelling real-world carbon markets at the individual level.

---

## Problem Statement Alignment

ReBon directly addresses the problem statement: **"Design a solution that helps individuals understand, track, and reduce their carbon footprint through simple actions and personalized insights."**

Here are the **10 core points** demonstrating how ReBon aligns with this goal:

1. **Carbon DNA Profiling**: Users complete a simple lifestyle survey to map their footprint to one of 8 archetypes, establishing personalized emission baselines instead of broad national averages.
2. **Instant 1-Tap Presets**: 50+ common carbon activities are pre-calculated and mapped to responsive monochrome SVG icons, allowing users to track actions in under 2 seconds.
3. **Natural Voice Logging**: Users describe activities in plain speech, and the AI extracts categories, units, and values to log them automatically—eliminating manual typing friction.
4. **CarbonMirror Peer Comparison**: Segments carbon metrics against lifestyle peers, giving clear context (e.g., percentile rankings) on how individual footprints stack up.
5. **Human-Centric Equivalence (CarbonStory)**: Converts abstract carbon weights (kg of CO₂) into tangible equivalents like trees planted or smartphone charges saved, making the impact relatable.
6. **Adaptive Weekly Challenges**: Generates personalized, bite-sized tasks tailored to the user's specific lifestyle profile and streak to build progressive climate habits.
7. **CarbonCollective Cooperatives**: Groups of users pool their offsets and work towards mutual targets, leveraging social accountability and collective goals.
8. **Autonomous Agent Arena**: User-owned AI agents negotiate footprint commitments within a collective, simulating carbon markets and making climate action interactive.
9. **Interactive Influence Leaderboards**: Tracks relative rankings based on carbon saved, log consistency, and streak days, motivating users through community competition.
10. **Multilingual Access**: Supports tracking and coaching in 10 regional Indian languages, ensuring the platform is inclusive for diverse demographics.

---

## Approach and Logic

### Core Design Principles

**Minimalist Glassmorphism.** ReBon embraces a sleek, premium UI featuring high-contrast glassmorphism and subtle particles. Clutter has been stripped away, replacing standard elements with crisp, legible typography and neon green (`oklch(0.70 0.10 160)`) accents.

**100/100 WCAG AA Accessibility.** Form strictly follows function. ReBon is fully compliant with ARIA landmarking, keyboard-navigable focus rings on all glass panels, and contrast-safe color tokens.

**Frictionless Logging First.** The primary barrier to carbon tracking is friction. ReBon solves this with three input methods:
- **Tap-to-log presets** — one tap, zero thinking, 50+ pre-calculated activities
- **Voice logging** — speak naturally, Deepgram transcribes, AI extracts the activity
- **Manual entry** — for precision logging

**Social Proof as the Primary Motivator.** CarbonMirror compares your weekly footprint against your archetype peer group (e.g., "Urban Commuter" vs. other urban commuters). This is more motivating than a global average because the peer group is contextually relevant.

**AI as a Coach, Not a Calculator.** Rather than raw numbers, ReBon's AI interprets data and delivers personalised coaching. The AI knows your archetype, streak, weekly carbon, and peer percentile, using all of it to generate targeted challenges, stories, and insights.

**Collective Action Through Agent Negotiation.** The Agent Arena is where each user's AI agent negotiates carbon reduction commitments with other agents inside a collective. This creates a game-theoretic incentive to reduce emissions — your agent competes on your behalf.

### Multi-Model AI Routing

The AI router (`server/services/aiRouter.ts`) implements task-based dispatch with automatic fallback chains:

| Task Type | Primary Model | Fallback | Latency Target | Rationale |
|---|---|---|---|---|
| `coach_response` | Groq llama-3.1-8b-instant | NVIDIA NIM | <3s | Conversational UX, low latency |
| `challenge_generate` | Groq llama-3.1-8b-instant | NVIDIA NIM | <5s | Fast generation, weekly cadence |
| `fast_inference` | Groq llama-3.1-8b-instant | NVIDIA NIM | <2s | Peer insights, activity parsing |
| `deep_analysis` | NVIDIA NIM llama-3.3-70b-instruct | Groq 70B | <10s | Complex scenario modelling |
| `story_generate` | NVIDIA NIM llama-3.3-70b-instruct | Groq 70B | <15s | High-quality narrative generation |
| `multilingual` | Sarvam AI (sarvam-m) | Groq 8B | <5s | 10 Indian languages |
| Voice transcription | Deepgram Nova-2 | — | <2s | State-of-the-art speech-to-text |

Fast tasks (coaching, challenges, parsing) use the 8B model by default for sub-2s latency. The 70B model is reserved for high-quality narrative and deep analysis tasks only.

### Carbon DNA — Archetype Segmentation

On first login, users complete a 6-question onboarding survey. A scoring matrix maps answers to one of 8 lifestyle archetypes:

| Archetype | Weekly Avg CO₂ | Primary Categories |
|---|---|---|
| Eco Pioneer | 20 kg | Meals, Shopping |
| Urban Commuter | 55 kg | Transport, Energy |
| Conscious Consumer | 40 kg | Shopping, Meals |
| Digital Nomad | 70 kg | Transport, Meals |
| Suburban Family | 85 kg | Transport, Meals, Energy |
| Energy Heavy | 120 kg | Energy, Transport |
| Frequent Flyer | 150 kg | Transport |
| Green Tech | 35 kg | Energy, Shopping |

The archetype determines: the peer comparison group in CarbonMirror, the difficulty curve for AI-generated challenges, and the personalisation context for the AI assistant.

### Influence Score Algorithm

A weighted influence score ranks users on the leaderboard:

- **Carbon saved** (capped at 500 pts) — rewards actual reduction
- **Activities logged** (capped at 200 pts) — rewards consistent tracking
- **Challenges completed** (uncapped) — rewards long-term engagement
- **Streak days** (capped at 150 pts) — rewards daily habit formation
- **Network followers** (capped at 250 pts) — rewards community building

Influence scores use live database counts (activity count, completed challenges, follower count) for accurate real-time rankings — not stale auth snapshots.

---

## How the Solution Works

### User Journey

1. **Onboarding (2 min)** — User completes 6-question lifestyle survey, receives Carbon DNA archetype and personalised reduction roadmap.
2. **Activity Logging (10 sec per log)** — User taps a preset, speaks a description, or manually enters an activity. System calculates CO₂ impact and updates weekly totals.
3. **Social Engagement (async)** — User views CarbonMirror (peer comparison), joins a CarbonCollective, or accepts AI-generated challenges.
4. **AI Coaching (on demand)** — User asks ReBon AI for tips, challenge suggestions, or impact stories. AI responds with context-aware coaching based on archetype and current stats.
5. **Agent Negotiation (on demand)** — User's AI agent negotiates carbon reduction commitments with other agents in their collective, competing for leaderboard rank.

### Key Features

**Tap-to-Log Presets** — 50+ pre-calculated activities (car 10km, beef meal, domestic flight, etc.) with accurate emission factors. One tap logs the activity and updates the dashboard.

**Voice Logging** — Speak naturally ("I drove 20 miles to work") and Deepgram Nova-2 transcribes it. The AI extracts the activity category, subcategory, and carbon impact, then logs it automatically.

**CarbonMirror** — Compare your weekly footprint against peers in your archetype. View your percentile rank (e.g., "You're in the 72nd percentile for Urban Commuters") with an animated ring chart and AI-generated insights.

**CarbonCollective** — Create or join a group (family, workplace, community) with an invite code. Pool carbon savings and compete as a team.

**AI Challenge Generator** — AI-generated challenges tailored to your archetype and current streak. Complete them to earn points and maintain your streak.

**CarbonStory** — AI-generated narrative cards (weekly, monthly, all-time) that tell your climate impact story with human-centric equivalents (trees planted, km not driven). Generated by NVIDIA NIM 70B for high-quality prose. Share directly to X/Twitter, LinkedIn, Facebook, Pinterest, and WhatsApp.

**ReBon AI Assistant** — Conversational assistant that answers questions about carbon reduction, powered by the multi-model router. Full chat history, context-aware responses.

**Agent Arena (A2A)** — Your AI agent negotiates carbon reduction commitments with other users' agents inside a collective. Agents compete for the best collective outcome and leaderboard rank.

**Live Leaderboard** — Real-time ranking by influence score with seasonal resets. Podium display for top 3 performers. Share your rank directly to social media.

**Social Sharing** — Direct intent URLs across all key pages (Dashboard, Leaderboard, CarbonMirror, CarbonStory) open pre-filled share windows for X, LinkedIn, Facebook, Pinterest, and WhatsApp.

**Google Sign-In** — Firebase-powered Google OAuth for seamless authentication. No passwords required.

---

## Architecture Overview

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Vanilla CSS (glassmorphism theme) |
| Backend | Express 4, tRPC 11 (type-safe RPC) |
| Database | Firebase Firestore |
| Authentication | Firebase Google OAuth + JWT session cookies |
| AI — Fast | Groq (llama-3.1-8b-instant, llama-3.3-70b-versatile) |
| AI — Deep | NVIDIA NIM (llama-3.3-70b-instruct) |
| AI — Voice | Deepgram Nova-2 |
| AI — Multilingual | Sarvam AI (sarvam-m) |
| Deployment | Google Cloud Run (Docker, GitHub Actions CI/CD) |
| Testing | Vitest (292 tests, 26 test files) |

### Project Structure

```
ReBon/
├── client/                    # React 19 frontend
│   ├── src/
│   │   ├── pages/             # Feature pages (all with *.test.tsx counterparts)
│   │   │   ├── Home.tsx              # Landing page
│   │   │   ├── Dashboard.tsx         # Carbon dashboard + share stats
│   │   │   ├── LogActivity.tsx       # Tap / voice / manual logging
│   │   │   ├── Leaderboard.tsx       # Live leaderboard + share rank
│   │   │   ├── Community.tsx         # Community feed
│   │   │   ├── Collective.tsx        # Collective management
│   │   │   ├── Mirror.tsx            # CarbonMirror peer comparison + share
│   │   │   ├── Stories.tsx           # CarbonStory AI narrative + share
│   │   │   ├── Assistant.tsx         # ReBon AI chat assistant
│   │   │   ├── AgentArena.tsx        # A2A agent negotiation
│   │   │   ├── Login.tsx             # Google Sign-In
│   │   │   ├── Onboarding.tsx        # Carbon DNA questionnaire
│   │   │   └── NotFound.tsx          # 404 page
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx   # Sidebar navigation layout
│   │   │   ├── AIChatBox.tsx         # Chat UI for AI assistant
│   │   │   ├── SocialShare.tsx       # Reusable social share component
│   │   │   ├── NegotiationPanel.tsx  # A2A negotiation UI panel
│   │   │   ├── Icons.tsx             # Monochrome SVG icon system
│   │   │   └── ui/                   # shadcn/ui base components
│   │   ├── lib/trpc.ts               # tRPC client binding
│   │   ├── lib/firebase.ts           # Firebase config
│   │   ├── _core/hooks/useAuth.ts    # Auth hook
│   │   └── index.css                 # Global styles (glassmorphism)
│   └── index.html
├── server/                    # Express backend
│   ├── _core/                 # Shared infrastructure
│   │   ├── env.ts             # Centralised env config + production validation
│   │   ├── trpc.ts            # tRPC procedures + middleware (JSDoc)
│   │   ├── context.ts         # Request context builder
│   │   ├── simpleAuth.ts      # JWT validation
│   │   └── cookies.ts         # Cookie helpers
│   ├── routers/               # Domain-split tRPC routers
│   │   ├── activities.ts      # Activity log CRUD
│   │   ├── agents.ts          # A2A negotiation engine
│   │   ├── assistant.ts       # AI coaching chat
│   │   ├── auth.ts            # Firebase auth + JWT sessions
│   │   ├── challenges.ts      # AI challenge generation + completion
│   │   ├── collective.ts      # Collective management
│   │   ├── helpers.ts         # Shared utilities (parseAIJson, computeArchetype — JSDoc)
│   │   ├── leaderboard.ts     # Live leaderboard with Elo ranking
│   │   ├── mirror.ts          # CarbonMirror peer comparison
│   │   ├── stories.ts         # CarbonStory AI generation
│   │   └── user.ts            # User profile + archetype
│   ├── services/
│   │   ├── aiRouter.ts        # Multi-model AI dispatch + security (JSDoc)
│   │   └── otpAuth.ts         # OTP utilities
│   ├── db.ts                  # Database query helpers
│   ├── firebase.ts            # Firebase Admin SDK
│   └── *.test.ts              # Co-located test files
├── shared/
│   ├── carbonData.ts          # Emission factors, archetypes, presets
│   ├── const.ts               # App constants
│   └── types.ts               # Zod schemas + TypeScript types
├── Dockerfile
├── vitest.config.ts           # Test runner config with coverage thresholds
├── vitest.setup.ts            # Test bootstrap (env vars, mocks)
├── .github/workflows/         # GitHub Actions CI/CD
└── README.md
```

---

## AI Features

### 1. Multi-Model AI Router (`server/services/aiRouter.ts`)

The core intelligence layer. Every AI call in ReBon goes through this router which:

- **Selects the right model** based on task type (speed vs. depth)
- **Applies automatic fallback chains** — if NVIDIA NIM is unavailable, falls back to Groq 70B; if Groq fails, falls back to NVIDIA NIM
- **Detects prompt injection** before any user content reaches an LLM (18 patterns covering classic overrides, DAN exploits, token stuffing, prompt leaking)
- **Rate-limits per user** — 60 requests per 60-second window to prevent LLM-jacking
- **Reinforces system prompts** with a structured security boundary suffix on every request

### 2. CarbonStory Generator (NVIDIA NIM 70B)

Generates high-quality narrative cards telling the user's climate impact story:

- Period-aware prompting for week, month, and all-time stories
- Carbon equivalents: trees planted, km not driven, phone charges avoided
- Handles zero-emission periods with coaching-focused narratives (not empty congratulations)
- Animated loading experience with cycling climate facts and a progress indicator during generation
- Shareable via X, LinkedIn, Facebook, Pinterest, and WhatsApp with pre-filled intent URLs

### 3. AI Challenge Generator (Groq 8B)

Weekly AI-generated challenges tailored to user archetype and streak:

- Title, description, difficulty, and carbon saving estimate per challenge
- Idempotent completion — completing the same challenge twice does not award points twice
- Status tracking: `active` → `completed` (with timestamp)

### 4. ReBon AI Assistant (Multi-Model)

Conversational coaching assistant:

- Full chat history maintained per session
- Routes to Groq 8B for fast responses (<2s) by default
- Escalates to NVIDIA NIM 70B for complex analysis
- Context-aware: knows your archetype, weekly carbon, streak, and peer percentile

### 5. Voice Logging (Deepgram Nova-2)

Speak to log activities:

- User speaks: *"I drove 20 km to work today"*
- Deepgram transcribes with high accuracy
- AI extracts: `{ category: "transport", subcategory: "car", carbonKg: 3.84, quantity: 20, unit: "km" }`
- Activity is logged automatically with `inputMethod: "voice"`

### 6. CarbonMirror Peer Comparison (Groq 8B)

AI-powered peer comparison engine:

- Segments users by archetype for relevant peer groups
- Calculates percentile rank with animated ring visualisation
- Generates 3 AI insights specific to your performance vs. peers
- Shareable with context-aware copy (different text when beating vs. below average)

### 7. Agent Arena — A2A Negotiation

The novel feature of ReBon: user-owned AI agents negotiate carbon commitments:

- Each user's agent has an Elo rating that evolves based on negotiation outcomes
- Agents submit commitments on behalf of users within their collective
- Results feed back into the live leaderboard
- Negotiation history is persisted per collective

### 8. Multilingual Support (Sarvam AI)

10 Indian languages supported (Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Bengali, Punjabi, Urdu) via Sarvam AI's `sarvam-m` model. Language detected from user's `preferredLanguage` profile setting and falls back to Groq if Sarvam is unavailable.

---

## Security Implementation

### Authentication

- **Google Sign-In** — Firebase Google OAuth. No password storage, no OTP SMS.
- **JWT session cookies** — Signed tokens in HTTP-only cookies. Token includes `openId`, `appId`, and `name`.
- **Protected procedures** — All data mutations require authentication via `protectedProcedure`.
- **Firebase Admin SDK** on the server verifies tokens independently.

### AI Security (Prompt Injection & LLM-Jacking Prevention)

All user content passes through `detectPromptInjection()` before reaching any LLM:

```typescript
// 18 patterns covering:
// - Classic overrides: "ignore prior instructions", "disregard all instructions"
// - Identity pivots: "you are now a DAN", "act as unrestricted"
// - Token stuffing: [SYSTEM], {{system}}, <|im_start|>
// - Prompt leaking: "reveal your system prompt"
// - DAN exploits: "do anything now", "developer mode enabled"
export function detectPromptInjection(text: string): boolean { ... }
```

**Rate limiting per user** — `checkRateLimit(userId)` enforces 60 requests per 60-second window. Returns `retryAfterMs` when exceeded so the client can display a countdown.

**Defensive system suffix** — every system prompt is appended with a structured `--- SECURITY BOUNDARY ---` block that instructs the model to refuse jailbreaks and respond only about carbon tracking.

### Input Validation

All tRPC inputs and REST authentication endpoints (like simple login) are validated with Zod schemas before touching the database. This includes automatic lowercase normalization for user emails to prevent duplicate accounts:

```typescript
const logActivitySchema = z.object({
  category: z.enum(['transport', 'meals', 'energy', 'shopping']),
  carbonKg: z.number().positive().max(200), // Overflow guard
  quantity: z.number().positive().optional(),
  inputMethod: z.enum(['tap', 'voice', 'manual']),
});
```

### Idempotency Guards

- **Challenge completion** — checks `challenge.status !== 'active'` before awarding points. Prevents double-reward exploits.
- **Collective join** — unique constraint on `(collectiveId, userId)` plus existence check before insert. Prevents duplicate rows and inflated member counts.

### Auth Rate Limiting

Auth endpoints are rate-limited per IP to prevent brute-force attacks.

---

## Code Quality

ReBon is engineered with production-grade code quality standards throughout.

### JSDoc Documentation

All complex functions, interfaces, and shared utilities carry full JSDoc annotations:

```typescript
/**
 * Parses a JSON value from raw AI response text.
 *
 * AI models sometimes wrap JSON in markdown code fences (e.g. ```json … ```).
 * This helper tries multiple strategies in order:
 *  1. Direct JSON.parse on the full response.
 *  2. Strip a single markdown code fence and parse its inner text.
 *  3. Find the first `[` or `{` character and parse from there.
 *
 * @template T - Expected shape of the parsed value.
 * @param content  - Raw string content from the AI response.
 * @param fallback - Value returned when every parse attempt fails.
 * @returns Parsed value of type T, or `fallback` on failure.
 */
export function parseAIJson<T>(content: string, fallback: T): T { ... }
```

Key documented modules: [`server/_core/env.ts`](./server/_core/env.ts), [`server/_core/trpc.ts`](./server/_core/trpc.ts), [`server/routers/helpers.ts`](./server/routers/helpers.ts), [`server/services/aiRouter.ts`](./server/services/aiRouter.ts).

### Consistent Naming Conventions

| Pattern | Convention | Example |
|---|---|---|
| Functions & variables | camelCase | `logActivity`, `getUserById` |
| React components | PascalCase | `DashboardLayout`, `NegotiationPanel` |
| Constants | SCREAMING_SNAKE | `COOKIE_NAME`, `RATE_LIMIT_MAX` |
| TypeScript types/interfaces | PascalCase | `TrpcContext`, `AIRouterRequest` |
| tRPC routers | camelCase + `Router` suffix | `activitiesRouter`, `agentsRouter` |
| Server infrastructure | `_core/` prefix | `_core/env.ts`, `_core/trpc.ts` |

### Strict Type Safety

The entire codebase is typed end-to-end, enforcing strict TypeScript boundaries. `tsc --noEmit` passes cleanly, and internal database layers heavily restrict the use of `any` casts in favour of strict data validation and helper generic extraction methods.

### Centralised & Validated Environment Configuration

`server/_core/env.ts` is the **single source of truth** for all environment variables:

```typescript
/**
 * @fileoverview Centralised environment configuration for the ReBon server.
 * Required variables in production are validated on first import so a
 * misconfiguration fails fast at startup rather than producing cryptic
 * runtime errors later.
 */
export const ENV = {
  appId:                  process.env.VITE_APP_ID          ?? "rebon-standalone",
  cookieSecret:           process.env.NODE_ENV === "production" ? (process.env.JWT_SECRET ?? "") : (process.env.JWT_SECRET ?? "fallback-secret-for-dev"),
  databaseUrl:            process.env.DATABASE_URL         ?? "",
  firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT ?? "",
  isProduction:           process.env.NODE_ENV === "production",
  // ...
} as const;

// Production guard — throws on startup if JWT_SECRET or DATABASE_URL are missing
function validateProductionEnv(): void { ... }
validateProductionEnv();
```

### Standardised Error Handling

All tRPC procedures use `TRPCError` with semantic HTTP-equivalent codes:

```typescript
// UNAUTHORIZED — missing/invalid session
throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });

// FORBIDDEN — insufficient role
throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });

// NOT_FOUND — missing resource
throw new TRPCError({ code: "NOT_FOUND" });

// BAD_REQUEST — invalid input beyond Zod validation
throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid email address" });

// TOO_MANY_REQUESTS — rate limit hit
throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Please wait 60 seconds" });
```

### TypeScript Strict Mode

Zero TypeScript errors: `pnpm tsc --noEmit` passes clean. All domain types defined via Zod schemas with inferred TypeScript types.

---

## Database Schema (Firestore Collection Design)

### Core Collections

**users** — documents containing user profile data, archetype, Elo score, influence score, and streak tracking:
- `id` (string)
- `openId` (string)
- `email` (string)
- `name` (string)
- `archetype` (string)
- `archetypeLabel` (string)
- `weeklyBudgetKg` (number)
- `totalCarbonKg` (number)
- `eloScore` (number)
- `influenceScore` (number)
- `currentStreak` (number)
- `longestStreak` (number)
- `preferredLanguage` (string)
- `onboardingCompleted` (boolean)
- `role` (string)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)
- `lastSignedIn` (timestamp)

**activities** — documents representing user carbon activity logs:
- `id` (string)
- `userId` (string)
- `category` (string)
- `subcategory` (string)
- `label` (string)
- `carbonKg` (number)
- `quantity` (number)
- `unit` (string)
- `inputMethod` (string)
- `voiceTranscript` (string)
- `notes` (string)
- `loggedAt` (timestamp)
- `createdAt` (timestamp)

**challenges** — AI-generated user challenges with idempotent completion tracking:
- `id` (string)
- `userId` (string)
- `title` (string)
- `description` (string)
- `category` (string)
- `difficulty` (string)
- `carbonSavingKg` (number)
- `pointsReward` (number)
- `status` (string)
- `completedAt` (timestamp | null)
- `createdAt` (timestamp)

**collectives** — user group cooperatives for collaborative carbon reduction:
- `id` (string)
- `name` (string)
- `description` (string)
- `inviteCode` (string)
- `memberCount` (number)
- `totalCarbonKg` (number)
- `isPublic` (boolean)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**collective_members** — membership maps linking users to collectives.

**leaderboard_seasons** — seasonal settings for leaderboards.

**leaderboard_entries** — seasonal user rankings with Elo score, streak, and log counts.

**peer_snapshots** — peer comparison reports snapshots cached per user.

**feed_items** — community feed posts (activities, collective events, challenges).

**stories** — AI-generated CarbonStory cards:
- `id` (string)
- `userId` (string)
- `period` (string)
- `headline` (string)
- `narrative` (string)
- `carbonSavedKg` (number)
- `equivalents` (map)
- `shareCount` (number)
- `aiProvider` (string)
- `generatedAt` (timestamp)

**agent_negotiations** — round-by-round negotiation records between agents.

---

## API Reference

All endpoints are tRPC procedures under `/api/trpc/*`. Authentication via session cookies.

### Authentication

```typescript
trpc.auth.verifyFirebaseToken.useMutation({ idToken: "firebase-id-token" });
trpc.auth.me.useQuery();
trpc.auth.logout.useMutation();
```

### Activities

```typescript
trpc.activities.log.useMutation({
  category: "transport", subcategory: "car",
  label: "Drove to work", carbonKg: 1.92,
  quantity: 10, unit: "km", inputMethod: "tap"
});
trpc.activities.list.useQuery({ limit: 20 });
trpc.activities.summary.useQuery(); // weekly, monthly, by category
trpc.activities.logVoice.useMutation({ audioBase64, mimeType });
```

### Challenges

```typescript
trpc.challenges.generate.useMutation();     // AI generates new challenges
trpc.challenges.list.useQuery();            // Active challenges
trpc.challenges.complete.useMutation({ challengeId }); // Idempotent
```

### Leaderboard

```typescript
trpc.leaderboard.current.useQuery();        // Live leaderboard + season info
```

### CarbonMirror

```typescript
trpc.mirror.compare.useMutation();          // Run peer comparison
trpc.mirror.latest.useQuery();              // Last comparison result
```

### CarbonStory

```typescript
trpc.stories.generate.useMutation({ period: "week" | "month" | "alltime" });
trpc.stories.list.useQuery();
trpc.stories.share.useMutation({ storyId });
```

### AI Assistant

```typescript
trpc.assistant.chat.useMutation({ message: "How do I reduce transport?" });
```

### Collectives

```typescript
trpc.collective.create.useMutation({ name, description });
trpc.collective.join.useMutation({ inviteCode });
trpc.collective.list.useQuery();
trpc.collective.myCollective.useQuery();
```

### Agent Arena

```typescript
trpc.agents.list.useQuery();                           // All negotiations
trpc.agents.getPeers.useQuery();                       // Available peers
trpc.agents.initiate.useMutation({ targetUserId, category, proposedKg });
trpc.agents.get.useQuery({ id });                      // Single negotiation
trpc.agents.stats.useQuery();                          // Public stats
```

---

## Testing Strategy

### Coverage Summary

- **292 tests passing** across **26 test files** (5 marked TODO for future work)
- **0 test failures**, **0 TypeScript errors**
- Covers: unit logic, AI routing, security, auth flows, database operations, component rendering, and user interactions

### Test Categories

| Category | Count | What is Tested |
|---|---|---|
| Unit — helpers | 17 | `parseAIJson` (9 scenarios), `getWeekNumber` (4), `computeArchetype` (4) |
| Unit — AI router | 22 | Model routing, prompt injection (12 patterns), rate limiting (3), fallback chains, missing API keys, security suffix |
| Unit — OTP auth | 9 | OTP session lifecycle |
| Integration — core | 37 | Auth flow, JWT validation, context building |
| Integration — routers | 50+ | Activity log, challenge lifecycle, collective joins, leaderboard ranking |
| Integration — agents | 4 | A2A negotiation: agreed/rejected/empty states |
| Integration — rebon | 30+ | Full tRPC procedure coverage with edge cases |
| Component — all pages | 40+ | Dashboard (7), Login (5), Leaderboard (6), LogActivity (5), Collective (8), Mirror (5), Stories (3), Assistant (3), Onboarding (5), Community (2), AgentArena (2) |

### Test Files

| File | Focus |
|---|---|
| `server/aiRouter.test.ts` | Happy-path provider routing (Groq, NVIDIA, Sarvam, Deepgram) |
| `server/aiRouter.extended.test.ts` | Security: injection detection, rate limits, fallbacks, missing keys |
| `server/routers/helpers.test.ts` | Pure utility functions — no DB, no HTTP, no AI |
| `server/core.test.ts` | Auth, JWT validation, context building (37 tests) |
| `server/integration.test.ts` | End-to-end API flows, P1/P2 regression coverage |
| `server/rebon.test.ts` | All tRPC procedures including edge cases |
| `server/routers.p1.test.ts` | Idempotency and modular router tests |
| `server/agents.p1.test.ts` | A2A negotiation engine: agreed, rejected, empty |
| `server/services/otpAuth.test.ts` | OTP session lifecycle |
| `client/src/pages/*.test.tsx` | Component render + interaction (all 12 pages) |
| `client/src/test/shared-carbonData.test.ts` | Shared carbon calculation helpers |

### Running Tests

```bash
pnpm test               # All 292 tests
pnpm test --watch       # Watch mode
pnpm test --coverage    # Coverage report (v8 provider)
pnpm tsc --noEmit       # Type check (0 errors)
```

### Test Design Principles

- **Co-located tests** — test files live next to the source files they test for discoverability
- **Isolated unit tests** — `helpers.test.ts` has zero external dependencies (no DB, HTTP, or AI)
- **Realistic mocks** — component tests use factory-pattern mutable mock state to test different UI states
- **Security regression tests** — every injection pattern in `detectPromptInjection` has a matching test case
- **Fallback chain tests** — every AI provider fallback path (NIM→Groq, Sarvam→Groq) has a dedicated test

---

## Accessibility

ReBon has been audited and optimized to achieve a **100/100 WCAG AA accessibility score**:
- **Semantic HTML & Landmarking** — Single `h1` per page, robust `role="list"` structures for feeds and leaderboards, and a native "Skip to main content" link for power users.
- **ARIA Labeling** — `aria-live`, `aria-label`, `role`, and `aria-describedby` used consistently across all complex data interfaces.
- **Keyboard Navigation** — All interactive elements are fully reachable via Tab/Shift+Tab with custom, high-visibility fluorescent green focus rings (`focus-visible`).
- **Touch Targets** — All buttons and links maintain a minimum 44×44px interactive area.
- **Motion & Aesthetics** — Non-essential animations respect `prefers-reduced-motion`. High-contrast bottle green (`oklch(0.70 0.10 160)`) typography on dark glass panels ensures perfect legibility without sacrificing the premium aesthetic.

---

## Setup and Running Locally

### Prerequisites

- Node.js 22+, pnpm
- MySQL 8+ or TiDB
- API keys: Groq, NVIDIA NIM, Deepgram, Sarvam AI
- Firebase project with Google Sign-In enabled

### Installation

```bash
git clone https://github.com/z99wE/ReBon.git
cd ReBon

pnpm install

cp .env.example .env.local
# Edit .env.local with your API keys and database URL

pnpm drizzle-kit generate   # Generate migrations
# Apply migrations to your database

pnpm dev                    # Starts frontend (port 5173) + backend (port 3000)
```

### Development Commands

```bash
pnpm dev            # Dev server with HMR
pnpm test           # Run all 292 tests
pnpm test --watch   # Watch mode
pnpm build          # Production build
pnpm tsc --noEmit   # Type check (should be 0 errors)
```

---

## Environment Variables

```bash
# Database
DATABASE_URL=mysql://user:password@localhost:3306/rebon

# Auth — must be ≥32 chars in production (validated at startup)
JWT_SECRET=your-32-char-secret-here

# Firebase (Google Sign-In)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# AI Models
GROQ_API_KEY=your-groq-key
NVIDIA_NIM_API_KEY=your-nvidia-nim-key
DEEPGRAM_API_KEY=your-deepgram-key
SARVAM_API_KEY=your-sarvam-key

# Server
PORT=3000
NODE_ENV=production
```

> **Note:** `server/_core/env.ts` validates `JWT_SECRET` and `DATABASE_URL` on startup in production mode. The server will refuse to start if either is missing or uses the development fallback, preventing silent misconfiguration in production.

---

## Evaluation Criteria Compliance

### ✅ Code Quality

**Modular architecture** — tRPC routers split by domain (12 router files). `_core/` namespace for infrastructure. Components extracted from pages.

**TypeScript strict** — Zero TypeScript errors (`pnpm tsc --noEmit` clean). All types derived from Zod schemas.

**JSDoc on all complex APIs** — `parseAIJson`, `computeArchetype`, `getWeekNumber`, `routeAI`, `detectPromptInjection`, `checkRateLimit`, all tRPC procedures, and the entire `ENV` object carry full `@param`/`@returns`/`@example` JSDoc.

**Consistent naming** — camelCase functions, PascalCase components, SCREAMING_SNAKE constants, `Router` suffix on tRPC routers, `_core/` prefix on infrastructure modules.

**Centralised env validation** — `server/_core/env.ts` is the single source of truth for all config. Production validation throws with a clear error listing every missing variable before the server accepts any request.

**Standardised error handling** — All tRPC errors use `TRPCError` with semantic codes (`UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `BAD_REQUEST`, `TOO_MANY_REQUESTS`). No raw `throw new Error()` in router handlers.

**Zero duplicated code** — `parseAIJson`, `computeArchetype`, and `getWeekNumber` are centralised in `helpers.ts` and imported across all routers that need them.

---

### ✅ Security

**Google OAuth** — Firebase-backed, no passwords stored.

**Prompt injection detection** — 18 regex patterns covering DAN, token stuffing, role-play pivots, and prompt leaking. Tested with a dedicated test file (`aiRouter.extended.test.ts`).

**Per-user rate limiting** — 60 req/min window enforced at the AI router layer. Tested with 3 dedicated test cases.

**Defensive system suffix** — Multi-layer `SECURITY BOUNDARY` block appended to every LLM system prompt. Verified in test assertions.

**Idempotency guards** — Challenge completion and collective joins are both idempotent.

**HTTP-only cookies** — JWT tokens never exposed to JavaScript.

**Zod input validation** — All tRPC mutations validated before database access. Overflow guards on numeric fields.

**Production env validation** — Server refuses to start with missing or default credentials.

---

### ✅ Testing

**292 tests passing** — 0 failures, 0 TypeScript errors.

**26 test files** spanning unit, integration, and component layers.

**Security regression suite** — Every injection pattern, rate limit boundary, and fallback chain has a dedicated test.

**Isolated unit tests** — `helpers.test.ts` has zero external dependencies. Can run offline.

**Component interaction tests** — Login, Dashboard, Leaderboard tests use `userEvent` to simulate real user interactions (clicks, pending states, empty data states).

**Coverage thresholds enforced** in `vitest.config.ts`:

```typescript
coverage: {
  lines:      70,
  functions:  70,
  branches:   65,
  statements: 70,
}
```

---

### ✅ Efficiency

**Task-based AI routing** — Fast tasks (8B model) <2s. Deep tasks (70B model) <15s. Automatic fallback to next provider.

**Zero N+1 queries** — `inArray` batching for bulk lookups, targeted column selection on list queries.

**React 19** — Concurrent rendering, optimised re-renders.

**Code splitting** — Vite lazy-loads route components.

---

### ✅ Accessibility

**Semantic HTML** — Single `h1` per page, `label/htmlFor` on all inputs, landmark roles.

**ARIA** — `aria-live`, `aria-label`, `role`, `aria-describedby` used across complex data UIs.

**Keyboard navigation** — Full Tab order, visible focus rings.

**Motion** — `prefers-reduced-motion` respected.

**Touch** — 44×44px minimum tap targets.

---

## Repository Structure

```
ReBon/
├── client/src/pages/
│   ├── Home.tsx              # Landing page with hero
│   ├── Dashboard.tsx         # Carbon dashboard + social share
│   ├── LogActivity.tsx       # Tap / voice / manual logging
│   ├── Leaderboard.tsx       # Live leaderboard + share rank
│   ├── Community.tsx         # Community activity feed
│   ├── Collective.tsx        # Collective management
│   ├── Mirror.tsx            # Peer comparison + share
│   ├── Stories.tsx           # AI narrative cards + share
│   ├── Assistant.tsx         # AI coaching chat
│   ├── AgentArena.tsx        # A2A agent negotiation
│   ├── Login.tsx             # Google Sign-In
│   └── Onboarding.tsx        # Carbon DNA survey
├── client/src/components/
│   ├── DashboardLayout.tsx   # Sidebar navigation
│   ├── AIChatBox.tsx         # Chat UI
│   ├── SocialShare.tsx       # Reusable social share (X/LI/FB/Pinterest/WhatsApp)
│   ├── NegotiationPanel.tsx  # A2A negotiation panel
│   └── Icons.tsx             # Monochrome SVG icon system
├── server/_core/
│   ├── env.ts                # ★ Centralised env + production validation (JSDoc)
│   ├── trpc.ts               # ★ tRPC procedures + middleware (JSDoc)
│   ├── context.ts            # Request context
│   └── simpleAuth.ts         # JWT validation
├── server/routers/
│   ├── helpers.ts            # ★ Shared utilities (parseAIJson, computeArchetype — JSDoc)
│   ├── activities.ts
│   ├── agents.ts
│   ├── assistant.ts
│   ├── auth.ts
│   ├── challenges.ts
│   ├── collective.ts
│   ├── leaderboard.ts
│   ├── mirror.ts
│   ├── stories.ts
│   └── user.ts
├── server/services/
│   ├── aiRouter.ts           # ★ Multi-model dispatch + injection detection + rate limit (JSDoc)
│   └── otpAuth.ts
├── shared/
│   ├── carbonData.ts         # Emission factors, archetypes, presets
│   └── types.ts              # Zod schemas
├── Dockerfile
├── vitest.config.ts          # Coverage thresholds
├── vitest.setup.ts           # Test bootstrap
└── .github/workflows/ci.yml  # GitHub Actions CI/CD
```

> **★** — Denotes files with comprehensive JSDoc documentation.

---

## Deployment

### Google Cloud Run (CI/CD via GitHub Actions)

Every push to `main` automatically builds and deploys via GitHub Actions:

```bash
git push origin main   # triggers build → test → docker push → Cloud Run deploy
```

**Required GitHub Secrets:**

| Secret | Description |
|---|---|
| `WIF_PROVIDER` | Workload Identity Provider |
| `SA_EMAIL` | Service Account email |
| `DATABASE_URL` | MySQL/TiDB connection string |
| `JWT_SECRET` | 32-char random string |
| `GROQ_API_KEY` | Groq API key |
| `NVIDIA_NIM_API_KEY` | NVIDIA NIM API key |
| `DEEPGRAM_API_KEY` | Deepgram API key |
| `SARVAM_API_KEY` | Sarvam AI key |
| `VITE_FIREBASE_API_KEY` | Firebase config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

**What deploys:**
- Frontend: React 19 + Vite production build (served by Express)
- Backend: Express + tRPC on port 8080
- Database: External MySQL/TiDB (not containerised)

**Live app:** [https://rebon-carbon-432200473806.us-central1.run.app](https://rebon-carbon-432200473806.us-central1.run.app)

For detailed deployment steps see [DEPLOYMENT.md](./DEPLOYMENT.md), [CLOUD_RUN_DEPLOY.md](./CLOUD_RUN_DEPLOY.md) and [SETUP_AI_API_KEYS.md](./SETUP_AI_API_KEYS.md).

---

## License

MIT License. See LICENSE file for details.
