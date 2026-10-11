# Security Policy

## Supported version

Security fixes are applied to the latest version on the default branch.

## Reporting a vulnerability

Do not disclose security vulnerabilities in a public Issue.

Use GitHub's private vulnerability reporting feature, or contact the repository
owner privately through their GitHub profile. Include:

- affected route or component;
- reproduction steps;
- expected and actual behavior;
- impact assessment;
- suggested mitigation, if available.

## Secret handling

- Never commit `.env`, `.env.local`, API keys, access tokens, or admin passwords.
- Never prefix server secrets with `NEXT_PUBLIC_`.
- Use Vercel Environment Variables for production secrets.
- Rotate a credential immediately if it appears in a commit, log, screenshot,
  Issue, or pull request.
- BYOK credentials are transmitted only for the active request and must not be
  persisted or logged by application code.

## Deployment checklist

Before every public deployment:

1. run `npm run check`;
2. inspect `git status` and `git diff --cached`;
3. scan staged content for secrets;
4. verify `SITE_RUN_MODE` and function duration settings;
5. test one complete fission flow in the target environment.
