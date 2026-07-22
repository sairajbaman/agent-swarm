#!/bin/bash
# install.sh — Kiro Agent Swarm Installer for Mac/Linux
# Usage: ./install.sh
# Or remote: curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/kiro-agent-swarm/main/install.sh | bash

set -e

echo ""
echo "🐝 Kiro Agent Swarm — Installer"
echo "================================"
echo ""

# Check if Kiro CLI is installed
KIRO_PATH="$HOME/.kiro"
if [ ! -d "$KIRO_PATH" ]; then
    echo "❌ Kiro CLI not found at $KIRO_PATH"
    echo "   Install Kiro CLI first: https://kiro.dev"
    exit 1
fi

echo "✓ Kiro CLI found at $KIRO_PATH"

# Create directories
AGENTS_DIR="$KIRO_PATH/agents"
PROMPTS_DIR="$AGENTS_DIR/prompts"
MEMORY_DIR="$AGENTS_DIR/memory"
BLACKBOARD_DIR="$MEMORY_DIR/blackboard"

mkdir -p "$PROMPTS_DIR" "$BLACKBOARD_DIR"
echo "✓ Created directories"

# Determine source directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Copy agent configs
echo "  Installing agent configs..."
cp "$SCRIPT_DIR"/agents/*.json "$AGENTS_DIR/"
echo "✓ Installed 9 agent configurations"

# Copy prompts
echo "  Installing system prompts..."
cp "$SCRIPT_DIR"/prompts/*.md "$PROMPTS_DIR/"
echo "✓ Installed 9 system prompts"

# Copy memory (don't overwrite existing)
echo "  Installing memory system..."
[ ! -f "$MEMORY_DIR/patterns.json" ] && cp "$SCRIPT_DIR/memory/patterns.json" "$MEMORY_DIR/"
[ ! -f "$MEMORY_DIR/reflections.json" ] && cp "$SCRIPT_DIR/memory/reflections.json" "$MEMORY_DIR/"

# Copy blackboard (don't overwrite existing)
for f in "$SCRIPT_DIR"/memory/blackboard/*; do
    dest="$BLACKBOARD_DIR/$(basename "$f")"
    [ ! -f "$dest" ] && cp "$f" "$dest"
done
echo "✓ Installed memory & blackboard system"

# Set as default agent
echo "  Setting swarm-orchestrator as default agent..."
if command -v kiro-cli &> /dev/null; then
    kiro-cli agent set-default --name swarm-orchestrator 2>/dev/null || true
    echo "✓ Set swarm-orchestrator as default agent"
else
    echo "⚠ kiro-cli not in PATH. Run manually:"
    echo "  kiro-cli agent set-default --name swarm-orchestrator"
fi

echo ""
echo "═══════════════════════════════════════════════"
echo "🎉 Installation Complete!"
echo "═══════════════════════════════════════════════"
echo ""
echo "The swarm is now your default agent."
echo "Open a new 'kiro-cli chat' session and try:"
echo ""
echo '  "Build a TypeScript utility that validates emails"'
echo ""
echo "Monitor agents: Press Ctrl+G during execution"
echo "Switch back:    kiro-cli agent set-default --name kiro_default"
echo ""
