# Troubleshooting Guide

## Common Issues

### 1. Database Connection Error

**Error:**
```
Can't reach database server at `localhost:5432`
```

**Solutions:**
1. Ensure PostgreSQL is running:
   ```bash
   docker-compose ps
   ```

2. Check DATABASE_URL format:
   ```
   postgresql://username:password@host:port/database?schema=public
   ```

3. Restart PostgreSQL:
   ```bash
   docker-compose down && docker-compose up -d
   ```

### 2. Prisma Client Not Generated

**Error:**
```
Cannot find module '@prisma/client'
```

**Solution:**
```bash
npm run db:generate
```

### 3. Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### 4. Environment Variables Not Loaded

**Error:**
```
Invalid `prisma.model.findMany()` invocation
Database URL must start with `postgresql://`
```

**Solution:**
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Verify variables are set:
   ```bash
   cat .env.local
   ```

### 5. Build Fails

**Error:**
```
Type error: Cannot find module '...'
```

**Solutions:**
1. Clean install:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check Node.js version:
   ```bash
   node --version  # Should be 20+
   ```

### 6. Husky Not Working

**Error:**
```
.husky/pre-commit: No such file or directory
```

**Solution:**
```bash
npm install
npx husky install
```

### 7. TypeScript Errors

**Error:**
```
Type 'string' is not assignable to type '...'
```

**Solutions:**
1. Run typecheck:
   ```bash
   npm run typecheck
   ```

2. Check for missing types:
   ```bash
   npm install -D @types/node
   ```

### 8. ESLint Errors

**Error:**
```
error: ... is defined but never used
```

**Solution:**
```bash
# Auto-fix
npm run lint -- --fix
```

### 9. Database Migration Issues

**Error:**
```
Migration `20260101_...` was already applied
```

**Solution:**
```bash
# Reset database (dev only!)
npx prisma migrate reset

# Or mark migration as applied
npx prisma migrate resolve --applied migration_name
```

### 10. API Returns 500

**Check:**
1. Server logs for error message
2. Database connection
3. Environment variables
4. Request body format

```bash
# Check logs
npm run dev  # Look at terminal output
```

## Getting Help

1. Search [GitHub Issues](https://github.com/khamal/ideabank/issues)
2. Check [GitHub Discussions](https://github.com/khamal/ideabank/discussions)
3. Open a new issue with:
   - Error message
   - Steps to reproduce
   - Environment (OS, Node version, browser)

## Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug npm run dev
```

## Performance Issues

### Slow Queries

1. Check database indexes
2. Use Prisma's `include` instead of multiple queries
3. Implement pagination

### High Memory

1. Check for memory leaks in logs
2. Increase Node.js memory:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run dev
   ```
