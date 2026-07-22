# uninstall.ps1 — Remove Kiro Agent Swarm
# Restores kiro_default as the default agent

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🐝 Kiro Agent Swarm — Uninstaller" -ForegroundColor Cyan
Write-Host ""

$agentsDir = "$HOME\.kiro\agents"

# Remove swarm agent configs
Remove-Item "$agentsDir\swarm-*.json" -Force -ErrorAction SilentlyContinue
Write-Host "✓ Removed swarm agent configs" -ForegroundColor Green

# Remove prompts (but keep directory)
Remove-Item "$agentsDir\prompts\orchestrator.md" -Force -ErrorAction SilentlyContinue
Remove-Item "$agentsDir\prompts\coder.md" -Force -ErrorAction SilentlyContinue
Remove-Item "$agentsDir\prompts\researcher.md" -Force -ErrorAction SilentlyContinue
Remove-Item "$agentsDir\prompts\architect.md" -Force -ErrorAction SilentlyContinue
Remove-Item "$agentsDir\prompts\reviewer.md" -Force -ErrorAction SilentlyContinue
Remove-Item "$agentsDir\prompts\critic.md" -Force -ErrorAction SilentlyContinue
Remove-Item "$agentsDir\prompts\integrator.md" -Force -ErrorAction SilentlyContinue
Remove-Item "$agentsDir\prompts\planner.md" -Force -ErrorAction SilentlyContinue
Remove-Item "$agentsDir\prompts\writer.md" -Force -ErrorAction SilentlyContinue
Write-Host "✓ Removed system prompts" -ForegroundColor Green

# Restore default agent
try {
    kiro-cli agent set-default --name kiro_default 2>&1 | Out-Null
    Write-Host "✓ Restored kiro_default as default agent" -ForegroundColor Green
} catch {
    Write-Host "⚠ Run manually: kiro-cli agent set-default --name kiro_default" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Uninstalled. Kiro CLI is back to normal." -ForegroundColor White
Write-Host "Memory files preserved at: $agentsDir\memory\" -ForegroundColor Gray
Write-Host ""
