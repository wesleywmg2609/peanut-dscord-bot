Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Peanut Discord Bot Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install pnpm
Write-Host "Step 1: Installing pnpm globally..." -ForegroundColor Yellow
npm install -g pnpm

# Step 2: Refresh PATH so pnpm is found in this session
Write-Host ""
Write-Host "Step 2: Refreshing PATH..." -ForegroundColor Yellow

$npmGlobalBin = (npm bin -g 2>$null)
if (-not $npmGlobalBin) {
    $npmGlobalBin = "$env:APPDATA\npm"
}

$env:PATH = "$npmGlobalBin;$env:PATH"

$pnpmCommand = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
if (-not $pnpmCommand) {
    $pnpmCommand = Get-Command pnpm -ErrorAction SilentlyContinue
}

if (-not $pnpmCommand) {
    Write-Host "[ERROR] pnpm was not found after installation." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 3: Install dependencies
Write-Host ""
Write-Host "Step 3: Installing bot dependencies..." -ForegroundColor Yellow

& $pnpmCommand.Source install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Dependency installation failed." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 4: Deploy slash commands
Write-Host ""
Write-Host "Step 4: Deploying Discord slash commands..." -ForegroundColor Yellow

& $pnpmCommand.Source deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Slash command deployment failed." -ForegroundColor Red
    Write-Host "Check your .env values: DISCORD_TOKEN, CLIENT_ID, GUILD_ID, COMMAND_DEPLOY_SCOPE" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 5: Start bot
Write-Host ""
Write-Host "Step 5: Setup complete! Starting Discord bot..." -ForegroundColor Yellow

& $pnpmCommand.Source dev