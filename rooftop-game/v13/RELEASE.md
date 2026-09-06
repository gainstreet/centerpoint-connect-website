# ROOFTOP — v0.13.0

Released September 5, 2026.

## Upgrade: Drone Survey

Added a new optional mobile-first aerial survey mini-mission on the Westgate roof. Players launch a drone, drag on a top-down flight deck to steer through four coverage checkpoints, then return to the launch pad before a 45-second battery expires.

Successful survey completion awards a one-time fictional $90 field bonus, +1 reputation, increments persistent drone-survey history, and unlocks the `Eyes in the Sky` badge. The reward is duplicate-protected per run and does not affect or penalize the core inspection score.

The drone console includes a stylized roof plan, HVAC obstacles, drain/seam landmarks, checkpoint rings, rotor animation, battery and coverage HUD, touch pointer controls, optional procedural drone hum, haptics, retry flow, a roof HUD launcher, and a completion card in final shift results.

## Verification

- JavaScript syntax check passed with Node.
- CSS brace/structure validation passed.
- Pure helper tests passed for checkpoint radius, distance calculation, battery drain/clamping, and the four-checkpoint configuration.
- Manual source review confirmed all changes are isolated under `rooftop-game/`.

A physical iPhone/Android Safari/Chrome/WebGL flight test is still outstanding. The new mini-game uses Canvas 2D inside the existing modal layer, so it does not depend on the 3D renderer to function.

Entertainment only; not drone-operation, roofing, safety or diagnostic training.
