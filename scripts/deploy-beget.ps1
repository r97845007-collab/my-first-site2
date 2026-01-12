$ErrorActionPreference = "Stop"

function Test-Command($name) {
  return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

if (-not (Test-Command "rsync")) {
  Write-Host "rsync not found. Use WSL:" -ForegroundColor Yellow
  Write-Host "  wsl rsync -avz --delete --exclude 'config.local.php' --exclude 'uploads/' -e \"ssh -p 22\" deploy/beget/public_html/ user@host:~/public_html/"
  exit 1
}

if (-not (Test-Command "ssh")) {
  Write-Error "ssh is not installed or not in PATH."
  exit 1
}

$BEGET_HOST = $env:BEGET_HOST
$BEGET_USER = $env:BEGET_USER
$BEGET_PORT = if ($env:BEGET_PORT) { $env:BEGET_PORT } else { "22" }
$BEGET_REMOTE_PATH = if ($env:BEGET_REMOTE_PATH) { $env:BEGET_REMOTE_PATH } else { "~/public_html/" }

if (-not $BEGET_HOST) { Write-Error "BEGET_HOST is not set."; exit 1 }
if (-not $BEGET_USER) { Write-Error "BEGET_USER is not set."; exit 1 }

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

rsync -avz --delete `
  --exclude "config.local.php" `
  --exclude "uploads/" `
  -e "ssh -p $BEGET_PORT" `
  $localPath `
  "$BEGET_USER@$BEGET_HOST`:$BEGET_REMOTE_PATH"

Write-Host "Deploy complete."
