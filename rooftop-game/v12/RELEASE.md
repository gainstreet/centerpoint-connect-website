# ROOFTOP — v0.12.0

Published September 6, 2026. Entry commit: `2df9c2de454b376b58d48978a319f78fe3064ac9`.

## Changelog

- Added contract-specific visual atmosphere so Dispatch jobs no longer feel like the same roof under identical conditions.
- Leak Investigation now plays in a cool post-storm setting with moving cloud cover, subtle field-camera droplets and five generated wet-roof sheen/puddle decals.
- Preventive Sweep now uses a warm early-morning look with low sun and light haze.
- Documentation Audit now uses a crisp clear-midday look for stronger evidence visibility.
- Added a compact live weather/roof-condition HUD chip and weather briefing text to each Dispatch Board job card.
- Battery Saver and reduced-motion modes suppress the new ambient animation work.

No main Centerpoint website files were changed; all changes are isolated under `rooftop-game/`.

## Verification

- `v12/features.js` passed `node --check`.
- Atmosphere helper tests passed for Leak Investigation, Preventive Sweep, Documentation Audit and unknown-job fallback.
- `v12/upgrade.css` passed structural brace validation.
- The live `rooftop-game/index.html` was updated to load `v12/upgrade.css` and `v12/features.js` and display `0.12.0`.
- Existing feature layers v0.4 through v0.11 remain loaded in their original order before v0.12.

## Limits

A fresh physical iPhone/Android, Safari/WebKit and GPU/WebGL visual regression pass was not available in this runtime. The public RawGitHack preview could not be independently opened from the test environment; GitHub source publication was verified instead.
