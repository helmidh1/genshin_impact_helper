# GEMINI.md — Teyvat Strategist (`genshin_impact_helper_00`) Context & Guidelines

## 1. Project Overview
- **Purpose**: **Teyvat Strategist** is a local-first Genshin Impact combat, build inspection, and status helper web application. It syncs public character showcase builds via **Enka.Network** and generates KQM-style team rotations, Energy Recharge (ER) diagnostics, buff timelines, and multi-turn matchup coaching via **Gemini 3.8 Flash** (`@google/genai`).
- **Primary Stack**:
  - **Framework**: Next.js `16.4.6` (App Router, Turbopack) with React `19.3.0` and TypeScript `^5` (`strict: true`).
  - **Styling**: Tailwind CSS v4 (`@tailwindcss/turbopack` `4.3.3`) with custom dark celestial glassmorphism theme tokens in `src/app/globals.css`.
  - **Icons & Fonts**: `lucide-react`, `Geist`, `Space Grotesk`, and `JetBrains Mono` via `next/font/google`.
  - **AI SDK**: `@google/genai` (`^3.2.0`) using the Interactions API (`client.interactions.create`) with model `gemini-3.8-flash` and automatic deterministic heuristic fallback when `GEMINI_API_KEY` is unset or unreachable.

## 2. Directory Layout & Architecture

| Path | Role & Responsibility |
| :--- | :--- |
| `src/app/` | Next.js App Router entrypoint (`layout.tsx`, `page.tsx`, `globals.css`) and server API route handlers. |
| `src/app/api/enka/[uid]/route.ts` | `GET` route validating 9- or 10-digit UIDs and returning normalized `TravelerProfile` data from Enka.Network. |
| `src/app/api/coach/route.ts` | `POST` route handling `mode: "strategy"` and `mode: "followup"` requests via `src/lib/gemini.ts`. |
| `src/components/` | Client UI components (`TeyvatStrategistApp.tsx` root state shell, `TopNavBar.tsx`, `OverviewTab.tsx`, `ShowcaseTab.tsx`, `CoachTab.tsx`, `ElementBadge.tsx`). |
| `src/lib/build-engine.ts` | Pure domain theorycraft engine (CV calculation, roll tiering, stat weight evaluation, archetype detection, build bottleneck critiques, equipment comparison). Zero I/O. |
| `src/lib/build-engine.test.ts` | Unit tests for pure domain theorycraft engine (19 tests via Vitest). |
| `src/lib/enka.ts` | Enka.Network API adapter & metadata fetcher (`characters.json`, `loc.json`), in-memory TTL caches; maps wire payloads to domain DTOs and delegates evaluation to `BuildEngine`. |
| `src/lib/hoyolab.ts` | HoYoLAB Battle Chronicle adapter; maps wire payloads to domain DTOs and delegates evaluation to `BuildEngine`. |
| `src/lib/gemini.ts` | Gemini 3.8 Flash Interactions API client (`generateCoachStrategy`, `askCoachFollowUp`), JSON schema enforcement, and deterministic local heuristics fallback (`buildFallbackStrategy`). |
| `src/lib/storage.ts` | Browser `localStorage` persistence (`teyvat_strategist_*_v1` keys) for saved UID profiles (capped at 8), active UID, daily directives/resin, party roster, coach strategy, and chat history (capped at 20 messages). |
| `src/lib/demo-data.ts` | Built-in demo traveler profile (`DEMO_TRAVELER_PROFILE`), default daily directives (`DEFAULT_DIRECTIVES`), and encounter/boss presets (`ENCOUNTER_PRESETS`). |
| `src/lib/elements.ts` | Elemental theme colors/icons (`ELEMENT_THEMES`) and party resonance calculations (`computeResonances`). |
| `src/types/genshin.ts` | Central TypeScript domain types (`TravelerProfile`, `ShowcaseCharacter`, `ArtifactPiece`, `CoachStrategyResponse`, `RawArtifactInput`, `BuildEvaluationResult`, etc.). |
| `GLOSSARY.md` | Canonical domain language glossary for terms and seams. |
| `CODING_STANDARDS.md` | Coding standards enforced during `/code-review`. |
| `public/` | Static SVG assets. |

