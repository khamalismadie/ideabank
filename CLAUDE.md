# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ideabank** — open-source mindmap-powered idea management system with AI assistance.

**License:** MIT | **Repo:** github.com/khamalismadie/ideabank

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
git tag -a v0.2.0 -m "Release v0.2.0"  # Create version tag
git push origin main --tags              # Push tags
```

## Architecture

- **Framework:** Next.js 14 with App Router
- **Frontend:** React Flow for mindmap visualization, Zustand for state
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL + Prisma ORM (schema: `prisma/schema.prisma`)
- **API Routes:** `src/app/api/` — RESTful endpoints
- **Validation:** Zod schemas in `src/lib/validate.ts`
- **Error Handling:** Custom error classes in `src/lib/errors.ts`
- **Logging:** Pino with request IDs
- **AI:** OpenAI GPT-4o-mini or Claude 3.5 Haiku (via `AI_PROVIDER` env var)

## Data Model

- **Idea** — Core entity (title, description, content, tags)
- **Connection** — Links ideas with relationship types (parent, related, causes, inspires)
- **Tag** — Labels for categorizing ideas

## API Endpoints

### Ideas
```
GET    /api/ideas           # List ideas (?search, ?tagId, ?page, ?limit)
POST   /api/ideas           # Create idea
GET    /api/ideas/:id       # Get single idea
PUT    /api/ideas/:id       # Update idea
DELETE /api/ideas/:id       # Delete idea
```

### Connections
```
GET    /api/connections     # List all connections
POST   /api/connections     # Create connection
DELETE /api/connections/:id # Remove connection
```

### Tags
```
GET    /api/tags            # List all tags
POST   /api/tags            # Create tag
PUT    /api/tags/:id        # Update tag
DELETE /api/tags/:id        # Delete tag
```

### Mindmap
```
GET    /api/mindmap         # Get full graph (nodes + edges)
GET    /api/mindmap/:rootId # Get subtree from root idea
```

### AI Features
```
POST   /api/ai/expand       # Expand idea → sub-ideas
POST   /api/ai/connect      # Suggest connections between ideas
POST   /api/ai/summarize    # Summarize idea branch
```

## Key Patterns

- All API routes use `validate()` from `src/lib/validate.ts` for input validation
- Errors extend `AppError` class and return structured JSON
- Request IDs via `x-request-id` header for tracing
- Prisma client singleton in `src/lib/prisma.ts`
- Zustand store in `src/store/mindmap.ts` (also `src/hooks/useMindmapStore.ts`)
- AI features fall back to mock responses when no API key is configured

## UI Components

- `src/components/ui/` — Base components (Button, Input, Textarea, Modal, Toast)
- `src/components/mindmap/` — Mindmap components:
  - `MindmapView.tsx` — Main mindmap page wrapper
  - `MindmapCanvas.tsx` — React Flow canvas with filtering
  - `IdeaNode.tsx` — Custom node renderer
  - `ConnectionEdge.tsx` — Custom edge renderer
  - `IdeaSidePanel.tsx` — Selected idea detail panel
  - `CreateIdeaModal.tsx` — New idea form
  - `CreateConnectionModal.tsx` — Connection creation form
  - `AiExpandModal.tsx` — AI idea expansion modal
  - `AiConnectButton.tsx` — AI connection suggestion button
  - `ExportMenu.tsx` — Export dropdown (PNG, JSON, PDF)
  - `SearchBar.tsx` — Keyword search input
  - `TagFilter.tsx` — Tag filter dropdown

## Pages

- `/` — Landing page
- `/mindmap` — Interactive mindmap visualization (main app)

## Environment Variables

```env
DATABASE_URL=postgresql://...    # Required
OPENAI_API_KEY=sk-...           # Optional (for AI features)
ANTHROPIC_API_KEY=sk-ant-...    # Optional (alternative to OpenAI)
AI_PROVIDER=openai              # or "claude" (default: openai)
```

## External Drive

Project location: `/Volumes/Maddai/Projects/Ideabank/`
