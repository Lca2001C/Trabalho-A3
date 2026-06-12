# =============================================================================
# ConectaBem — Atalho de Inicialização (Windows)
# =============================================================================
# Este script apenas delega ao orquestrador multiplataforma start.js.
#
# Uso:
#   .\start.ps1            → inicializa e publica via NGROK
#   .\start.ps1 --seed     → também popula o banco (seed)
#   .\start.ps1 --no-ngrok → roda só localmente, sem o túnel
# =============================================================================

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "[XX] Node.js nao encontrado. Instale em https://nodejs.org" -ForegroundColor Red
  exit 1
}

node "$PSScriptRoot\start.js" $args
