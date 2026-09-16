# Stage 1 — execution notes

Date: 2026-09-16

## Resolved: remote GitHub repository

The repository now exists at:

- https://github.com/multiplay-pages/toptrekjacket
- default branch: `main`

The repository was created manually by the owner after browser automation could not authenticate. The connected GitHub integration has push/admin access to the existing repository, so subsequent source, branch and PR operations can be performed through the connector.

## Local dependency installation limitation

The current execution container could not resolve `registry.npmjs.org` (`EAI_AGAIN`), so local dependency installation was not used as the Stage 1 acceptance check.

Instead, this baseline includes `.github/workflows/ci.yml`. GitHub Actions is the authoritative build check for Stage 1:

```bash
npm install
npm run build
```

This avoids weakening the acceptance criteria while keeping production untouched.

## Hosting guardrail

GitHub Pages is not part of Stage 1 and must remain disabled. The existing Vercel production project is not connected to this repository during Stage 1.
