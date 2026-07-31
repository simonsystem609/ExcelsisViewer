# nanoPRC decoder and application bridge

This directory contains the standards-based native 3D-PDF decoder used by
ExcelsisView `1.1.15`.

## Pinned upstream

- nanoPRC commit: `66cacb70ac1072e9f23b677c5ae8dd83e61709c5`
- zlib commit: `f9dd6009be3ed32415edf1e89d1bc38380ecb95d`
- upstream license: GNU AGPL v3, with a commercial license also offered by the
  upstream author

The source archives and extracted trees are kept locally in this directory.
No Git remote is required for local builds.

## Build

Install Zig `0.16.0`, then either put `zig.exe` on `PATH`, set
`EXCELSIS_ZIG`, or pass `-ZigPath`:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass `
  -File .\build.ps1 `
  -Configuration Release `
  -ZigPath C:\path\to\zig.exe
```

The script builds the application exporter, JSON exporter, quick-start tool,
and probe into `build\`. Generated cache directories are not required source.

The build uses the strict floating-point option
`-ffp-contract=off`. PRC compressed tessellation reinjects reconstructed
points into later coordinate bases and requires double-precision rounding
after each operation.

The local bridge changes support large assemblies by:

- compressed geometry is emitted once instead of once per source face
- file-local biased tessellation indices are mapped to the global API table
- RI-set `rep_items` are exported and instanced by the viewer
- JSON is compact rather than pretty-printed

## Application integration (1.1.15)

`nano_prc_app_export.exe` now emits a small JSON product-tree manifest plus a
compact binary position/index stream. This avoids materializing the large
demo JSON in Electron.

The packaged renderer retains the component tree, selection, hide/isolate,
opacity, edge, fit, rotate, pan, and zoom controls. The application contains
only the nanoPRC decoder path.

The installer includes the nanoPRC AGPL license, third-party notices, and a
source archive containing the pinned upstream tree plus the local build and
bridge changes.

See `MODIFICATIONS.md` for the exact modified-file list, dates, and build-only
integration changes.
