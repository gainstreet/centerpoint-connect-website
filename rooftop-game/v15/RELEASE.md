# ROOFTOP 0.15.0 — Field Awareness Pass

## User-visible upgrades

- Added a live rooftop compass HUD that rotates with the operator and shows the nearest unlogged core inspection detail plus distance.
- Added condition pips for Drain / Seam / Patch so the roof is easier to navigate on a phone without turning the game into waypoint-following.
- Added Edge Watch: the HUD changes from clear → caution → danger as the operator approaches the playable roof perimeter, with a short haptic/audio warning on supported devices.
- Added a subtle four-sided yellow roof perimeter guide rendered into the 3D scene. This is game feedback only, not safety instruction.
- Added an owner-operator character art pass: tool belt, hip tablet, chest radio, knee pads and heavier work-boot silhouette now follow the player model.
- Battery Saver keeps the functional awareness HUD while minimizing animation.

## Preservation / scope

- Additive v15 layer only. Existing driving, dispatch, evidence camera, Moisture Map, Clean Sweep, Quote Desk, Repair Run, Drone Survey, Crew Comms, progression, garage and payouts are preserved.
- Main Centerpoint site files are untouched; only `rooftop-game/` is changed.

## Validation

- `node --check` passed for `v15/features.js`.
- Deterministic helper tests cover heading normalization, target bearing, relative compass delta and edge-state thresholds.
- Mock integration confirms the v15 layer chains the previous upgrade hooks and can instantiate the operator kit and roof perimeter without replacing the underlying player or truck.
- Physical iPhone/Android and Safari/WebGL visual regression remains recommended.
