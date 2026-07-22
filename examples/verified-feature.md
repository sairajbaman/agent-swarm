# Example: Verified Feature (the adoption hook)

The swarm's real value isn't just writing code — it's **proving the code works** before handing it back. This is a real run (a `slugify` utility), showing the fast-path decision, the review loop, and verification surfaced as the headline result.

---

## The prompt

```
Create a JavaScript slugify module with tests. It should turn arbitrary
strings into URL-safe slugs.
```

## Fast-path decision

The orchestrator classifies this: **one small module + its tests, single language, no research needed.** That's not a 6-agent job. It picks the small-task pattern:

```
🐝 Spawning 2 agents (coder, reviewer) — small single-module task.
```

No planner, no researcher, no integrator. Just build + verify. (A "what is a slug?" question would get **0 agents** — answered directly.)

## Pipeline

```
implement (swarm-coder)
    └──▶ review (swarm-reviewer)   ← actually runs `node --test`
```

## What each agent did

**coder** wrote two files:
- `slugify.js` — lowercase, trim, collapse non-alphanumeric runs to a single hyphen, strip edge hyphens, empty string for null/empty input.
- `slugify.test.js` — 6 tests using Node's built-in runner (`node:test`).

**reviewer** didn't just read the code — it **executed the tests**:

```
$ node --test        (exit code 0)
  tests 6
  pass 6
  fail 0
```

It also flagged two non-blocking notes: a redundant `.replace()` (dead code) and ASCII-only handling (drops accented characters instead of transliterating). Verdict: **PASS**.

## What the user sees (verification is the headline)

> ✓ **Build clean, 6/6 tests passing** (`node --test`, exit 0).
>
> Created `slugify.js` + `slugify.test.js`. Handles spaces, special characters, repeated separators, and empty/null input. Two optional notes: one redundant regex line, and it's ASCII-only (drops accents) — fine for URL slugs, flag if you need i18n.

The trust signal — *"6/6 tests passing"* — leads the response. The code was **proven**, not just generated.

---

## Why this drives daily adoption

- **Small task → small team.** No swarm overhead for a one-module job; it stays fast.
- **Verification, not vibes.** "It passes the tests" beats "here's some code that looks right."
- **Honest limits.** The reviewer surfaces real caveats (ASCII-only) instead of pretending the code is perfect.

Run `kiro-swarm bench report` afterward and this run is recorded — success rate, agents used, time — so the swarm right-sizes future teams from real data.
