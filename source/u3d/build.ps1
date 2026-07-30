param(
    [string]$Configuration = "Release",
    [string]$RuntimeTarget = "",
    [string]$MingwRoot = ""
)

$ErrorActionPreference = "Stop"
$workspaceRoot = Split-Path -Parent $PSScriptRoot
$upstreamRoot = Join-Path $PSScriptRoot "upstream"
$bridgeSource = Join-Path $PSScriptRoot "bridge\u3d_app_export.cpp"
$buildRoot = Join-Path $workspaceRoot "tmp\u3d-build"
if ([string]::IsNullOrWhiteSpace($RuntimeTarget)) {
    $ApplicationRoots = @(
        Get-ChildItem -LiteralPath $workspaceRoot -Directory |
            ForEach-Object { Join-Path $_.FullName "app-asar-extract" } |
            Where-Object { Test-Path -LiteralPath (Join-Path $_ "package.json") }
    )
    if ($ApplicationRoots.Count -ne 1) {
        throw "Could not uniquely locate the ExcelsisView app-asar-extract directory."
    }
    $RuntimeTarget = Join-Path $ApplicationRoots[0] "modules\3dpdf\native\u3d"
}
if ([string]::IsNullOrWhiteSpace($MingwRoot)) {
    $MingwRoot = if ($env:EXCELSIS_MINGW64) {
        $env:EXCELSIS_MINGW64
    } else {
        "C:\msys64\mingw64"
    }
}
$mingwRoot = $MingwRoot
$mingwBin = Join-Path $mingwRoot "bin"
$cmake = Join-Path $mingwBin "cmake.exe"
$ninja = Join-Path $mingwBin "ninja.exe"
$compiler = Join-Path $mingwBin "g++.exe"
$objdump = Join-Path $mingwBin "objdump.exe"
$expectedCommit = "5c141d9f0d366357e2b7cf93af2eade284a334be"
$commitMarker = Join-Path $PSScriptRoot "UPSTREAM-COMMIT.txt"

foreach ($requiredPath in @(
    $upstreamRoot,
    $bridgeSource,
    $commitMarker,
    $cmake,
    $ninja,
    $compiler,
    $objdump,
    (Join-Path $mingwRoot "lib\libz.a"),
    (Join-Path $mingwRoot "lib\libpng.a"),
    (Join-Path $mingwRoot "lib\libjpeg.a"),
    (Join-Path $mingwBin "libwinpthread-1.dll")
)) {
    if (-not (Test-Path -LiteralPath $requiredPath)) {
        throw "Required U3D build input is missing: $requiredPath"
    }
}

$actualCommit = (Get-Content -Raw -LiteralPath $commitMarker).Trim()
if ($actualCommit -ne $expectedCommit) {
    throw "U3D upstream source must remain pinned to $expectedCommit (found $actualCommit)."
}

New-Item -ItemType Directory -Force -Path $buildRoot | Out-Null
$env:PATH = "$mingwBin;C:\msys64\usr\bin;$env:PATH"

& $cmake `
    -S $upstreamRoot `
    -B $buildRoot `
    -G Ninja `
    "-DCMAKE_POLICY_VERSION_MINIMUM=3.5" `
    "-DCMAKE_BUILD_TYPE=$Configuration" `
    "-DCMAKE_C_FLAGS=-fstack-protector-strong" `
    "-DCMAKE_CXX_FLAGS=-std=gnu++14 -fstack-protector-strong" `
    "-DCMAKE_SHARED_LINKER_FLAGS=-Wl,--dynamicbase,--nxcompat -static-libgcc -static-libstdc++" `
    "-DU3D_SHARED=ON" `
    "-DZLIB_LIBRARY=$(Join-Path $mingwRoot 'lib\libz.a')" `
    "-DPNG_LIBRARY=$(Join-Path $mingwRoot 'lib\libpng.a')" `
    "-DJPEG_LIBRARY=$(Join-Path $mingwRoot 'lib\libjpeg.a')"
if ($LASTEXITCODE -ne 0) { throw "U3D CMake configuration failed." }

