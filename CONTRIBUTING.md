# Contributing

Thanks for helping improve Creative Fission Agent.

## Development workflow

1. Create a focused branch from the default branch.
2. Install dependencies with `npm ci`.
3. Copy `.env.example` to `.env.local`; never commit the resulting file.
4. Keep changes scoped and follow the existing Next.js and TypeScript patterns.
5. Run `npm run check` before opening a pull request.

## Pull requests

A pull request should include:

- the problem and intended behavior;
- implementation notes and trade-offs;
- screenshots for user-facing changes;
- verification steps;
- environment-variable or deployment changes;
- confirmation that no credentials or generated private documents are included.

## Coding conventions

- Use TypeScript for application code.
- Keep API secrets server-side.
- Return structured JSON errors from API routes.
- Prefer explicit schemas and typed data over ad hoc string parsing.
- Keep generated assets and internal delivery documents outside Git.

## Product behavior

Changes to creative genes, QA thresholds, model names, access modes, or cost
controls affect the product contract. Document these changes in the pull request
and update README or CHANGELOG when appropriate.
