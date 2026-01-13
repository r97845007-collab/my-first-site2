$ErrorActionPreference = "Stop"

function Resolve-WinSCP {
  if (Get-Command "WinSCP.com" -ErrorAction SilentlyContinue) { return "WinSCP.com" }
  $defaultPaths = @(
    "$env:ProgramFiles\WinSCP\WinSCP.com",
    "$env:ProgramFiles(x86)\WinSCP\WinSCP.com"
  )
  foreach ($path in $defaultPaths) {
    if (Test-Path $path) { return $path }
  }
  return $null
}

$winscp = Resolve-WinSCP
if (-not $winscp) {
  Write-Error "WinSCP.com not found. Install WinSCP or add it to PATH."
  exit 1
}

$BEGET_HOST = $env:BEGET_HOST
$BEGET_USER = $env:BEGET_USER
$BEGET_REMOTE_PATH = if ($env:BEGET_REMOTE_PATH -eq $null) { "/" } else { $env:BEGET_REMOTE_PATH }
$BEGET_PRIVATE_KEY = $env:BEGET_PRIVATE_KEY
$BEGET_HOSTKEY = $env:BEGET_HOSTKEY
$DRY_RUN = if ($env:DRY_RUN) { $env:DRY_RUN } else { "0" }

if (-not $BEGET_HOST) { Write-Error "BEGET_HOST is not set."; exit 1 }
if (-not $BEGET_USER) { Write-Error "BEGET_USER is not set."; exit 1 }
if (-not $BEGET_PRIVATE_KEY) { Write-Error "BEGET_PRIVATE_KEY is not set."; exit 1 }
if ([string]::IsNullOrWhiteSpace($BEGET_REMOTE_PATH)) {
  Write-Error "BEGET_REMOTE_PATH is empty."
  exit 1
}

$localPath = "deploy/beget/public_html"
if (-not (Test-Path $localPath)) {
  Write-Error "Local path '$localPath' not found."
  exit 1
}

$fileMask = "|config.local.php;uploads/;uploads/*;.ssh/;.ssh/*"
$previewFlag = if ($DRY_RUN -eq "1") { "-preview" } else { "" }

$openArgs = @("sftp://$BEGET_USER@$BEGET_HOST/")
$openArgs += "-privatekey=""$BEGET_PRIVATE_KEY"""
if ($BEGET_HOSTKEY) {
  $openArgs += "-hostkey=""$BEGET_HOSTKEY"""
}

$script = @(
  "option batch on",
  "option confirm off",
  ("open " + ($openArgs -join " ")),
  ("synchronize local -delete {0} -filemask=""{1}"" ""{2}"" ""{3}""" -f $previewFlag, $fileMask, $localPath, $BEGET_REMOTE_PATH),
  "exit"
) -join "`r`n"

$scriptFile = New-TemporaryFile
Set-Content -Path $scriptFile -Value $script -Encoding ASCII

Write-Host "Deploying via WinSCP..."
Write-Host "Host: $BEGET_HOST"
Write-Host "User: $BEGET_USER"
Write-Host "Remote path: $BEGET_REMOTE_PATH"

& $winscp "/script=$scriptFile"

Remove-Item $scriptFile -ErrorAction SilentlyContinue
Write-Host "Deploy complete."
