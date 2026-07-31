# Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or use Docker)
- npm or yarn

## Option 1: Vercel (Recommended)

### Setup

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy

### Environment Variables

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

### Database

Use [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app) for PostgreSQL.

## Option 2: Docker

### Build and Run

```bash
# Build image
docker build -t ideabank .

# Run with PostgreSQL
docker-compose up -d
```

### Production Docker Compose

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/ideabank
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ideabank
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Option 3: Railway

1. Create account on [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Add PostgreSQL plugin
4. Set environment variables
5. Deploy

## Option 4: Self-Hosted

### Requirements

- Linux server (Ubuntu 22.04+)
- Node.js 20+
- PostgreSQL 16+
- Nginx (reverse proxy)
- PM2 (process manager)

### Setup

```bash
# Clone repository
git clone https://github.com/khamal/ideabank.git
cd ideabank

# Install dependencies
npm ci

# Setup environment
cp .env.example .env.local
# Edit .env.local with your values

# Build
npm run build

# Start with PM2
pm2 start npm --name "ideabank" -- start
pm2 save
pm2 startup
```

### Nginx Config

```nginx
server {
    listen 80;
    server_name ideabank.dev;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Migrations

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply to production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

## Monitoring

### Health Check

```bash
curl https://your-domain/api/health
# {"status":"ok","timestamp":"...","version":"0.1.0"}
```

### Logs

```bash
# PM2 logs
pm2 logs ideabank

# Docker logs
docker-compose logs -f app
```

## Troubleshooting

### Database Connection Issues

1. Check DATABASE_URL format
2. Ensure PostgreSQL is running
3. Check firewall rules
4. Verify credentials

### Build Failures

1. Run `npm install` to ensure dependencies
2. Check Node.js version (20+)
3. Verify environment variables

### Memory Issues

1. Increase Node.js memory: `NODE_OPTIONS="--max-old-space-size=4096"`
2. Check for memory leaks in logs
3. Consider scaling horizontally
