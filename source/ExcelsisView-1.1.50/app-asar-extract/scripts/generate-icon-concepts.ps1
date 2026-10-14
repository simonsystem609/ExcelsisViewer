param(
  [string]$OutputDirectory = "design\icon-concepts-2026-08-04"
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class ExcelsisIconConceptRecolor {
  private static byte Clamp(double value) {
    return (byte)Math.Max(0, Math.Min(255, Math.Round(value)));
  }

  public static Bitmap Recolor(Bitmap source, Color background, Color foreground) {
    int width = source.Width;
    int height = source.Height;
    Rectangle rectangle = new Rectangle(0, 0, width, height);
    PixelFormat format = PixelFormat.Format32bppArgb;
    BitmapData sourceData = source.LockBits(rectangle, ImageLockMode.ReadOnly, format);
    byte[] pixels;
    try {
      int length = Math.Abs(sourceData.Stride) * height;
      pixels = new byte[length];
      Marshal.Copy(sourceData.Scan0, pixels, 0, length);
    } finally {
      source.UnlockBits(sourceData);
    }

    const double baseRed = 255.0;
    const double baseGreen = 128.0;
    const double baseBlue = 128.0;
    for (int offset = 0; offset < pixels.Length; offset += 4) {
      double blue = pixels[offset];
      double green = pixels[offset + 1];
      double red = pixels[offset + 2];
      double dr = red - baseRed;
      double dg = green - baseGreen;
      double db = blue - baseBlue;
      double distance = Math.Sqrt(dr * dr + dg * dg + db * db);
      double mask = Math.Max(0.0, Math.Min(1.0, (distance - 14.0) / 82.0));
      pixels[offset] = Clamp(background.B * (1.0 - mask) + foreground.B * mask);
      pixels[offset + 1] = Clamp(background.G * (1.0 - mask) + foreground.G * mask);
      pixels[offset + 2] = Clamp(background.R * (1.0 - mask) + foreground.R * mask);
      pixels[offset + 3] = 255;
    }

    Bitmap result = new Bitmap(width, height, format);
    BitmapData resultData = result.LockBits(rectangle, ImageLockMode.WriteOnly, format);
    try {
      Marshal.Copy(pixels, 0, resultData.Scan0, pixels.Length);
    } finally {
      result.UnlockBits(resultData);
    }
    return result;
  }
}
'@

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $projectRoot 'build\icon-view-source.png'
$outputRoot = if ([System.IO.Path]::IsPathRooted($OutputDirectory)) {
  $OutputDirectory
} else {
  Join-Path $projectRoot $OutputDirectory
}
New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null

function ColorFromHex([string]$Hex) {
  return [System.Drawing.ColorTranslator]::FromHtml($Hex)
}

function New-SquareSource([string]$Path, [int]$Size) {
  $source = [System.Drawing.Bitmap]::new($Path)
  try {
    $result = [System.Drawing.Bitmap]::new(
      $Size,
      $Size,
      [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    )
    $graphics = [System.Drawing.Graphics]::FromImage($result)
    try {
      $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.DrawImage($source, 0, 0, $Size, $Size)
    } finally {
      $graphics.Dispose()
    }
    return $result
  } finally {
    $source.Dispose()
  }
}

function New-RecoloredIcon(
  [System.Drawing.Bitmap]$Source,
  [System.Drawing.Color]$Background,
  [System.Drawing.Color]$Foreground
) {
  # The C# loop keeps the exact raster silhouette while avoiding a very slow
  # per-pixel PowerShell pipeline over all nine concepts.
  return [ExcelsisIconConceptRecolor]::Recolor($Source, $Background, $Foreground)
}

$families = @(
  [pscustomobject]@{
    Key = 'A'
    Name = 'Royal vivid'
    Purple = '#5B22D6'
    Dxf = '#FF7178'
    Dwg = '#FFD044'
    Pdf = '#337AF2'
  },
  [pscustomobject]@{
    Key = 'B'
    Name = 'Electric'
    Purple = '#6D28FF'
    Dxf = '#FF4F61'
    Dwg = '#FFC928'
    Pdf = '#176BFF'
  },
  [pscustomobject]@{
    Key = 'C'
    Name = 'Blue-violet'
    Purple = '#4528F5'
    Dxf = '#F25A68'
    Dwg = '#F3BA16'
    Pdf = '#1685E8'
  }
)
$types = @(
  [pscustomobject]@{ Key = 'DXF'; BackgroundProperty = 'Dxf'; Foreground = 'Purple' },
  [pscustomobject]@{ Key = 'DWG'; BackgroundProperty = 'Dwg'; Foreground = 'Purple' },
  [pscustomobject]@{ Key = 'PDF'; BackgroundProperty = 'Pdf'; Foreground = 'Black' }
)

$source = New-SquareSource -Path $sourcePath -Size 512
$generated = @{}
try {
  foreach ($family in $families) {
    foreach ($type in $types) {
      $background = ColorFromHex($family.($type.BackgroundProperty))
      $foreground = if ($type.Foreground -eq 'Black') {
        [System.Drawing.Color]::FromArgb(10, 10, 12)
      } else {
        ColorFromHex($family.Purple)
      }
      $icon = New-RecoloredIcon -Source $source -Background $background -Foreground $foreground
      $name = "family-$($family.Key.ToLowerInvariant())-$($type.Key.ToLowerInvariant()).png"
      $path = Join-Path $outputRoot $name
      $icon.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
      $generated["$($family.Key)-$($type.Key)"] = $path
      $icon.Dispose()
    }
  }
} finally {
  $source.Dispose()
}

$sheetWidth = 1130
$sheetHeight = 1080
$iconSize = 280
$sheet = [System.Drawing.Bitmap]::new(
  $sheetWidth,
  $sheetHeight,
  [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
)
$graphics = [System.Drawing.Graphics]::FromImage($sheet)
$titleFont = [System.Drawing.Font]::new('Segoe UI Semibold', 23)
$headerFont = [System.Drawing.Font]::new('Segoe UI Semibold', 18)
$labelFont = [System.Drawing.Font]::new('Segoe UI', 15)
$smallFont = [System.Drawing.Font]::new('Segoe UI', 11)
$whiteBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(245, 247, 252))
$mutedBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(176, 184, 202))
$borderPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(70, 78, 96), 2)
try {
  $graphics.Clear([System.Drawing.Color]::FromArgb(24, 27, 34))
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.DrawString('ExcelsisView file icon concepts', $titleFont, $whiteBrush, 30, 20)
  $graphics.DrawString('Exact current logo silhouette; colors only', $smallFont, $mutedBrush, 33, 58)
  for ($column = 0; $column -lt $types.Count; $column++) {
    $x = 166 + $column * 316
    $graphics.DrawString($types[$column].Key, $headerFont, $whiteBrush, $x + 112, 77)
  }
  for ($row = 0; $row -lt $families.Count; $row++) {
    $family = $families[$row]
    $y = 112 + $row * 316
    $graphics.DrawString("$($family.Key).", $headerFont, $whiteBrush, 28, $y + 92)
    $graphics.DrawString($family.Name, $labelFont, $whiteBrush, 28, $y + 125)
    $graphics.DrawString($family.Purple, $smallFont, $mutedBrush, 29, $y + 157)
    for ($column = 0; $column -lt $types.Count; $column++) {
      $type = $types[$column]
      $x = 166 + $column * 316
      $path = $generated["$($family.Key)-$($type.Key)"]
      $icon = [System.Drawing.Bitmap]::new($path)
      try {
        $graphics.DrawImage($icon, $x, $y, $iconSize, $iconSize)
        $graphics.DrawRectangle($borderPen, $x, $y, $iconSize, $iconSize)
      } finally {
        $icon.Dispose()
      }
    }
  }
  $sheetPath = Join-Path $outputRoot 'icon-concepts-contact-sheet.png'
  $sheet.Save($sheetPath, [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Output $sheetPath
} finally {
  $borderPen.Dispose()
  $mutedBrush.Dispose()
  $whiteBrush.Dispose()
  $smallFont.Dispose()
  $labelFont.Dispose()
  $headerFont.Dispose()
  $titleFont.Dispose()
  $graphics.Dispose()
  $sheet.Dispose()
}
