# Governance

This document describes how the Ideabank project is governed.

## Principles

1. **Transparency** — All decisions are made in public
2. **Consensus** — We seek agreement before proceeding
3. **Meritocracy** — Contributions earn influence
4. **Inclusivity** — Everyone is welcome

## Decision Making

### Routine Decisions

- Bug fixes, minor features, documentation updates
- Can be merged by any maintainer after review
- Requires: 1 approval, CI passing

### Significant Decisions

- New features, API changes, major refactors
- Requires: Discussion period (7 days), 2 approvals
- May require RFC (see below)

### Breaking Changes

- API removals, schema migrations, config format changes
- Requires: RFC process, 2 approvals, migration guide
- Minimum 14-day comment period

## RFC Process

For significant changes, create an RFC:

1. Copy `docs/rfcs/0000-template.md`
2. Number sequentially
3. Open PR with `rfc` label
4. 14-day comment period
5. Final comment period (7 days) with `final-comment-period` label
6. Merge or reject

See [docs/rfcs/](docs/rfcs/) for templates.

## Maintainers

See [MAINTAINERS.md](MAINTAINERS.md) for current maintainers.

## Changes to Governance

Changes to this document require:

- 2 maintainer approvals
- 14-day comment period
- No objections from active maintainers

---

*This governance model is inspired by the Node.js Technical Steering Committee.*
