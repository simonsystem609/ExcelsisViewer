param(
    [ValidateSet("Release", "Debug")]
    [string]$Configuration = "Release",
    [string]$ZigPath = $env:EXCELSIS_ZIG
)

$ErrorActionPreference = "Stop"

$ExperimentRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$UpstreamRoot = Join-Path $ExperimentRoot "upstream"
$BuildRoot = Join-Path $ExperimentRoot "build"
$Zig = $ZigPath
if ([string]::IsNullOrWhiteSpace($Zig)) {
    $ZigCommand = Get-Command zig.exe -ErrorAction SilentlyContinue
    if ($null -ne $ZigCommand) {
        $Zig = $ZigCommand.Source
    }
}
if ([string]::IsNullOrWhiteSpace($Zig)) {
    $WorkspaceZig = Join-Path $ExperimentRoot "..\..\tools\zig-0.16.0\zig-x86_64-windows-0.16.0\zig.exe"
    if (Test-Path -LiteralPath $WorkspaceZig -PathType Leaf) {
        $Zig = (Resolve-Path -LiteralPath $WorkspaceZig).Path
    }
}
$env:ZIG_GLOBAL_CACHE_DIR = Join-Path $ExperimentRoot ".zig-global-cache"
$env:ZIG_LOCAL_CACHE_DIR = Join-Path $ExperimentRoot ".zig-local-cache"

if ([string]::IsNullOrWhiteSpace($Zig) -or -not (Test-Path -LiteralPath $Zig -PathType Leaf)) {
    throw "Zig 0.16.0 was not found. Put zig.exe on PATH, set EXCELSIS_ZIG, or pass -ZigPath."
}
$ZigVersion = (& $Zig version).Trim()
if ($LASTEXITCODE -ne 0 -or $ZigVersion -ne "0.16.0") {
    throw "Expected Zig 0.16.0, found '$ZigVersion'."
}

New-Item -ItemType Directory -Path $BuildRoot -Force | Out-Null

$CoreSources = @(
    "prc_api.c",
    "prc_api_debug.c",
    "prc_api_write.c",
    "prc_api_write_pdf.c",
    "prc_style_api.c",
    "prc_tri_primitives_api.c",
    "prc_tri_primitives_helper_api.c",
    "prc_uncompressed_primitives_api.c",
    "prc_bit.c",
    "prc_write_bit.c",
    "prc_write_common.c",
    "prc_write_compress_tess.c",
    "prc_write_tess_3d.c",
    "prc_write_wire_tess.c",
    "prc_write_global.c",
    "prc_write_tree.c",
    "prc_write_file_structure.c",
    "prc_write_model.c",
    "prc_write_pdf.c",
    "prc_write_pdf_3d.c",
    "prc_context.c",
    "prc_double.c",
    "prc_error.c",
    "prc_huff.c",
    "prc_memory.c",
    "prc_parse_common.c",
    "prc_parse_extra_geometry.c",
    "prc_parse_file_structure.c",
    "prc_parse_global.c",
    "prc_parse_main.c",
    "prc_parse_tess.c",
    "prc_parse_tree.c",
    "prc_pdf.c",
    "prc_pdf_dict.c",
    "prc_pdf_stream.c",
    "prc_pdf_decrypt.c",
    "prc_pdf_xref.c",
    "prc_release.c",
    "prc_schema.c",
    "prc_vector_util.c",
    "prc_decode_compressed_tess.c",
    "prc_decode_markup_tess.c"
) | ForEach-Object { Join-Path $UpstreamRoot "src\$_" }

$ZlibSources = @(
    "adler32.c",
    "compress.c",
    "crc32.c",
    "deflate.c",
    "gzclose.c",
    "gzlib.c",
    "gzread.c",
    "gzwrite.c",
    "infback.c",
    "inffast.c",
    "inflate.c",
    "inftrees.c",
    "trees.c",
    "uncompr.c",
    "zutil.c"
) | ForEach-Object { Join-Path $UpstreamRoot "thirdparty\zlib\$_" }