## 3. Key Guidelines & Constraints
- **Next.js 16 Breaking Changes (`AGENTS.md`)**: This repository uses Next.js `16.4.6`, which has breaking differences from older Next.js versions (e.g., async route `params` as `Promise<{ ... }>` as seen in `src/app/api/enka/[uid]/route.ts`). Always consult the local docs in `node_modules/next/dist/docs/` before modifying Next.js APIs, routing, or configuration.
- **Local-First & Graceful Degradation**:
  - All user state (profiles, directives, active party, strategy, chat) lives in `localStorage` via `src/lib/storage.ts`—do not introduce a database unless requested.
  - `GEMINI_API_KEY` is optional. Any AI feature in `src/lib/gemini.ts` or `/api/coach` must continue to fall back cleanly to local heuristics when the key is missing or an API call fails.
- **Enka.Network Etiquette & Caching**:
  - Keep UID format validation (`9` or `10` digits), `User-Agent` header (`TeyvatStrategist/1.0 (local-next-app)`), and in-memory TTL caching (`uidCache` honoring `data.ttl` with a 60s minimum; 12-hour `metadataCache`) intact in `src/lib/enka.ts`.
  - Keep `images: { unoptimized: true }` in `next.config.ts` so remote Enka UI assets render without Next.js image proxy domain issues.
- **Server vs. Client Boundaries**: Keep `@google/genai` (`process.env.GEMINI_API_KEY`) and Enka upstream fetches strictly inside server-side `src/app/api/**` and `src/lib/gemini.ts` / `src/lib/enka.ts`; never expose secrets to client components.

## 4. Code & Documentation Conventions
- **TypeScript**:
  - `strict: true` is enabled in `tsconfig.json`; use the `@/*` path alias mapping to `./src/*`.
  - Place shared domain interfaces and union types in `src/types/genshin.ts` and import with `import type` where appropriate.
  - Avoid `any` unless interacting with untyped upstream Enka payloads (where ESLint disable comments are explicitly scoped).
- **React & Styling**:
  - Mark interactive components with `"use client";` at the top (`TeyvatStrategistApp.tsx` and tab/nav components).
  - Use Tailwind CSS v4 `@theme inline` color/font tokens and utility classes (`.glass-panel`, `.glass-panel-gold`, `.gold-tactical-btn`, `.celestial-mesh`, `.tabular-nums`) defined in `src/app/globals.css`.
  - Use `lucide-react` for UI icons and `ELEMENT_THEMES` from `src/lib/elements.ts` for consistent elemental colors.
- **Linting**: Configured in `eslint.config.mjs` using `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.

## 5. Tooling & Workflows
Run commands from the repository root (`.`):

- **Install dependencies**:
  ```bash
  npm install
  ```
- **Run development server** (Turbopack, `http://localhost:3000`):
  ```bash
  npm run dev
  ```
- **Unified fast check** (Typecheck + Lint + Unit tests):
  ```bash
  npm run check
  ```
- **Run Unit Tests** (Vitest):
  ```bash
  npm test
  ```
- **Run Typecheck** (TypeScript):
  ```bash
  npm run typecheck
  ```
- **Run ESLint**:
  ```bash
  npm run lint
  ```
- **Production build** (type-checks Next.js routes & bundles with Turbopack):
  ```bash
  npm run build
  ```
- **Start production server**:
  ```bash
  npm run start
  ```
- **Optional environment setup**: Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` to enable live Gemini 3.8 Flash coaching.

## 6. Agent Invariants & Guardrails
- **Git Worktree Isolation & Sandboxing**: This repository is a Git worktree linked to `../main/.git/worktrees/version_01`. In subagent or tool calls, commands that execute `git` or access Node tools must be run with `BypassSandbox: true` to avoid permission errors (`fatal: not a git repository`).
- **Do Not Remove `AGENTS.md` Block**: Preserve the `<!-- BEGIN:nextjs-agent-rules --> ... <!-- END:nextjs-agent-rules -->` block in `AGENTS.md` (it is managed/regenerated by `next dev`).
- **Protected & Generated Paths — Do Not Edit Manually**:
  - `.env*` (except `.env.example`), `.next/`, `node_modules/`, `next-env.d.ts`, `tsconfig.tsbuildinfo`, and `package-lock.json` (unless managing dependencies via `npm`).
- **API & Schema Alignment**: When updating `CoachStrategyResponse` or `STRATEGY_JSON_SCHEMA`, keep `src/types/genshin.ts`, `src/lib/gemini.ts` (both Gemini schema and `buildFallbackStrategy`), and `src/components/CoachTab.tsx` synchronized.
- **Verify Changes**: After code edits, run `npm run check` and `npm run build` to ensure TypeScript, ESLint, unit tests, and Next.js bundling succeed cleanly.

