# Teyvat Strategist Domain Model

Teyvat Strategist is a combat diagnostics, build inspection, and tactical coaching helper for Genshin Impact.

## Language

**Build Engine**:
The core theorycraft evaluation domain module that computes artifact roll quality, set bonuses, and meta build alignment.
_Avoid_: Evaluator, rater, grading service, calculator

**Profile Store**:
The centralized client-side domain module responsible for local state persistence, schema migration, resin recovery reconciliation, and reactive UI subscriptions.
_Avoid_: Storage helper, cache manager, local storage wrapper, state manager

**Crit Value (CV)**:
A standardized theorycraft metric calculating an artifact or character's critical hit investment (`CRIT Rate × 2 + CRIT DMG`).
_Avoid_: Crit score, damage score, crit ratio

**Roll Tier**:
A grading classification assigned to an individual artifact based on substat roll quality and Crit Value.
_Avoid_: Artifact rank, piece score, gear quality

**Build Tier**:
A holistic evaluation tier assigned to a character build based on overall stat distribution, set bonuses, and total Crit Value.
_Avoid_: Character rating, showcase grade, tier list

**Artifact Slot**:
One of the five canonical equipment positions for relics: Flower, Plume, Sands, Goblet, or Circlet.
_Avoid_: Relic position, equip type, gear piece

**Scaling Archetype**:
The primary stat scaling and functional role of a character build (e.g. Crit DPS, HP Support, DEF Scaler, EM Driver) that determines how stats are prioritized during build evaluation.
_Avoid_: Build type, character class, role category
