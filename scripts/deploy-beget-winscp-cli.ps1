# scripts/deploy-beget-winscp-cli.ps1
# CLI deploy via WinSCP.com (SFTP sync) + key conversion to PPK via WinSCP /keygen.
# Excludes: config.local.php, uploads/, .ssh/
# Requires: WinSCP.com

$ErrorActionPreference = "Stop"

function Fail($msg) { Write-Host $msg -ForegroundColor Red; exit 1 }

# --- Env ---
$HostName   = $env:BEGET_HOST
$UserName   = $env:BEGET_USER
$Port       = if ($env:BEGET_PORT) { $env:BEGET_PORT } else { "22" }
$RemotePath = if ($env:BEGET_REMOTE_PATH) { $env:BEGET_REMOTE_PATH } else { "~/" }
$HostKey    = $env:BEGET_HOSTKEY
$DryRun     = $env:DRY_RUN

if ([string]::IsNullOrWhiteSpace($HostName)) { Fail "BEGET_HOST is not set." }
if ([string]::IsNullOrWhiteSpace($UserName)) { Fail "BEGET_USER is not set." }
if ($RemotePath -eq "/" -or [string]::IsNullOrWhiteSpace($RemotePath)) { Fail "BEGET_REMOTE_PATH must not be '/' or empty. Use '~/'." }

# Translate "~/" to "." for WinSCP (home dir)
$RemoteDir = $RemotePath.Trim()
if ($RemoteDir -eq "~/" -or $RemoteDir -eq "~") { $RemoteDir = "." }
elseif ($RemoteDir.StartsWith("~/")) { $RemoteDir = $RemoteDir.Substring(2) }
if ($RemoteDir -eq "") { $RemoteDir = "." }

# --- Repo paths ---
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$LocalDir = Join-Path $RepoRoot "deploy\beget\public_html"
if (!(Test-Path $LocalDir)) { Fail "Local directory not found: $LocalDir" }

# --- Find WinSCP.com ---
$WinSCP = $env:WINSCP_COM
if ([string]::IsNullOrWhiteSpace($WinSCP)) {
  $WinScpCandidates = @(
    "$env:ProgramFiles\WinSCP\WinSCP.com",
    "$env:ProgramFiles(x86)\WinSCP\WinSCP.com"
  )
  $WinSCP = $WinScpCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
}
if (-not $WinSCP -or !(Test-Path $WinSCP)) { Fail "WinSCP.com not found. Set WINSCP_COM or install WinSCP." }

# --- Key paths ---
$OpenSshKey = Join-Path $env:USERPROFILE ".ssh\id_ed25519"
if (!(Test-Path $OpenSshKey)) { Fail "OpenSSH private key not found: $OpenSshKey" }

$PpkKey = Join-Path $env:USERPROFILE ".ssh\id_ed25519.ppk"

Write-Host "=== Beget deploy via WinSCP (CLI) ===" -ForegroundColor Cyan
Write-Host "Host: $HostName"
Write-Host "User: $UserName"
Write-Host "Port: $Port"
Write-Host "Remote dir: $RemoteDir"
Write-Host "Local dir: $LocalDir"
Write-Host "WinSCP: $WinSCP"
if ($DryRun) { Write-Host "DRY_RUN=1 (preview only, no delete)" -ForegroundColor Yellow }

# --- Convert key to PPK via WinSCP /keygen ---
Write-Host "Converting OpenSSH key -> PPK: $PpkKey" -ForegroundColor Cyan
& $WinSCP "/keygen" $OpenSshKey ("/output={0}" -f $PpkKey)
if ($LASTEXITCODE -ne 0 -or !(Test-Path $PpkKey)) {
  Fail "Key conversion failed via WinSCP. Check that your OpenSSH key is accessible and not passphrase-protected."
}

# --- Build WinSCP open command ---
$OpenParts = @()
$OpenParts += "open"
$OpenParts += ("sftp://{0}@{1}:{2}/" -f $UserName, $HostName, $Port)
$OpenParts += ("-privatekey=""{0}""" -f $PpkKey)

if ($HostKey) {
  $HostKey = $HostKey -replace "SHA256:", ""
  $OpenParts += ("-hostkey=""{0}""" -f $HostKey)
} else {
  Write-Host "WARNING: BEGET_HOSTKEY not set. First run may ask to trust server key." -ForegroundColor Yellow
}

$OpenCmd = ($OpenParts -join " ")

# File mask: exclude config.local.php, uploads/, .ssh/
$FileMask = "|config.local.php;*/config.local.php;uploads/;*/uploads/;.ssh/;*/.ssh/"

# Sync flags
$SyncFlags = if ($DryRun) { "-preview" } else { "-delete" }

# Create temporary WinSCP script
$tmpScript = Join-Path $env:TEMP ("winscp-deploy-{0}.txt" -f ([guid]::NewGuid().ToString("N")))
$tmpLog    = Join-Path $env:TEMP ("winscp-deploy-{0}.log" -f ([guid]::NewGuid().ToString("N")))

@"
option batch abort
option confirm off
$OpenCmd
cd "$RemoteDir"
synchronize remote "$LocalDir" . $SyncFlags -filemask="$FileMask"
exit
"@ | Set-Content -Path $tmpScript -Encoding ASCII

# Run WinSCP
Write-Host "Running WinSCP sync..." -ForegroundColor Cyan
Write-Host "Log: $tmpLog" -ForegroundColor DarkGray
& $WinSCP "/ini=nul" "/log=$tmpLog" "/script=$tmpScript"
$ExitCode = $LASTEXITCODE

Remove-Item $tmpScript -ErrorAction SilentlyContinue

if ($ExitCode -ne 0) {
  Write-Host "Deploy FAILED (WinSCP exit code $ExitCode)" -ForegroundColor Red
  Write-Host "Open log: $tmpLog" -ForegroundColor Yellow
  exit $ExitCode
}

Write-Host "Deploy OK (WinSCP)." -ForegroundColor Green
Write-Host "Log: $tmpLog" -ForegroundColor DarkGray
