<#
.SYNOPSIS
  Outillage jetable de la maquette DMS Prod (V0.1).

.EXAMPLE
  ./mockup.ps1            # = dev : serveur local avec rechargement auto (http://localhost:4321)
  ./mockup.ps1 build      # génère le site statique dans dist/
  ./mockup.ps1 preview    # build puis sert dist/ (le rendu réel)
  ./mockup.ps1 brand      # régénère logo détouré, favicons et image de partage depuis brand/source/
  ./mockup.ps1 clean      # supprime dist/, .astro/ et node_modules/
#>
param(
  [ValidateSet('dev', 'build', 'preview', 'install', 'brand', 'clean')]
  [string]$Command = 'dev'
)

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

function Assert-Node {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js est introuvable. Installer Node 22.23 ou plus récent (https://nodejs.org)."
  }
  $version = [version]((node -v).TrimStart('v'))
  if ($version -lt [version]'22.23.4') {
    throw "Node $version est trop ancien : Astro 7 demande Node 22.23.4 ou plus récent."
  }
}

function Install-Dependencies([switch]$Force) {
  if ($Force -or -not (Test-Path node_modules)) {
    Write-Host '> Installation des dépendances...' -ForegroundColor Cyan
    if (Test-Path package-lock.json) { npm ci --no-fund --no-audit } else { npm install --no-fund --no-audit }
    if ($LASTEXITCODE -ne 0) { throw 'Échec de npm install.' }
  }
}

function Invoke-Npm([string]$Script) {
  npm run $Script
  if ($LASTEXITCODE -ne 0) { throw "Échec de npm run $Script." }
}

switch ($Command) {
  'install' { Assert-Node; Install-Dependencies -Force }
  'dev'     { Assert-Node; Install-Dependencies; Invoke-Npm 'dev' }
  'build'   { Assert-Node; Install-Dependencies; Invoke-Npm 'build'; Write-Host "> Site généré dans $PSScriptRoot\dist" -ForegroundColor Green }
  'preview' { Assert-Node; Install-Dependencies; Invoke-Npm 'build'; Invoke-Npm 'preview' }
  'brand'   { Assert-Node; Install-Dependencies; node tools/brand.mjs; if ($LASTEXITCODE -ne 0) { throw 'Échec de tools/brand.mjs.' } }
  'clean'   {
    foreach ($dir in 'dist', '.astro', 'node_modules') {
      if (Test-Path $dir) { Remove-Item -Recurse -Force $dir; Write-Host "> $dir supprimé" }
    }
  }
}
