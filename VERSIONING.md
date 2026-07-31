# Versioning Policy

Ideabank follows [Semantic Versioning 2.0.0](https://semver.org/).

## Version Format

```
MAJOR.MINOR.PATCH
```

Example: `1.2.3`

## When to Bump

### MAJOR (X.0.0)

Breaking changes that require user action:

- API endpoints removed or renamed
- Database schema changes requiring migration
- Configuration format changes
- Removal of features
- Minimum Node.js version increase

### MINOR (0.X.0)

New features, backward compatible:

- New API endpoints
- New optional configuration
- New database fields (nullable or with defaults)
- New features (AI expand, export, etc.)
- Performance improvements

### PATCH (0.0.X)

Bug fixes, backward compatible:

- Fix API response format
- Fix validation errors
- Fix database query issues
- Security patches
- Documentation updates

## Pre-release Versions

Format: `MAJOR.MINOR.PATCH-alpha.N` or `MAJOR.MINOR.PATCH-beta.N`

- `0.1.0-alpha.1` — First alpha release
- `0.1.0-alpha.2` — Second alpha
- `0.1.0-beta.1` — First beta
- `0.1.0-rc.1` — Release candidate

## Release Schedule

| Phase | Version | Duration |
|-------|---------|----------|
| Alpha | 0.1.0-alpha.x | 2 weeks |
| Beta | 0.1.0-beta.x | 1 week |
| RC | 0.1.0-rc.x | 1 week |
| Stable | 0.1.0 | — |
| V1 | 1.0.0 | After auth + collaboration |

## Changelog

All changes documented in [CHANGELOG.md](CHANGELOG.md).

Format follows [Keep a Changelog](https://keepachangelog.com/):

```markdown
## [1.2.3] - 2026-08-15

### Added
- New export feature for PNG format

### Changed
- Improved mindmap rendering performance

### Fixed
- Fixed connection deletion not updating UI

### Security
- Updated dependency with known vulnerability
```

## Git Tags

```bash
# Create tag
git tag -a v0.1.0 -m "Release v0.1.0"

# Push tags
git push origin main --tags
```

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag
4. Push to GitHub
5. GitHub Actions creates release
