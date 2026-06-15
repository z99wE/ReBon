# ReBon Testing Strategy

This document outlines the testing approach, coverage targets, and how to run tests locally and in CI.

## Overview

ReBon uses **Vitest** for unit and integration testing across both server and client code. Tests are organized by layer:

- **Server tests** (`server/**/*.test.ts`) — tRPC procedures, database operations, AI integrations
- **Client tests** (`client/**/*.test.tsx`) — React components, user interactions, form handling
- **Integration tests** (`server/integration.test.ts`) — end-to-end workflows like onboarding, activity logging, challenge completion

## Coverage Targets

| Layer | Target | Current |
|---|---|---|
| Lines | 70% | ~72% |
| Functions | 70% | ~71% |
| Branches | 65% | ~68% |
| Statements | 70% | ~72% |

Coverage reports are generated in HTML format and available at `coverage/index.html` after running tests.

## Running Tests Locally

### Install Dependencies

```bash
pnpm install
```

### Run All Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (re-run on file changes)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage
```

### Run Specific Tests

```bash
# Run a single test file
pnpm test server/auth.logout.test.ts

# Run tests matching a pattern
pnpm test -- --grep "carbon"

# Run tests in a directory
pnpm test server/
```

### View Coverage Report

After running `pnpm test:coverage`, open the HTML report:

```bash
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

## CI/CD Pipeline

GitHub Actions automatically runs the full test suite on every push and pull request to `main` or `develop` branches.

### CI Workflow

The `.github/workflows/ci.yml` file defines the CI pipeline:

1. **Checkout code** — Clone the repository
2. **Setup Node.js** — Install Node.js 22.x
3. **Install dependencies** — `pnpm install --frozen-lockfile`
4. **TypeScript check** — `pnpm check` (verify no type errors)
5. **Run tests with coverage** — `pnpm test:coverage`
6. **Upload coverage** — Send coverage data to Codecov
7. **Build project** — `pnpm build` (verify production build succeeds)

### CI Badge

Add this badge to your README to show CI status:

```markdown
[![CI](https://github.com/z99wE/ReBon/actions/workflows/ci.yml/badge.svg)](https://github.com/z99wE/ReBon/actions/workflows/ci.yml)
```

## Test Organization

### Server Tests

**File:** `server/auth.logout.test.ts`

Tests the OAuth logout flow, including session cookie clearing and redirect handling.

**File:** `server/rebon.test.ts`

Core unit tests for carbon calculations, archetype assignment, influence scoring, and challenge generation rules.

**File:** `server/integration.test.ts`

End-to-end integration tests covering:

- Onboarding flow (questions → archetype assignment)
- Activity logging (preset selection → carbon calculation)
- Challenge completion (idempotency, points calculation)
- Collective join (duplicate prevention)
- Leaderboard updates (ranking consistency)
- Mirror comparison (percentile calculation)

**File:** `server/aiRouter.test.ts`

Tests for AI model routing, ensuring fast tasks use the 8B model and heavy tasks use the 70B model.

### Client Tests

**Planned:** `client/src/pages/Login.test.tsx`

Tests the OTP login flow: identifier input, method switching, OTP entry, success/error states.

**Planned:** `client/src/pages/Onboarding.test.tsx`

Tests question rendering, selection handling, and completion state.

**Planned:** `client/src/pages/LogActivity.test.tsx`

Tests activity preset selection, voice result rendering, quantity input, and challenge entry points.

**Planned:** `client/src/pages/Dashboard.test.tsx`

Tests dashboard stats, quick actions, recent activity, and empty states.

**Planned:** `client/src/pages/Mirror.test.tsx`

Tests peer comparison, percentile display, insights, and error states.

**Planned:** `client/src/pages/Collective.test.tsx`

Tests create/join behavior, invite code handling, and member list rendering.

**Planned:** `client/src/pages/Leaderboard.test.tsx`

Tests ranked display, loading states, and user identity rendering.

**Planned:** `client/src/pages/Assistant.test.tsx`

Tests message submission, response rendering, and error handling.

## What Gets Tested

### Core Workflows

- **Onboarding** — User answers questions, archetype is assigned, roadmap is generated
- **Activity Logging** — User logs activity via preset or voice, carbon is calculated, points awarded
- **Challenge Completion** — User completes challenge, points updated, leaderboard refreshed
- **Collective Join** — User joins collective, membership is created (no duplicates), member count updated
- **Mirror Comparison** — User views peer comparison, percentile calculated, insights displayed
- **Leaderboard** — Rankings calculated, user positioned correctly, top influencers highlighted

### Data Integrity

- **Idempotency** — Duplicate operations don't create duplicate rows or double-count points
- **Constraints** — Database enforces unique constraints on collectiveMembers, leaderboard entries
- **Indexes** — Hot paths have indexes for fast queries (user activities, challenges by week, etc.)

### AI Features

- **Fast inference** — Uses llama-3.1-8b-instant for quick responses
- **Heavy analysis** — Uses llama-3.1-70b for deep insights
- **JSON parsing** — Handles AI responses wrapped in markdown code blocks
- **Enum sanitization** — Invalid category/difficulty values are mapped to valid enums

### Security

- **OTP** — No sensitive values logged to console
- **Session** — JWT tokens include required fields (openId, appId, name)
- **CORS** — API calls are restricted to same-origin or allowed domains
- **Rate limiting** — OTP endpoints rate-limited to prevent brute force

## Debugging Tests

### Run Tests with Verbose Output

```bash
pnpm test -- --reporter=verbose
```

### Debug a Single Test

```bash
# Use node inspector
node --inspect-brk ./node_modules/vitest/vitest.mjs run server/auth.logout.test.ts
```

### Check Test Isolation

If tests pass individually but fail together, it may be a test isolation issue:

```bash
# Run tests in random order
pnpm test -- --shuffle

# Run tests sequentially
pnpm test -- --no-threads
```

## Artifacts to Exclude from Git

Add these to `.gitignore` (already configured):

```
coverage/
dist/
client/dist/
.vitest/
node_modules/
```

## Best Practices

1. **Write tests as you code** — Don't leave testing for the end
2. **Test behavior, not implementation** — Focus on what the user sees, not how it works internally
3. **Keep tests focused** — One test should verify one behavior
4. **Use descriptive names** — Test names should explain what is being tested
5. **Mock external services** — Don't call real APIs in tests
6. **Clean up after tests** — Use `afterEach` to reset state
7. **Avoid flaky tests** — Don't rely on timing; use explicit waits

## Continuous Improvement

- **Monitor coverage trends** — Aim to increase coverage over time
- **Add tests for bugs** — When a bug is found, add a test to prevent regression
- **Refactor tests** — Keep tests maintainable and DRY
- **Review test feedback** — Use test failures to improve code design

---

**For questions or contributions, see the main [README.md](./README.md).**
