# Blackboard Memory — Shared State for Agent Swarm

This directory is a shared knowledge surface. Every agent can read/write here.
The orchestrator reads this before designing teams. Agents write findings here
so later agents don't duplicate work.

## Files

| File | Purpose |
|------|---------|
| `research.md` | Research findings, library comparisons, API docs |
| `architecture.md` | Design decisions, schemas, data flow |
| `code.md` | Code inventory, what's been built, file paths |
| `tests.md` | Test results, coverage, failing tests |
| `issues.md` | Bugs found, review feedback, problems |
| `decisions.md` | Key decisions made and reasoning |
| `context.md` | Project context, workspace state, git status |

## Rules

1. Agents APPEND to files, never overwrite
2. Each entry includes timestamp and agent ID
3. Later agents READ before starting work
4. Orchestrator reads ALL blackboard files before designing teams
