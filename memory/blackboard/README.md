# Blackboard Memory — Shared State for Agent Swarm

A shared knowledge surface so agents build on each other's work instead of duplicating it. The orchestrator coordinates what gets written where.

## Per-Run Isolation (important)

State from one task must not leak into an unrelated one. Each multi-agent run is namespaced in its own subfolder:

```
blackboard/
├── run-<id>/            ← one folder per swarm run (isolated)
│   ├── research-*.md    ← one file per researcher
│   ├── architecture.md
│   ├── code.md
│   ├── tests.md
│   ├── issues.md
│   └── decisions.md
├── context.md           ← current workspace snapshot (git/deps/files)
├── research.md          ← legacy/example templates (topic-level notes)
├── architecture.md
├── code.md
├── tests.md
├── issues.md
└── decisions.md
```

The orchestrator picks a short run id at the start of a task and points agents at `run-<id>/`. The top-level files are templates/defaults; the live work happens in the run folder.

## File Purposes

| File | Purpose |
|------|---------|
| `research-*.md` | Research findings — **one file per researcher** to avoid collisions |
| `architecture.md` | Design decisions, schemas, data flow |
| `code.md` | Code inventory, what's been built, file paths |
| `tests.md` | Build/test results, coverage, failures |
| `issues.md` | Bugs found, review feedback |
| `decisions.md` | Key decisions and reasoning |
| `context.md` | Workspace state, git status, dependencies |

## Parallel-Write Safety

1. **One writer per file.** Agents that run *in parallel* must each write to their **own** file (e.g., `research-api.md`, `research-libs.md`). Never point two concurrent agents at the same file — writes will clobber each other.
2. **Merge in a later stage.** An integrator/synthesis stage combines the per-writer files into one.
3. **A single agent appends** to its own file (timestamp + section), never overwrites its prior entries.
4. **Read before write.** Later stages read the relevant run-folder files before starting.
5. **Skip the blackboard for small pipelines** — if the DAG already passes outputs stage-to-stage, you don't need it. Use it for larger runs (~5+ agents) where cross-stage sharing genuinely helps.

## Cleanup

Old `run-<id>/` folders can be deleted freely — they're per-task scratch space. Long-term learning lives in `../patterns.json` and `../reflections.json`, not here.
