$ErrorActionPreference = "Stop"

function Test-Command($name) {
  return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

function Resolve-Rsync {
  if (Test-Command "rsync") { return "rsync" }
  $msysPath = "C:\msys64\usr\bin\rsync.exe"
  if (Test-Path $msysPath) {
    $env:PATH = "C:\msys64\usr\bin;$env:PATH"
    return $msysPath
  }
  return $null
}

$rsyncCmd = Resolve-Rsync
if (-not $rsyncCmd) {
  Write-Host "rsync not found. Use WSL:" -ForegroundColor Yellow
  Write-Host "  wsl rsync -avz --delete --exclude 'config.local.php' --exclude 'uploads/' --exclude '.ssh/' -e ssh -p 22 deploy/beget/public_html/ user@host:~/"
  Write-Host "Or install MSYS2 and add C:\msys64\usr\bin to PATH." -ForegroundColor Yellow
  exit 1
}

if (-not (Test-Command "ssh")) {
  Write-Error "ssh is not installed or not in PATH."
  exit 1
}

$BEGET_HOST = $env:BEGET_HOST
$BEGET_USER = $env:BEGET_USER
$BEGET_PORT = if ($env:BEGET_PORT) { $env:BEGET_PORT } else { "22" }
$BEGET_REMOTE_PATH = if ($env:BEGET_REMOTE_PATH -eq $null) { "~/" } else { $env:BEGET_REMOTE_PATH }
$DRY_RUN = if ($env:DRY_RUN) { $env:DRY_RUN } else { "0" }

if (-not $BEGET_HOST) { Write-Error "BEGET_HOST is not set."; exit 1 }
if (-not $BEGET_USER) { Write-Error "BEGET_USER is not set."; exit 1 }
if ([string]::IsNullOrWhiteSpace($BEGET_REMOTE_PATH)) {
  Write-Error "BEGET_REMOTE_PATH is empty. Use \"~/\"."
  exit 1
}
if ($BEGET_REMOTE_PATH -eq "/") {
  Write-Error "BEGET_REMOTE_PATH cannot be \"/\". Use \"~/\"."
  exit 1
}

$localPath = "deploy/beget/public_html/"
if (-not (Test-Path $localPath)) {
  Write-Error "Local path '$localPath' not found."
  exit 1
}

Write-Host "Deploying to Beget..."
Write-Host "Host: $BEGET_HOST"
Write-Host "User: $BEGET_USER"
Write-Host "Port: $BEGET_PORT"
Write-Host "Remote path: $BEGET_REMOTE_PATH"

$args = @(
  "-avz",
  "--delete",
  "--exclude", "config.local.php",
  "--exclude", "uploads/",
  "--exclude", ".ssh/"
)
if ($DRY_RUN -eq "1") { $args += "--dry-run" }
$args += @("-e", "ssh -T -o LogLevel=ERROR -p $BEGET_PORT", $localPath, "$BEGET_USER@$BEGET_HOST`:$BEGET_REMOTE_PATH")

& $rsyncCmd @args

Write-Host "Deploy complete."
