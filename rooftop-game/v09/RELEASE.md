# ROOFTOP — v0.9.0

Released September 5, 2026.

## Changes

Added an evidence-camera layer to make roof inspections feel more like field documentation rather than a generic screenshot mechanic. The camera now shows a rule-of-thirds frame, subject label, standoff guidance and contextual documentation prompt while photographing a roof condition.

Captured inspection photos are analyzed locally in the browser for contrast, visible detail, center detail and usable exposure. Each photo receives a 1–3 star Photo QA grade with framing/detail/light bars and a retake recommendation when evidence is weak. The Field Report carries the Photo QA grade beside each finding, and shift results show an Evidence Quality summary.

Three usable evidence photos award the persistent Documentation Pro badge, +1 reputation and one completed documentation set. The reward is protected against duplicate application and does not change the technical inspection score or fictional job payout.

Updated the title loop to “Inspect it. Document it. Map it. Quote it. Deliver it.” Existing driving, Quick Play, Clean Sweep/weather bonuses, garage customization, quote strategy, Repair Run, Moisture Map, scoring and persistence remain layered underneath.

Only `rooftop-game/` was changed.

## Verification

`v09/features.js` passed `node --check`. `v09/upgrade.css` passed balanced-brace parsing.

The deterministic Photo QA grader was tested with weak, usable and strong image metrics and returned 1, 2 and 3 stars respectively. A mocked integration test recorded all three inspection conditions, verified exactly one Documentation Pro reward (+1 reputation, one documentation set, one badge), then repeated a recording and confirmed no duplicate reputation/reward was applied.

GitHub was re-read after publishing to verify the v0.9 files exist and the live entry point references both `v09/upgrade.css` and `v09/features.js`.

## Limits

A fresh physical-device camera playthrough is still needed on iPhone/Android and Safari/WebKit. The local automated checks validate JavaScript syntax and reward logic but do not substitute for visual QA of real captured frames. Photo QA is an arcade documentation mechanic and is not a professional inspection standard or defect-detection model.
