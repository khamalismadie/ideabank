# Ideabank — Production-Readiness Assessment

**Date:** 2026-07-31
**Reviewer:** Senior Engineering Assessment
**Scope:** Full project readiness for public open-source launch

---

## Current State

The repository contains **zero source code**. Six files exist: `PRD.md`, `README.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `LICENSE`, `.gitignore`. Everything is planning and documentation. This is a clean slate, not a half-built house — which is actually the best time to make structural decisions correctly.

---

## 1. What's Good

### Documentation Foundation
- **PRD is solid.** Clear problem statement, user stories with priority tiers, data model with relationship types, API endpoint spec, timeline. Most open-source projects never get this far before writing code.
- **CONTRIBUTING.md exists from day one.** Conventional Commits defined, PR checklist included, code style mentioned. This will save you from answering "how do I contribute?" a hundred times.
- **LICENSE is correct.** MIT, proper copyright line, proper boilerplate.
- **.gitignore is thorough.** Covers node_modules, env files, build artifacts, IDE files, OS files, coverage directory.
- **README has badges, feature list, getting-started section, project structure.** Good skeleton.

### Design Decisions
- **Tech stack is coherent.** React + React Flow for visualization, Node.js backend, PostgreSQL + Prisma, Next.js. No exotic choices. Community support is strong for all of these.
- **Data model is well-thought-out.** The Connection entity with relationship types (`parent`, `related`, `causes`, `inspires`) is the right abstraction. Many mindmap projects get this wrong by hardcoding edges.
- **API design follows REST conventions.** Clean resource-based URLs, proper HTTP methods.

---

## 2. What's Missing — Full Gap Analysis

### A. No Source Code At All
The project has no `package.json`, no `src/`, no `prisma/`, no `app/`, no `next.config.js`. Nothing runs. The README says `npm run dev` but that command doesn't exist.

### B. Infrastructure & Configuration

| Gap | Impact |
|-----|--------|
| No `package.json` | Cannot install, run, or build anything |
| No `tsconfig.json` | TypeScript won't compile |
| No `next.config.js` / `next.config.ts` | Next.js won't start |
| No `.env.example` | Contributors won't know what env vars are needed |
| No `docker-compose.yml` | No local dev environment with PostgreSQL |
| No `Dockerfile` | No containerized deployment |
| No `turbo.json` or monorepo config | If splitting frontend/backend, no workspace strategy |

### C. Testing

| Gap | Impact |
|-----|--------|
| Zero test files | No safety net for any future code |
| No test framework configured | No Jest/Vitest/Playwright |
| No `__tests__/` or `*.test.ts` files | No test examples for contributors |
| No test CI step | Tests mentioned in CONTRIBUTING.md but won't run |

### D. CI/CD

| Gap | Impact |
|-----|--------|
| No `.github/workflows/` | No automated builds, tests, or deployments |
| No branch protection rules guidance | No quality gates |
| No release automation | Manual releases are error-prone |
| No Dependabot / Renovate config | Dependencies will rot |

### E. Security

| Gap | Impact |
|-----|--------|
| No `SECURITY.md` | No vulnerability reporting process |
| No rate limiting plan | API abuse vector |
| No input validation strategy | Injection/overflow attacks |
| No CORS configuration | Cross-origin issues |
| No helmet.js or equivalent | Missing HTTP security headers |
| No auth strategy defined (PRD says "optional") | Everyone's data is public by default |
| No `.env.example` with placeholder secrets | Risk of hardcoded secrets in code |
| No `npm audit` in CI | Known vulnerabilities ship silently |

### F. Error Handling & Logging

| Gap | Impact |
|-----|--------|
| No error handling strategy | Every error becomes a 500 |
| No logging library chosen | No structured logs |
| No error boundary components | React crashes show blank screen |
| No API error response format defined | Frontend can't parse errors reliably |
| No request ID / correlation ID system | Debugging production issues is guesswork |

### G. Database & Migrations

| Gap | Impact |
|-----|--------|
| No `prisma/schema.prisma` | Data model lives only in PRD diagrams |
| No migration strategy | Schema changes will break existing data |
| No seed script | Dev environment has no test data |
| No database connection pooling config | Connection exhaustion under load |

### H. API Validation & Contracts

| Gap | Impact |
|-----|--------|
| No request validation (Zod/Joi) | Garbage in, garbage out |
| No OpenAPI/Swagger spec | API docs are only in PRD markdown |
| No response schema definition | Frontend and backend can drift apart |
| No pagination strategy | `GET /api/ideas` returns everything at scale |
| No sorting/filtering implementation | PRD mentions "filterable" but no spec |

### I. Monitoring & Observability

| Gap | Impact |
|-----|--------|
| No health check endpoint | Load balancers can't verify service status |
| No metrics collection | No visibility into performance |
| No alerting strategy | Issues discovered by users, not you |
| No APM choice (Sentry/Datadog/etc.) | Production debugging is blind |

### J. Documentation Gaps

| Gap | Impact |
|-----|--------|
| No API documentation beyond PRD | Consumers can't integrate reliably |
| No architecture decision records (ADRs) | Rationale for tech choices is lost |
| No changelog / `CHANGELOG.md` | Users don't know what changed between versions |
| No `.github/ISSUE_TEMPLATE/` | Issues arrive in random format |
| No `.github/PULL_REQUEST_TEMPLATE.md` | PRs lack structure |
| No `.github/DISCUSSION_TEMPLATE.md` | Discussions have no format |
| No GitHub Actions status badge in README | Build status invisible |
| README "Getting Started" assumes everything works | Will break immediately |
| No deployment guide | Contributors can't deploy |
| No environment variable documentation | What does `DATABASE_URL` need? |

### K. Code Quality Tooling

| Gap | Impact |
|-----|--------|
| No ESLint config | No static analysis |
| No Prettier config | No formatting consistency |
| No Husky + lint-staged | Pre-commit hooks don't exist |
| No `editorconfig` | Editor behavior varies across contributors |
| No TypeScript strict mode | Type safety is opt-in, meaning no safety |

### L. Community & Project Management

| Gap | Impact |
|-----|--------|
| No GitHub Issue templates | Unstructured bug reports |
| No GitHub Discussions setup | Questions go to Issues |
| No code of conduct | No community standards |
| No `SECURITY.md` | No way to report vulnerabilities privately |
| No release/tagging strategy | No versioning discipline |
| No GitHub Projects or roadmap | Contributors don't know what's next |
| No "good first issue" labels | New contributors can't find entry points |

---

## 3. Priority Fixes

### P0 — Must Have Before First Commit With Real Code

These block everything. Without them, the project cannot accept contributions or run.

| # | Item | File(s) to Create |
|---|------|--------------------|
| 1 | `package.json` with all dependencies | `package.json` |
| 2 | `tsconfig.json` with strict mode | `tsconfig.json` |
| 3 | `next.config.ts` | `next.config.ts` |
| 4 | `.env.example` with all required vars | `.env.example` |
| 5 | Prisma schema matching the PRD data model | `prisma/schema.prisma` |
| 6 | Docker Compose for local PostgreSQL | `docker-compose.yml` |
| 7 | Basic app structure (Next.js app router) | `src/app/layout.tsx`, `src/app/page.tsx` |
| 8 | ESLint + Prettier config | `eslint.config.mjs`, `.prettierrc` |
| 9 | `editorconfig` | `.editorconfig` |
| 10 | GitHub CI workflow (lint + typecheck + test) | `.github/workflows/ci.yml` |
| 11 | `SECURITY.md` | `SECURITY.md` |
| 12 | Issue & PR templates | `.github/ISSUE_TEMPLATE/bug_report.md`, `.github/ISSUE_TEMPLATE/feature_request.md`, `.github/PULL_REQUEST_TEMPLATE.md` |
| 13 | Health check endpoint | `src/app/api/health/route.ts` |
| 14 | Input validation on API routes | `src/lib/validate.ts` (Zod schemas) |
| 15 | Global error handler | `src/app/api/error-handler.ts` |

### P1 — Should Have Before v1.0 Release

These make the difference between "works on my machine" and "production-ready".

| # | Item | File(s) to Create |
|---|------|--------------------|
| 1 | Unit test framework + first tests | `vitest.config.ts`, `src/__tests__/ideas.test.ts` |
| 2 | API integration tests | `src/__tests__/api/ideas.test.ts` |
| 3 | E2E test setup | `playwright.config.ts`, `e2e/mindmap.spec.ts` |
| 4 | Structured logging (pino/winston) | `src/lib/logger.ts` |
| 5 | Error boundaries for React | `src/components/ErrorBoundary.tsx` |
| 6 | Request ID middleware | `src/lib/request-id.ts` |
| 7 | CORS configuration | `src/lib/cors.ts` |
| 8 | Rate limiting | `src/lib/rate-limit.ts` |
| 9 | Database seed script | `prisma/seed.ts` |
| 10 | OpenAPI spec | `docs/openapi.yaml` |
| 11 | `CHANGELOG.md` | `CHANGELOG.md` |
| 12 | Code of Conduct | `CODE_OF_CONDUCT.md` |
| 13 | Husky + lint-staged | `.husky/pre-commit`, package.json scripts |
| 14 | Dependabot config | `.github/dependabot.yml` |
| 15 | Release workflow | `.github/workflows/release.yml` |
| 16 | Architecture Decision Records | `docs/adr/001-tech-stack.md` |

### P2 — Nice to Have (Post v1.0)

| # | Item | File(s) to Create |
|---|------|--------------------|
| 1 | Sentry integration | `src/lib/sentry.ts` |
| 2 | Prometheus metrics | `src/app/api/metrics/route.ts` |
| 3 | Deployment guide | `docs/deployment.md` |
| 4 | Performance benchmarks | `docs/benchmarks.md` |
| 5 | GitHub Discussions templates | `.github/DISCUSSION_TEMPLATE/` |
| 6 | Good-first-issue triage automation | `.github/workflows/triage.yml` |
| 7 | CodeQL security scanning | `.github/workflows/codeql.yml` |
| 8 | Bundle size tracking | `.github/workflows/bundlewatch.yml` |
| 9 | Visual regression tests | `e2e/visual/` |
| 10 | Multi-language i18n setup | `src/i18n/` |

---

## 4. Action Plan — Ordered by Dependency

### Phase 0: Foundation (Day 1)

**Goal:** Project runs locally, code compiles, CI passes.

```
Create these files IN ORDER (each depends on the previous):

