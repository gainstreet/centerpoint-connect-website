# ROOFTOP — v0.10.0

Released September 5, 2026. Entry commit: `1e62a6080807ef76009bfc99d270ce3868bc29da`.

## Changes

This pass focuses on presentation, atmosphere and the feeling that Westgate is an actual playable district rather than a static prototype.

- Added four animated traffic vehicles that continuously circulate on the district roads.
- Added three animated rooftop HVAC fan assemblies to make the commercial roof feel active.
- Added subtle property-manager idle motion.
- Added cinematic mission slates for Full Shift, Quick Play, roof-access transitions and evidence logging.
- Added a compact live location/status chip that changes between the service yard, en-route driving, job site and active roof inspection.
- Added optional procedural ambience when sound is enabled: district hum on the ground, subdued drive ambience and wind/HVAC layers on the roof. Audio remains opt-in through the existing sound control.
- Battery Saver now automatically reduces the new living-world animation load to two traffic vehicles and one HVAC fan.
- Existing inspection, evidence camera, Moisture Map, Clean Sweep, weather bonus, quote desk, repair delivery, garage, progression and touch controls are preserved.

Only `rooftop-game/` was changed.

## Verification

- `v10/features.js` passed `node --check`.
- `v10/upgrade.css` passed structural brace validation (37 opening / 37 closing blocks).
- Pure helper tests passed for road-loop wrapping and contextual ambience selection.
- A mocked upgrade-lifecycle smoke test instantiated the v0.10 wrapper, called `onStart`, `hud` and `frame`, and verified creation of exactly four traffic nodes plus three HVAC fan nodes. The smoke test caught and fixed a mutable-state bug in `syncAudio` before publication.
- The published GitHub source was fetched back after publication and matches the corrected v0.10 feature layer.

## Limits

A fresh physical iPhone/Android, Safari/WebKit, WebGL/GPU and audible device-ambience pass was not available in this runtime. The hosted raw.githack HTML preview could not be independently opened by the web runner due its navigation safety restriction, although the repository entry point and new assets were published and verified through GitHub.

Entertainment only. The game is not roofing, safety or diagnostic training.
