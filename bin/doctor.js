#!/usr/bin/env node
// bin/doctor.js — health check for the installed swarm.
// Answers "is this actually working?" with a clear pass/warn/fail report and fixes.

const fs = require('fs');
const path = require('path');
const os = require('os');

const EXPECTED_AGENTS = [
  'swarm-orchestrator', 'swarm-researcher', 'swarm-coder', 'swarm-architect',
  'swarm-reviewer', 'swarm-critic', 'swarm-integrator', 'swarm-writer', 'swarm-planner',
];
const EXPECTED_PROMPTS = [
  'orchestrator.md', 'coder.md', 'researcher.md', 'architect.md', 'reviewer.md',
  'critic.md', 'integrator.md', 'planner.md', 'writer.md',
];

function main() {
  const HOME = os.homedir();
  const AGENTS = path.join(HOME, '.kiro', 'agents');
  const PROMPTS = path.join(AGENTS, 'prompts');
  const checks = [];
  const add = (label, status, detail, fix) => checks.push({ label, status, detail, fix });

  // 1. Node version
  const major = parseInt(process.versions.node.split('.')[0], 10);
  add('Node.js >= 18', major >= 18 ? 'ok' : 'fail', `v${process.versions.node}`, 'Upgrade Node.js to v18+');

  // 2. ~/.kiro present
  add('Kiro directory', fs.existsSync(path.join(HOME, '.kiro')) ? 'ok' : 'fail',
    path.join(HOME, '.kiro'), 'Install Kiro CLI first: https://kiro.dev');

  // 3. Agent configs
  let presentAgents = [];
  try { presentAgents = fs.readdirSync(AGENTS).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')); } catch { /* none */ }
  const missingAgents = EXPECTED_AGENTS.filter((a) => !presentAgents.includes(a));
  add('Agent configs (9)', missingAgents.length === 0 ? 'ok' : 'fail',
    `${EXPECTED_AGENTS.length - missingAgents.length}/9 present${missingAgents.length ? ` — missing: ${missingAgents.join(', ')}` : ''}`,
    'Run: kiro-swarm install');

  // 4. Orchestrator wiring (the critical single-source-of-truth check)
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(AGENTS, 'swarm-orchestrator.json'), 'utf8'));
    if (cfg.systemPrompt && /orchestrator\.md$/.test(cfg.systemPrompt)) {
      add('Orchestrator wiring', 'ok', `systemPrompt → ${cfg.systemPrompt}`);
    } else if (cfg.prompt) {
      add('Orchestrator wiring', 'warn', 'uses inline prompt (older layout)', 'Reinstall to switch to systemPrompt: kiro-swarm install');
    } else {
      add('Orchestrator wiring', 'fail', 'no systemPrompt or prompt', 'Run: kiro-swarm install');
    }
  } catch {
    add('Orchestrator wiring', 'fail', 'cannot read swarm-orchestrator.json', 'Run: kiro-swarm install');
  }

  // 5. System prompts
  let presentPrompts = [];
  try { presentPrompts = fs.readdirSync(PROMPTS).filter((f) => f.endsWith('.md')); } catch { /* none */ }
  const missingPrompts = EXPECTED_PROMPTS.filter((p) => !presentPrompts.includes(p));
  add('System prompts (9)', missingPrompts.length === 0 ? 'ok' : 'fail',
    `${EXPECTED_PROMPTS.length - missingPrompts.length}/9 present${missingPrompts.length ? ` — missing: ${missingPrompts.join(', ')}` : ''}`,
    'Run: kiro-swarm install');

  // 6. Model routing config
  const routingPath = path.join(AGENTS, 'config', 'model-routing.json');
  if (fs.existsSync(routingPath)) {
    try {
      const r = JSON.parse(fs.readFileSync(routingPath, 'utf8'));
      const configured = Object.values(r.tiers || {}).filter(Boolean).length;
      if (configured > 0) add('Model routing', 'ok', `${configured} tier(s) configured`);
      else add('Model routing', 'warn', 'all tiers null (inheriting default model)',
        'Optional speedup: set model IDs in ~/.kiro/agents/config/model-routing.json');
    } catch {
      add('Model routing', 'warn', 'invalid JSON', 'Fix or reinstall: kiro-swarm install');
    }
  } else {
    add('Model routing', 'warn', 'config missing', 'Run: kiro-swarm install');
  }

  // 7. Bench recorder present
  const benchPath = path.join(AGENTS, 'bin', 'bench.js');
  add('Benchmark recorder', fs.existsSync(benchPath) ? 'ok' : 'warn', benchPath, 'Run: kiro-swarm install');

  // 8. Memory file valid
  const patternsPath = path.join(AGENTS, 'memory', 'patterns.json');
  if (fs.existsSync(patternsPath)) {
    try {
      const p = JSON.parse(fs.readFileSync(patternsPath, 'utf8'));
      add('Memory (patterns.json)', 'ok', `valid — ${(p.benchmarks && p.benchmarks.totalRuns) || 0} run(s) recorded`);
    } catch {
      add('Memory (patterns.json)', 'warn', 'invalid JSON (bench auto-backs-up + reinits)');
    }
  } else {
    add('Memory (patterns.json)', 'warn', 'missing (created on first run)', 'Run: kiro-swarm install');
  }

  // 9. Bench self-test — actually record+read against a temp file
  if (fs.existsSync(benchPath)) {
    try {
      const { execFileSync } = require('child_process');
      const tmp = path.join(os.tmpdir(), `kiro-swarm-doctor-${process.pid}.json`);
      execFileSync(process.execPath, [benchPath, 'record', '--type', 'doctor-selftest', '--agents', '1', '--ms', '1', '--passed', 'true'],
        { env: { ...process.env, KIRO_PATTERNS: tmp }, stdio: 'pipe' });
      const ok = fs.existsSync(tmp) && JSON.parse(fs.readFileSync(tmp, 'utf8')).benchmarks.totalRuns === 1;
      try { fs.unlinkSync(tmp); } catch { /* ignore */ }
      add('Bench self-test', ok ? 'ok' : 'warn', ok ? 'record + read works' : 'unexpected result');
    } catch (e) {
      add('Bench self-test', 'warn', `failed: ${e.message}`);
    }
  } else {
    add('Bench self-test', 'warn', 'skipped (recorder missing)', 'Run: kiro-swarm install');
  }

  // Render
  const icon = (s) => (s === 'ok' ? '\u2713' : s === 'warn' ? '\u26a0' : '\u2717');
  console.log('');
  console.log('🐝 kiro-swarm doctor');
  console.log('─'.repeat(54));
  checks.forEach((c) => {
    console.log(`  ${icon(c.status)} ${c.label.padEnd(24)} ${c.detail || ''}`);
    if (c.status !== 'ok' && c.fix) console.log(`      ↳ ${c.fix}`);
  });
  console.log('');

  const fails = checks.filter((c) => c.status === 'fail').length;
  const warns = checks.filter((c) => c.status === 'warn').length;
  if (fails > 0) {
    console.log(`  🔴 ${fails} problem(s) found — fix the ✗ items above (usually: kiro-swarm install).`);
    process.exitCode = 1;
  } else if (warns > 0) {
    console.log(`  🟡 Healthy, with ${warns} optional improvement(s) noted above.`);
  } else {
    console.log('  🟢 All checks passed — the swarm is healthy and ready.');
  }
  console.log('');
  return { fails, warns, checks };
}

if (require.main === module) main();

module.exports = { main };
