# ROOFTOP — v0.11.0

Released September 5, 2026.

## Changes

Added a new Dispatch Board that turns the existing Westgate systems into selectable, replayable service-call contracts instead of always launching the same Quick Play loop.

Three job types are available:

- Leak Investigation — the original service call, cleared with a 70+ inspection.
- Preventive Sweep — requires a 70+ inspection, all three findings and the full 12/12 Clean Sweep; successful completion pays a fictional $250 dispatch bonus.
- Documentation Audit — requires an 80+ inspection plus all three evidence photos rated at least 2 stars by the existing Photo QA system; successful completion pays a fictional $300 dispatch bonus.

Preventive Sweep unlocks after a 70 best score and Documentation Audit after an 80 best score. The Dispatch Board tracks jobs cleared, current streak and best streak. The active contract is shown in a dedicated in-game HUD chip. Result screens show every contract criterion as passed or missed. Missing a dispatch challenge never reduces the normal inspection score or core inspection payout.

The Quick Play button now opens the Dispatch Board. Full Shift remains available and continues to launch the original drive-to-site service call. Existing driving, garage, Clean Sweep, weather window, Quote Desk, repair run, Moisture Map, Photo QA, traffic, ambience and other v0.4-v0.10 systems remain intact.

Only `rooftop-game/` was changed.

## Verification

- `v11/features.js` passes `node --check`.
- `v11/upgrade.css` passed balanced-brace structural validation.
- Deterministic Dispatch evaluator tests passed success and failure cases for all three jobs, including 11/12 debris failure, sub-2-star photo failure and sub-80 audit-score failure.
- A mocked integration test verified a Preventive Sweep adds exactly $250 once, increases run pay from $450 to $700, increments jobs/streak once, and cannot duplicate the payout on a repeated `finished()` call.
- Result-card timing was hardened so the UI cannot show a failed Dispatch card before the completion result has been applied.

## Limits

This run did not complete a fresh physical iPhone/Android, Safari/WebKit or GPU/WebGL playthrough. The new layer reuses already-tested field systems and was verified with deterministic JavaScript/integration tests. Device-level visual and touch regression testing remains recommended before a public marketing launch.

All game currency and rewards are fictional. ROOFTOP is entertainment, not roofing, safety, estimating or diagnostic training.
