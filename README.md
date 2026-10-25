# Ideabank

> Mindmap-powered idea management system with AI assistance.

[![CI](https://github.com/khamalismadie/ideabank/actions/workflows/ci.yml/badge.svg)](https://github.com/khamalismadie/ideabank/actions/workflows/ci.yml)
[![CodeQL](https://github.com/khamalismadie/ideabank/actions/workflows/codeql.yml/badge.svg)](https://github.com/khamalismadie/ideabank/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub Stars](https://img.shields.io/github/stars/khamalismadie/ideabank)](https://github.com/khamalismadie/ideabank)

## What is Ideabank?

Ideabank helps you capture, connect, and develop your ideas visually using mindmaps. Instead of linear notes, see how your ideas relate to each other.

### Features

- **Visual Mindmap** — Interactive node-based graph for idea visualization using React Flow
- **Connect Ideas** — Link concepts with relationships (parent, related, causes, inspires)
- **AI Expand** — Let AI help develop your ideas into sub-concepts (V2)
- **Smart Search** — Find ideas by keyword, tag, or connection
- **Tags** — Organize ideas with custom labels
- **Export** — Download as PNG, PDF, or JSON (V1)

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)
- npm or yarn

### Quick Start

```bash
# Clone
git clone https://github.com/khamalismadie/ideabank.git
cd ideabank

# Install dependencies
npm install

# Start PostgreSQL
docker-compose up -d

# Setup environment
cp .env.example .env.local

# Setup database
npm run db:push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Then navigate to the mindmap view at [http://localhost:3000/mindmap](http://localhost:3000/mindmap)

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript compiler |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |

## Tech Stack

- **Frontend:** Next.js 14 + React 18 + React Flow + Zustand + Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL 16 + Prisma ORM
- **Validation:** Zod
- **Logging:** Pino
- **AI:** OpenAI / Claude API (optional)
- **Testing:** Vitest

## Project Structure

```
ideabank/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   │   ├── health/   # Health check
│   │   │   ├── ideas/    # Idea CRUD
│   │   │   ├── connections/
│   │   │   ├── tags/
│   │   │   └── mindmap/
│   │   ├── mindmap/      # Mindmap visualization page
│   │   ├── layout.tsx
│   │   └── page.tsx      # Landing page
│   ├── components/       # React components
│   │   ├── ui/           # Base UI components
│   │   └── mindmap/      # Mindmap-specific components
│   ├── store/            # Zustand state management
│   └── lib/              # Shared utilities
│       ├── prisma.ts     # Prisma client
│       ├── validate.ts   # Zod schemas
│       ├── errors.ts     # Error handling
│       └── logger.ts     # Logging
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── docs/                 # Documentation
├── .github/              # CI/CD, templates
└── docker-compose.yml    # Local PostgreSQL
```

## API Documentation

### Health Check
```
GET /api/health
```

### Ideas
```
GET    /api/ideas           # List ideas (supports ?search, ?tagId, ?page, ?limit)
POST   /api/ideas           # Create idea
GET    /api/ideas/:id       # Get idea
PUT    /api/ideas/:id       # Update idea
DELETE /api/ideas/:id       # Delete idea
```

### Connections
```
GET    /api/connections     # List connections
POST   /api/connections     # Create connection
DELETE /api/connections/:id # Delete connection
```

### Tags
```
GET    /api/tags            # List tags
POST   /api/tags            # Create tag
PUT    /api/tags/:id        # Update tag
DELETE /api/tags/:id        # Delete tag
GET    /api/tags/:id/ideas  # Get ideas by tag
```

### Mindmap
```
GET    /api/mindmap         # Get full graph (nodes + edges)
GET    /api/mindmap/:rootId # Get subtree from root idea
```

Full API spec: [PRD.md](PRD.md)

## Documentation

- [Architecture](docs/architecture.md) - System design and decisions
- [Deployment](docs/deployment.md) - Vercel, Docker, Railway, self-hosted
- [Environment Variables](docs/env-reference.md) - All configuration options
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions

## Roadmap

| Phase | Features | Status |
|-------|----------|--------|
| MVP | CRUD + Mindmap visualization | ✅ Complete |
| V1 | Tags + Search + Export | In Progress |
| V2 | AI features (expand, connect, summarize) | Planned |
| V3 | Auth + Collaboration | Planned |

## Related Projects

| Project | Description |
|---------|-------------|
| [Component Atlas](https://github.com/khamalismadie/Component-atlas) | Interactive visual map for React codebases — dependency graphs, re-render heatmaps, bundle size analysis |
| [PromptKit](https://clawhub.ai/khamalismadie/skills/promptkit) | Auto-selects and applies prompting frameworks from 56 options for structured AI prompts |

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## Security

To report security vulnerabilities, please see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
