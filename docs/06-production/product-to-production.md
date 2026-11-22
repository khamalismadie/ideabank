# Product to Production Pipeline

End-to-end flow of a change in Ideabank: from product idea to production release.

## Overview

Ideabank ships through gated stages. Each stage must pass its exit criteria before the next stage begins.

## Pipeline Stages

```mermaid
flowchart LR
    D[Discovery] --> P[PRD]
    P --> SP[Sprint Planning]
    SP --> DEV[Development]
    DEV --> QA[QA / Verification]
    QA --> ST[Staging]
    ST --> REL[Production Release]
```

## Stages & Exit Criteria

| Stage           | Key Activities                                                      | Exit Criteria                          |
| --------------- | ------------------------------------------------------------------- | -------------------------------------- |
| Discovery       | Capture idea (GitHub issue / Discussions); refine problem statement | Problem agreed                         |
| PRD             | Write requirements; finalize scope                                  | PRD signed off                         |
| Sprint Planning | Groom backlog; set sprint goal                                      | Sprint backlog committed               |
| Development     | TDD; Conventional Commits; feature branch                           | PR with green tests / lint / typecheck |
| QA              | Unit + integration tests; manual smoke test                         | QA gate passed                         |
| Staging         | Deploy to staging (Docker / Vercel preview); smoke test             | Staging green                          |
| Production      | Merge to `main`; deploy; monitor                                    | Release verified                       |

## Release Checklist

- [ ] Conventional commit with scope (`feat`, `fix`, `docs`, `chore`, etc.)
- [ ] PR template completed (type, related issue, testing)
- [ ] Tests, lint, typecheck pass
- [ ] Docs updated if needed
- [ ] Changelog updated (if applicable)
- [ ] Staging verified
- [ ] Production deploy with rollback plan

## Related Docs

- [Deployment Guide](deployment.md)
- [Architecture](../02-architecture/system-architecture.md)
- [Troubleshooting](../troubleshooting.md)
- [PRD](../01-product/product-requirements.md)
- [Contributing](../CONTRIBUTING.md)
