$ErrorActionPreference = "Stop"

$ToolDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigPath = Join-Path $ToolDir "config.json"
$ExampleConfigPath = Join-Path $ToolDir "config.example.json"

function Read-JsonFile($Path) {
  return Get-Content $Path -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Require-Command($Name) {
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $cmd) {
    throw "Missing command: $Name. Please install it and make sure it is available in PATH."
  }
}

Write-Host "Apex ranked leaderboard updater" -ForegroundColor Cyan
Write-Host "Tool directory: $ToolDir"

if (-not (Test-Path $ConfigPath)) {
  Copy-Item $ExampleConfigPath $ConfigPath
  Write-Host "Created config.json from config.example.json." -ForegroundColor Yellow
  Write-Host "Please edit config.json first, then run this script again." -ForegroundColor Yellow
  exit 1
}

$config = Read-JsonFile $ConfigPath
if ($config.serverHost -eq "YOUR_SERVER_IP" -or [string]::IsNullOrWhiteSpace($config.serverHost)) {
  Write-Host "Please set serverHost in config.json first." -ForegroundColor Yellow
  exit 1
}

Require-Command "node"
Require-Command "npm"
Require-Command "scp"
Require-Command "ssh"

Push-Location $ToolDir
try {
  if (-not (Test-Path (Join-Path $ToolDir "node_modules"))) {
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
    npx playwright install chromium
  }

  Write-Host "Opening browser and saving leaderboard HTML..." -ForegroundColor Cyan
  npm run save

  $localHtmlName = if ($config.localHtml) { $config.localHtml } else { "leaderboard.html" }
  $localHtml = Join-Path $ToolDir $localHtmlName
  if (-not (Test-Path $localHtml)) {
    throw "Local HTML not found: $localHtml"
  }

  $serverPort = if ($config.serverPort) { [int]$config.serverPort } else { 22 }
  $server = "$($config.serverUser)@$($config.serverHost)"

  Write-Host "Uploading HTML to server..." -ForegroundColor Cyan
  scp -P $serverPort $localHtml "$server`:$($config.remoteHtmlPath)"

  if ($config.autoPublish -eq $false) {
    Write-Host "Upload completed. autoPublish is false, skipping remote publish." -ForegroundColor Green
    exit 0
  }

  $remoteProjectPath = $config.remoteProjectPath
  $remoteHtmlPath = $config.remoteHtmlPath
  $remoteCommand = "cd $remoteProjectPath && node server/scripts/import-ranked-leaderboard.js $remoteHtmlPath && npm --prefix client run build && git add server/data/ranked-leaderboard.json && (git commit -m 'chore: update ranked leaderboard data' || true) && git push origin main && pm2 restart apex-server --update-env"

  Write-Host "Importing and publishing on server..." -ForegroundColor Cyan
  ssh -p $serverPort $server $remoteCommand

  Write-Host "Done. Open /leaderboard to check the result." -ForegroundColor Green
}
finally {
  Pop-Location
}
