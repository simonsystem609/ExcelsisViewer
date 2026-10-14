$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$zig = $env:EXCELSIS_ZIG
if ([string]::IsNullOrWhiteSpace($zig)) { $zig = Join-Path $root '..\..\tools\zig-0.16.0\zig-x86_64-windows-0.16.0\zig.exe' }
if (-not (Test-Path -LiteralPath $zig -PathType Leaf)) { throw 'Zig is required to rebuild the Windows file clipboard helper.' }
$env:ZIG_GLOBAL_CACHE_DIR = Join-Path $root 'native\obj\zig-global-cache'
$env:ZIG_LOCAL_CACHE_DIR = Join-Path $root 'native\obj\zig-local-cache'
New-Item -ItemType Directory -Path $env:ZIG_GLOBAL_CACHE_DIR,$env:ZIG_LOCAL_CACHE_DIR -Force | Out-Null
$output = Join-Path $root 'native\file-clipboard.exe'
& $zig c++ -target x86_64-windows-gnu -std=c++20 -O2 -static -municode -DUNICODE -D_UNICODE -fstack-protector-strong -fno-omit-frame-pointer '-Wl,--dynamicbase' '-Wl,--nxcompat' '-Wl,--high-entropy-va' -s -o $output (Join-Path $root 'native\file-clipboard.cpp') -lole32 -lshell32 -luuid -luser32
if ($LASTEXITCODE -ne 0) { throw 'Windows file clipboard compilation failed.' }
& $output --self-test
if ($LASTEXITCODE -ne 0) { throw 'Windows file clipboard self-test failed.' }
Write-Host ('Clipboard helper SHA-256: ' + (Get-FileHash -LiteralPath $output -Algorithm SHA256).Hash)
