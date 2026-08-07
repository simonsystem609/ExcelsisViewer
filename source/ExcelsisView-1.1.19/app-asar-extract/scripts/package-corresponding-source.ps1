$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$ProgressPreference = "SilentlyContinue"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$WorkspaceRoot = (Resolve-Path (Join-Path $ProjectRoot "..\..")).Path
$Package = Get-Content -Raw -LiteralPath (Join-Path $ProjectRoot "package.json") |
    ConvertFrom-Json
$Version = [string]$Package.version
$Stamp = (Get-Date).ToUniversalTime().ToString("yyyyMMdd-HHmmss")
$StagingRoot = Join-Path $WorkspaceRoot "trash\corresponding-source-$Version-$Stamp"
$BundleRoot = Join-Path $StagingRoot "ExcelsisView-$Version-source"
$ApplicationParent = Join-Path $BundleRoot "ExcelsisView-$Version"
$ApplicationRoot = Join-Path $ApplicationParent "app-asar-extract"
$NanoRoot = Join-Path $BundleRoot "prc\nanoprc"
$U3dRoot = Join-Path $BundleRoot "u3d"
$ArchiveDirectory = Join-Path $ProjectRoot "third_party\source\app"
$ArchivePath = Join-Path $ArchiveDirectory "ExcelsisView-$Version-source.zip"

New-Item -ItemType Directory -Path `
    $ApplicationRoot, `
    $NanoRoot, `
    $U3dRoot, `
    $ArchiveDirectory `
    -Force | Out-Null

$SupersededArchiveDirectory = Join-Path $StagingRoot "superseded-app-source"
$NonCurrentArchives = @(
    Get-ChildItem -LiteralPath $ArchiveDirectory -Filter "ExcelsisView-*-source.zip" -File |
        Where-Object {
            -not [string]::Equals(
                $_.FullName,
                $ArchivePath,
                [System.StringComparison]::OrdinalIgnoreCase
            )
        }
)
if ($NonCurrentArchives.Count -gt 0) {
    New-Item -ItemType Directory -Path $SupersededArchiveDirectory -Force |
        Out-Null
    foreach ($OldArchive in $NonCurrentArchives) {
        Move-Item -LiteralPath $OldArchive.FullName `
            -Destination (Join-Path $SupersededArchiveDirectory $OldArchive.Name)
    }
}

$TopLevelFiles = @(
    "cache-limits.cjs",
    "dwg-converter.cjs",
    "dxf-encoding.cjs",
    "guarded-process.cjs",
    "main.cjs",
    "nano-prc-bridge.cjs",
    "u3d-bridge.cjs",
    "preload.cjs",
    "thumbnail-preload.cjs",
    "batch-print-preload.cjs",
    "print-document-preload.cjs",
    "external-integrity.json",
    "DISTRIBUTION-RISK-ACCEPTANCE.md",
    "package.json",
    "package-lock.json",
    "LICENSE.txt",
    "README.md",
    "SOURCE.md",
    "THIRD_PARTY_NOTICES.md"
)
foreach ($RelativePath in $TopLevelFiles) {
    Copy-Item -LiteralPath (Join-Path $ProjectRoot $RelativePath) `
        -Destination (Join-Path $ApplicationRoot $RelativePath) -Force
}

foreach ($DirectoryName in @("build", "launcher", "modules", "scripts")) {
    Copy-Item -LiteralPath (Join-Path $ProjectRoot $DirectoryName) `
        -Destination (Join-Path $ApplicationRoot $DirectoryName) -Recurse
}

$NativeRoot = Join-Path $ApplicationRoot "native"
New-Item -ItemType Directory -Path $NativeRoot -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $ProjectRoot "native\process-guard.cpp") `
    -Destination $NativeRoot -Force
Copy-Item -LiteralPath (Join-Path $ProjectRoot "native\process-guard.exe") `
    -Destination $NativeRoot -Force

$ShellRoot = Join-Path $ApplicationRoot "shell\thumbnail-provider"
New-Item -ItemType Directory -Path $ShellRoot -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $ProjectRoot "shell\thumbnail-provider\src") `
    -Destination (Join-Path $ShellRoot "src") -Recurse
Copy-Item -LiteralPath (Join-Path $ProjectRoot "shell\thumbnail-provider\tests") `
    -Destination (Join-Path $ShellRoot "tests") -Recurse

$ThirdPartyRoot = Join-Path $ApplicationRoot "third_party"
New-Item -ItemType Directory -Path $ThirdPartyRoot -Force | Out-Null
foreach ($DirectoryName in @("licenses", "libredwg")) {
    Copy-Item -LiteralPath (Join-Path $ProjectRoot "third_party\$DirectoryName") `
        -Destination (Join-Path $ThirdPartyRoot $DirectoryName) -Recurse
}
New-Item -ItemType Directory -Path (Join-Path $ThirdPartyRoot "source") -Force |
    Out-Null
Copy-Item -LiteralPath (Join-Path $ProjectRoot "third_party\source\nanoprc") `
    -Destination (Join-Path $ThirdPartyRoot "source\nanoprc") -Recurse
Copy-Item -LiteralPath (Join-Path $ProjectRoot "third_party\source\u3d") `
    -Destination (Join-Path $ThirdPartyRoot "source\u3d") -Recurse

$NanoArchive = Join-Path `
    $ProjectRoot `
    "third_party\source\nanoprc\nanoPRC-modified-source-66cacb70.zip"
Expand-Archive -LiteralPath $NanoArchive -DestinationPath $NanoRoot
$U3dArchive = Join-Path `
    $ProjectRoot `
    "third_party\source\u3d\u3d-modified-source-5c141d9f.zip"
Expand-Archive -LiteralPath $U3dArchive -DestinationPath $U3dRoot

if (Test-Path -LiteralPath $ArchivePath) {
    $PreviousArchivePath = Join-Path `
        $StagingRoot `
        "superseded-ExcelsisView-$Version-source.zip"
    Move-Item -LiteralPath $ArchivePath -Destination $PreviousArchivePath
}

Compress-Archive -LiteralPath $BundleRoot `
    -DestinationPath $ArchivePath `
    -CompressionLevel Optimal

$InstalledAppSourceArchives = @(
    Get-ChildItem -LiteralPath $ArchiveDirectory -Filter "ExcelsisView-*-source.zip" -File
)
if (
    $InstalledAppSourceArchives.Count -ne 1 -or
    -not [string]::Equals(
        $InstalledAppSourceArchives[0].FullName,
        $ArchivePath,
        [System.StringComparison]::OrdinalIgnoreCase
    )
) {
    throw "Expected exactly one current app source archive: $ArchivePath"
}

$Hash = (Get-FileHash -LiteralPath $ArchivePath -Algorithm SHA256).Hash
Write-Host "Corresponding source: $ArchivePath"
Write-Host "SHA-256: $Hash"
Write-Host "Staging retained for manual cleanup: $StagingRoot"