1.  package.json                    # Dependencies: next, react, prisma, zod, pino
2.  tsconfig.json                   # Strict mode, path aliases
3.  next.config.ts                  # Minimal config
4.  .env.example                    # DATABASE_URL, OPENAI_API_KEY, etc.
5.  docker-compose.yml              # PostgreSQL 16 + pgAdmin
6.  prisma/schema.prisma            # Idea, Connection, Tag models from PRD
7.  src/app/layout.tsx              # Root layout
8.  src/app/page.tsx                # Placeholder page
9.  src/app/api/health/route.ts     # GET /api/health → 200 OK
10. eslint.config.mjs               # Flat config, @typescript-eslint
11. .prettierrc                     # Single quotes, no semicolons (or your preference)
12. .editorconfig                   # Match Prettier settings
13. .github/workflows/ci.yml        # Install → Lint → Typecheck → Test → Build
```

### Phase 1: Core API (Days 2-3)

**Goal:** CRUD endpoints with validation, error handling, logging.

```
14. src/lib/validate.ts             # Zod schemas for Idea, Connection, Tag
15. src/lib/logger.ts               # Pino with request context
16. src/lib/request-id.ts           # Middleware: X-Request-ID header
17. src/app/api/error-handler.ts    # Global error → structured JSON response
18. src/app/api/ideas/route.ts      # GET (list+filter+paginate), POST
19. src/app/api/ideas/[id]/route.ts # GET, PUT, DELETE
20. src/app/api/connections/route.ts # POST, GET
21. src/app/api/connections/[id]/route.ts # DELETE
22. src/app/api/tags/route.ts       # POST, GET
23. src/app/api/tags/[id]/route.ts  # PUT, DELETE
24. src/app/api/mindmap/route.ts    # GET (full graph)
25. src/app/api/mindmap/[rootId]/route.ts # GET (subtree)
26. prisma/seed.ts                  # Sample data for development
```

### Phase 2: Testing + Security (Days 4-5)

**Goal:** Tests exist, security basics covered.

```
27. vitest.config.ts                # Unit test config
28. src/__tests__/validate.test.ts  # Validation schema tests
29. src/__tests__/ideas.test.ts     # Unit tests for idea logic
30. src/__tests__/api/ideas.test.ts # Integration tests
31. src/lib/cors.ts                 # CORS origin whitelist
32. src/lib/rate-limit.ts           # In-memory rate limiter (sliding window)
33. SECURITY.md                     # Vulnerability reporting process
34. playwright.config.ts            # E2E config
35. e2e/mindmap-basic.spec.ts       # Create idea → see in mindmap
36. .github/dependabot.yml          # Weekly dependency updates
```

### Phase 3: Community + Polish (Day 6)

**Goal:** Ready for first contributors.

```
37. CODE_OF_CONDUCT.md              # Contributor Covenant
38. .github/ISSUE_TEMPLATE/bug_report.md
39. .github/ISSUE_TEMPLATE/feature_request.md
40. .github/PULL_REQUEST_TEMPLATE.md
41. CHANGELOG.md                    # Start from v0.1.0
42. docs/adr/001-tech-stack.md      # Why these technologies
43. docs/openapi.yaml               # Full API spec
44. Update README.md                # Real setup instructions, working badges
45. Update CONTRIBUTING.md          # Reference actual test/lint commands
46. Update CLAUDE.md                # Real architecture section
47. .husky/pre-commit               # Lint + format on commit
```

### Phase 4: Pre-Launch (Day 7)

**Goal:** Tag v0.1.0, open for issues.

```
48. .github/workflows/release.yml  # Automated changelog + tag on merge to main
49. docs/deployment.md              # Vercel + Railway deploy guide
50. Review all docs for accuracy
51. Tag v0.1.0
52. Enable GitHub Discussions
53. Create "good first issue" labels + seed 3-5 starter issues
```

---

## 5. Specific File Specifications

### `SECURITY.md`

Must include:
- How to report vulnerabilities (email, not public issue)
- Expected response time (48h acknowledgment, 7-day fix for critical)
- Scope (what's in/out of the security policy)
- Supported versions

### `.env.example`

```
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ideabank?schema=public"

