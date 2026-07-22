# Advanced Swarm Features — Roadmap

## ✅ Recently Shipped (wired into prompts + configs)

These landed in the orchestrator/agent prompts and configs and are live now:

- **Single-source orchestrator prompt** — `swarm-orchestrator.json` now loads `prompts/orchestrator.md` via `systemPrompt` (matching all other agents). The old divergent inline prompt is gone, so behavior no longer drifts from the documented design.
- **Right-sized teams** — the orchestrator skips the integrator when there's a single producer and skips planner/researcher for clear tasks. Less overhead, faster runs.
- **Budget ceiling** — hard caps of 20 agents/run and 3 loop iterations to bound cost and latency.
- **Per-stage model routing** — the orchestrator sets `model` per stage (fast/cheap for research, critique, docs; strongest for coding, review, architecture).
- **Mandatory verification** — the reviewer now actually runs build/tests/lint and reports real output; failures trigger the `NEEDS_CHANGES` loop.
- **Safety over autonomy** — removed "never ask permission"; destructive/irreversible actions (force push, `rm -rf`, dropping data, prod/infra changes) now require confirmation, and coder/integrator agents are told to prefer non-destructive commands.
- **Honest confidence handling** — scores are documented as advisory signals; the enforceable gate is the `NEEDS_CHANGES` review loop, not the number.
- **Per-run blackboard isolation** — runs are namespaced under `run-<id>/` with one file per parallel writer, preventing clobbering and stale-state leakage.
- **Language-agnostic prompts** — coder/architect no longer assume TypeScript; they detect and match the project's language and conventions.
- **Explicit learning write-back** — the orchestrator now writes run patterns to `patterns.json` and notes to `reflections.json` as a final step.

---

## Phase 1: Can Add NOW (via orchestrator prompt + agent prompts)

These features work within Kiro's existing `subagent` tool by making the orchestrator smarter.

---

### ✅ 1. DAG Scheduler (ALREADY BUILT)
The `subagent` tool natively supports dependency graphs via `depends_on`.
Everything independent runs simultaneously. This is already how our system works.

---

### ✅ 2. Confidence Scoring
**How:** Add to every agent's output format.

Each agent must end their response with:
```
## Confidence
- Score: [0-100]%
- Reason: [why this confidence level]
- Needs Review: [Yes/No]
- Missing: [what information would increase confidence]
```

The orchestrator checks confidence scores. If any agent scores below 70%, it spawns an additional pass.

**Implementation:** Update all prompts in `prompts/` to include confidence scoring in output format.

---

### ✅ 3. Autonomous Loop (Review → Improve cycle)
**How:** Use `subagent` loop_to feature.

```json
{
  "name": "reviewer",
  "role": "swarm-reviewer",
  "prompt_template": "Review the implementation...",
  "depends_on": ["implementation"],
  "loop_to": {
    "target": "implementation",
    "trigger": "NEEDS_CHANGES",
    "max_iterations": 3
  }
}
```

If reviewer says "NEEDS_CHANGES", the coder runs again with feedback. Up to 3 iterations until quality threshold is met.

**Implementation:** Update orchestrator prompt to use `loop_to` for review cycles.

---

### ✅ 4. Consensus Engine (Multiple perspectives → vote)
**How:** The orchestrator spawns competing agents and a judge.

```json
[
  {"name": "solution-a", "role": "swarm-coder", "prompt_template": "Implement approach A..."},
  {"name": "solution-b", "role": "swarm-coder", "prompt_template": "Implement approach B..."},
  {"name": "judge", "role": "swarm-reviewer", "prompt_template": "Compare solutions A and B. Pick the best. Explain why.", "depends_on": ["solution-a", "solution-b"]}
]
```

**Implementation:** Add "competing solutions" pattern to orchestrator prompt for high-stakes decisions.

---

### ✅ 5. Workspace Awareness
**How:** The orchestrator reads project state BEFORE designing the team.

