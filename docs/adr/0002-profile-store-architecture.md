# 0002: Profile Store Architecture and Reactive Client Persistence

Local user state (traveler showcase profiles, active UID, daily resin directives, party rosters, coach strategy results, chat history, check-in status, and equipment advice) is consolidated from fragmented `localStorage` keys into a unified `ProfileStore` domain module (`src/lib/profile-store.ts`).

1. **State Topology**: Primary application state lives in a single versioned state document (`teyvat_strategist_store_v2`) with automatic non-destructive migration from legacy `_v1` keys. User credentials (`GEMINI_API_KEY` and HoYoLAB cookies) are isolated in separate storage slots.
2. **Reactivity & React Integration**: The store is headless and framework-agnostic with an external subscriber registry. Client components subscribe via `useSyncExternalStore` through `useProfileStore()`, eliminating state duplication and synchronization loops.
3. **Domain Actions**: State mutations are performed strictly through typed domain actions on `profileStore` (e.g. `saveProfile`, `setActiveUid`, `setParty`, `updateDirectives`, `saveCoachStrategy`), enforcing domain invariants and quota caps (e.g. maximum 8 profiles, 20 chat messages per UID).
4. **Resin Regeneration**: Resin recovery is automatically reconciled based on timestamp elapsed time, with a background 60-second active tick that updates live UI timers without writing to storage on unmutated ticks.
5. **Testability**: The store accepts an injectable `StorageAdapter` interface, allowing full unit test coverage via an in-memory adapter in `src/lib/profile-store.test.ts` without browser environment dependencies.
