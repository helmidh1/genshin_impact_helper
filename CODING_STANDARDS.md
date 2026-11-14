# Coding Standards

Rules and conventions enforced during code review (`/code-review`). Reviewer agents MUST evaluate diffs against these standards.

## 1. Architecture & Domain Separation

- **Pure Domain Engines**:
  - **Build Engine** (`src/lib/build-engine.ts`): Pure domain logic for Crit Value calculations, roll tiering, stat weight evaluation, archetype detection, build bottleneck critiques, equipment comparison. Unit tests in `src/lib/build-engine.test.ts`.
  - **Coach Engine** (`src/lib/coach-engine.ts`): Pure domain logic for rotation sequencing, Energy Recharge (ER) diagnostic benchmarks, buff timelines, party summarization, and heuristic equipment advice. Unit tests in `src/lib/coach-engine.test.ts`.
  - Both domain engines must remain pure: zero network I/O, zero filesystem access, zero browser `localStorage` dependencies, zero AI SDK imports, and zero React hooks.
- **Adapter Boundary**: Upstream data adapters (e.g., `src/lib/enka.ts`, `src/lib/hoyolab.ts`) are anti-corruption layers.
  - Adapters must only fetch, validate, and normalize upstream payloads into domain DTOs (`RawArtifactInput`).
  - Adapters must delegate artifact and build evaluation to `evaluateArtifacts()` from `src/lib/build-engine.ts`.
  - Never perform inline stat grading or duplicate theorycrafting calculations inside adapters or UI components.
- **No Middleman Re-exports**: Do not re-export `BuildEngine` functions or types from adapter files (`enka.ts`, `hoyolab.ts`). Consumers must import directly from `@/lib/build-engine` or `@/types/genshin`.
- **Monotonic Timing Invariant**: Any time-based resource recovery or countdown calculation must be derived deterministically from anchor timestamp progress (`elapsedMs % INTERVAL_MS`), never by repeatedly decrementing mutable cached seconds against a static anchor.

## 2. Type Locality & Domain Models

- **Centralized Types**: Shared domain interfaces, union types, and DTOs belong in `src/types/genshin.ts`.
  - Import types with `import type { ... } from "@/types/genshin"`.
  - Do not declare shared domain types across ad-hoc utility files.
- **Test Fixture Fidelity & Canonical Builders**: Test fixtures, mocks, and character generators must strictly satisfy domain interfaces (e.g. `ShowcaseCharacter`, `BuildArchetype`, `WeaponRecommendationTier`). Tests must import canonical builders from `src/lib/test-fixtures.ts` (`createMockCharacter`, `createMockArtifacts`, `createMockEncounter`, `MemoryStorageAdapter`) rather than declaring ad-hoc partial mocks or empty arrays, ensuring fidelity by construction.

## 3. Server & Client Boundaries

- **Universal Domain Isolation**: Domain store and utility modules (`src/lib/*.ts`) must remain pure universal TypeScript with **zero React hook imports** (`useEffect`, `useState`, `useSyncExternalStore`), ensuring safe import in server API routes, workers, and Node scripts. React hooks must strictly reside in dedicated client modules (`src/lib/use-*.ts` or components) marked with `"use client";`.
- **Secret & AI Isolation**: `@google/genai` client instances and `process.env.GEMINI_API_KEY` must remain strictly server-side (`src/app/api/**` and `src/lib/gemini.ts`). Never import AI SDKs or expose API keys to `"use client"` components.
- **Client Components**: Any component utilizing React hooks (`useState`, `useEffect`, etc.) or browser globals (`localStorage`, `window`) must start with `"use client";`.
- **Local-First Degradation**: Any AI-assisted coaching feature must fall back cleanly to local heuristics when `GEMINI_API_KEY` is missing or unreachable.

## 4. Quality Gates

- Every modification must pass both the unified check suite and production bundle verification before merging or committing:
  ```bash
  npm run check && npm run build
  ```
  (`npm run typecheck && npm run lint && npm test && next build`).
