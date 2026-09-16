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
- [ ] `npm run validate:data` passes in GitHub Actions.
- [ ] `npm run build` passes in GitHub Actions.
- [ ] PR merged to `main`.
- [ ] Vercel production remains unchanged.

Stage 2 is PASS only after the CI checks above pass and the PR is merged.
