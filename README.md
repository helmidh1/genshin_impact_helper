# ⚔️ Teyvat Strategist

> **Local-First Genshin Impact Combat Theorycrafting, Build Inspector & Progression Helper**  
> Built with Next.js 16 (App Router, Turbopack), React 19, TypeScript Strict Mode, Tailwind CSS v4, and Google Gemini 3.8 Flash.

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x_Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-93_Tests_Passing-6ebd4c?style=flat-square&logo=vitest)](https://vitest.dev/)
[![AI Powered](https://img.shields.io/badge/Gemini_3.8_Flash-Interactions_API-8e75ff?style=flat-square&logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## 🌟 Overview

**Teyvat Strategist** is an open-source, local-first web application designed for Genshin Impact players, theorycrafters, and coaches. It connects to public in-game showcases via **Enka.Network** to inspect character builds, calculates substat **Crit Value (CV)** and artifact roll tiers, tracks daily progression timers (Resin, Parametric Transformer, Crystalfly Trap), and generates KQM-style team rotations and ER benchmarks powered by **Gemini 3.8 Flash** with **100% deterministic local heuristic fallback**.

Designed with **strict domain purity** and **zero external database dependencies**, all profile data, custom teams, directives, and coaching history live safely inside your browser's `localStorage`.

---

## 🚀 Core Features

### 1. 🔍 Character Showcase & Artifact Build Inspector
- **Instant Showcase Sync**: Enter any valid 9- or 10-digit Genshin Impact UID to import public characters directly from Enka.Network with zero authentication required.
- **Substat Crit Value (CV) Grading**: Evaluates pure substat roll luck ($\text{CV} = [\text{CRIT Rate} \times 2] + \text{CRIT DMG}$) across all 5 artifact slots with roll tiering (God Roll, Ace, High, Solid, Needs Work).
- **Toggleable CV Theorycrafting Drawer**: An educational in-app explanation drawer detailing the universal 1:2 roll budget ratio, substat evaluation criteria, build quality benchmarks ($<100$ Developing to $220+$ Elite), and an interactive 5-piece breakdown of the active character.
- **Hardware-Accelerated Slide Drawer**: Smoothly collapse or expand the character selection carousel with CSS grid transitions, featuring right-anchored toggle controls and active character preview chips.
- **Multi-Filter & Symmetrical Sorting**:
  - Search characters strictly by name.
  - Filter by weapon type (`Sword`, `Claymore`, `Polearm`, `Bow`, `Catalyst`).
  - Filter by rarity (`All Stars`, `5★`, `4★`).
  - Filter by element (`Pyro`, `Hydro`, `Electro`, `Cryo`, `Dendro`, `Anemo`, `Geo`).
  - Sort by Crit Value, Level, Constellation, or Name with a dedicated **High ⇄ Low** (or **A ⇄ Z**) direction toggle.
- **KQM-Aligned Equipment Guides**: Integrated weapon rankings (BiS, Top Alternatives, F2P), artifact set recommendations with 4-piece synergies, stat benchmarks, and external links to KeqingMains, Game8, and Icy-Veins.

### 2. 🧠 AI Combat & Rotation Coach
- **Gemini 3.8 Flash Integration**: Assembly of structured KQM-style multi-step team rotations, elemental reaction sequences, particle funneling guidance, and boss matchup advice via `@google/genai` Interactions API.
- **Graceful Local Degradation**: If `GEMINI_API_KEY` is not provided or the network is unreachable, the coach seamlessly falls back to pure domain heuristics—zero crashes, zero blocking banners.
- **Curated Meta Team Presets**: 15 pre-built meta team archetypes ready to load with 1 click:
  - *Vaporize / Overload*: Raiden National, Arlecchino Vape, Hu Tao Double Hydro, Yoimiya Overvape
  - *Aggravate / Spread*: Alhaitham Quickbloom, Keqing Aggravate, Tighnari Spread
  - *Freeze / Swirl*: Ayaka Premium Freeze, Neuvillette Hypercarry, Xiao Hypercarry, Wanderer Anemo Hyper
  - *Electro-Charged / Lunar*: Clorinde Electro-Charged, Cyno Quickbloom, Furina Taser
  - *Mono Geo*: Itto Mono Geo
- **Multi-Field Team Search**: Searchable preset and saved account team selector with keyword filtering by team name, elemental archetype, and character names.
- **Energy Recharge (ER) Diagnostics**: Analyzes party particle generation, Favonius weapon energy yields, battery synergies, and flags characters at risk of burst downtime.
- **Multi-Turn Tactical Follow-Up**: Ask custom follow-up questions to refine rotations against specific Spiral Abyss floors, shields, and enemy mechanical vulnerabilities.

### 3. 📊 Daily Directives & Account Tracker
- **Monotonic Resin Replenishment**: Real-time resin recovery counter based on strict 8-minute intervals with exact recovery projections and capped percentage gauges.
- **Gadget Timers**: Real-time 7-day cooldown tracking for both the **Parametric Transformer** and the Fontaine **Crystalfly Trap** (15 Crystal Cores).
- **Optional HoYoLAB Synchronization**: Optional client-side sync to import full un-showcased character rosters, live Realm Currency, and perform 1-click Genshin Daily Check-In with automated Geetest verification challenge detection.

---

## 🏗️ Architecture & Engineering Principles

```
src/
├── app/                     # Next.js 16 App Router (layout, page, API routes)
│   ├── api/coach/route.ts   # Server-side Gemini AI coach gateway
│   ├── api/enka/[uid]/      # Server-side Enka.Network showcase proxy & cache
│   └── api/hoyolab/         # Server-side HoYoLAB notes & check-in proxy
├── components/              # React 19 Client UI Components (Tailwind CSS v4)
│   ├── TeyvatStrategistApp  # Root reactive state shell & tab navigation
│   ├── ShowcaseTab.tsx      # Character showcase, CV drawer, and filters
│   ├── CoachTab.tsx         # AI combat coach, rotation timeline, and presets
│   └── OverviewTab.tsx      # Directives, resin clock, and profile summary
├── lib/                     # Pure Domain Theorycraft Engines & Adapters
│   ├── build-engine.ts      # Pure CV math, roll tiering, stat weights (Zero I/O)
│   ├── coach-engine.ts      # Pure rotation sequencing, ER benchmarks (Zero I/O)
│   ├── directives-engine.ts # Pure monotonic resin clocks & cooldowns (Zero I/O)
│   ├── profile-store.ts     # Universal domain state store & legacy migrations
│   ├── gemini.ts            # Transport adapter for Google GenAI Interactions API
│   ├── enka.ts              # Upstream Enka.Network API adapter & TTL caches
│   └── hoyolab.ts           # Upstream HoYoLAB adapter & DTO normalizer
└── types/genshin.ts         # Centralized domain interfaces, DTOs & union types
```

- **Pure Domain Boundary**: All mathematical calculations (`build-engine.ts`, `coach-engine.ts`, `directives-engine.ts`) are 100% pure TypeScript functions—zero React hooks, zero network calls, zero browser storage access, and zero external side effects.
- **Transport Agnosticism**: Domain engines deal exclusively with typed domain models and business states. Network transport semantics (HTTP status codes, headers, cookie extraction) remain strictly isolated inside route handlers and adapters.
- **Mechanical Lint Isolation**: Enforced via ESLint (`no-restricted-imports`), preventing client components and hooks from ever importing server adapters or AI SDK credentials.
- **Hydration Safety**: Built on `useSyncExternalStore` with a referentially stable `SERVER_SNAPSHOT` and `useHasMounted` gates to eliminate Next.js server/client hydration mismatches.

---

## 🛠️ Quickstart & Setup Guide

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm` (bundled with Node.js)

### 1. Clone the Repository
```bash
git clone https://github.com/helmidh1/genshin_impact_helper.git
cd genshin_impact_helper
```

### 2. Install Dependencies
```bash
npm install
```

### 3. (Optional) Configure Environment Variables
Teyvat Strategist is completely usable out-of-the-box using built-in heuristic coaching and demo data. To enable live Gemini 3.8 Flash AI coaching:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```bash
# Get your free key at https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 How to Use for Your Own Account

1. **Enable In-Game Character Showcase**:
   - In Genshin Impact, open the **Paimon Menu** → **Edit Profile**.
   - Add up to 8 (or 12) characters to your **Character Showcase**.
   - **Crucial**: Ensure the checkbox **"Show Character Details"** is turned **ON** so artifacts, weapons, and talent levels are publicly visible.
2. **Sync Your UID in Teyvat Strategist**:
   - In the top navigation bar, enter your **9-digit or 10-digit Genshin Impact UID** (e.g. `600000001`, `700000001`, `800000001`).
   - Click **Sync Data**. Your profile, avatars, weapons, and artifacts will load instantly.
3. **Inspect Builds & Crit Values**:
   - Navigate to the **Character Showcase** tab.
   - Click on any character in the horizontal carousel or search by name.
   - Click **"What is CV?"** in the Crit Value banner to see how their substats add up to their total rating.
4. **Build Teams & Generate Rotations**:
   - Navigate to the **Combat Coach** tab.
   - Select an encounter preset (e.g. Spiral Abyss Floor 12 Chamber 1) or choose from 15 meta party setups via **Load Team**.
   - Review the generated rotation timeline, ER energy diagnostics, and party resonance buffs.

---

## 🧪 Testing & Verification

The project includes an exhaustive unit test suite covering pure theorycraft math, state persistence, monotonic resin recovery, and error unwrapping:

```bash
# Run all unit tests (Vitest)
npm test

# Run full quality check (Typecheck + Lint + Unit tests)
npm run check

# Verify production Next.js build & bundle optimization
npm run build
```

---

## 🔒 Privacy & Local-First Philosophy

- **Zero Tracking**: No Google Analytics, no tracking cookies, and no telemetry.
- **Client-Side Persistence**: All synced profiles, custom teams, directives, and chat history live exclusively in your browser's `localStorage` (`teyvat_strategist_store_v2`).
- **Secret Isolation**: Optional API keys entered into the UI are stored in dedicated isolated storage slots and are stripped from exported JSON backups.
- **Safe Network Proxies**: Upstream queries to Enka.Network and HoYoLAB are routed through internal Next.js API route handlers with in-memory TTL caching, protecting upstream rate limits and preventing CORS leakage.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

*Teyvat Strategist is an independent, community-driven project and is not affiliated with or endorsed by miHoYo / HoYoverse.*
