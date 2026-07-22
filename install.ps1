# install.ps1 — Kiro Agent Swarm Installer for Windows
# Usage: .\install.ps1
# Or remote: irm https://raw.githubusercontent.com/sairajbaman/agent-swarm/main/install.ps1 | iex

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🐝 Kiro Agent Swarm — Installer" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Kiro CLI is installed
$kiroPath = "$HOME\.kiro"
if (-not (Test-Path $kiroPath)) {
    Write-Host "❌ Kiro CLI not found at $kiroPath" -ForegroundColor Red
    Write-Host "   Install Kiro CLI first: https://kiro.dev" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Kiro CLI found at $kiroPath" -ForegroundColor Green

# Create directories
$agentsDir = "$kiroPath\agents"
$promptsDir = "$agentsDir\prompts"
$memoryDir = "$agentsDir\memory"
$blackboardDir = "$memoryDir\blackboard"

New-Item -ItemType Directory -Path $promptsDir -Force | Out-Null
New-Item -ItemType Directory -Path $blackboardDir -Force | Out-Null

Write-Host "✓ Created directories" -ForegroundColor Green

# Determine source directory
$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }

# Copy agent configs
Write-Host "  Installing agent configs..." -ForegroundColor Gray
Copy-Item -Path "$scriptDir\agents\*" -Destination $agentsDir -Force
Write-Host "✓ Installed 9 agent configurations" -ForegroundColor Green

# Copy prompts
Write-Host "  Installing system prompts..." -ForegroundColor Gray
Copy-Item -Path "$scriptDir\prompts\*" -Destination $promptsDir -Force
Write-Host "✓ Installed 9 system prompts" -ForegroundColor Green

# Copy memory (don't overwrite existing patterns)
Write-Host "  Installing memory system..." -ForegroundColor Gray
if (-not (Test-Path "$memoryDir\patterns.json")) {
    Copy-Item -Path "$scriptDir\memory\patterns.json" -Destination $memoryDir -Force
}
if (-not (Test-Path "$memoryDir\reflections.json")) {
    Copy-Item -Path "$scriptDir\memory\reflections.json" -Destination $memoryDir -Force
}

# Copy blackboard files (don't overwrite existing)
Get-ChildItem "$scriptDir\memory\blackboard\*" | ForEach-Object {
    $dest = "$blackboardDir\$($_.Name)"
    if (-not (Test-Path $dest)) {
        Copy-Item $_.FullName $dest
    }
}
Write-Host "✓ Installed memory & blackboard system" -ForegroundColor Green

# Set as default agent
Write-Host "  Setting swarm-orchestrator as default agent..." -ForegroundColor Gray
try {
    $result = kiro-cli agent set-default --name swarm-orchestrator 2>&1
    Write-Host "✓ Set swarm-orchestrator as default agent" -ForegroundColor Green
} catch {
    Write-Host "⚠ Could not set default agent automatically." -ForegroundColor Yellow
    Write-Host "  Run manually: kiro-cli agent set-default --name swarm-orchestrator" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎉 Installation Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "The swarm is now your default agent." -ForegroundColor White
Write-Host "Open a new 'kiro-cli chat' session and try:" -ForegroundColor White
Write-Host ""
Write-Host '  "Build a TypeScript utility that validates emails"' -ForegroundColor Yellow
Write-Host ""
Write-Host "The swarm will automatically:" -ForegroundColor Gray
Write-Host "  1. Analyze task complexity" -ForegroundColor Gray
Write-Host "  2. Spawn 5-7 parallel agents" -ForegroundColor Gray
Write-Host "  3. Research → Code → Review → Integrate" -ForegroundColor Gray
Write-Host "  4. Deliver production-ready code" -ForegroundColor Gray
Write-Host ""
Write-Host "Monitor agents: Press Ctrl+G during execution" -ForegroundColor Gray
Write-Host "Switch back:    kiro-cli agent set-default --name kiro_default" -ForegroundColor Gray
Write-Host ""