Before spawning agents, orchestrator runs:
- `git status` — what's changed
- `read package.json` — what dependencies exist
- `glob **/*.ts` — what files exist
- `grep "TODO|FIXME"` — what's pending

Then includes this context in each agent's `prompt_template`.

**Implementation:** Update orchestrator prompt to gather workspace context before team design.

---

### ✅ 6. Context Compression
**How:** Each agent receives ONLY what's relevant to their task.

Instead of passing the entire codebase to every agent:
- Researcher gets: the question + relevant docs
- Coder gets: the spec + relevant files only
- Reviewer gets: the diff + test results

The orchestrator is responsible for curating context per agent in the `prompt_template`.

**Implementation:** Already designed this way. Orchestrator should be MORE specific about what context each agent needs.

---

### ✅ 7. Long-Term Learning (Enhanced Memory)
**How:** Expand `memory/patterns.json` structure.

```json
{
  "patterns": [...],
  "successfulPlans": [...],
  "failedPlans": [...],
  "bugPatterns": [...],
  "architectureTemplates": [...],
  "promptImprovements": [...],
  "benchmarks": {
    "avgAgentsPerTask": 5.2,
    "avgTimePerSwarm": "45s",
    "successRate": 0.87
  }
}
```

**Implementation:** Update memory schema and orchestrator's reflection logic.

---

## Phase 2: Needs Infrastructure (Build next)

These features require additional code/tooling beyond prompt engineering.

---

### ✅ 8. Blackboard Memory (Shared State) — SHIPPED

**Problem:** Currently agents only communicate through the DAG (output → next stage input). They can't share intermediate findings in real-time.

**Solution:** Use a shared file as a blackboard.

```
D:/agent swarm/blackboard/
├── research.md        ← Researchers write here
├── architecture.md    ← Architects write here  
├── code-inventory.md  ← Coders log what they've built
├── issues.md          ← Anyone can log issues
├── decisions.md       ← Key decisions made
└── context.md         ← Shared project context
```

Every agent's prompt includes: "Read `blackboard/` before starting. Write your findings to the relevant blackboard file."

**Status:** ✅ Shipped with per-run isolation (`run-<id>/` folders) and one-file-per-parallel-writer to prevent clobbering. See `memory/blackboard/README.md`.

---

### 🔨 9. Recursive Swarms (Sub-swarms)

**Problem:** Kiro's `subagent` tool doesn't allow sub-agents to spawn their own sub-agents (no recursion).

**Workaround:** The orchestrator implements hierarchy by creating LARGER pipelines with coordinator stages:

```json
[
  {"name": "research-coordinator", "role": "swarm-planner", "prompt_template": "Coordinate research across 3 domains: API research, community research, docs research. Produce a unified research brief."},
  {"name": "api-research", "role": "swarm-researcher", "prompt_template": "Research APIs for..."},
  {"name": "community-research", "role": "swarm-researcher", "prompt_template": "Research community opinions on..."},
  {"name": "docs-research", "role": "swarm-researcher", "prompt_template": "Research official documentation for..."},
  {"name": "research-synthesis", "role": "swarm-integrator", "prompt_template": "Merge all research into one brief", "depends_on": ["api-research", "community-research", "docs-research"]},
  {"name": "coding-team", "role": "swarm-coder", ...},
  ...
]
```

**True recursive swarms** would need a custom wrapper that:
1. Coordinator agent produces a plan
2. Wrapper translates plan → subagent call
3. Results flow back up

**Status:** Workaround available now. True recursion is a Phase 3 feature.

---

### 🔨 10. Internal Task Queue (Kanban for Agents)

**Proposed schema:**
```json
{
  "id": "task-001",
  "title": "Implement auth middleware",
  "priority": "high",
  "status": "in_progress",
  "owner": "swarm-coder-1",
  "dependencies": ["task-000"],
  "retryCount": 0,
  "maxRetries": 3,
  "confidence": null,
  "deadline": null,
  "created": "2026-07-22T15:00:00Z",
  "started": "2026-07-22T15:01:00Z",
  "completed": null
}
```

