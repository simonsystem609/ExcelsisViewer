$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root 'native\process-guard.cpp'
$output = Join-Path $root 'native\process-guard.exe'
$zig = $env:EXCELSIS_ZIG
if ([string]::IsNullOrWhiteSpace($zig)) {
  $workspaceZig = Join-Path $root '..\..\tools\zig-0.16.0\zig-x86_64-windows-0.16.0\zig.exe'
  if (Test-Path -LiteralPath $workspaceZig -PathType Leaf) {
    $zig = (Resolve-Path -LiteralPath $workspaceZig).Path
  }
}
if ([string]::IsNullOrWhiteSpace($zig) -or -not (Test-Path -LiteralPath $zig -PathType Leaf)) {
  throw 'Zig 0.16.0 is required to build the process guard.'
}
$cacheRoot = Join-Path $root 'native\obj'
$env:ZIG_GLOBAL_CACHE_DIR = Join-Path $cacheRoot 'zig-global-cache'
$env:ZIG_LOCAL_CACHE_DIR = Join-Path $cacheRoot 'zig-local-cache'
New-Item -ItemType Directory -Path $env:ZIG_GLOBAL_CACHE_DIR -Force | Out-Null
New-Item -ItemType Directory -Path $env:ZIG_LOCAL_CACHE_DIR -Force | Out-Null

& $zig c++ `
  -target x86_64-windows-gnu `
  -std=c++20 `
  -O2 `
  -static `
  -municode `
  -DUNICODE `
  -D_UNICODE `
  -DWIN32_LEAN_AND_MEAN `
  -DNOMINMAX `
  -fstack-protector-strong `
  -fno-omit-frame-pointer `
  '-Wl,--dynamicbase' `
  '-Wl,--nxcompat' `
  '-Wl,--high-entropy-va' `
  -s `
  -o $output `
  $source `
  -ladvapi32 `
  -lole32
if ($LASTEXITCODE -ne 0) {
  throw "Process guard compilation failed with exit code $LASTEXITCODE."
}

$hash = (Get-FileHash -LiteralPath $output -Algorithm SHA256).Hash
Write-Host "Process guard: $output"
Write-Host "SHA-256: $hash"
