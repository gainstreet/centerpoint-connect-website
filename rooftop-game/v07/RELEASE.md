# ROOFTOP — v0.7.0

Released September 5, 2026.

## Changes

Awarded v0.6 follow-up quotes can now be delivered as a playable Repair Run instead of ending at the sales screen. The repair loop uses the inspection findings to build a field-verified work order, then presents touch-first arcade tasks for drain clearing, seam rolling and final QA moisture scanning. Successful delivery pays the remaining fictional contract balance, adds reputation and tracks contracts delivered separately from contracts won.

The repair run adds mobile haptics, workmanship feedback, a clean-closeout bonus, persistent duplicate-payment protection, a resume-contract entry on the title screen, delivered-contract career stats, and completed repair visuals on the existing Westgate roof. All existing inspection, Quick Play, Full Shift, weather/clean-sweep, quote desk and garage features remain intact.

Only `rooftop-game/` was changed.

## Verification

The v0.7 feature script passed Node syntax validation and the stylesheet has balanced rules. A headless Chromium 144 integration harness at a 393 x 852 mobile viewport exercised the real DOM/pointer handlers for the new flow: accepted-contract CTA, mobilization, all nine drain-debris taps, three pointer-drag seam passes, three timed QA target locks, final payment, reputation gain, delivered-contract tracking and the closed-contract results card.

QA result: contract $1,800, deposit $175, remaining balance $1,625, clean-closeout bonus $100, final test cash $4,725 from a $3,000 starting balance, reputation 70 -> 74, one delivered contract, badges `first-delivery` and `clean-closeout`. Re-entering the completed repair flow did not duplicate the payment.

The test harness used Chromium's software/headless environment and mocked the underlying v0.6 game API so the new module could be exercised deterministically. A fresh physical-device end-to-end run of the full v0.7 game, WebGL/GPU path, Safari/WebKit and persistent reload behavior remain outstanding.

## Published entry point

Commit: `5e5ee0792cc3a988d55c1273f15ab417dfa99c5e`

Entertainment only. The repair mini-games intentionally simplify roofing work and are not installation, diagnostic or safety training.
