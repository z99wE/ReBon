# ReBon — Carbon Footprint Social Impact Platform

## Phase 1: Foundation
- [x] Create todo.md (this file)
- [x] Inject API keys: Groq, NVIDIA NIM, Deepgram, Sarvam AI
- [x] Set up multi-model AI routing service (server/services/aiRouter.ts)
- [x] Design and apply full database schema (users, activities, challenges, collectives, stories, leaderboard, etc.)
- [x] Run schema migration

## Phase 2: Global UI System
- [x] Configure Black Mirror sci-fi + Mid-Century Modern theme in index.css
- [x] Add Jost + Inter fonts via Google Fonts
- [x] Build AppLayout with top nav, sidebar, and animated transitions
- [x] Create reusable atomic components: StarburstIcon, EllipseDecor, GlowCard, CarbonMeter
- [x] Build landing/home page with hero, features overview, and CTA

## Phase 3: Onboarding & Carbon DNA
- [x] Build multi-step onboarding questionnaire
- [x] Implement lifestyle archetype segmentation (Urban Commuter, Conscious Consumer, etc.)
- [x] Generate personalized carbon reduction roadmap via AI
- [x] Build user profile page with Carbon DNA visualization
- [x] Store archetype + roadmap in DB

## Phase 4: Carbon Activity Logging & Dashboard
- [x] Build quick-tap activity presets (transport, meals, energy, shopping)
- [x] Integrate Deepgram voice input for activity logging
- [x] Build main dashboard with carbon meter, weekly trends, category breakdown
- [x] Implement carbon calculation engine with real emission factors
- [x] Build activity history timeline

## Phase 5: CarbonInfluencer Engine & Leaderboard
- [x] Build graph-based influence scoring algorithm
- [x] Build live community feed with influencer amplification
- [x] Build real-time leaderboard with Elo-style scoring
- [x] Implement weekly seasons and rival matchup system
- [x] Build cascading influence score visualization

## Phase 6: CarbonMirror, CarbonCollective & What-If
- [x] Build CarbonMirror anonymized peer comparison (category-level + percentile)
- [x] Ensure archetype alignment between onboarding and CarbonMirror
- [x] Build CarbonCollective group creation and management
- [x] Build collective impact pooling and real-time modeling
- [x] Build what-if scenario calculator

## Phase 7: AI Features
- [x] Build AI Challenge Generator (Groq for speed, NIM for depth)
- [x] Implement weekly challenge completion tracking and streak rewards
- [x] Build CarbonStory NLG narrative generation
- [x] Build beautiful shareable impact cards
- [x] Build ReBon AI conversational assistant with multi-model routing
- [x] Implement Sarvam AI multilingual support in ReBon AI

## Phase 8: Quality, Security & Accessibility
- [x] Write vitest unit tests for all backend procedures (67 tests, 3 test files)
- [x] Write vitest tests for AI routing logic
- [x] Add input validation (Zod schemas, negative/zero/overflow guards)
- [x] Add ARIA labels, keyboard navigation, focus rings
- [x] Ensure responsive design (mobile-first)
- [x] Add error boundaries and graceful fallbacks

## Phase 9: Final Polish & Delivery
- [x] Final UI polish and animation refinement
- [x] Optimize bundle size (< 10 MB repo)
- [x] Save checkpoint
- [x] Prepare GitHub-ready README
- [x] Write ENV_SETUP.md for local development

## Phase 10: Auth, UI Overhaul & Quality Hardening
- [x] Fix duplicate electricity_kwh key in LogActivity.tsx
- [x] Remove build output, coverage folders, node_modules from git tracking
- [x] Add .gitignore entries for dist/, coverage/, screenshots/
- [x] Implement email/OTP authentication (no Manus dependency)
- [x] Implement phone number OTP authentication
- [x] Build auth pages: login, verify OTP, register
- [x] Redesign UI to Stripe-inspired: vibrant gradients, abstract shapes, colourful
- [x] Refactor tests: focused unit tests, mock externals, integration smoke tests
- [x] Add rate limiting to auth and AI endpoints
- [x] Add security headers (helmet.js)
- [x] Final accessibility audit and keyboard navigation check

## Phase 11: UI Overhaul + A2A Feature
- [x] Rebuild global CSS: glassmorphism + industrial grid (Astrix-style), black base, white/10 borders, glass cards
- [x] Rebuild landing page (Home.tsx): industrial grid header, marketing copy, glassmorphism hero
- [x] Rebuild RebonLayout sidebar: industrial grid nav, uppercase tracking, glass sidebar
- [x] Rebuild Dashboard: glassmorphism stat cards, marketing copy, animated metrics
- [x] Rebuild all inner pages with glassmorphism card system
- [x] Add A2A (Agent-to-Agent) carbon negotiation feature: backend router + frontend page
- [x] Add A2A route to App.tsx and sidebar navigation
- [x] Update tests for A2A feature

## Phase 12: Bug Fixes (Login + AI Features)
- [x] Fix JWT payload mismatch: verifyOtp now includes appId and name fields required by sdk.verifySession
- [x] Fix Login.tsx UI: "IconPhone" and "IconArrowForward" raw text replaced with "Phone" and "Send code"
- [x] Fix AI JSON parsing: add parseAIJson helper to strip markdown code fences before JSON.parse
- [x] Fix challenges.generate: sanitize AI-returned category/difficulty to valid DB enum values
- [x] Verified: login flow works end-to-end (sendOtp → verifyOtp → authenticated session)
- [x] Verified: ReBon AI assistant responds correctly (Groq)
- [x] Verified: challenge generation works (3 AI-generated challenges saved to DB)
- [x] Verified: story generation works (NVIDIA NIM narrative + equivalents)
- [x] Verified: activity logging works
- [x] Verified: leaderboard loads
