# ROOFTOP — v0.6.0

Released September 5, 2026. Entry commit: `34bd91b16951e921b3622cd28273111eac22743b`.

## Changes

Added a post-inspection **Quote Desk** so a strong field report can turn into follow-up work. Scores of 70+ unlock a fictional client opportunity with three pricing strategies: Competitive Bid, Balanced Bid, and Premium Service. Each strategy has a different fictional price, margin posture, and client-fit probability influenced by inspection quality and reputation.

Contract decisions use a deterministic per-run roll so re-opening the result cannot reroll the client. Accepted proposals add a fictional 10% mobilization deposit, reputation, contract count, contract value, and first-bid / first-contract badges. Rejected proposals never remove the inspection payout and cannot duplicate charges or awards.

Added persistent career stats to the title screen and in-game HUD: contracts won, reputation, and best inspection score. Shift results now surface the follow-up opportunity and remember its outcome. Updated title copy to make the owner-operator loop clearer: inspect the roof, make the call, then try to win the work.

No registration, analytics, backend, or main-site changes were added. All work remains under `rooftop-game/`.

## Verification

- `v06/features.js` passed `node --check`.
- `v06/upgrade.css` parsed with `tinycss2`: 32 rules, 0 parse errors.
- A mocked functional test created all three quote strategies and resolved a deterministic Balanced Bid at $1,800. The accepted result added exactly one $175 deposit, +2 reputation, one contract, one bid, and both first-bid / first-contract badges.
- Re-clicking the same strategy did not add a second payment or second bid.
- A separate deterministic Premium Service rejection at $2,400 left company cash unchanged, added one bid, zero contracts, and applied the intended -1 reputation response.

Published file hashes verified from GitHub:

- `index.html`: `047d1aa28d3e0668585f61457bf46bcc410f2492`
- `v06/features.js`: `61c576069f434116141508a4fbeb1c807a07534d`
- `v06/upgrade.css`: `390365f7938ca99914cdd9fc5b2dab88557d7f8c`

## Limits

The available Chromium runtime is organization-blocked from local HTTP and `file://` game pages, so this run could not perform a fresh end-to-end visual/touch playthrough of v0.6. The new layer was syntax-, CSS-, and logic-tested, while prior v0.5 gameplay remains preserved underneath it. Physical iPhone/Android, Safari/WebKit, GPU rendering, and persistent browser reload still require device testing.

All pricing, probabilities, deposits, earnings, and reputation values are fictional game mechanics, not estimating or business advice.
