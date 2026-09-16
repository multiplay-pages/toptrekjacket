# Trek Jacket Finder

Controlled source repository for the Trek Jacket Finder application.

GitHub source of truth: https://github.com/multiplay-pages/toptrekjacket

## Stage 1 status

**RECOVERY SCAFFOLD — NOT PRODUCTION SOURCE YET.**

The current public production remains unchanged at:
- https://trek-jacket-finder.vercel.app
- production deployment verified before Stage 1: `dpl_5K45KnvaPhBk95XHFD7DuaDfPrte`

This repository is being established so future changes are made in normal source code, reviewed, tested and deployed through preview environments instead of patching built deployment artifacts.

## Important data rule

The data currently present in `src/data.ts` is a legacy scaffold and **must not be treated as authoritative**. The authoritative product evidence is the current Notion DATA PACK and will be migrated in Stage 2 with validation rules.

Do not change ranking order, scenario logic, technical scores, TOP 3 behavior, verified product photos, or user preferences during Stage 1.

## Local development

```bash
npm install
npm run build
npm run dev
```

## Planned workflow

1. Stage 1 — establish controlled Git source and buildable scaffold.
2. Stage 2 — migrate authoritative 20/20 DATA PACK into typed source data with validators.
3. Stage 3 — repair one UI surface at a time: TOP20 → comparison → TOP3/selector.
4. Stage 4 — add automated regression tests.
5. Stage 5 — connect GitHub to Vercel preview/staging and run browser QA.
6. Stage 6 — only after PASS, promote to the existing production project.

See `docs/STAGE-1-RECOVERY.md` and `docs/QA-GUARDRAILS.md`.
