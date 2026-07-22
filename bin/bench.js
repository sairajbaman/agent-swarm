#!/usr/bin/env node
// bin/bench.js — deterministic run recorder + benchmark tracker for the swarm.
//
// Why this exists: the "long-term learning" loop previously relied on the LLM
// remembering to hand-edit patterns.json — unreliable and error-prone. This
// gives the orchestrator a deterministic way to record every run via shell:
//   kiro-swarm bench record --type coding --agents 5 --ms 42000 --passed true --confidence 91 --loops 1
// and to read back real numbers:
//   kiro-swarm bench report
//
// Storage: patterns.json (override the path with the KIRO_PATTERNS env var — used by tests).

const fs = require('fs');
const path = require('path');
const os = require('os');

const MAX_RUNS = 500; // cap raw run history so the file can't grow unbounded

function patternsPath() {
  return process.env.KIRO_PATTERNS
    || path.join(os.homedir(), '.kiro', 'agents', 'memory', 'patterns.json');
}

const DEFAULT_BENCHMARKS = {
  totalRuns: 0,
  avgAgentsPerTask: 0,
  avgConfidence: 0,
  successRate: 0,
  avgExecutionTimeMs: 0,
  reviewLoopsTriggered: 0,
  consensusUsed: 0,
  customAgentsCreated: 0,
  blackboardWrites: 0,
};

function defaultPatterns() {
  return {
    version: 2,
    patterns: [],
    successfulPlans: [],
    failedPlans: [],
    bugPatterns: [],
    architectureTemplates: [],
    promptImprovements: [],
    agentPerformance: {},
    benchmarks: { ...DEFAULT_BENCHMARKS },
    runs: [],
    taskQueue: [],
    lastUpdated: null,
  };
}

function load() {
  const p = patternsPath();
  if (!fs.existsSync(p)) return defaultPatterns();
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    // Preserve the corrupt file for inspection, then start clean rather than crash.
    try { fs.copyFileSync(p, `${p}.corrupt-${Date.now()}`); } catch { /* ignore */ }
    console.warn(`⚠  patterns.json was unreadable (${e.message}); backed it up and reinitialized.`);
    return defaultPatterns();
  }
  const d = defaultPatterns();
  return {
    ...d,
    ...raw,
    benchmarks: { ...d.benchmarks, ...(raw.benchmarks || {}) },
    runs: Array.isArray(raw.runs) ? raw.runs : [],
  };
}

