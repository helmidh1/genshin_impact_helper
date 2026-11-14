# 0001: Build Engine Domain Boundary

Upstream data providers (`enka.ts` and `hoyolab.ts`) must never import each other or perform inline theorycraft artifact grading. All artifact Crit Value (CV) calculation, roll tier grading, set bonus resolution, and build quality evaluation are consolidated into `src/lib/build-engine.ts` as a pure, zero-I/O in-process domain module. Transport adapters must normalize external DTOs into the common domain input shape before delegating to `BuildEngine`.
