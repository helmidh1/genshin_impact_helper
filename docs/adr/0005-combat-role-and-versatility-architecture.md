# 0005: Combat Role and Multi-Role Versatility Architecture

To support role-based character classification and roster filtering while honoring multi-role equipment setups (e.g., Raiden as Hypercarry vs. Hyperbloom Support; Bennett as ATK Buffer vs. Emergency Healer), character roles are formally established as a distinct architectural layer from statistical scaling archetypes.

1. **Separation of Concerns & Field-Presence Classification**:
   - `CombatRole` (`"On-Field DPS" | "Off-Field DPS" | "Off-Field Support" | "On-Field Support" | "Off-Field Healer" | "On-Field Healer"`) models tactical team composition function and field presence. Legacy shorthands (`"DPS" | "Sub-DPS" | "Support" | "Healer"`) remain backward-compatible via `isRoleMatch`.
   - `ScalingArchetype` (`"crit-dps" | "hp-support" | "def-scaler" | "em-driver"`) remains strictly responsible for mathematical stat weights, roll tiering, and Crit Value benchmarks.

2. **Multi-Role Model (Eligible vs. Typical vs. Active)**:
   - `roles: CombatRole[]`: An intrinsic array of all viable tactical roles a character can perform across meta team archetypes.
   - `typicalRoles: CombatRole[]`: Canonical community theorycraft meta roles (e.g. from Game8/KQM) that represent a unit's standard purpose regardless of an individual's equipped gear (e.g., Valeriy as `["Off-Field Support"]`, Bennett as `["Off-Field Support", "Off-Field Healer"]`).
   - `activeRole: CombatRole`: The specific combat role a character currently fulfills, evaluated dynamically by `BuildEngine` based on equipped weapons, artifact sets, and main stat distributions.

3. **Active Role Heuristic Precedence**:
   For multi-role characters, `BuildEngine` resolves `activeRole` through a deterministic evaluation hierarchy:
   1. *Healer*: Eligible for healing + Healing Bonus main stat or dedicated healing sets (*Maiden Beloved*, *Ocean-Hued Clam*, *Song of Days Past*). Defaults to `Off-Field Healer` (or `On-Field Healer` for burst drivers like Kokomi/Noelle).
   2. *Support*: Eligible for support + utility sets (*Noblesse Oblige*, *Viridescent Venerer*, *Tenacity*, *Deepwood*, *Scroll of the Hero of Tona*, *A Day Carved from Rising Winds*, *Heart of the Furnace*) or utility weapons (*Favonius*, *Sacrificial*, *TTDS*, *Freedom-Sworn*, *Elegy*). Defaults to `Off-Field Support` (or `On-Field Support` for enablers/drivers).
   3. *Off-Field DPS*: Eligible for off-field damage + sets (*Golden Troupe*, *Emblem of Severed Fate*) or balanced off-field sub-stat profiles.
   4. *On-Field DPS*: Eligible for on-field carry + high CV, offensive goblet/circlet, or carry sets (*Marechaussee Hunter*, *Whimsy*, *Gladiator's*, etc.).
   5. *Fallback*: The character's primary canonical role (`roles[0]`).

4. **Two-Tier Equipment Architecture**:
   - **Tier 1 (Curated Meta Tables)**: Instant offline deterministic recommendations (`CURATED_EQUIPMENT_GUIDES` in `src/lib/equipment-data.ts`) curated from Game8 and KQM. Weapons and artifact sets are ranked by tier (*BiS Signature*, *Top Alternative 5★*, *Best 4★ / F2P*, *Situational*) with set-specific weapon synergies and main/substat targets.
   - **Tier 2 (Interactive AI Coach)**: On-demand AI consultations via Gemini 3.8 Flash (`@google/genai`) for bespoke inventory troubleshooting, team-specific stat tuning, and custom player queries.

5. **Filter Semantics & Typical Role Highlighting**:
   - Roster filtering in `ShowcaseTab` and `OverviewTab` uses `isRoleMatch(r, roleFilter)`, ensuring characters are cleanly discoverable whether filtering by granular on-field/off-field variants or broad roles.
   - `EquipmentRecommendationsPanel` provides a prominent **Recommended / Typical Meta Roles** banner highlighting standard builds with golden stars (`★ [Role] Typical`), clearly visually separated from the player's active equipped build `(Equipped)` and off-meta variants `(Off-Meta)`.

4. **Module Boundary (`character-roles.ts`)**:
   - Role catalogs and inference helpers are isolated in `src/lib/character-roles.ts`.
   - Pure domain functions (`getCharacterCombatRoles`, `inferActiveCombatRole`) maintain zero I/O, zero network dependencies, and zero React hooks, ensuring universality across Server Components, API routes, and client stores.

5. **Filter Semantics**:
   - Roster filtering in `ShowcaseTab` and `OverviewTab` matches character capability (`char.roles.includes(selectedRole)`), ensuring multi-role characters are discoverable under all roles they can legitimately play across both screens.
   - Character cards and detail headers surface the `activeRole` badge while indicating full eligible versatility.

6. **Role-Aware Equipment Recommendations**:
   - `BuildArchetype` in `src/types/genshin.ts` is tagged with `role: CombatRole`, tying each recommended weapon and artifact set loadout to a tactical role.
   - `EquipmentRecommendationsPanel` provides an interactive role switcher defaulted to the character's detected `activeRole`. Selecting a role filters available archetypes and updates recommended weapons, artifact sets, and the live comparison banner against that specific role's standards.
