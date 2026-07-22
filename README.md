# 🐝 Kiro Agent Swarm

**Make Kiro CLI 10x smarter. One install. Zero config.**

Type a prompt → the orchestrator analyzes it → spawns 5-20 parallel agents → they work simultaneously → a synthesizer delivers the result. Smarter than any single agent run.

Inspired by [Kimi Agent Swarm](https://www.kimi.com/blog/agent-swarm) — Scale Out, Not Just Up.

---

## ⚡ One-Line Install

```bash
# NPM (recommended — works everywhere)
npm install -g kiro-agent-swarm
```

That's it. Auto-installs everything. Next `kiro-cli chat` session uses the swarm.

**Alternative methods:**

```bash
# Windows (PowerShell)
irm https://raw.githubusercontent.com/sairajbaman/agent-swarm/main/install.ps1 | iex

# Mac/Linux
curl -fsSL https://raw.githubusercontent.com/sairajbaman/agent-swarm/main/install.sh | bash

# Manual
git clone https://github.com/sairajbaman/agent-swarm.git
cd agent-swarm
.\install.ps1   # Windows
./install.sh    # Mac/Linux
```

After install, **every new `kiro-cli chat` session** automatically uses the swarm. No commands to remember.

> **🔒 What the installer does (transparency note)**
>
> The install script only does three things:
> 1. Copies agent configs and prompts into `~/.kiro/agents/`
> 2. Initializes an empty memory directory at `~/.kiro/agents/memory/`
> 3. Sets `swarm-orchestrator` as your default Kiro CLI agent
>
> That's it. **No network calls. No telemetry. No background processes.** Everything stays inside `~/.kiro/` and is fully reversible with `kiro-swarm uninstall` (or just delete `~/.kiro/agents/swarm-*`).
>
> You can audit the entire install: [`install.sh`](install.sh) (29 lines) | [`install.ps1`](install.ps1) (42 lines) | [`bin/install.js`](bin/install.js) (npm postinstall)

**CLI commands:**
```bash
kiro-swarm status      # Check if swarm is active
kiro-swarm install     # Reinstall/update
kiro-swarm uninstall   # Remove swarm, restore default
```

---

## 🧠 What It Does

```
You type: "Build a REST API with auth and database"

Orchestrator analyzes → Medium complexity → 6 agents needed

Stage 1 (parallel):
  ├── swarm-researcher → finds best auth libraries
  ├── swarm-architect  → designs API schema + DB model

Stage 2 (depends on Stage 1):
  ├── swarm-coder      → implements backend code
  ├── swarm-coder      → implements auth middleware

Stage 3 (depends on Stage 2):
  └── swarm-reviewer   → finds bugs, security issues
      ↺ loop_to: coder (if NEEDS_CHANGES, max 3 iterations)

Stage 4 (depends on Stage 3):
  └── swarm-integrator → merges everything, delivers final code

Result: Complete, reviewed, production-ready code.
Time: Parallel execution = 2-3x faster than sequential.
```

---

## 🏗️ Architecture

```
User Prompt (every prompt, every time)
      │
      ▼
┌─────────────────────────────────────────┐
│  ORCHESTRATOR (auto-activates)           │
│                                          │
│  • Classifies task complexity            │
│  • Reads workspace (git, deps, files)    │
│  • Designs optimal team dynamically      │
│  • Creates custom agents on the fly      │
│  • Invokes subagent pipeline             │
│  • Synthesizes final result              │
└────────────────┬────────────────────────┘
                 │
     ┌───────────┼───────────┐
     ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│Research │ │  Code   │ │ Design  │  ← Stage 1 (parallel)
│ Agent   │ │  Agent  │ │  Agent  │
└────┬────┘ └────┬────┘ └────┬────┘
     └───────────┼───────────┘
                 ▼
         ┌─────────────┐
         │  Reviewer   │  ← Stage 2 (quality gate)
         │    Agent    │
         └──────┬──────┘
                │ ↺ loop (if NEEDS_CHANGES)
                ▼
         ┌─────────────┐
         │ Integrator  │  ← Stage 3 (final delivery)
         │    Agent    │
         └─────────────┘
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Self-Organizing** | Orchestrator invents the right team per task — no fixed templates |
| **Parallel Execution** | Independent agents work simultaneously via DAG scheduler |
| **Dynamic Agent Creation** | Creates custom specialists on the fly when needed |
| **Blackboard Memory** | Shared state prevents duplicate work between agents |
| **Confidence Scoring** | Every agent outputs 0-100% confidence. Low scores trigger re-runs |
| **Autonomous Loop** | Review → Improve → Review cycles until quality threshold met |
| **Consensus Engine** | Competing solutions for high-stakes decisions |
| **Workspace Aware** | Reads git status, dependencies, file structure before planning |
| **Context Compression** | Each agent gets ONLY relevant context — no bloat |
| **Hierarchical Swarms** | 10+ agent tasks use coordinator sub-teams |
| **Long-Term Learning** | Remembers successful patterns, avoids failed ones |
| **Works Everywhere** | Global install — any folder, any project, any session |

---

## 🎯 Complexity Routing (Automatic)

| Your Prompt | What Happens |
|-------------|-------------|
| "What is TypeScript?" | Direct answer (0 agents) |
| "Fix the bug in auth.ts" | Small swarm (2-3 agents) |
| "Build a REST API with auth" | Medium swarm (5-7 agents) |
| "Rebuild the entire backend" | Large swarm (8-12 agents) |
| "Create a full SaaS app" | Extreme swarm (12-20 agents) |

---

## 🤖 Specialist Agents

| Agent | Role | Tools |
|-------|------|-------|
| `swarm-orchestrator` | The brain — designs teams and coordinates | All tools + subagent |
| `swarm-researcher` | Searches web, docs, finds libraries | web_search, web_fetch, read |
| `swarm-coder` | Writes production code | read, write, shell, code |
| `swarm-architect` | Designs systems, APIs, schemas | read, grep, glob, code |
| `swarm-reviewer` | Reviews code, finds bugs | read, grep, shell, code |
| `swarm-critic` | Challenges assumptions, devil's advocate | read, grep, glob |
| `swarm-integrator` | Merges parallel outputs | read, write, shell, code |
| `swarm-writer` | Documentation, reports, prose | read, write, web_search |
| `swarm-planner` | Decomposes complex tasks | read, grep, web_search |

---

## 📁 Project Structure

```
agent-swarm/
├── install.ps1              ← One-command installer (Windows)
├── install.sh               ← One-command installer (Mac/Linux)
├── uninstall.ps1            ← Clean removal
├── README.md                ← This file
├── ARCHITECTURE.md          ← Detailed design doc
├── ROADMAP.md               ← Future features roadmap
├── agents/                  ← Agent configuration files
│   ├── swarm-orchestrator.json
│   ├── swarm-coder.json
│   ├── swarm-researcher.json
│   ├── swarm-architect.json
│   ├── swarm-reviewer.json
│   ├── swarm-critic.json
│   ├── swarm-integrator.json
│   ├── swarm-writer.json
│   └── swarm-planner.json
├── prompts/                 ← System prompts for each agent
│   ├── orchestrator.md
│   ├── coder.md
│   ├── researcher.md
│   └── ... (8 more)
├── memory/                  ← Persistent learning
│   ├── blackboard/          ← Shared state between agents
│   ├── patterns.json        ← Learned team structures
│   └── reflections.json     ← Self-improvement notes
└── examples/                ← Example swarm runs
    └── coding-task.md
```

---

## 🔧 Manual Install

If you prefer manual setup:

```powershell
# 1. Clone the repo
git clone https://github.com/sairajbaman/agent-swarm.git
cd agent-swarm

# 2. Copy agents to Kiro's global directory
Copy-Item -Path "agents\*" -Destination "$HOME\.kiro\agents\" -Force
Copy-Item -Path "prompts" -Destination "$HOME\.kiro\agents\prompts" -Recurse -Force
Copy-Item -Path "memory" -Destination "$HOME\.kiro\agents\memory" -Recurse -Force

# 3. Set as default agent
kiro-cli agent set-default --name swarm-orchestrator
```

---

## 🔄 Uninstall

```powershell
.\uninstall.ps1
# Or manually:
kiro-cli agent set-default --name kiro_default
Remove-Item "$HOME\.kiro\agents\swarm-*" -Force
```

---

## 📊 Monitor Your Swarm

While agents are running, press **Ctrl+G** in Kiro CLI to see:
- All active agent sessions
- Which stage is running
- Which agents have completed

---

## 🧪 Test It

After install, open a new `kiro-cli chat` and try:

```
Build a TypeScript utility that validates email addresses with custom rules and tests
```

Watch the swarm:
1. Researcher finds email validation patterns
2. Architect designs the API
3. Coder implements it
4. Reviewer checks for bugs
5. Integrator delivers the final code

---

## 🤝 Contributing

1. Fork this repo
2. Add/improve agent prompts in `prompts/`
3. Add new specialist agents in `agents/`
4. Submit a PR

---

## 📜 License

MIT — Use it, fork it, make it better.

---

## 🙏 Inspired By

- [Kimi Agent Swarm](https://www.kimi.com/blog/agent-swarm) — Scale Out, Not Just Up
- [Awesome Harness Engineering](https://github.com/ai-boost/awesome-harness-engineering) — Best practices
- [Anthropic Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)

---

**Built for [Kiro CLI](https://kiro.dev) users who want their AI to be smarter, faster, and more capable.**
