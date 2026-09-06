# ROOFTOP — v0.8.0

Released September 5, 2026.

## Changes

Added an optional **Moisture Map** exploration layer to the playable Westgate roof. While walking the roof, players can open a mobile-first scanner HUD, follow directional and signal-strength feedback, locate three hidden anomalies, and lock readings only after physically moving into the target zone. Completed readings leave small in-world survey markers behind.

Completing all three readings awards a one-time fictional $125 field-survey bonus, +2 reputation, a persistent survey count, and the **Leak Detective** badge. The bonus is intentionally separate from the core inspection score so the side objective does not pressure the player to rush inspection decisions.

Scanner feedback includes signal-dependent pulse timing, optional sound pings when sound is enabled, haptic feedback where supported, directional guidance, a completion card, and a result-screen summary. Portrait, compact-phone, landscape, and reduced-motion styles were added.

Existing driving, Quick Play, inspection photography, Clean Sweep/weather challenges, garage customization, quoting, repair delivery, score sharing and progression remain in place. Only `rooftop-game/` was changed.

## Verification

- `v08/features.js` passes `node --check`.
- `v08/upgrade.css` parses with `tinycss2` with zero stylesheet errors.
- A deterministic Node integration harness instantiated the upgrade layer against the same public game API shape, activated the scanner, moved the player to all three target coordinates, locked all three readings, and verified: 3 unique findings, exactly +$125 cash, exactly +2 reputation, one survey completion, Leak Detective badge unlock, three generated world markers, and no duplicate reward when completion was invoked again.
- The harness also verified scanner/button DOM creation and profile/run save calls.

## Limits

The runtime environment blocks browser navigation to local/file pages, so a fresh full visual Chromium playthrough could not be completed in this run. Physical iPhone/Android, Safari/WebKit, GPU/WebGL performance, haptic behavior and audible scanner ping behavior remain device-verification items. Scanner readings are fictional arcade mechanics and are not a real moisture-detection or leak-diagnostic procedure.
