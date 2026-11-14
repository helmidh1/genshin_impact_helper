# Coding Standards

Rules and conventions enforced during code review (`/code-review`). Reviewer agents MUST evaluate diffs against these standards.

## 1. Architecture & Domain Separation

- **Pure Domain Engine**: Domain logic (Crit Value calculations, roll tiering, stat weight evaluation, archetype detection, build bottleneck critiques, equipment comparison) belongs strictly in `src/lib/build-engine.ts`.
  - The domain engine must remain pure: zero network I/O, zero filesystem access, zero browser `localStorage` dependencies.
  - All domain engine calculations must have corresponding unit test coverage in `src/lib/build-engine.test.ts`.
- **Adapter Boundary**: Upstream data adapters (e.g., `src/lib/enka.ts`, `src/lib/hoyolab.ts`) are anti-corruption layers.
  - Adapters must only fetch, validate, and normalize upstream payloads into domain DTOs (`RawArtifactInput`).
  - Adapters must delegate artifact and build evaluation to `evaluateArtifacts()` from `src/lib/build-engine.ts`.
  - Never perform inline stat grading or duplicate theorycrafting calculations inside adapters or UI components.
- **No Middleman Re-exports**: Do not re-export `BuildEngine` functions or types from adapter files (`enka.ts`, `hoyolab.ts`). Consumers must import directly from `@/lib/build-engine` or `@/types/genshin`.

## 2. Type Locality & Domain Models

- **Centralized Types**: Shared domain interfaces, union types, and DTOs belong in `src/types/genshin.ts`.
  - Import types with `import type { ... } from "@/types/genshin"`.
  - Do not declare shared domain types across ad-hoc utility files.
- **Test Fixture Fidelity**: Test fixtures, mocks, and character generators must strictly satisfy domain interfaces (e.g. `ShowcaseCharacter`, `BuildArchetype`, `WeaponRecommendationTier`). Do not mock complex typed fields (such as `talents: { normal, skill, burst }`) with loose placeholders or empty arrays.

## 3. Server & Client Boundaries

- **Secret & AI Isolation**: `@google/genai` client instances and `process.env.GEMINI_API_KEY` must remain strictly server-side (`src/app/api/**` and `src/lib/gemini.ts`). Never import AI SDKs or expose API keys to `"use client"` components.
- **Client Components**: Any component utilizing React hooks (`useState`, `useEffect`, etc.) or browser globals (`localStorage`, `window`) must start with `"use client";`.
- **Local-First Degradation**: Any AI-assisted coaching feature must fall back cleanly to local heuristics when `GEMINI_API_KEY` is missing or unreachable.

## 4. Quality Gates

- Every modification must pass the unified check suite before merging:
  ```bash
  npm run check
  ```
  (`npm run typecheck && npm run lint && npm test`).
