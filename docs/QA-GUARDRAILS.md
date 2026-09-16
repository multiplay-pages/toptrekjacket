# QA and non-regression guardrails

These constraints must remain explicit during the recovery.

## Product behavior frozen until later stages

- Base ranking order stays 1–20.
- Scenario selector logic is not redesigned in Stage 1.
- Existing technical scoring is not recalculated.
- Default TOP 3 behavior is not intentionally changed.
- Verified product-photo identity must not be replaced by similar models.
- Local user preference behavior must not be redefined.

## Data quality rule for Stage 2+

A production record must never end with an unexplained blank field, raw `—`, or generic `brak danych` when a fuller explanation is available.

Where a numeric audit rating does not exist, UI should state that no numeric rating was assigned rather than inventing a score.

Where a manufacturer does not publish a parameter, UI should say that explicitly and retain the source/evidence status.

## Release rule

No source from this repository may replace production until:

1. authoritative 20/20 data migration is complete;
2. automated validation passes;
3. Vercel preview/staging is deployed;
4. browser QA passes for TOP20, comparison, TOP3, selector and photos;
5. production is then promoted and re-checked.
