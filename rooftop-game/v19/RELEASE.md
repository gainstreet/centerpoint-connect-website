# ROOFTOP 0.19 — Commercial Roof Authenticity Pass

## User-visible upgrades
- Added a denser, more believable commercial-roof environment: service walk pads, a hatch landing, warning corners, skylight curbs, plumbing vents, yellow gas piping and supports, a small roof-maintenance staging area, and clearer perimeter coping.
- Added a cinematic roof-arrival card that identifies Westgate Plaza, the fictional roof system, age, and approximate roof area when the player reaches the roof or starts Quick Play.
- Added a compact roof-system HUD chip while the player is actively on the roof.
- New roof props are render-only and intentionally avoid changing the existing collision map, missions, scoring, inspection targets, or saved-game data.
- The entire upgrade is isolated to `rooftop-game/v19/` plus the rooftop game entry point.

## Test notes
- `node --check` passes for `v19/features.js`.
- CSS brace-balance and basic structural checks pass for `v19/upgrade.css`.
- Static integration checks verify the layer chains the existing `createRoofUpgrades` hook, preserves base hooks, exports QA helpers, and keeps all new geometry attached to the rooftop-game world.
- Real-device iPhone/Android Safari/Chrome visual regression remains recommended.
