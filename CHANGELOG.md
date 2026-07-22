# Changelog

All notable changes to this project are documented here. This project adheres to [Semantic Versioning](https://semver.org/).

## [1.1.1] — 2026-07-22

### Fixed
- README now reflects real behavior — **right-sizing** (small tasks answered instantly, swarms only when the work needs them) instead of implying every prompt spawns 5-20 agents.
- Documented the `kiro-swarm doctor` command; refreshed the project structure and feature list (real verification, safety-first).
- Made the confidence-scoring description honest (advisory signal; the review loop is the enforced gate).

### Changed
- Normalized `package.json` (`bin` path, repository URL) to clear npm publish warnings.

## [1.1.0] — 2026-07-22

### Added
- **Deterministic benchmark harness** (`bin/bench.js`, `kiro-swarm bench`) — records every run and reports success rate, avg agents/task, and execution time. Real data instead of hand-edited JSON.
- **`kiro-swarm doctor`** — health check + live self-test (install integrity, environment, orchestrator wiring).
- **Fast-path decision gate** — the orchestrator answers small/daily tasks directly and only spawns a swarm for genuinely multi-concern work.
- **Model routing** (`config/model-routing.json`) — per-stage model tiers (fast for research/critique/docs, strong for coding/review).
- **Real verification** — the reviewer runs the project's build/tests/lint and surfaces pass/fail as the headline result.
- **Per-run blackboard isolation** (`run-<id>/`, one file per parallel writer) to prevent clobbering and stale state.
- Lightweight observability — one-line plan before spawning, verification surfaced in the final answer.
- `examples/verified-feature.md`, `PUBLISHING.md`.

### Changed
- **Single-source orchestrator prompt** — `swarm-orchestrator.json` now loads `prompts/orchestrator.md` via `systemPrompt` (previously a divergent inline prompt overrode the documented design).
- Coder/architect prompts are now language-agnostic (no TypeScript bias).
- Budget ceiling — max 20 agents/run, max 3 review-loop iterations.

### Removed
- The reckless "never ask permission" instruction — destructive/irreversible actions now require confirmation.

### Fixed
- Broken install URLs (`kiro-agent-swarm` → `agent-swarm` repo) in the README and install scripts.

## [1.0.0]

- Initial release — self-organizing multi-agent swarm for Kiro CLI: orchestrator + 8 specialist agents, DAG pipeline, blackboard memory, install scripts, npm package.

[1.1.1]: https://github.com/sairajbaman/agent-swarm/releases/tag/v1.1.1
[1.1.0]: https://github.com/sairajbaman/agent-swarm/releases/tag/v1.1.0
[1.0.0]: https://github.com/sairajbaman/agent-swarm/releases/tag/v1.0.0
