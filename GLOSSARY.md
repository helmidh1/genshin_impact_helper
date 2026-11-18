# Teyvat Strategist Domain Model

Teyvat Strategist is a combat diagnostics, build inspection, and tactical coaching helper for Genshin Impact.

## Language

**Build Engine**:
The core theorycraft evaluation domain module that computes artifact roll quality, set bonuses, and meta build alignment.
_Avoid_: Evaluator, rater, grading service, calculator

**Coach Engine**:
The pure domain theorycraft engine responsible for calculating party rotation sequences, Energy Recharge (ER) thresholds, buff timelines, and equipment advice.
_Avoid_: AI helper, bot, strategy generator, chat handler

**Directives Engine**:
The pure domain module responsible for daily progression arithmetic, resin regeneration formulas, countdown and ETA formatting, UTC+8 calendar day logic, and HoYoLAB check-in reward resolution.
_Avoid_: Timer helper, resin calculator, check-in service, daily manager

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
The primary stat scaling formula and stat weight profile of a character build (e.g. Crit DPS, HP Support, DEF Scaler, EM Driver) that determines how stats are prioritized during build evaluation.
_Avoid_: Build type, character class, gear classification

**Combat Role**:
The tactical battlefield function a character performs in a team composition, distinguished by field presence and mechanical duty: On-Field DPS (main carry/hypercarry), Off-Field DPS (sub-dps/deployable skill/burst damage), Off-Field Support (buffers, batteries, crowd control, resistance shred, shielders), On-Field Support (drivers, enablers), Off-Field Healer (deployable/burst sustain), or On-Field Healer (burst-attacking driver). Legacy broad roles (`DPS`, `Sub-DPS`, `Support`, `Healer`) remain supported via semantic role matching (`isRoleMatch`).
_Avoid_: Job, class, character type

**Typical Combat Role (Meta Role)**:
The canonical, recommended role(s) designated by community theorycraft standards (e.g. Game8, Kage/KQM) that represent a character's primary intended team function regardless of an individual player's current equipped loadout. Highlighted with golden star indicators (`★ Typical`) in equipment recommendations.
_Avoid_: Intended spec, standard job

**Eligible Combat Roles**:
The intrinsic set of tactical combat roles a character is capable of fulfilling across different viable team archetypes and playstyles.
_Avoid_: Role list, character specs

**Active Combat Role**:
The specific combat role a character currently fulfills based on their equipped weapon, artifact set bonuses, and main stat loadout, inferred dynamically via `inferActiveCombatRole` and labeled as `(Equipped)`.
_Avoid_: Current class, active spec

**Two-Tier Equipment Architecture**:
The architectural separation between instant offline deterministic curated meta recommendations (`CURATED_EQUIPMENT_GUIDES` sourced from Game8 and KQM) for baseline weapon/artifact targets, and the on-demand interactive AI Equipment Coach (`@google/genai` Gemini 3.8 Flash) for personalized player inventory diagnostics and build critiques.
_Avoid_: Hybrid guide, dual calculator
