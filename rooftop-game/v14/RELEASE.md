# ROOFTOP — v0.14.0

Released September 5, 2026.

## Changes

- Added a real service-rig art pass to the player truck: ladder rack, aluminum extension ladder, bed toolbox, equipment case, animated amber beacon and branded ROOFTOP SERVICE CO. door panels.
- Added MAYA / DISPATCH crew communications with a custom illustrated headset portrait, radio-wave treatment, short procedural radio squawk, subtle haptics and context-aware callouts as the player moves from yard → route → site → roof → findings → report → closeout.
- Radio messages are saved per shift so resumed games do not spam previously heard callouts.
- Battery Saver keeps the core rack/toolbox silhouette but hides the textured door panels and reduces beacon animation cost.
- Existing driving, inspection, Evidence Camera, Moisture Map, Clean Sweep, Dispatch Board, atmosphere, Quote Desk, Repair Run, Drone Survey, garage and progression systems remain layered in place.

## Verification

- `node --check` passes for `v14/features.js`.
- Pure-state tests pass for the crew-radio phase model across yard, en route, parking, check-in, roof access, 0/1/2/3 findings and completed-shift states.
- A mocked integration instantiates the service-rig geometry, verifies the two branded door panels plus beacon, and confirms the rig follows the truck transform.
- CSS structural parsing passes with balanced blocks and no parse errors under `tinycss2`.

## Limits

A fresh physical iPhone/Android, Safari/WebKit and GPU/WebGL visual regression is still outstanding. The service-rig geometry uses the same generated local 3D primitives as the rest of ROOFTOP and does not add external assets, analytics, registration or backend services.

Entertainment only; not roofing, drone, safety or diagnostic training.
