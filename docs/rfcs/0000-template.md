# RFC: [Title]

- **RFC ID:** RFC-0000
- **Status:** Draft
- **Author:** [Your Name]
- **Created:** YYYY-MM-DD
- **Updated:** YYYY-MM-DD

## Summary

One paragraph explanation of the proposal.

## Motivation

Why are we doing this? What problem does it solve?

- What is the use case?
- Who does this benefit?
- What happens if we don't do this?

## Detailed Design

The technical design of the proposal.

### API Changes

```
GET /api/new-endpoint
POST /api/new-endpoint
```

### Database Changes

```prisma
model NewModel {
  id String @id @default(uuid())
}
```

### UI Changes

Describe any user interface changes.

## Alternatives Considered

What other approaches did you consider?

### Alternative 1: [Name]

Pros:
- ...

Cons:
- ...

### Alternative 2: [Name]

Pros:
- ...

Cons:
- ...

## Migration Plan

How do we implement this without breaking existing functionality?

1. Step 1
2. Step 2
3. Step 3

## Testing

How do we test this?

- Unit tests
- Integration tests
- Manual testing steps

## Documentation

What documentation needs to be updated?

- [ ] README
- [ ] API docs
- [ ] CHANGELOG
- [ ] Migration guide (if breaking)

## Unresolved Questions

What questions remain?

- ...