**Implementation:** A `memory/task-queue.json` file that the orchestrator manages. Each agent checks in/out tasks.

---

### 🔨 11. Tool Router

**Problem:** Every agent calls tools directly. No caching, no optimization, no retry logic.

**Solution:** A tool-routing layer (could be an MCP server) that:
- Caches repeated reads (if file hasn't changed, return cached)
- Retries failed tool calls (network errors, timeouts)
- Rate-limits expensive operations (web searches)
- Logs all tool usage for the dashboard

**Status:** Needs a custom MCP server. Phase 2 build.

---

### 🔨 12. Performance Dashboard

**Tracked metrics:**
```
┌─────────────────────────────────────────────┐
│  SWARM DASHBOARD                             │
├─────────────────────────────────────────────┤
│  Active Agents:    7/10                      │
│  Current Stage:    Implementation (2/4)      │
│  Pipeline:         ████████░░ 80%            │
│                                              │
│  Tokens Used:      45,230                    │
│  Est. Cost:        $0.12                     │
│  Elapsed:          1m 23s                    │
│                                              │
│  Agent Timeline:                             │
│  researcher-1  ████████ done (32s)           │
│  researcher-2  ██████████ done (41s)         │
│  architect     ███████ done (28s)            │
│  coder-1       ████████████░░ running        │
│  coder-2       ██████████░░░░ running        │
│  reviewer      ░░░░░░░░░░░░░░ waiting        │
│  integrator    ░░░░░░░░░░░░░░ waiting        │
└─────────────────────────────────────────────┘
```

**Implementation:** Would need a TUI component. Currently, `Ctrl+G` in Kiro shows active sessions — that's our MVP dashboard.

---

## Phase 3: Future Vision

### 🚀 13. Agent Marketplace
Share and install specialist agents from a community registry.

### ✅ 14. Multi-Model Routing — SHIPPED (basic)
Different agents use different models (cheap model for research, expensive for coding). The orchestrator sets the `model` field per `subagent` stage. Basic routing is live; a learned cost/quality policy remains future work.

### 🚀 15. Distributed Execution
Agents run on different machines for true horizontal scaling.

### 🚀 16. Real-time Collaboration
Agents communicate mid-task via shared channels (not just DAG flow).

### 🚀 17. Self-Evolving Prompts
The system A/B tests different prompt versions and keeps winners.

---

## Implementation Priority

| Feature | Effort | Impact | Status |
|---------|--------|--------|--------|
| Confidence Scoring (advisory) | Low (prompt change) | High | ✅ Shipped |
| Autonomous Loop (loop_to) | Low (prompt change) | High | ✅ Shipped |
| Workspace Awareness | Low (orchestrator reads) | High | ✅ Shipped |
| Consensus Engine | Low (pattern addition) | Medium | ✅ Shipped |
| Context Compression | Low (already designed) | High | ✅ Shipped |
| Blackboard Memory (per-run isolation) | Medium (file structure) | High | ✅ Shipped |
| Model Routing (per-stage) | Low (prompt change) | High | ✅ Shipped |
| Verification (real build/test) | Low (prompt change) | High | ✅ Shipped |
| Safety guardrails + budget ceiling | Low (prompt change) | High | ✅ Shipped |
| Long-Term Learning (write-back) | Medium (schema + write step) | High | 🟡 Wired via prompt; needs real-world validation |
| Task Queue | Medium (new file) | Medium | ⬜ Next |
| Recursive Swarms (workaround) | Medium (larger pipelines) | High | ⬜ Next |
| Tool Router | High (MCP server) | Medium | ⬜ Later |
| Performance Dashboard | High (TUI component) | Low | ⬜ Later |
