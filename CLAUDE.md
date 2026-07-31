# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ideabank** — open-source mindmap-powered idea management system with AI assistance.

**License:** MIT | **Repo:** github.com/khamal/ideabank

## Commands

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm run lint             # Run ESLint
npm run typecheck        # TypeScript check (no emit)
npm test                 # Run Vitest tests
npm run db:push          # Push Prisma schema to DB
npm run db:seed          # Seed sample data
npm run db:studio        # Open Prisma Studio (GUI)
git tag -a v0.1.0 -m "Release v0.1.0"  # Create version tag
git push origin main --tags              # Push tags
```

## Architecture

- **Framework:** Next.js 14 with App Router
- **Database:** PostgreSQL + Prisma ORM (schema: `prisma/schema.prisma`)
- **API Routes:** `src/app/api/` — RESTful endpoints
- **Validation:** Zod schemas in `src/lib/validate.ts`
- **Error Handling:** Custom error classes in `src/lib/errors.ts`
- **Logging:** Pino with request IDs

## Data Model

- **Idea** — Core entity (title, description, content, tags)
- **Connection** — Links ideas with relationship types (parent, related, causes, inspires)
- **Tag** — Labels for categorizing ideas

## Key Patterns

- All API routes use `validate()` from `src/lib/validate.ts` for input validation
- Errors extend `AppError` class and return structured JSON
- Request IDs via `x-request-id` header for tracing
- Prisma client singleton in `src/lib/prisma.ts`

## External Drive

Project location: `/Volumes/khamal/projects/Ideabank/`
