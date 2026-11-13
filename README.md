# Teyvat Strategist — Genshin Impact Combat & Status Helper

A local-first Next.js (App Router, TypeScript, Tailwind CSS) web app for tracking your Genshin Impact showcase builds via **Enka.Network** and generating team rotations, ER diagnostics, and matchup coaching via **Gemini 3.8 Flash** (`@google/genai`).

## Features

- **Overview Dashboard**: Traveler profile summary (AR, World Level, Spiral Abyss, Imaginarium Theater, Achievements), sortable 8-card Public Character Showcase grid, and local-first **Directives & Resin** tracker (`localStorage`).
- **Character Showcase & Build Inspector**: Detailed character stats, talent levels, weapon stats, 5-slot artifact substat roll breakdowns with Crit Value (CV) grading, and automated bottleneck callouts.
- **AI Combat & Rotation Coach**: 4-slot team builder, Encounter / Boss preset selector, rotation timeline visualizer, Energy Recharge & particle funneling diagnostics, and multi-turn Q&A powered by Gemini 3.8 Flash (with deterministic local heuristics fallback when `GEMINI_API_KEY` is unset).

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Optional — enable live AI coaching by copying `.env.example` to `.env.local` and adding your Gemini API key:
   ```bash
   GEMINI_API_KEY=your_key_here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser, enter your 9- or 10-digit Genshin Impact UID in the top bar, and click **Sync Data**.
