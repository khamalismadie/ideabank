# Open Source Rules

Guidelines for maintaining Ideabank as a healthy open source project.

## Code of Conduct

All contributors must follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Contribution Guidelines

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Quick Rules

1. **Fork & Branch** — Never commit directly to `main`
2. **Conventional Commits** — Use `feat:`, `fix:`, `docs:`, etc.
3. **One PR = One Feature** — Keep pull requests focused
4. **Tests Required** — All new features need tests
5. **Update Docs** — Update README/PRD if behavior changes

## Commit Convention

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description | Version Bump |
|------|-------------|--------------|
| `feat` | New feature | MINOR |
| `fix` | Bug fix | PATCH |
| `docs` | Documentation only | PATCH |
| `style` | Code style (formatting) | None |
| `refactor` | Code change (no feature/fix) | None |
| `test` | Adding tests | None |
| `chore` | Build, tooling, deps | None |
| `perf` | Performance improvement | PATCH |
| `ci` | CI/CD changes | None |
| `revert` | Revert commit | — |

### Examples

```bash
git commit -m "feat(ideas): add search functionality"
git commit -m "fix(api): resolve connection duplication"
git commit -m "docs(readme): update installation steps"
git commit -m "chore(deps): update prisma to 5.14.0"
```

## Branch Strategy

```
main          ← stable releases
  └── feat/*  ← feature branches
  └── fix/*   ← bug fix branches
  └── docs/*  ← documentation branches
```

### Rules

- `main` is always deployable
- All changes go through Pull Requests
- PRs require 1 approval (or self-merge for maintainers)
- CI must pass before merge
- Squash merge preferred

## Release Process

1. **Create release branch** (for major releases)
2. **Update CHANGELOG.md**
3. **Bump version** in `package.json`
4. **Create PR** to `main`
5. **Merge PR**
6. **Create git tag**
7. **GitHub Actions** creates release

## Issue Management

### Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature request |
| `documentation` | Documentation improvement |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `security` | Security vulnerability |
| `breaking change` | Breaking change |

### Triage Process

1. New issues reviewed within 48 hours
2. Labels applied
3. Assigned to milestone if planned
4. Stale issues closed after 30 days

## Security

### Reporting Vulnerabilities

See [SECURITY.md](SECURITY.md).

**Never** open public issues for security vulnerabilities.

### Dependency Management

- Dependabot runs weekly
- Security patches merged within 72 hours
- `npm audit` runs in CI

## Code Quality

### Requirements

- TypeScript strict mode
- ESLint passes
- Prettier formatting
- 80%+ test coverage (target)
- No `any` types

### Review Checklist

- [ ] Code follows style guide
- [ ] Tests included
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Changelog updated

## Licensing

- All code is MIT licensed
- Third-party licenses documented
- No GPL dependencies allowed
- Contributors agree to MIT license by submitting PR

## Communication

### Channels

- **Issues** — Bug reports, feature requests
- **Discussions** — Questions, ideas, general
- **PRs** — Code contributions

### Response Times

| Type | Target |
|------|--------|
| Security issues | 48 hours |
| Bug reports | 7 days |
| Feature requests | 14 days |
| PRs | 7 days |

## Governance

### Maintainers

- Khamal (creator)
- Future: community maintainers after contributions

### Decision Making

- Minor changes: maintainer approval
- Major changes: discussion + maintainer approval
- Breaking changes: RFC process

## Roadmap

See [PRD.md](PRD.md) for current roadmap.

### Milestones

| Milestone | Target | Status |
|-----------|--------|--------|
| v0.1.0-alpha | Week 1-2 | 🔄 In Progress |
| v0.1.0-beta | Week 3 | ⏳ Pending |
| v0.1.0-rc | Week 4 | ⏳ Pending |
| v0.1.0 | Week 4 | ⏳ Pending |
| v1.0.0 | Month 3 | ⏳ Pending |
