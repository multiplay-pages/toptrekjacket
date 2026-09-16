# Stage 1 — Source recovery and repository bootstrap

Date: 2026-09-16

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
- No GitHub Pages.
- No ranking changes.
- No selector/scenario logic redesign.
- No product-data corrections; those belong to Stage 2.
- No design refresh.

## Verified production reference before Stage 1

- Production URL: https://trek-jacket-finder.vercel.app
- Vercel project: `trek-jacket-finder`
- Project ID: `prj_rMjJIycxQZmCSvPpupYs5PsbqFjm`
- Team ID: `team_7hPovBT2iV7GpndA5ssdCTZs`
- Production deployment: `dpl_5K45KnvaPhBk95XHFD7DuaDfPrte`
- Runtime errors at Stage 1 check: none reported by Vercel.

## Source provenance

This scaffold was recovered from an earlier source archive. It is structurally useful but its product data predates the latest Notion DATA PACK and production corrections.

Therefore:

- code structure may be reused;
- product facts in `src/data.ts` are **not authoritative**;
- Stage 2 must replace/normalize those records from the current DATA PACK;
- production must not be replaced by this baseline.

## Stage 1 acceptance criteria

- [x] historical deployment/bootstrap artifacts removed from the source baseline;
- [x] source tree contains only normal application/build inputs;
- [ ] GitHub Actions dependency install succeeds;
- [ ] GitHub Actions `npm run build` succeeds;
- [x] baseline recovery branch created;
- [x] remote GitHub repository exists: `multiplay-pages/toptrekjacket`;
- [ ] baseline merged to `main`;
- [ ] GitHub Pages remains disabled;
- [ ] Vercel production remains unchanged.

Stage 1 is PASS only when all criteria above are complete.
