# Publishing & Distribution (maintainer notes)

> **Important:** the improvements in this repo are on GitHub but **not on npm** until you publish a new version. Users who run `npm install -g kiro-agent-swarm` get whatever is on the npm registry — currently the older `1.0.0`. Publish to ship the new work.

## Distribution channels

| Channel | Command users run | Ships from |
|---------|-------------------|-----------|
| **npm** (primary) | `npm install -g kiro-agent-swarm` | the npm registry (must `npm publish`) |
| **Script (Windows)** | `irm .../install.ps1 \| iex` | GitHub `main` (live on push) |
| **Script (Mac/Linux)** | `curl -fsSL .../install.sh \| bash` | GitHub `main` (live on push) |
| **Manual / clone** | `git clone … && ./install` | GitHub `main` (live on push) |

The script and clone paths update the moment you push to `main`. Only the npm path needs an explicit publish.

## Publishing a new version

1. **Make sure it's clean:**
   ```bash
   node bin/cli.js doctor      # health check
   node --check bin/*.js       # syntax
   ```
2. **Bump the version** in `package.json` (semver):
   - patch (1.1.x) — fixes only
   - minor (1.x.0) — new backward-compatible features (current: `1.1.0`)
   - major (x.0.0) — breaking changes to install/CLI behavior
3. **Preview exactly what ships:**
   ```bash
   npm pack --dry-run
   ```
4. **Publish:**
   ```bash
   npm login        # once
   npm publish
   ```
5. **Verify:**
   ```bash
   npm view kiro-agent-swarm version    # should show the new version
   ```

## What's in `1.1.0`

- Single-source orchestrator prompt (fixes the dead-prompt bug) + fast-path decision gate
- Safety-first behavior (confirm destructive actions), real build/test verification in review
- `kiro-swarm doctor` health check and `kiro-swarm bench` performance tracking
- Per-stage model routing config, per-run blackboard isolation, language-agnostic prompts

## Notes

- `files` in `package.json` controls what ships. It currently includes `bin/`, `agents/`, `prompts/`, `memory/`, `config/`, `README.md`, `LICENSE`.
- The `postinstall` hook runs `node bin/install.js` — that's what wires the swarm into `~/.kiro` on `npm install -g`.
- Tag GitHub releases to match npm versions so the two channels stay in sync.