# AI (optional — app works without it)
OPENAI_API_KEY=""
AI_PROVIDER="openai"  # or "claude"

# Auth (optional)
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"

# App
NODE_ENV="development"
PORT=3000
```

### `.github/workflows/ci.yml` (key structure)

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: ideabank_test
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
```

### `prisma/schema.prisma` (key structure)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Idea {
  id          String       @id @default(uuid())
  title       String
  description String?
  content     String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  connections Connection[] @relation("Source")
  targetConns Connection[] @relation("Target")
  tags        Tag[]
}

model Connection {
  id           String   @id @default(uuid())
  sourceId     String
  targetId     String
  relationship String   @default("related") // parent | related | causes | inspires
  source       Idea     @relation("Source", fields: [sourceId], references: [id])
  target       Idea     @relation("Target", fields: [targetId], references: [id])

  @@unique([sourceId, targetId, relationship])
}

model Tag {
  id    String @id @default(uuid())
  name  String @unique
  color String @default("#6366f1")
  ideas Idea[]
}
```

---

## 6. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| AI API costs spiral | High | Rate limit per-user, cache responses, set monthly caps |
| PostgreSQL migration breaks data | High | Always write reversible migrations, test on staging first |
| No auth = public data | Critical | Implement auth before any public deployment |
| Dependency vulnerabilities | Medium | Dependabot + `npm audit` in CI |
| Scope creep (collaboration, versioning too early) | Medium | Stick to PRD priority tiers, ship P0 first |
| External drive dependency | Low | Move repo to internal disk or cloud, external drives fail |

---

## 7. Summary

**Current maturity: 2/10** (planning only, no runnable code)

**What exists is good.** The PRD is above average. The documentation structure is above average. The tech choices are sound.

**What's missing is everything that makes code run.** No package.json, no source code, no tests, no CI, no database schema, no security posture.

**The plan is achievable in ~7 days** to reach a v0.1.0 that can accept contributions. The dependency chain is linear — Phase 0 must complete before anything else runs.

**The single highest-impact action right now:** Run Phase 0. Get `package.json`, `docker-compose.yml`, `prisma/schema.prisma`, and the CI workflow committed. That turns this from "docs about a project" into "a project that runs."

---

*Assessment generated 2026-07-31. Re-evaluate after Phase 0 completion.*
