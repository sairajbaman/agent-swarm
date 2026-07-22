#!/usr/bin/env node
// bin/install.js — Auto-installs agent swarm after `npm install -g kiro-agent-swarm`

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME = os.homedir();
const KIRO_DIR = path.join(HOME, '.kiro');
const AGENTS_DIR = path.join(KIRO_DIR, 'agents');
const PROMPTS_DIR = path.join(AGENTS_DIR, 'prompts');
const MEMORY_DIR = path.join(AGENTS_DIR, 'memory');
const BLACKBOARD_DIR = path.join(MEMORY_DIR, 'blackboard');

// Source directories (relative to this script)
const PKG_ROOT = path.join(__dirname, '..');
const SRC_AGENTS = path.join(PKG_ROOT, 'agents');
const SRC_PROMPTS = path.join(PKG_ROOT, 'prompts');
const SRC_MEMORY = path.join(PKG_ROOT, 'memory');

console.log('');
console.log('🐝 Kiro Agent Swarm — Installing...');
console.log('');

// Check Kiro CLI exists
if (!fs.existsSync(KIRO_DIR)) {
  console.log('⚠️  Kiro CLI not found at', KIRO_DIR);
  console.log('   Install Kiro CLI first: https://kiro.dev');
  console.log('   Then run: kiro-swarm install');
  console.log('');
  process.exit(0); // Don't fail npm install
}

// Create directories
[PROMPTS_DIR, BLACKBOARD_DIR].forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
});

// Copy agent configs
const agentFiles = fs.readdirSync(SRC_AGENTS).filter(f => f.endsWith('.json'));
agentFiles.forEach(file => {
  fs.copyFileSync(
    path.join(SRC_AGENTS, file),
    path.join(AGENTS_DIR, file)
  );
});
console.log(`✓ Installed ${agentFiles.length} agent configurations`);

// Copy prompts
const promptFiles = fs.readdirSync(SRC_PROMPTS).filter(f => f.endsWith('.md'));
promptFiles.forEach(file => {
  fs.copyFileSync(
    path.join(SRC_PROMPTS, file),
    path.join(PROMPTS_DIR, file)
  );
});
console.log(`✓ Installed ${promptFiles.length} system prompts`);

// Copy memory files (don't overwrite existing — preserve learned patterns)
const memoryFiles = ['patterns.json', 'reflections.json'];
memoryFiles.forEach(file => {
  const dest = path.join(MEMORY_DIR, file);
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(path.join(SRC_MEMORY, file), dest);
  }
});

// Copy blackboard files (don't overwrite existing)
const blackboardSrc = path.join(SRC_MEMORY, 'blackboard');
if (fs.existsSync(blackboardSrc)) {
  fs.readdirSync(blackboardSrc).forEach(file => {
    const dest = path.join(BLACKBOARD_DIR, file);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(path.join(blackboardSrc, file), dest);
    }
  });
}
console.log('✓ Installed memory & blackboard system');

// Try to set as default agent
try {
  const { execSync } = require('child_process');
  execSync('kiro-cli agent set-default --name swarm-orchestrator', { stdio: 'pipe' });
  console.log('✓ Set swarm-orchestrator as default agent');
} catch {
  console.log('⚠️  Run manually: kiro-cli agent set-default --name swarm-orchestrator');
}

console.log('');
console.log('🎉 Kiro Agent Swarm installed!');
console.log('');
console.log('Open a new "kiro-cli chat" and type any complex task.');
console.log('The swarm will activate automatically.');
console.log('');
console.log('Monitor agents: Ctrl+G');
console.log('Uninstall:      kiro-swarm uninstall');
console.log('');
