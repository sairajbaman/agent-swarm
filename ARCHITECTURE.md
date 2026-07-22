# Agent Swarm Architecture for Kiro CLI

## Philosophy: Scale Out, Not Up

Instead of one agent thinking harder, we spawn many agents thinking independently
and in parallel — then reconcile their outputs into something smarter than any
single agent could produce.

The swarm **designs itself**. You give a prompt. The orchestrator decides what
team to build.

---

## How It Works (Powered by Kiro's Native Tools)

```
User Prompt
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  ORCHESTRATOR (kiro_default agent)                   │
│                                                      │
│  1. Analyze task complexity & dimensions             │
│  2. Decompose into independent sub-tasks             │
│  3. Design team: what roles, how many agents         │
│  4. Define dependencies (DAG)                        │
│  5. Spawn via `subagent` tool (parallel stages)      │
└─────────────┬───────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────┐
│  PARALLEL EXECUTION (Kiro subagent pipeline)         │
│                                                      │
│  Stage 1 (no deps - all parallel):                   │
│    ├── Agent-A: researcher (web_search, web_fetch)   │
│    ├── Agent-B: analyst (grep, code, read)           │
│    ├── Agent-C: writer (write, knowledge)            │
│    └── Agent-D: critic (read, review)                │
│                                                      │
│  Stage 2 (depends on Stage 1):                       │
│    └── Synthesizer: reconcile all outputs            │
│                                                      │
│  Stage 3 (depends on Stage 2):                       │
│    └── Reviewer: quality check final output          │
└─────────────┬───────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────┐
│  SYNTHESIS & REFLECTION                              │
│                                                      │
│  1. Merge parallel outputs                           │
│  2. Resolve disagreements (if agents conflict)       │
│  3. Self-evaluate: what worked, what didn't          │
│  4. Store patterns in memory for next time           │
│  5. Deliver final result to user                     │
└─────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Orchestrator (`swarm/orchestrator.md`)

The CEO. Receives the user's raw prompt and:
- Classifies the task type (research, code, analysis, creative, multi-domain)
- Determines parallelization strategy
- Designs the team (roles + responsibilities)
- Creates the execution plan (DAG of stages)
- Outputs a structured JSON plan that the spawner executes

### 2. Spawner (`swarm/spawn.ts`)

Takes the orchestrator's plan and translates it into Kiro's `subagent` tool call:
- Maps roles → agent configurations
- Sets up dependencies between stages
- Configures loop-back (reviewer can send work back to implementer)
- Handles variable passing between stages

### 3. Agent Templates (`swarm/agents/`)

Pre-built role templates that the orchestrator can assign:
- `researcher` — searches web, fetches docs, gathers context
- `coder` — writes/edits code, runs tests
- `analyst` — reads data, finds patterns, produces insights
- `writer` — produces prose, documentation, reports
- `critic` — reviews work, finds flaws, suggests improvements
- `planner` — breaks complex problems into steps
- `fact_checker` — verifies claims, cross-references sources
- `custom` — orchestrator can invent new roles on the fly

### 4. Synthesizer (`swarm/synthesizer.md`)

The final stage agent that:
- Receives ALL parallel agent outputs
- Identifies agreements and disagreements
- Resolves conflicts through reasoning
- Produces a unified, higher-quality result
- Flags low-confidence areas

### 5. Memory (`swarm/memory/`)

Persists across swarm runs:
- `patterns.json` — successful team structures for task types
- `reflections.json` — what worked/failed in past swarms
- `templates.json` — learned agent configurations

### 6. CLI Entry Point (`swarm/run.ts`)

```bash
kiro-swarm "Research the top 10 AI agent frameworks and compare them"
```

One command. Swarm self-organizes. Result delivered.

---

## Key Design Decisions

### Why Kiro's Native `subagent` Tool?

- Already supports parallel stages (no deps = concurrent)
- Already supports DAG dependencies (depends_on)
- Already supports loop-back (reviewer → implementer cycle)
- Each stage is a full Kiro agent with all MCP tools available
- No external API needed — runs on Kiro's own model

### Self-Organizing = Orchestrator Plans Dynamically

The orchestrator is NOT a static router. It receives the raw prompt and INVENTS
the right team structure. Examples:

**"Compare React vs Vue vs Svelte"**
→ Spawns 3 researchers (one per framework) + 1 synthesizer

**"Write a blog post about quantum computing"**
→ Spawns 1 researcher + 1 writer + 1 fact-checker + 1 editor

**"Audit this codebase for security issues"**
→ Spawns 5 agents (one per attack vector) + 1 reporter

**"Plan my startup launch"**
→ Spawns: market researcher, competitor analyst, financial modeler,
   marketing strategist, devil's advocate (critic)

### Disagreement as a Feature

When multiple agents work independently, they may reach different conclusions.
This is GOOD. The synthesizer doesn't just average — it reasons through conflicts:

- Agent-A says "React is best for this use case"
- Agent-B says "Svelte is better because..."
- Synthesizer: evaluates both arguments, picks winner with reasoning

---

## File Structure

```
agent-swarm/
├── ARCHITECTURE.md          ← This file
├── package.json             ← Node.js project
├── tsconfig.json            ← TypeScript config
├── src/
│   ├── index.ts             ← CLI entry point
│   ├── orchestrator.ts      ← Orchestrator logic
│   ├── spawner.ts           ← Translates plan → subagent calls
│   ├── synthesizer.ts       ← Merges parallel outputs
│   ├── memory.ts            ← Pattern storage & recall
│   └── types.ts             ← Shared types
├── prompts/
│   ├── orchestrator.md      ← System prompt for the CEO
│   ├── synthesizer.md       ← System prompt for reconciliation
│   ├── reflector.md         ← Self-evaluation prompt
│   └── agents/
│       ├── researcher.md    ← Research agent template
│       ├── coder.md         ← Coding agent template
│       ├── analyst.md       ← Analysis agent template
│       ├── writer.md        ← Writing agent template
│       ├── critic.md        ← Review/critique template
│       ├── planner.md       ← Planning agent template
│       └── custom.md        ← Dynamic role template
├── memory/
│   ├── patterns.json        ← Learned team structures
│   └── reflections.json     ← Past swarm evaluations
└── examples/
    ├── research.md          ← Example: research task
    ├── code-review.md       ← Example: code audit
    └── creative.md          ← Example: creative writing
