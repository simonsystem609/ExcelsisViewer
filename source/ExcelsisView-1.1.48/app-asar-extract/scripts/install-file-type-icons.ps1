param(
  [ValidateSet('A', 'B', 'C')]
  [string]$Family = 'A',
  [string]$ConceptDirectory = 'design\icon-concepts-2026-08-04'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourceRoot = if ([System.IO.Path]::IsPathRooted($ConceptDirectory)) {
  $ConceptDirectory
} else {
  Join-Path $projectRoot $ConceptDirectory
}
$buildRoot = Join-Path $projectRoot 'build'
$sizes = @(256, 128, 64, 48, 32, 24, 20, 16)

function Get-ResizedPngBytes([string]$SourcePath, [int]$Size) {
  $source = [System.Drawing.Bitmap]::new($SourcePath)
  try {
    $target = [System.Drawing.Bitmap]::new(
      $Size,
      $Size,
      [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    )
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($target)
      try {
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.DrawImage($source, 0, 0, $Size, $Size)
      } finally {
        $graphics.Dispose()
      }
      $stream = [System.IO.MemoryStream]::new()
      try {
        $target.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
        return [byte[]]$stream.ToArray()
      } finally {
        $stream.Dispose()
      }
    } finally {
      $target.Dispose()
    }
  } finally {
    $source.Dispose()
  }
}

function Write-MultiSizeIcon([string]$SourcePath, [string]$DestinationPath) {
  $entries = @(
    foreach ($size in $sizes) {
      [pscustomobject]@{
        Size = $size
        Bytes = [byte[]]@(Get-ResizedPngBytes -SourcePath $SourcePath -Size $size)
      }
    }
  )
  $stream = [System.IO.MemoryStream]::new()
  $writer = [System.IO.BinaryWriter]::new($stream)
  try {
    $writer.Write([uint16]0)
    $writer.Write([uint16]1)
    $writer.Write([uint16]$entries.Count)
    $dataOffset = 6 + (16 * $entries.Count)
    foreach ($entry in $entries) {
      $dimension = if ($entry.Size -eq 256) { 0 } else { $entry.Size }
      $writer.Write([byte]$dimension)
      $writer.Write([byte]$dimension)
      $writer.Write([byte]0)
      $writer.Write([byte]0)
      $writer.Write([uint16]1)
      $writer.Write([uint16]32)
      $writer.Write([uint32]$entry.Bytes.Length)
      $writer.Write([uint32]$dataOffset)
      $dataOffset += $entry.Bytes.Length
    }
    foreach ($entry in $entries) {
      $writer.Write([byte[]]$entry.Bytes)
    }
    $writer.Flush()
    [System.IO.File]::WriteAllBytes($DestinationPath, $stream.ToArray())
  } finally {
    $writer.Dispose()
    $stream.Dispose()
  }
}

New-Item -ItemType Directory -Path $buildRoot -Force | Out-Null
foreach ($type in @('dxf', 'dwg', 'pdf')) {
  $sourcePath = Join-Path $sourceRoot "family-$($Family.ToLowerInvariant())-$type.png"
  if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
    throw "Approved icon concept is missing: $sourcePath"
  }
  $pngPath = Join-Path $buildRoot "icon-file-$type-256.png"
  $icoPath = Join-Path $buildRoot "icon-file-$type.ico"
  [System.IO.File]::WriteAllBytes(
    $pngPath,
    [byte[]]@(Get-ResizedPngBytes -SourcePath $sourcePath -Size 256)
  )
  Write-MultiSizeIcon -SourcePath $sourcePath -DestinationPath $icoPath
  Write-Output ([pscustomobject]@{
    Type = $type.ToUpperInvariant()
    Png = $pngPath
    Ico = $icoPath
  })
}
