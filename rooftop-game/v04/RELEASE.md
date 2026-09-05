# ROOFTOP — v0.4.0

Released September 5, 2026. Entry commit: e14635dbf82c42d9dbbbc766a6af51d2cf0b5b2c.

## Changes

Quick Play now starts directly beside the first roof detail; Full Shift retains the truck-to-site loop. Added guided next-detail markers, evidence feedback, rank labels, a score-gated garage with three purchasable finishes, actual truck recolouring, a pigeon reaction, and a 1080 x 1350 PNG score card using real in-game inspection photography. All currency is fictional.

Removed hidden building-top faces beneath roof slabs; improved nearly coplanar roof/decal sorting in the Canvas renderer. Reduced background rendering while menus are open. Added bounded photo-save waits, repeat-action protection and obstructed-photo checks.

No registration, analytics or backend was added. Only rooftop-game/ was changed. The hourly automation was not modified or verified by this run.

## Verification

A complete Chromium touch-emulation Quick Play run used actual pointer/touch inputs, not player teleportation: all three details, real rendered photos, recommendations, report submission, score 100/100, $450 payment and +6 reputation. No page JavaScript errors in that completed run.

A separate garage/results UI regression used the recorded completion/photo fixture with an in-memory storage mock. It verified a $600 Orange purchase, actual renderer paint change, no repeated charge when re-equipping, no duplicated payment when returning to results, successful 1080 x 1350 PNG download, and replay retaining company state within the session. This fixture test is not proof of persistent browser storage.

Additional observed touch checks: manual acceleration, held braking, auto-drive arrival, truck exit, roof-boundary blocking and pointer cancellation. Small-screen control-fit checks passed at 320 x 568 and 667 x 375. Gameplay/screenshots also exercised 393 x 852 and 852 x 393.

Long combined test commands hit runner timeouts after reporting completed checks. The final mission and results UI tests were rerun separately and finished successfully; unexecuted tail checks are not counted.

## Limits

Tests used in-memory HTML and the Canvas compatibility renderer because navigation, WebGL and real storage were unavailable. Physical iPhone/Android, Safari/WebKit, GPU rendering, sustained device frame rates, native phone sharing and persistent reload remain unverified. Some painter-order artifacts may remain. This is one mission with two entry routes, not a multi-mission campaign.

The hosted preview could not be independently opened from the test environment. Published GitHub asset hashes exactly match the tested local source:

- index.html: ec7fd2b35e40435d328e3231e3f7292cce60ff0a
- v04/game.js: 894615fda422037618d209db9bb800d7bbbdcb7c
- v04/features.js: 3791470878c89618e27f5d0c6b1b9d629b433a08
- v04/engine.js: 279da4be79115014548b210c1e921421dacf079a
- v04/upgrade.css: 5dd8ebef5b5bb4d9f2800f2fba53c3dda6419d63

Entertainment only; not roofing, safety or diagnostic training. Seek professional scenario review before a public marketing launch.
