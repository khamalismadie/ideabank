# Environment Variables Reference

## Required

### DATABASE_URL

```
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

| Component | Description |
|-----------|-------------|
| `username` | PostgreSQL username (default: `postgres`) |
| `password` | PostgreSQL password |
| `host` | Database host (default: `localhost`) |
| `port` | Database port (default: `5432`) |
| `database` | Database name (default: `ideabank`) |

Example:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ideabank?schema=public"
```

## Optional

### AI Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | OpenAI API key for AI features |
| `AI_PROVIDER` | `openai` | AI provider: `openai` or `claude` |

### Authentication

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXTAUTH_SECRET` | — | Secret for NextAuth.js session encryption |
| `NEXTAUTH_URL` | `http://localhost:3000` | Canonical URL for auth callbacks |

### Application

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment: `development`, `production`, `test` |
| `PORT` | `3000` | Server port |
| `LOG_LEVEL` | `info` | Logging level: `debug`, `info`, `warn`, `error` |

## Development

### Docker Compose Variables

Pre-configured in `.env.local`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ideabank?schema=public"
NODE_ENV=development
PORT=3000
```

### Database Setup

```bash
# Start PostgreSQL
docker-compose up -d

# Push schema
npm run db:push

# Seed data
npm run db:seed
```

## Production

### Vercel

Set in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

### Docker

Pass via environment or `.env` file:

```bash
docker run -e DATABASE_URL="postgresql://..." ideabank
```

## Security Notes

- Never commit `.env` or `.env.local` files
- Use different secrets for development and production
- Rotate secrets periodically
- Use a secrets manager in production (e.g., Vercel, Railway)
