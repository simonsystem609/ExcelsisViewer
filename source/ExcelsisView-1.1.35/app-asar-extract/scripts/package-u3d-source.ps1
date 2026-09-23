$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$WorkspaceRoot = (Resolve-Path (Join-Path $ProjectRoot "..\..")).Path
$U3dRoot = Join-Path $WorkspaceRoot "u3d"
$UpstreamRoot = Join-Path $U3dRoot "upstream"
$SourceOutput = Join-Path $ProjectRoot "third_party\source\u3d"
$LicenseOutput = Join-Path $ProjectRoot "third_party\licenses\u3d"
$ArchivePath = Join-Path $SourceOutput "u3d-modified-source-5c141d9f.zip"
$Stamp = (Get-Date).ToUniversalTime().ToString("yyyyMMdd-HHmmss-fff")
$StagingRoot = Join-Path $WorkspaceRoot "trash\u3d-source-$Stamp"
$BundleRoot = Join-Path $StagingRoot "u3d-modified-source-5c141d9f"
$BundleUpstream = Join-Path $BundleRoot "upstream"
$MingwRoot = if ($env:EXCELSIS_MINGW64) {
    $env:EXCELSIS_MINGW64
} else {
    "C:\msys64\mingw64"
}
$MingwLicenses = Join-Path $MingwRoot "share\licenses"

New-Item -ItemType Directory -Path `
    $SourceOutput, `
    $LicenseOutput, `
    $BundleUpstream `
    -Force | Out-Null

$ExpectedCommit = "5c141d9f0d366357e2b7cf93af2eade284a334be"
$CommitMarker = Join-Path $U3dRoot "UPSTREAM-COMMIT.txt"
$GitCommand = Get-Command git -ErrorAction SilentlyContinue
$HasGitMetadata = Test-Path -LiteralPath (Join-Path $UpstreamRoot ".git")
if ($HasGitMetadata -and $GitCommand) {
    $ActualCommit = (& git -C $UpstreamRoot rev-parse HEAD).Trim()
    if ($LASTEXITCODE -ne 0) {
        throw "Could not read the U3D upstream Git commit."
    }
    $UpstreamPaths = @(& git -C $UpstreamRoot ls-files)
    if ($LASTEXITCODE -ne 0 -or $UpstreamPaths.Count -eq 0) {
        throw "Could not enumerate the tracked U3D upstream source."
    }
} else {
    if (-not (Test-Path -LiteralPath $CommitMarker)) {
        throw "U3D source archive is missing its pinned commit marker: $CommitMarker"
    }
    $ActualCommit = (Get-Content -Raw -LiteralPath $CommitMarker).Trim()
    $GitMetadataRoot = Join-Path $UpstreamRoot ".git"
    $GitMetadataPrefix = $GitMetadataRoot + [IO.Path]::DirectorySeparatorChar
    $UpstreamPaths = @(
        Get-ChildItem -LiteralPath $UpstreamRoot -Recurse -File -Force |
            Where-Object {
                -not $_.FullName.Equals(
                    $GitMetadataRoot,
                    [System.StringComparison]::OrdinalIgnoreCase
                ) -and
                -not $_.FullName.StartsWith(
                    $GitMetadataPrefix,
                    [System.StringComparison]::OrdinalIgnoreCase
                )
            } |
            ForEach-Object {
                $_.FullName.Substring($UpstreamRoot.Length).TrimStart("\")
            } |
            Sort-Object
    )
}
if ($ActualCommit -ne $ExpectedCommit) {
    throw "U3D upstream source is not pinned to $ExpectedCommit."
}

foreach ($RelativePath in $UpstreamPaths) {
    $SourcePath = Join-Path $UpstreamRoot $RelativePath
    $DestinationPath = Join-Path $BundleUpstream $RelativePath
    New-Item -ItemType Directory -Path (Split-Path -Parent $DestinationPath) -Force |
        Out-Null
    Copy-Item -LiteralPath $SourcePath -Destination $DestinationPath -Force
}
$AdditionalUpstreamSources = @(
    "RTL\Component\Texture\IFXImageSizeUtils.h"
)
foreach ($RelativePath in $AdditionalUpstreamSources) {
    $SourcePath = Join-Path $UpstreamRoot $RelativePath
    if (-not (Test-Path -LiteralPath $SourcePath)) {
        throw "Required modified U3D source is missing: $SourcePath"
    }
    $DestinationPath = Join-Path $BundleUpstream $RelativePath
    New-Item -ItemType Directory -Path (Split-Path -Parent $DestinationPath) -Force |
        Out-Null
    Copy-Item -LiteralPath $SourcePath -Destination $DestinationPath -Force
}
foreach ($RelativePath in @(
    "build.ps1",
    "README.md",
    "PATCHES.md",
    "bridge",
    "tests"
)) {
    Copy-Item -LiteralPath (Join-Path $U3dRoot $RelativePath) `
        -Destination (Join-Path $BundleRoot $RelativePath) `
        -Recurse `
        -Force
}
Set-Content -LiteralPath (Join-Path $BundleRoot "UPSTREAM-COMMIT.txt") `
    -Value "$ExpectedCommit`r`n" `
    -Encoding ascii

if (Test-Path -LiteralPath $ArchivePath) {
    $SupersededRoot = Join-Path $WorkspaceRoot "trash\superseded-u3d-source-$Stamp"
    New-Item -ItemType Directory -Path $SupersededRoot -Force | Out-Null
    Move-Item -LiteralPath $ArchivePath `
        -Destination (Join-Path $SupersededRoot (Split-Path -Leaf $ArchivePath))
}
Compress-Archive -Path (Join-Path $BundleRoot "*") `
    -DestinationPath $ArchivePath `
    -CompressionLevel Optimal

Copy-Item -LiteralPath (Join-Path $UpstreamRoot "COPYING") `
    -Destination (Join-Path $LicenseOutput "LICENSE-U3D-Apache-2.0.txt") `
    -Force
Copy-Item -LiteralPath (Join-Path $MingwLicenses "libwinpthread\COPYING") `
    -Destination (Join-Path $LicenseOutput "LICENSE-libwinpthread.txt") `
    -Force
Copy-Item -LiteralPath (Join-Path $MingwLicenses "libpng\LICENSE") `
    -Destination (Join-Path $LicenseOutput "LICENSE-libpng.txt") `
    -Force
Copy-Item -LiteralPath (Join-Path $MingwLicenses "zlib\LICENSE") `
    -Destination (Join-Path $LicenseOutput "LICENSE-zlib.txt") `
    -Force
Copy-Item -LiteralPath (Join-Path $MingwLicenses "libjpeg-turbo\LICENSE.md") `
    -Destination (Join-Path $LicenseOutput "LICENSE-libjpeg-turbo.md") `
    -Force

$Hash = (Get-FileHash -LiteralPath $ArchivePath -Algorithm SHA256).Hash
Write-Host "U3D corresponding source: $ArchivePath"
Write-Host "SHA-256: $Hash"
Write-Host "Staging retained for manual cleanup: $StagingRoot"
