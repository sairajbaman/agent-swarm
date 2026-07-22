#!/usr/bin/env node
// bin/cli.js — `kiro-swarm` CLI command

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const command = process.argv[2] || 'status';
const HOME = os.homedir();
const AGENTS_DIR = path.join(HOME, '.kiro', 'agents');

switch (command) {
  case 'install':
    require('./install.js');
    break;

  case 'uninstall':
    uninstall();
    break;

  case 'status':
    status();
    break;

  case 'help':
  case '--help':
  case '-h':
    help();
    break;

  default:
    console.log(`Unknown command: ${command}`);
    help();
    process.exit(1);
}

function uninstall() {
  console.log('');
  console.log('🐝 Removing Kiro Agent Swarm...');
  console.log('');

  // Remove swarm agent configs
  const agentFiles = fs.readdirSync(AGENTS_DIR).filter(f => f.startsWith('swarm-') && f.endsWith('.json'));
  agentFiles.forEach(file => {
    fs.unlinkSync(path.join(AGENTS_DIR, file));
  });
  console.log(`✓ Removed ${agentFiles.length} agent configs`);

  // Remove prompts
  const promptsDir = path.join(AGENTS_DIR, 'prompts');
  if (fs.existsSync(promptsDir)) {
    const promptFiles = ['orchestrator.md', 'coder.md', 'researcher.md', 'architect.md', 'reviewer.md', 'critic.md', 'integrator.md', 'planner.md', 'writer.md'];
    promptFiles.forEach(file => {
      const p = path.join(promptsDir, file);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });
    console.log('✓ Removed system prompts');
  }

  // Restore default agent
  try {
    execSync('kiro-cli agent set-default --name kiro_default', { stdio: 'pipe' });
    console.log('✓ Restored kiro_default as default agent');
  } catch {
    console.log('⚠️  Run manually: kiro-cli agent set-default --name kiro_default');
  }

  console.log('');
  console.log('Uninstalled. Memory files preserved at ~/.kiro/agents/memory/');
  console.log('');
}

function status() {
  console.log('');
  console.log('🐝 Kiro Agent Swarm — Status');
  console.log('');

  const kiroExists = fs.existsSync(path.join(HOME, '.kiro'));
  const orchestratorExists = fs.existsSync(path.join(AGENTS_DIR, 'swarm-orchestrator.json'));
  const promptsExist = fs.existsSync(path.join(AGENTS_DIR, 'prompts', 'orchestrator.md'));
  const memoryExists = fs.existsSync(path.join(AGENTS_DIR, 'memory', 'patterns.json'));
  const blackboardExists = fs.existsSync(path.join(AGENTS_DIR, 'memory', 'blackboard'));

  const agentCount = fs.existsSync(AGENTS_DIR)
    ? fs.readdirSync(AGENTS_DIR).filter(f => f.startsWith('swarm-') && f.endsWith('.json')).length
    : 0;

  console.log(`  Kiro CLI:        ${kiroExists ? '✓ Found' : '✗ Not found'}`);
  console.log(`  Orchestrator:    ${orchestratorExists ? '✓ Installed' : '✗ Missing'}`);
  console.log(`  Agent configs:   ${agentCount}/9 installed`);
  console.log(`  System prompts:  ${promptsExist ? '✓ Installed' : '✗ Missing'}`);
  console.log(`  Memory system:   ${memoryExists ? '✓ Active' : '✗ Missing'}`);
  console.log(`  Blackboard:      ${blackboardExists ? '✓ Active' : '✗ Missing'}`);
  console.log('');

  if (orchestratorExists && agentCount === 9) {
    console.log('  Status: 🟢 ACTIVE — Swarm is your default agent');
  } else if (agentCount > 0) {
    console.log('  Status: 🟡 PARTIAL — Run "kiro-swarm install" to complete');
  } else {
    console.log('  Status: 🔴 NOT INSTALLED — Run "kiro-swarm install"');
  }
  console.log('');
}

function help() {
  console.log('');
  console.log('🐝 kiro-swarm — Agent Swarm for Kiro CLI');
  console.log('');
  console.log('Usage:');
  console.log('  kiro-swarm install     Install/reinstall the swarm');
  console.log('  kiro-swarm uninstall   Remove swarm, restore default agent');
  console.log('  kiro-swarm status      Check installation status');
  console.log('  kiro-swarm help        Show this help');
  console.log('');
  console.log('After install, open a new kiro-cli chat session.');
  console.log('The swarm activates automatically on every complex task.');
  console.log('');
}
