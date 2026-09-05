# ROOFTOP: Owner Operator — 0.3.0

Released September 5, 2026. Playable mobile-first alpha. Only rooftop-game/ was changed; the main website is untouched.

## Changes

Original generated commercial district, storefronts, palm trees, road markings, detailed commercial roof and equipment. New articulated owner character and work pickup with ladder rack and rotating wheels. Mobile title screen, radar, objective HUD, contextual action button, independent touch joystick/camera/brake controls, portrait and landscape layouts.

Complete single-mission loop: enter truck, drive manually or with optional route assistance, park, meet property manager, access roof, inspect three details, capture actual rendered photographs, choose recommendations and submit a report. Includes fictional payment/reputation, personal best, replay, score-sharing interface, local progress/photo storage, pause, audio toggle, battery saver and unstuck action. No signup, analytics or external runtime assets.

WebGL renderer with Canvas software fallback. Source and generated visual/audio assets are original to this prototype; no copied GTA artwork or unapproved Centerpoint logo.

## Verification

Published entry point: aca1326237b1152157b3cd311a62bc0319043164. Asset Git blob hashes match the tested local files:

- engine.js: c397b7cafc52928a1b6d3674cb0d3636ccc95469
- world.js: 1d327b1118ae65d60e757bd818cb0a85e67b058d
- style.css: 1bafbe2899c00cc83507c516b0988b95b85b7398
- game.js: c428fbb991fddf9e4fafe246c055a1785ba08599

Chromium touch-emulation completed a full mission using actual pointer/touch controls, not player teleportation. Tested manual driving, route assistance, parking, customer conversation, roof access, all three photographed findings, recommendations and report submission. Result: 100/100, $450, +6 reputation. Repeated completion input did not duplicate payment. No JavaScript page errors. Viewports: 393x852 and 852x393; additional start/action-button fit checks at 320x568 and 667x375.

## Outstanding checks and limits

The test environment blocks navigation and cannot create WebGL. Tests used in-memory HTML and the Canvas compatibility renderer. Physical iPhone/Android, Safari/WebKit, GPU rendering and sustained device performance remain untested. The public preview could not be independently fetched after publishing; GitHub content was verified.

Successful persistent save/reload, native sharing and audible audio were not verified. Storage was denied in this environment, exercising session-only fallback. Software rendering can show painter-order artifacts. Protected roof boundaries are implemented but an intentional edge-collision test was not included. This is a single-mission alpha, not campaign-ready or cross-device certified.

All scenarios and currency are fictional entertainment, not safety training or professional diagnostic advice. Obtain roofing-professional review before a marketing launch. This release does not configure or verify an hourly automation.
