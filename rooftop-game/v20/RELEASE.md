# ROOFTOP v0.20 — Cause + Origin Diagnostic

## Player-visible upgrade
- Unlocks a new **CALL THE SOURCE** field diagnostic after all three Westgate roof conditions are documented.
- Presents the player’s observed evidence side by side: obstructed drain, open membrane lap, and sound previous repair.
- Challenges the owner-operator to separate a visible roof condition from a proven leak source instead of guessing cause and origin.
- Correct decision banks a fictional **$125 diagnostic bonus**, awards **+2 reputation**, and unlocks the persistent **No Guesswork** badge.
- Incorrect decisions do not reduce the normal inspection payout; the game explains why the evidence does not prove the source.
- Adds a compact mobile HUD prompt, haptic/audio decision feedback, and a closeout result card.

## Compatibility / scope
- Preserves the existing inspection, camera QA, dispatch jobs, drone survey, Clean Sweep, navigation, roof-detail art, progression, saves, and result flow.
- Changes are isolated to `rooftop-game/`.

## Validation
- `node --check` passes for `v20/features.js`.
- CSS brace/selector structural check passes for `v20/upgrade.css`.
- Helper tests cover correct and incorrect cause-and-origin decisions and bonus values.
- Real-device iPhone/Android visual/touch testing remains outstanding.
