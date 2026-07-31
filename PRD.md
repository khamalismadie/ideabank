# PRD: Ideabank — Mindmap-Powered Idea Management

## Overview

**Ideabank** adalah aplikasi manajemen ide berbasis mindmap yang memungkinkan pengguna menyimpan, mengorganisasi, dan mengembangkan ide secara visual dengan bantuan AI.

## Problem

- Ide sering hilang karena tidak terstruktur
- Catatan linear (notes) tidak cukup untuk ide yang saling terhubung
- Sulit melihat hubungan antar ide
- Tidak ada cara cepat mengembangkan ide mentah menjadi konsep matang

## Solution

Aplikasi mindmap interaktif dengan:
- Custom API untuk menyimpan dan query ide
- Visualisasi node-based mindmap
- AI assist untuk expand ide
- Search dan filter berbasis hubungan antar ide

## User Stories

### P0 — Core
1. Sebagai user, saya bisa **create idea** dengan judul dan deskripsi
2. Sebagai user, saya bisa **connect ideas** (edge/hubungan)
3. Sebagai user, saya bisa **visualisasi sebagai mindmap**
4. Sebagai user, saya bisa **edit dan delete idea**
5. Sebagai user, saya bisa **search idea** berdasarkan keyword

### P1 — Enhancement
6. Sebagai user, saya bisa **tag ideas** (kategori/label)
7. Sebagai user, saya bisa **expand idea dengan AI** (generates sub-ideas)
8. Sebagai user, saya bisa **export mindmap** (PNG, PDF, JSON)
9. Sebagai user, saya bisa **filter by tag** atau **time range**

### P2 — Future
10. Sebagai user, saya bisa **collaborate** (share mindmap)
11. Sebagai user, saya bisa **version history** (lihat perubahan ide)
12. Sebagai user, saya bisa **AI auto-connect** (sistem suggest hubungan antar ide)

## Data Model

```
┌─────────────┐      ┌─────────────────┐      ┌─────────────┐
│    Idea      │      │   Connection     │      │     Tag     │
├─────────────┤      ├─────────────────┤      ├─────────────┤
│ id          │──┐   │ id              │   ┌──│ id          │
│ title       │  └──▶│ source_id       │   │  │ name        │
│ description │      │ target_id       │   │  │ color       │
│ content     │      │ relationship    │◀──┘  └─────────────┘
│ created_at  │      │   (parent/      │
│ updated_at  │      │    related/     │
└─────────────┘      │    causes)      │
                     └─────────────────┘
```

**Relationship Types:**
- `parent` → hierarki (child idea)
- `related` → koneksi tematik
- `causes` → cause-effect
- `inspires` → ide yang menginspirasi ide lain

## API Endpoints

### Ideas
```
POST   /api/ideas           # Create idea
GET    /api/ideas            # List all (filterable)
GET    /api/ideas/:id        # Get single idea
PUT    /api/ideas/:id        # Update idea
DELETE /api/ideas/:id        # Delete idea
```

### Connections
```
POST   /api/connections      # Create connection
GET    /api/connections      # List all connections
DELETE /api/connections/:id  # Remove connection
```

### Tags
```
POST   /api/tags             # Create tag
GET    /api/tags             # List all tags
PUT    /api/tags/:id         # Update tag
DELETE /api/tags/:id         # Delete tag
```

### AI Features
```
POST   /api/ai/expand        # Expand idea → sub-ideas
POST   /api/ai/connect       # Suggest connections
POST   /api/ai/summarize     # Summarize branch
```

### Mindmap
```
GET    /api/mindmap           # Get full graph (nodes + edges)
GET    /api/mindmap/:rootId   # Get subtree from root
```

## Tech Stack (Proposed)

| Layer | Technology |
|-------|------------|
| Frontend | React/Next.js + React Flow (mindmap viz) |
| Backend | Node.js + Express/Fastify |
| Database | PostgreSQL + Prisma ORM |
| AI | OpenAI/Claude API |
| Auth | NextAuth.js (optional) |
| Hosting | Vercel + Railway/Supabase |

## UI Flow

```
┌──────────────────────────────────────────────────┐
│  IDEABANK                                         │
├──────────────────────────────────────────────────┤
│                                                   │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐     │
│   │ Idea A  │────│ Idea B  │────│ Idea C  │     │
│   └────┬────┘    └─────────┘    └─────────┘     │
│        │                                          │
│        └──────┐                                   │
│               ▼                                   │
│         ┌─────────┐                               │
│         │ Idea D  │                               │
│         └─────────┘                               │
│                                                   │
├──────────────────────────────────────────────────┤
│  [Search]  [+ New]  [Tags]  [AI Expand]  [Export] │
└──────────────────────────────────────────────────┘
```

## Success Metrics

- User bisa create dan connect ideas dalam < 10 detik
- Mindmap load time < 1 detik untuk 100+ nodes
- AI expand menghasilkan minimal 3 sub-ideas per request

## Timeline

| Phase | Scope | Duration |
|-------|-------|----------|
| MVP | CRUD + Mindmap visualization | 2 weeks |
| V1 | Tags + Search + Export | 1 week |
| V2 | AI features | 1 week |
| V3 | Auth + Collaboration | 2 weeks |

## Open Source

- **License:** MIT
- **Repo:** github.com/khamal/ideabank (public)
- **Contributing:** See CONTRIBUTING.md

## Open Questions

1. Offline-first atau online-only?
2. Berapa max ideas per user yang harus didukung?
3. AI provider: OpenAI atau Claude?
4. Perlu versioning/backup system?
