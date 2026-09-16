# Stage 2 — Authoritative product data

Date: 2026-09-16

## Objective

Replace the Stage 1 legacy data scaffold with a typed, implementation-ready 20/20 dataset derived from the Notion DATA PACK dated 15.09.2026, without changing ranking or scenario-selector logic and without deploying to Vercel.

## Source of truth

- Notion DATA PACK: `3dcdaa43-f568-81fe-b155-d4fc27c4a27a`
- Dataset in code: `src/data/jackets-01-05.json` … `src/data/jackets-16-20.json` (20 records total)
- Type bridge and selector logic: `src/data.ts`
- Automated gate: `scripts/validate-data.mjs`

## Evidence model

Every product carries explicit evidence status:

- `confirmed`
- `secondary-confirmed`
- `disputed`
- `manufacturer-unpublished`
- `not-applicable`

A missing manufacturer value is never represented by an empty field, a bare dash or an invented number.

## Guardrails

The validator fails when:

- the dataset is not exactly 20 records with ranks 1–20 exactly once;
- a required descriptive field is empty or contains an unexplained placeholder;
- strengths, weaknesses or sources are missing;
- uncertainty wording conflicts with its evidence status;
- a source URL is malformed;
- Peak Performance Alpha gsm is presented as certain instead of disputed 68/85;
- Mammut or Klättermusen insulation gsm is invented;
- Goldwin is not the UNISEX `GM25306` or is confused with `GMW25306`;
- Milo Nafo is given a classical puffy insulation gsm;
- Helly Hansen LIFALOFT gsm is invented;
- numeric audit scores are added to ranks 11–20.

## Non-regression

Stage 2 intentionally does **not** change:

- ranking order;
- existing numeric audit scores for ranks 1–10;
- selector/scenario logic;
- Vercel configuration or production deployment;
- image delivery architecture.

## Acceptance criteria

- [x] 20/20 product records migrated from the authoritative DATA PACK.
- [x] Required descriptive fields are explicit and non-empty.
- [x] Evidence uncertainty is represented structurally.
- [x] Critical six-model guardrails are encoded.
- [x] No numeric scores invented for #11–20.
- [x] `npm run validate:data` passes in GitHub Actions — PR #2 runs `35063846429` and `35063961191`.
- [x] `npm run build` passes in GitHub Actions — PR #2 runs `35063846429` and `35063961191`.
- [x] PR #2 merged to `main` — merge commit `4ee1ea698f9146c17f0db3ca5b0d7776ab220503`.
- [x] Vercel production remains unchanged — `dpl_5K45KnvaPhBk95XHFD7DuaDfPrte` is still the production deployment.

## Status

**PASS — Stage 2 complete.** The authoritative 20/20 DATA PACK is now represented in repository data with automated validation. Production has not been redeployed; UI integration and preview QA belong to Stage 3.
