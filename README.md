# ExcelsisView

ExcelsisView 1.1.15 is an open-source Windows viewer for DXF, DWG, regular
PDF, and supported PRC/U3D 3D PDF documents. Document processing is local,
and native document parsers run behind Windows process-containment and
resource limits.

## Download

- [Windows installer](https://github.com/simonsystem609/ExcelsisViewer/releases/download/excelsis-view-v1.1.15/ExcelsisView-Setup-1.1.15.exe)
- [Release notes and all assets](https://github.com/simonsystem609/ExcelsisViewer/releases/tag/excelsis-view-v1.1.15)
- [Exact corresponding-source archive](https://github.com/simonsystem609/ExcelsisViewer/releases/download/excelsis-view-v1.1.15/SOURCE-ExcelsisView-1.1.15.zip)
- [SHA-256 checksums](SHA256SUMS.txt)
- [Licensing and security audit](AUDIT-1.1.15.md)

Version 1.1.15 hardens U3D JPEG/PNG texture dimensions, pitches, component
counts, allocations, resize buffers, and render copies with checked limits.
It also validates animation and subdivision output pointers before use and
adds hostile native tests for overflow, excessive sizes, allocation failure,
and truncated image data.

The installer and ExcelsisView binaries are currently unsigned, so Windows
may show a SmartScreen warning. Microsoft Defender was disabled in the build
environment, so no Defender scan is claimed. Kaspersky 21.25 with 2026-07-31
bases scanned the exact release assets, unpacked payload, and expanded source
with zero detections or suspicions. Verify the installer SHA-256 before running
it.

## Source and build

The exact expanded source is committed under [`source/`](source/). It
contains the application source, the pinned modified nanoPRC source, the
pinned modified U3D source, the LibreDWG source archive, license texts, and
the scripts used to rebuild the release.

From `source/ExcelsisView-1.1.15/app-asar-extract` on Windows with Node.js 24,
npm, PowerShell, the documented native prerequisites, and Zig 0.16.0:

```powershell
npm ci
npm run dist
```

See
[`source/ExcelsisView-1.1.15/app-asar-extract/SOURCE.md`](source/ExcelsisView-1.1.15/app-asar-extract/SOURCE.md)
for the complete build requirements.

## Project links

- Project site: https://simonsystem609.github.io/ExcelsisViewer/
- Excelsis Helper: https://simonsystem609.github.io/ExcelsisHelper/
- Support and issue reports: https://github.com/simonsystem609/ExcelsisViewer/issues
- Excelsis3D plans and development help: https://discord.gg/uJrSBQm68
- Support development: https://buymeacoffee.com/lakatos

Please do not upload confidential customer or CAD files to public issues.

## License

Authored ExcelsisView code is `AGPL-3.0-or-later`; see [LICENSE](LICENSE).
Bundled third-party components retain their own compatible licenses and
notices.