& $cmake --build $buildRoot --config $Configuration --target IFXCore IFXImporting IFXCoreStatic --parallel
if ($LASTEXITCODE -ne 0) { throw "U3D runtime build failed." }

$includeArguments = @(
    "-I$(Join-Path $upstreamRoot 'RTL\Component\Include')",
    "-I$(Join-Path $upstreamRoot 'RTL\Kernel\Include')",
    "-I$(Join-Path $upstreamRoot 'RTL\Platform\Include')",
    "-I$(Join-Path $upstreamRoot 'RTL\Platform\Win32\Common')"
)
$bridgeArguments = @(
    "-std=gnu++14",
    "-O2",
    "-fstack-protector-strong",
    "-DNDEBUG",
    "-DUNICODE",
    "-D_UNICODE",
    "-DU3D_NO_ASM"
) + $includeArguments + @(
    $bridgeSource,
    (Join-Path $buildRoot "IFXCoreStatic.a"),
    "-static-libgcc",
    "-static-libstdc++",
    "-Wl,--dynamicbase,--nxcompat",
    "-lwinmm",
    "-lkernel32",
    "-luser32",
    "-lgdi32",
    "-lwinspool",
    "-lshell32",
    "-lole32",
    "-loleaut32",
    "-luuid",
    "-lcomdlg32",
    "-ladvapi32",
    "-o",
    (Join-Path $buildRoot "u3d_app_export.exe")
)
& $compiler @bridgeArguments
if ($LASTEXITCODE -ne 0) { throw "Excelsis U3D bridge build failed." }

$allowedImports = @(
    "ADVAPI32.dll",
    "COMDLG32.dll",
    "GDI32.dll",
    "IFXCore.dll",
    "KERNEL32.dll",
    "libwinpthread-1.dll",
    "msvcrt.dll",
    "ole32.dll",
    "OLEAUT32.dll",
    "SHELL32.dll",
    "USER32.dll",
    "WINMM.dll",
    "WS2_32.dll"
)
foreach ($binary in @(
    (Join-Path $buildRoot "u3d_app_export.exe"),
    (Join-Path $buildRoot "IFXCore.dll"),
    (Join-Path $buildRoot "IFXImporting.dll"),
    (Join-Path $mingwBin "libwinpthread-1.dll")
)) {
    $imports = & $objdump -p $binary |
        Select-String "DLL Name:" |
        ForEach-Object { ($_ -split "DLL Name:", 2)[1].Trim() }
    $unexpected = @($imports | Where-Object { $_ -notin $allowedImports })
    if ($unexpected.Count) {
        throw "Unexpected runtime import in $binary`: $($unexpected -join ', ')"
    }
}

New-Item -ItemType Directory -Force -Path $RuntimeTarget | Out-Null
Copy-Item -Force -LiteralPath `
    (Join-Path $buildRoot "u3d_app_export.exe"), `
    (Join-Path $buildRoot "IFXCore.dll"), `
    (Join-Path $buildRoot "IFXImporting.dll"), `
    (Join-Path $mingwBin "libwinpthread-1.dll") `
    -Destination $RuntimeTarget

$testRoot = Join-Path $buildRoot "smoke-test"
New-Item -ItemType Directory -Force -Path $testRoot | Out-Null
$testManifest = Join-Path $testRoot "box_group.json"
$testMesh = Join-Path $testRoot "box_group.mesh"
& (Join-Path $RuntimeTarget "u3d_app_export.exe") `
    (Join-Path $upstreamRoot "Samples\TestScenes\box_group.u3d") `
    $testManifest `
    $testMesh
if ($LASTEXITCODE -ne 0) { throw "U3D smoke test failed." }
$manifest = Get-Content -Raw -LiteralPath $testManifest | ConvertFrom-Json
if ($manifest.format -ne "Excelsis U3D bridge 1" -or
    $manifest.mesh_count -ne 1 -or
    (Get-Item -LiteralPath $testMesh).Length -lt 16) {
    throw "U3D smoke-test output is invalid."
}

Write-Host "U3D runtime built and installed in $RuntimeTarget"
