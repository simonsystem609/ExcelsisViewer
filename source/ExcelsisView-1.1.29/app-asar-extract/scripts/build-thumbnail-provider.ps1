param(
  [switch]$RunTests
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$root = Split-Path -Parent $PSScriptRoot
$providerRoot = Join-Path $root 'shell\thumbnail-provider'
$sourceRoot = Join-Path $providerRoot 'src'
$testRoot = Join-Path $providerRoot 'tests'
$binRoot = Join-Path $providerRoot 'bin\x64'
$objectRoot = Join-Path $providerRoot 'obj\x64'

$zig = $env:EXCELSIS_ZIG
if ([string]::IsNullOrWhiteSpace($zig)) {
  $zigCommand = Get-Command zig.exe -ErrorAction SilentlyContinue
  if ($null -ne $zigCommand) {
    $zig = $zigCommand.Source
  }
}
if ([string]::IsNullOrWhiteSpace($zig)) {
  $workspaceZig = Join-Path $root '..\..\tools\zig-0.16.0\zig-x86_64-windows-0.16.0\zig.exe'
  if (Test-Path -LiteralPath $workspaceZig -PathType Leaf) {
    $zig = (Resolve-Path -LiteralPath $workspaceZig).Path
  }
}
if ([string]::IsNullOrWhiteSpace($zig) -or -not (Test-Path -LiteralPath $zig -PathType Leaf)) {
  throw 'Zig 0.16.0 is required. Set EXCELSIS_ZIG to the absolute path of zig.exe.'
}
$zigVersion = (& $zig version).Trim()
if ($LASTEXITCODE -ne 0 -or $zigVersion -ne '0.16.0') {
  throw "Expected Zig 0.16.0, found '$zigVersion'."
}

New-Item -ItemType Directory -Path $binRoot -Force | Out-Null
New-Item -ItemType Directory -Path $objectRoot -Force | Out-Null
$env:ZIG_GLOBAL_CACHE_DIR = Join-Path $objectRoot 'zig-global-cache'
$env:ZIG_LOCAL_CACHE_DIR = Join-Path $objectRoot 'zig-local-cache'
New-Item -ItemType Directory -Path $env:ZIG_GLOBAL_CACHE_DIR -Force | Out-Null
New-Item -ItemType Directory -Path $env:ZIG_LOCAL_CACHE_DIR -Force | Out-Null

$runtimeEntries = @(
  [pscustomobject]@{
    RelativePath = 'native\process-guard.exe'
    SourcePath = Join-Path $root 'native\process-guard.exe'
  }
)
$libreDwgRoot = Join-Path $root 'third_party\libredwg'
foreach ($runtimeFile in Get-ChildItem -LiteralPath $libreDwgRoot -File |
    Where-Object { $_.Extension -in @('.dll', '.exe') } |
    Sort-Object Name) {
  $runtimeEntries += [pscustomobject]@{
    RelativePath = "third_party\libredwg\$($runtimeFile.Name)"
    SourcePath = $runtimeFile.FullName
  }
}
$integrityHeader = Join-Path $objectRoot 'generated-runtime-integrity.h'
$headerLines = @(
  '#pragma once',
  '#include <cstddef>',
  '#include <cstdint>',
  'struct ExpectedRuntimeFile {',
  '  const wchar_t* relative_path;',
  '  std::uint8_t sha256[32];',
  '};',
  'inline constexpr ExpectedRuntimeFile kExpectedRuntimeFiles[] = {'
)
foreach ($runtimeEntry in $runtimeEntries) {
  if (-not (Test-Path -LiteralPath $runtimeEntry.SourcePath -PathType Leaf)) {
    throw "Integrity input is missing: $($runtimeEntry.SourcePath)"
  }
  $hash = (Get-FileHash -LiteralPath $runtimeEntry.SourcePath -Algorithm SHA256).Hash
  $hashBytes = for ($index = 0; $index -lt 64; $index += 2) {
    "0x$($hash.Substring($index, 2).ToLowerInvariant())"
  }
  $escapedPath = $runtimeEntry.RelativePath.Replace('\', '\\')
  $headerLines += "  {L`"$escapedPath`", {$($hashBytes -join ', ')}},"
}
$headerLines += @(
  '};',
  'inline constexpr std::size_t kExpectedRuntimeFileCount =',
  '    sizeof(kExpectedRuntimeFiles) / sizeof(kExpectedRuntimeFiles[0]);'
)
Set-Content -LiteralPath $integrityHeader -Value $headerLines -Encoding Ascii

$common = @(
  'c++',
  '-target', 'x86_64-windows-gnu',
  '-std=c++20',
  '-O2',
  '-static',
  '-DUNICODE',
  '-D_UNICODE',
  '-DWIN32_LEAN_AND_MEAN',
  '-DNOMINMAX',
  '-fstack-protector-strong',
  '-fno-omit-frame-pointer',
  '-Wl,--dynamicbase',
  '-Wl,--nxcompat',
  '-Wl,--high-entropy-va',
  "-I$objectRoot",
  '-Wall',
  '-Wextra',
  '-Wpedantic',
  '-Wno-nullability-completeness',
  '-Wno-dll-attribute-on-redeclaration'
)
$libraries = @('-lole32', '-lgdi32', '-lshell32', '-ladvapi32', '-lbcrypt', '-luuid')
$providerPath = Join-Path $binRoot 'ExcelsisDxfThumbnailProvider.dll'
$providerArguments = $common + @(
  '-shared',
  '-s',
  '-o', $providerPath,
  (Join-Path $sourceRoot 'dxf_thumbnail_core.cpp'),
  (Join-Path $sourceRoot 'thumbnail_provider.cpp')
) + $libraries
& $zig @providerArguments
if ($LASTEXITCODE -ne 0) {
  throw "Thumbnail provider compilation failed with exit code $LASTEXITCODE."
}
if (-not (Test-Path -LiteralPath $providerPath -PathType Leaf)) {
  throw 'Thumbnail provider output is missing.'
}
& (Get-Command node.exe -ErrorAction Stop).Source (Join-Path $PSScriptRoot 'stamp-thumbnail-provider.cjs') $providerPath
if ($LASTEXITCODE -ne 0) {
  throw "Thumbnail provider metadata stamping failed with exit code $LASTEXITCODE."
}

if ($RunTests) {
  $testPath = Join-Path $objectRoot 'thumbnail_provider_tests.exe'
  $testArguments = $common + @(
    '-municode',
    '-s',
    '-o', $testPath,
    (Join-Path $testRoot 'thumbnail_provider_tests.cpp')
  ) + $libraries
  & $zig @testArguments
  if ($LASTEXITCODE -ne 0) {
    throw "Thumbnail test compilation failed with exit code $LASTEXITCODE."
  }
  $smokeBitmap = Join-Path $objectRoot 'thumbnail-smoke.bmp'
  & $testPath $providerPath $smokeBitmap
  if ($LASTEXITCODE -ne 0) {
    throw "Thumbnail provider tests failed with exit code $LASTEXITCODE."
  }
}

$hash = (Get-FileHash -LiteralPath $providerPath -Algorithm SHA256).Hash
Write-Host "Thumbnail provider: $providerPath"
Write-Host "SHA-256: $hash"