function save(data) {
  const p = patternsPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const tmp = `${p}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, p); // atomic replace so a crash mid-write can't corrupt the file
}

function parseArgs(args) {
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = args[i + 1];
    if (next === undefined || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

const num = (v, def = 0) => (Number.isFinite(Number(v)) ? Number(v) : def);
const bool = (v) => v === true || v === 'true' || v === '1' || v === 'yes';
const round = (n, d = 2) => { const f = 10 ** d; return Math.round(n * f) / f; };
const pct = (v) => `${Math.round((num(v)) * 1000) / 10}%`;
const fmtMs = (ms) => { ms = num(ms); return ms >= 1000 ? `${Math.round(ms / 100) / 10}s` : `${ms}ms`; };

function recompute(data) {
  const runs = data.runs;
  const b = data.benchmarks;
  const n = runs.length;
  if (n === 0) return;
  const sum = (f) => runs.reduce((s, r) => s + num(r[f]), 0);
  b.avgAgentsPerTask = round(sum('agents') / n);
  b.avgExecutionTimeMs = Math.round(sum('ms') / n);
  const conf = runs.filter((r) => Number.isFinite(Number(r.confidence)));
  b.avgConfidence = conf.length ? round(conf.reduce((s, r) => s + Number(r.confidence), 0) / conf.length) : 0;
  b.successRate = round(runs.filter((r) => r.passed).length / n, 3);
  b.reviewLoopsTriggered = sum('loops');
  b.consensusUsed = runs.filter((r) => r.consensus).length;
  b.customAgentsCreated = sum('customAgents');
}

function record(args) {
  const a = parseArgs(args);
  const data = load();
  const run = {
    ts: new Date().toISOString(),
    type: a.type || a.taskType || 'unknown',
    agents: num(a.agents),
    ms: num(a.ms),
    passed: a.passed === undefined ? true : bool(a.passed),
    confidence: a.confidence !== undefined ? num(a.confidence) : null,
    loops: num(a.loops),
    consensus: bool(a.consensus),
    customAgents: num(a.customAgents),
    note: typeof a.note === 'string' ? a.note : '',
  };
  data.runs.push(run);
  if (data.runs.length > MAX_RUNS) data.runs = data.runs.slice(-MAX_RUNS);
  data.benchmarks.totalRuns = num(data.benchmarks.totalRuns) + 1;
  recompute(data);
  data.lastUpdated = run.ts;
  save(data);
  const b = data.benchmarks;
  console.log(`✓ Recorded run: ${run.type} | ${run.agents} agents | ${fmtMs(run.ms)} | ${run.passed ? 'PASS' : 'FAIL'}`);
  console.log(`  totals → runs:${b.totalRuns} successRate:${pct(b.successRate)} avgAgents:${b.avgAgentsPerTask} avgTime:${fmtMs(b.avgExecutionTimeMs)}`);
}

function report() {
  const data = load();
  const b = data.benchmarks;
  console.log('');
  console.log('🐝 Swarm Benchmarks');
  console.log(`   source: ${patternsPath()}`);
  console.log('─'.repeat(50));
  console.log(`  Total runs:            ${b.totalRuns}`);
  console.log(`  Success rate:          ${pct(b.successRate)}`);
  console.log(`  Avg agents / task:     ${b.avgAgentsPerTask}`);
  console.log(`  Avg confidence:        ${b.avgConfidence || 0}%`);
  console.log(`  Avg execution time:    ${fmtMs(b.avgExecutionTimeMs)}`);
  console.log(`  Review loops fired:    ${b.reviewLoopsTriggered}`);
  console.log(`  Consensus used:        ${b.consensusUsed}`);
  console.log(`  Custom agents created: ${b.customAgentsCreated}`);
  console.log(`  (aggregates over last ${data.runs.length} stored run(s))`);
  const recent = data.runs.slice(-5).reverse();
  if (recent.length) {
    console.log('');
    console.log('  Recent runs:');
    recent.forEach((r) => {
      const when = String(r.ts).replace('T', ' ').slice(0, 19);
      const conf = r.confidence != null ? `  ${r.confidence}%` : '';
      console.log(`   • ${when}  ${r.passed ? 'PASS' : 'FAIL'}  ${r.type}  ${r.agents} agents  ${fmtMs(r.ms)}${conf}`);
    });
  }
  console.log('');
}

function reset() {
  const data = load();
  data.benchmarks = { ...DEFAULT_BENCHMARKS };
  data.runs = [];
  data.lastUpdated = new Date().toISOString();
  save(data);
  console.log('✓ Benchmarks reset to zero.');
}

function help() {
  console.log(`
🐝 kiro-swarm bench — measure and track swarm performance

Usage:
  kiro-swarm bench record [flags]   Record one swarm run
  kiro-swarm bench report           Show benchmark summary + recent runs
  kiro-swarm bench reset            Zero out benchmarks

record flags:
  --type <string>       task type (coding, research, audit, ...)
  --agents <n>          number of agents spawned
  --ms <n>              wall-clock execution time (milliseconds)
  --passed <bool>       did it succeed / tests pass (default true)
  --confidence <n>      final confidence score 0-100
  --loops <n>           review loops triggered
  --consensus <bool>    was the consensus engine used
  --customAgents <n>    number of custom specialists created
  --note <string>       freeform note

Storage: patterns.json (override with the KIRO_PATTERNS env var).
`);
}

function main(args) {
  const cmd = (args[0] || 'report').toLowerCase();
  const rest = args.slice(1);
  switch (cmd) {
    case 'record': return record(rest);
    case 'report': return report();
    case 'reset': return reset();
    case 'help': case '--help': case '-h': return help();
    default:
      console.log(`Unknown bench command: ${cmd}`);
      help();
      process.exitCode = 1;
      return undefined;
  }
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = { main, load, save, record, report, reset, recompute, parseArgs, patternsPath, defaultPatterns };
