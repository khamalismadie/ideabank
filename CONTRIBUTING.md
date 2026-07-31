# Contributing to Ideabank

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
# Clone
git clone https://github.com/khamal/ideabank.git
cd ideabank

# Install dependencies
npm install

# Start PostgreSQL
docker-compose up -d

# Setup environment
cp .env.example .env.local

# Setup database
npm run db:push
npm run db:seed

# Start dev server
npm run dev
```

## How to Contribute

### Bug Reports
- Open an issue with `bug` label
- Include: steps to reproduce, expected vs actual behavior, screenshots

### Feature Requests
- Open an issue with `enhancement` label
- Describe the use case and expected behavior

### Code Contributions
1. Fork the repo
2. Create branch: `git checkout -b feat/your-feature`
3. Make changes
4. Run tests: `npm test`
5. Commit: `git commit -m "feat: add your feature"`
6. Push: `git push origin feat/your-feature`
7. Open PR with description of changes

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Description | Version Bump |
|--------|-------------|--------------|
| `feat:` | New feature | MINOR |
| `fix:` | Bug fix | PATCH |
| `docs:` | Documentation only | PATCH |
| `style:` | Code style (formatting, semicolons, etc) | None |
| `refactor:` | Code change that neither fixes bug nor adds feature | None |
| `test:` | Adding or correcting tests | None |
| `chore:` | Build process, tooling, dependencies | None |
| `perf:` | Performance improvement | PATCH |
| `ci:` | CI/CD changes | None |

Examples:
```
feat(ideas): add search functionality
fix(api): resolve connection duplication
docs(readme): update installation steps
chore(deps): update prisma to 5.14.0
```

## Code Style

- Use ESLint + Prettier
- Use TypeScript strict mode (no `any`)
- Keep functions small and focused
- Write meaningful variable names

## Pull Request Checklist

- [ ] Code follows project style
- [ ] Tests pass (`npm test`)
- [ ] Documentation updated if needed
- [ ] Commit messages follow convention
- [ ] PR description explains the changes
- [ ] Changelog updated (if applicable)

## Versioning

See [VERSIONING.md](VERSIONING.md) for versioning policy.

- `MAJOR` — Breaking changes
- `MINOR` — New features (backward compatible)
- `PATCH` — Bug fixes

## Questions?

Open a discussion in the repo's Discussions tab.
