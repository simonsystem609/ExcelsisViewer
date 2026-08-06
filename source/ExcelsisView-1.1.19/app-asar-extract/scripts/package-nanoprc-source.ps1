$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$WorkspaceRoot = Resolve-Path (Join-Path $ProjectRoot "..\..")
$NanoRoot = Join-Path $WorkspaceRoot "prc\nanoprc"
$SourceOutput = Join-Path $ProjectRoot "third_party\source\nanoprc"
$LicenseOutput = Join-Path $ProjectRoot "third_party\licenses\nanoprc"
$ArchivePath = Join-Path $SourceOutput "nanoPRC-modified-source-66cacb70.zip"

New-Item -ItemType Directory -Path $SourceOutput, $LicenseOutput -Force | Out-Null

$ArchiveIsCurrent = $false
if (Test-Path -LiteralPath $ArchivePath) {
    $ArchiveTime = (Get-Item -LiteralPath $ArchivePath).LastWriteTimeUtc
    $LatestSourceTime = (
        Get-ChildItem -LiteralPath (Join-Path $NanoRoot "upstream") -Recurse -File |
        Sort-Object LastWriteTimeUtc -Descending |
        Select-Object -First 1
    ).LastWriteTimeUtc
    foreach ($ExtraSource in @("build.ps1", "README.md", "MODIFICATIONS.md", "probe.c")) {
        $ExtraTime = (Get-Item -LiteralPath (Join-Path $NanoRoot $ExtraSource)).LastWriteTimeUtc
        if ($ExtraTime -gt $LatestSourceTime) {
            $LatestSourceTime = $ExtraTime
        }
    }
    $GeneratedTime = (
        Get-ChildItem -LiteralPath (Join-Path $NanoRoot "generated") -Recurse -File |
        Sort-Object LastWriteTimeUtc -Descending |
        Select-Object -First 1
    ).LastWriteTimeUtc
    if ($GeneratedTime -gt $LatestSourceTime) {
        $LatestSourceTime = $GeneratedTime
    }
    $ArchiveIsCurrent = $ArchiveTime -ge $LatestSourceTime
}

if (-not $ArchiveIsCurrent) {
    if (Test-Path -LiteralPath $ArchivePath) {
        $Stamp = (Get-Date).ToUniversalTime().ToString("yyyyMMdd-HHmmss-fff")
        $PreviousArchiveDirectory = Join-Path `
            $WorkspaceRoot `
            "trash\superseded-nanoprc-source-$Stamp"
        New-Item -ItemType Directory -Path $PreviousArchiveDirectory |
            Out-Null
        Move-Item -LiteralPath $ArchivePath `
            -Destination (Join-Path $PreviousArchiveDirectory (Split-Path -Leaf $ArchivePath))
    }

    Compress-Archive -LiteralPath `
        (Join-Path $NanoRoot "upstream"), `
        (Join-Path $NanoRoot "build.ps1"), `
        (Join-Path $NanoRoot "README.md"), `
        (Join-Path $NanoRoot "MODIFICATIONS.md"), `
        (Join-Path $NanoRoot "probe.c"), `
        (Join-Path $NanoRoot "generated") `
        -DestinationPath $ArchivePath -CompressionLevel Optimal
}

Copy-Item -LiteralPath (Join-Path $NanoRoot "upstream\LICENSE") `
    -Destination (Join-Path $LicenseOutput "LICENSE-nanoPRC.txt") -Force
Copy-Item -LiteralPath (Join-Path $NanoRoot "upstream\THIRD_PARTY_NOTICES.md") `
    -Destination (Join-Path $LicenseOutput "THIRD_PARTY_NOTICES-nanoPRC.md") -Force

Get-Item -LiteralPath $ArchivePath | Select-Object FullName, Length, LastWriteTime