$Optimization = if ($Configuration -eq "Debug") { "-O0" } else { "-O2" }
$DebugInformation = if ($Configuration -eq "Debug") { "-g" } else { "-g0" }
$SourcePrefixMap = "-ffile-prefix-map=$ExperimentRoot=nanoPRC"
$DebugPrefixMap = "-fdebug-prefix-map=$ExperimentRoot=nanoPRC"
$MacroPrefixMap = "-fmacro-prefix-map=$ExperimentRoot=nanoPRC"
$CommonArgs = @(
    "cc",
    "-std=c99",
    $Optimization,
    $DebugInformation,
    $SourcePrefixMap,
    $DebugPrefixMap,
    $MacroPrefixMap,
    # PRC predictive tessellation reinjects every reconstructed point into
    # later bases and requires IEEE-754 double rounding after each operation.
    # Fused multiply-add contraction changes that chain on thin triangles.
    "-ffp-contract=off",
    "-fstack-protector-strong",
    "-fno-omit-frame-pointer",
    "-Wl,--dynamicbase",
    "-Wl,--nxcompat",
    "-Wl,--high-entropy-va",
    "-DPRC_LITTLE_ENDIAN",
    "-DPRC_BUILD_SHARED",
    "-DPRC_DEBUG_MEMORY=0",
    "-DPRC_ENABLE_UNZIPPED_FUZZ=0",
    "-DPRC_VERSION_STRING=`"0.1.0-66cacb70`"",
    "-I$(Join-Path $UpstreamRoot 'include')",
    "-I$(Join-Path $UpstreamRoot 'src')",
    "-I$(Join-Path $ExperimentRoot 'generated')",
    "-I$(Join-Path $UpstreamRoot 'thirdparty\zlib')"
)

$JsonExporterSources = @(
    (Join-Path $UpstreamRoot "demos\json_export\src\json_export.c"),
    (Join-Path $UpstreamRoot "demos\json_export\src\json_writer.c")
)

$QuickStartSource = Join-Path $UpstreamRoot "demos\quick_start\src\main.c"
$TeapotWriteSource = Join-Path $UpstreamRoot "demos\teapot_write\src\teapot_write.c"
$ProbeSource = Join-Path $ExperimentRoot "probe.c"
$StbImageHardeningTestSource = Join-Path $ExperimentRoot "tests\stb_image_hardening_test.c"

& $Zig @CommonArgs @CoreSources @ZlibSources @JsonExporterSources `
    "-o" (Join-Path $BuildRoot "nano_prc_app_export.exe")
if ($LASTEXITCODE -ne 0) {
    throw "nanoPRC application exporter build failed with exit code $LASTEXITCODE"
}
Copy-Item -LiteralPath (Join-Path $BuildRoot "nano_prc_app_export.exe") `
    -Destination (Join-Path $BuildRoot "nano_prc_json_export.exe") -Force

& $Zig @CommonArgs @CoreSources @ZlibSources $TeapotWriteSource `
    "-o" (Join-Path $BuildRoot "nano_prc_teapot_write.exe")
if ($LASTEXITCODE -ne 0) {
    throw "nanoPRC synthetic fixture writer build failed with exit code $LASTEXITCODE"
}

& $Zig @CommonArgs @CoreSources @ZlibSources $QuickStartSource `
    "-o" (Join-Path $BuildRoot "nano_prc_quick_start.exe")
if ($LASTEXITCODE -ne 0) {
    throw "nanoPRC quick-start build failed with exit code $LASTEXITCODE"
}

& $Zig @CommonArgs @CoreSources @ZlibSources $ProbeSource `
    "-o" (Join-Path $BuildRoot "nano_prc_probe.exe")
if ($LASTEXITCODE -ne 0) {
    throw "nanoPRC probe build failed with exit code $LASTEXITCODE"
}

$StbImageHardeningTestPath = Join-Path $BuildRoot "stb_image_hardening_test.exe"
$StbImageHardeningTestArgs = @(
    "cc",
    "-std=c99",
    $Optimization,
    $DebugInformation,
    $SourcePrefixMap,
    $DebugPrefixMap,
    $MacroPrefixMap,
    "-fstack-protector-strong",
    "-Wl,--dynamicbase",
    "-Wl,--nxcompat",
    "-Wl,--high-entropy-va",
    "-I$(Join-Path $UpstreamRoot 'src')",
    $StbImageHardeningTestSource,
    "-o",
    $StbImageHardeningTestPath
)
& $Zig @StbImageHardeningTestArgs
if ($LASTEXITCODE -ne 0) {
    throw "nanoPRC stb_image hardening tests failed to compile."
}
& $StbImageHardeningTestPath
if ($LASTEXITCODE -ne 0) {
    throw "nanoPRC stb_image hardening tests failed."
}

Get-Item -LiteralPath `
    (Join-Path $BuildRoot "nano_prc_app_export.exe"), `
    (Join-Path $BuildRoot "nano_prc_json_export.exe"), `
    (Join-Path $BuildRoot "nano_prc_teapot_write.exe"), `
    (Join-Path $BuildRoot "nano_prc_quick_start.exe"), `
    (Join-Path $BuildRoot "nano_prc_probe.exe"), `
    $StbImageHardeningTestPath |
    Select-Object FullName, Length, LastWriteTime
