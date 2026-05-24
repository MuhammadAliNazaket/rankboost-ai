param(
  [string]$ProjectName = "rankboost-ai",
  [string]$ProductionBranch = "main"
)

$ErrorActionPreference = "Stop"

function Assert-LastExitCode([string]$Step) {
  if ($LASTEXITCODE -ne 0) {
    throw "$Step failed with exit code $LASTEXITCODE"
  }
}

function Ensure-Env([string]$Name) {
  if (-not (Test-Path "Env:$Name")) {
    throw "Missing required environment variable: $Name"
  }
}

$repoRoot = Split-Path -Parent $PSScriptRoot

if (-not (Test-Path "Env:CLOUDFLARE_API_TOKEN")) {
  $tokenFile = Join-Path $repoRoot ".cloudflare_api_token"
  if (Test-Path $tokenFile) {
    $env:CLOUDFLARE_API_TOKEN = (Get-Content -Raw $tokenFile).Trim()
  }
}

Ensure-Env "CLOUDFLARE_API_TOKEN"

$tokenLen = ($env:CLOUDFLARE_API_TOKEN | Measure-Object -Character).Characters
if ($tokenLen -lt 30) {
  throw "CLOUDFLARE_API_TOKEN looks too short ($tokenLen chars). Paste the token value only (no quotes, no 'Bearer ' prefix)."
}

$tmp = Join-Path $repoRoot ".tmp"
$pmHome = Join-Path $tmp "pm-home"
$corepackHome = Join-Path $tmp "corepack"
$npmCache = Join-Path $tmp "npm-cache"

New-Item -ItemType Directory -Force -Path $pmHome, $corepackHome, $npmCache | Out-Null

# Keep package-manager state inside the repo so this works even when the real user profile is locked down.
$env:USERPROFILE = $pmHome
$env:HOMEDRIVE = (Split-Path $pmHome -Qualifier)
$env:HOMEPATH = $pmHome.Substring($env:HOMEDRIVE.Length)
$env:APPDATA = Join-Path $pmHome "AppData\Roaming"
$env:LOCALAPPDATA = Join-Path $pmHome "AppData\Local"
New-Item -ItemType Directory -Force -Path $env:APPDATA, $env:LOCALAPPDATA | Out-Null
$env:COREPACK_HOME = $corepackHome
$env:NPM_CONFIG_CACHE = $npmCache

$pnpmGlobalBin = Join-Path $env:LOCALAPPDATA "pnpm\bin"
New-Item -ItemType Directory -Force -Path $pnpmGlobalBin | Out-Null
$env:PATH = "$pnpmGlobalBin;$env:PATH"
$env:COREPACK_ENABLE_AUTO_PIN = "0"

Write-Host "Installing Wrangler (via pnpm global) ..."
corepack pnpm add -g wrangler | Out-Host
Assert-LastExitCode "Install wrangler"
corepack pnpm approve-builds --all | Out-Host
Assert-LastExitCode "Approve wrangler builds"

$frontendDir = Join-Path $repoRoot "frontend"
if (-not (Test-Path $frontendDir)) {
  throw "frontend directory not found at: $frontendDir"
}

Push-Location $frontendDir
try {
  Write-Host "Installing frontend deps (pnpm install) ..."
  corepack pnpm install | Out-Host
  Assert-LastExitCode "Install frontend deps"
  corepack pnpm approve-builds --all | Out-Host
  Assert-LastExitCode "Approve frontend builds"

  Write-Host "Building frontend (pnpm run build) ..."
  $env:DISABLE_ESLINT_PLUGIN = "true"
  corepack pnpm run build | Out-Host
  Assert-LastExitCode "Build frontend"

  $buildDir = Join-Path $frontendDir "build"
  if (-not (Test-Path $buildDir)) {
    throw "Build output directory not found: $buildDir"
  }

  Write-Host "Ensuring Pages project exists ($ProjectName) ..."
  $projectsJson = wrangler.cmd pages project list --json
  $projects = $projectsJson | ConvertFrom-Json
  $exists = $false
  foreach ($p in $projects) {
    if ($p.name -eq $ProjectName) { $exists = $true; break }
  }
  if (-not $exists) {
    wrangler.cmd pages project create $ProjectName --production-branch $ProductionBranch | Out-Host
  }

  Write-Host "Deploying build/ to Cloudflare Pages ($ProjectName) ..."
  $deployed = $false
  for ($attempt = 1; $attempt -le 2; $attempt++) {
    try {
      wrangler.cmd pages deploy $buildDir --project-name $ProjectName --branch $ProductionBranch | Out-Host
      $deployed = $true
      break
    } catch {
      if ($attempt -eq 2) { throw }
      Write-Host "Deploy attempt $attempt failed, retrying in 5s..."
      Start-Sleep -Seconds 5
    }
  }

  Write-Host "Latest deployments:"
  wrangler.cmd pages deployment list --project-name $ProjectName | Out-Host

  $prodUrl = "https://$ProjectName.pages.dev/"
  Write-Host "Verifying deployment URL: $prodUrl"
  $ok = $false
  for ($i = 1; $i -le 12; $i++) {
    try {
      $resp = Invoke-WebRequest -Uri $prodUrl -Method GET -UseBasicParsing -TimeoutSec 30
      Write-Host "OK ($($resp.StatusCode))"
      $ok = $true
      break
    } catch {
      Write-Host "Attempt $i failed, retrying in 5s..."
      Start-Sleep -Seconds 5
    }
  }
  if (-not $ok) {
    throw "Deployment verification failed: $prodUrl did not return a successful response."
  }
} finally {
  Pop-Location
}
