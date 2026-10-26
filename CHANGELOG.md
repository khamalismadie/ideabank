# Changelog

All notable changes to Ideabank will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-10-26

### Added
- **Export functionality** — PNG, JSON, and PDF export via ExportMenu dropdown
- **AI Connect** — `/api/ai/connect` endpoint suggests relationships between ideas
- **AI Summarize** — `/api/ai/summarize` endpoint summarizes idea branches
- **AiConnectButton** — Toolbar button to trigger AI connection suggestions
- **html-to-image** dependency for PNG export

### Features
- Export PNG with 2x pixel ratio for crisp images
- Export JSON with full graph structure (nodes + edges + timestamp)
- Export PDF via browser print dialog
- AI connection suggestions with relationship types and reasoning
- Branch summarization with key themes and word count
- Support for both OpenAI (GPT-4o-mini) and Claude (Claude-3.5-Haiku) providers
- Mock AI responses when no API key configured

## [0.1.0] - 2026-10-26

### Added
- **Mindmap visualization** — Interactive node-based graph with React Flow
- **Idea CRUD** — Full create, read, update, delete for ideas
- **Connection management** — Link ideas with relationship types (parent, related, causes, inspires)
- **Tag system** — Custom labels with colors for organizing ideas
- **Search & filter** — Find ideas by keyword and filter by tags
- **AI Expand** — Generate sub-ideas from a parent idea via AI
- **API routes** — RESTful endpoints for ideas, connections, tags, mindmap, AI
- **PostgreSQL + Prisma** — Database schema with Idea, Connection, Tag models
- **Open source infrastructure** — CI/CD, Dependabot, issue/PR templates
- **Next.js 14 App Router** — Modern React framework with server components
- **Zustand state management** — Client-side state for mindmap interactions
- **Tailwind CSS styling** — Utility-first CSS with custom design tokens
- **Zod validation** — Schema validation for API inputs
- **Pino logging** — Structured JSON logging with request IDs

## [Unreleased]

### Planned
- Auth + user accounts
- Collaboration (share mindmaps)
- Version history
- AI auto-connect suggestions
- Mobile responsive design
