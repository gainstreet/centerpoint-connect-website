# ROOFTOP: Owner Operator — 0.5.0

Released September 5, 2026. Only files under `rooftop-game/` were changed.

## Improvements this run

- Added a **Clean Sweep** side challenge on the commercial roof. Twelve visible debris pickups are distributed around the inspection route so normal roof movement now has a second gameplay purpose. Clearing all twelve awards a fictional $75 bonus and a `clean-sweep` badge.
- Added a **3:00 Weather Window** bonus clock. Finishing the report inside the active-play window awards a fictional $100 bonus and a `beat-the-rain` badge. The timer pauses while a modal or field camera is open. If it expires, the core inspection score is not penalized.
- Added a compact mobile bonus HUD with collectible progress, countdown state, progress bar, urgent/expired states, and subtle approaching-weather visual treatment.
- Added mobile vibration feedback for evidence logging, debris collection, bonus completion, and shift completion when the browser/device supports `navigator.vibrate`.
- Added bonus details to the final results sheet. Bonus payouts are guarded so repeated completion calls cannot duplicate cash.
- Preserved v0.4 Quick Play, Full Shift driving, roof photography, report scoring, garage paints, score cards, local progress, radar, touch controls, audio toggle, and battery-saver mode.

## Validation

A Chromium mobile-emulation harness executed the v0.5 feature layer with a mocked v0.4 game API at 393×852. It traversed all twelve debris positions using the same per-frame distance logic as the live build, completed the Clean Sweep challenge, completed within the weather window, and verified:

- cash: $2,500 → $2,675 from the two new bonuses
- report payout display value: $450 → $625 including both bonuses
- badges: `clean-sweep` and `beat-the-rain`
- 12 / 12 debris collection
- repeated `finished()` calls do not duplicate payment
- a separate 181-second run correctly expires the weather bonus and leaves the $450 core payout unchanged
- no JavaScript page errors were emitted in the harness

The published entry point commit is `f195f1397c284f9cc36c45d64573c00dfc5c285d`.

## Remaining device checks

The environment cannot load the public hosted preview or run the repository's complete GPU build over the network. Physical iPhone/Android testing, Safari/WebKit, real haptics, and sustained mobile GPU performance therefore remain outstanding. The new feature layer itself was syntax/runtime tested locally in Chromium against a mock of the v0.4 API.

This game is entertainment and a marketing prototype, not roofing or safety training. The weather bonus explicitly does not penalize players for taking longer to inspect.
