# 0004: Directives Engine Domain Boundary and Progression Seam

Daily progression arithmetic, monotonic resin recovery formulas, countdown ETA formatting, UTC+8 calendar date calculations, and HoYoLAB daily check-in reward resolution are consolidated into a dedicated pure domain module: `src/lib/directives-engine.ts`.

1. **Pure Domain Isolation**:
   All mathematical calculations governing player daily directives—including monotonic 8-minute resin replenishment cycles, recovery second projections, percentage caps, parametric transformer cooldowns, UTC+8 date transitions, and check-in reward indexing—reside in `src/lib/directives-engine.ts`. This module contains zero I/O, zero network calls, zero crypto hashing, zero React hooks, and zero `localStorage` access.

2. **Decoupling Presentation from Time Formulas**:
   UI components such as `OverviewTab.tsx` must never perform inline mathematical calculations for resin replenishment (e.g. `(maxResin - resin) * 8`). Instead, presentation components consume pure selector functions (`calculateResinEta`, `formatParametricCooldown`) exported by `DirectivesEngine`.

3. **Transport Adapter Seam**:
   Upstream data adapters (`src/lib/hoyolab.ts` and `src/lib/hoyolab-checkin.ts`) remain strictly focused on HTTP network calls, authentication headers, and payload normalization. They delegate date calculation, retcode classification, and reward mapping directly to `DirectivesEngine`.

4. **State Store Delegation**:
   `ProfileStore` (`src/lib/profile-store.ts`) delegates resin elapsed-time reconciliation directly to `DirectivesEngine.reconcileResin()`, ensuring that progression logic is decoupled from client storage persistence mechanisms.
