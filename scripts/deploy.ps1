$env:BEGET_HOST = "yaruvlnr.beget.tech"
$env:BEGET_USER = "yaruvlnr_1234"
$env:BEGET_PORT = "22"
$env:BEGET_REMOTE_PATH = "~/"
$env:BEGET_HOSTKEY = "ssh-ed25519 255 SHA256:14hNJylDIrQMUKWN/Fz7Lq06hjnnyBmBCE9feqeK53M"
$env:WINSCP_COM = "C:\Program Files (x86)\WinSCP\WinSCP.com"

$scriptPath = Join-Path $PSScriptRoot "deploy-beget-winscp-cli.ps1"
& $scriptPath