```

---

## Execution Flow (Detailed)

### Step 1: User Input
```
"Research the top 5 AI agent frameworks, compare their architectures,
 and recommend which one to use for a CLI tool"
```

### Step 2: Orchestrator Analyzes & Plans
```json
{
  "task_type": "research_comparison",
  "complexity": "high",
  "parallelizable": true,
  "team": [
    {"role": "researcher", "focus": "AutoGen framework", "id": "r1"},
    {"role": "researcher", "focus": "CrewAI framework", "id": "r2"},
    {"role": "researcher", "focus": "LangGraph framework", "id": "r3"},
    {"role": "researcher", "focus": "Swarm (OpenAI) framework", "id": "r4"},
    {"role": "researcher", "focus": "MetaGPT framework", "id": "r5"},
    {"role": "analyst", "focus": "Compare architectures from research", "id": "a1"},
    {"role": "critic", "focus": "Challenge recommendations, find flaws", "id": "c1"},
    {"role": "synthesizer", "focus": "Final recommendation with reasoning", "id": "s1"}
  ],
  "stages": [
    {"agents": ["r1","r2","r3","r4","r5"], "parallel": true},
    {"agents": ["a1"], "depends_on": ["r1","r2","r3","r4","r5"]},
    {"agents": ["c1"], "depends_on": ["a1"]},
    {"agents": ["s1"], "depends_on": ["a1","c1"]}
  ]
}
```

### Step 3: Spawner Executes
Translates to Kiro's `subagent` tool with parallel stages.

### Step 4: Agents Work (in parallel where possible)
- 5 researchers work SIMULTANEOUSLY
- Analyst waits for all 5, then compares
- Critic challenges the analyst's conclusions
- Synthesizer produces final output

### Step 5: Result Delivered
Clean, synthesized output with the reasoning visible.

---

## What Makes This "Smarter"

1. **Self-organizing** — No predefined teams. Orchestrator invents the right structure.
2. **Parallel** — Independent work happens simultaneously.
3. **Adversarial** — Critics/fact-checkers challenge other agents.
4. **Reflective** — System evaluates its own performance after each run.
5. **Learning** — Successful patterns are remembered for next time.
6. **Scalable** — 2 agents or 20 agents, based on task needs.
