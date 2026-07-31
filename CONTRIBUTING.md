# Contributing to Ideabank

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
# Clone
git clone https://github.com/khamal/ideabank.git
cd ideabank

# Install dependencies
npm install

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

| Prefix | Description |
|--------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `style:` | Code style (formatting, semicolons, etc) |
| `refactor:` | Code change that neither fixes bug nor adds feature |
| `test:` | Adding or correcting tests |
| `chore:` | Build process, tooling, dependencies |

Examples:
```
feat: add idea connection API
fix: resolve mindmap rendering issue on Safari
docs: update API endpoints in PRD
```

## Code Style

- Use ESLint + Prettier (config will be added)
- Use TypeScript for type safety
- Keep functions small and focused
- Write meaningful variable names

## Pull Request Checklist

- [ ] Code follows project style
- [ ] Tests pass (`npm test`)
- [ ] Documentation updated if needed
- [ ] Commit messages follow convention
- [ ] PR description explains the changes

## Questions?

Open a discussion in the repo's Discussions tab.
