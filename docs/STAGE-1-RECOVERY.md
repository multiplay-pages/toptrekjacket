# Stage 1 — Source recovery and repository bootstrap

Date: 2026-09-16

## Status

**PASS — Stage 1 completed.**

The repository now provides a controlled, buildable source baseline. It is intentionally **not connected to Vercel production yet** and its product facts remain non-authoritative until Stage 2.

## Objective

Create a normal, buildable source repository before any further product-data or UI repair work.

## In scope

- React + TypeScript + Vite source scaffold.
- Reproducible build checked by GitHub Actions.
- Git history starting from a clearly identified recovery baseline.
- Documentation of production identity and non-regression constraints.
- GitHub repository: `multiplay-pages/toptrekjacket`.

## Out of scope

- No production deployment.
- No Vercel project connection changes.
- No GitHub Pages publication.
- No ranking changes.
- No selector/scenario logic redesign.
- No product-data corrections; those belong to Stage 2.
- No design refresh.

## Verified production reference

- Production URL: https://trek-jacket-finder.vercel.app
- Vercel project: `trek-jacket-finder`
- Project ID: `prj_rMjJIycxQZmCSvPpupYs5PsbqFjm`
- Team ID: `team_7hPovBT2iV7GpndA5ssdCTZs`
- Production deployment after Stage 1 merge remains: `dpl_5K45KnvaPhBk95XHFD7DuaDfPrte` — READY / production.
- Runtime errors at the Stage 1 pre-check: none reported by Vercel.

## Source provenance

This scaffold was recovered from an earlier source archive. It is structurally useful but its product data predates the latest Notion DATA PACK and production corrections.

Therefore:

- code structure may be reused;
- product facts in `src/data.ts` are **not authoritative**;
- Stage 2 must replace/normalize those records from the current DATA PACK;
- production must not be replaced by this baseline.

## CI evidence

- PR #1: https://github.com/multiplay-pages/toptrekjacket/pull/1
- PR head that passed CI: `8555e490f3b544b42b5ec596be9e6647866a9d2f`
- Passing pull-request workflow: run `35061229911`.
- Squash merge to `main`: `4d6e5dae662a73ce66ebd5f0a34ee7958d1b2910`.
- Passing `main` build after merge: run `35061296642`.
- CI installs dependencies and runs `npm run build` on GitHub-hosted Ubuntu/Node 22.

## Hosting guardrails

- GitHub Pages has not been published for this repository; the expected public Pages URL returned HTTP 404 during the Stage 1 check.
- The repository contains no Pages deployment workflow.
- The existing Vercel production project has not been connected to this repository in Stage 1.

## Stage 1 acceptance criteria

- [x] historical deployment/bootstrap artifacts removed from the source baseline;
- [x] source tree contains only normal application/build inputs;
- [x] GitHub Actions dependency install succeeds;
- [x] GitHub Actions `npm run build` succeeds;
- [x] baseline recovery branch created;
- [x] remote GitHub repository exists: `multiplay-pages/toptrekjacket`;
- [x] baseline merged to `main`;
- [x] GitHub Pages is not configured/published as a site;
- [x] Vercel production remains unchanged.

## Next stage

**Stage 2 — authoritative data migration.** Move the current Notion DATA PACK 20/20 into typed source data and add a validator that rejects empty fields, raw `—`, unexplained missing data, and uncertainty presented as fact. Do not deploy Stage 2 to production until its own preview/staging QA gate passes.
