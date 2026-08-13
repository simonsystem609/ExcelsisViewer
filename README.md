# ExcelsisView

ExcelsisView 1.1.25 is an open-source Windows viewer for DXF, DWG, regular
PDF, and supported PRC/U3D 3D PDF documents. Document processing is local,
and native document parsers run behind Windows process-containment and
resource limits.

## Download

- [Windows installer](https://github.com/simonsystem609/ExcelsisViewer/releases/download/excelsis-view-v1.1.25/ExcelsisView-Setup-1.1.25.exe)
- [Release notes and all assets](https://github.com/simonsystem609/ExcelsisViewer/releases/tag/excelsis-view-v1.1.25)
- [Exact corresponding-source archive](https://github.com/simonsystem609/ExcelsisViewer/releases/download/excelsis-view-v1.1.25/SOURCE-ExcelsisView-1.1.25.zip)
- [SHA-256 checksums](SHA256SUMS.txt)
- [Licensing and security audit](AUDIT-1.1.25.md)

Version 1.1.25 makes Update Center compare the installed Viewer and Helper
versions with their fixed, immutable GitHub release feeds and re-checks the
installed version immediately before any download. Equal or newer installed
versions cannot be replaced with an older public release. Version 1.1.24 also
added constrained update downloads and a DXF rotation split menu while keeping
the main Rotate button as one-click clockwise rotation. The full PDF, PRC,
U3D, DWG/DXF, containment, Explorer, source, updater, security, and
packaged-byte gates were rerun against the exact release candidate.

The installer and ExcelsisView binaries are currently unsigned, so Windows
may show a SmartScreen warning. Microsoft Defender was disabled in the build
environment, so no Defender scan is claimed. Kaspersky 21.26 with 2026-08-13
full bases scanned 10,995 objects across the exact release assets and unpacked payload
with zero detections or suspicions. Verify the installer SHA-256 before running
it.

## Source and build

The exact expanded source is committed under [`source/`](source/). It
contains the application source, the pinned modified nanoPRC source, the
pinned modified U3D source, the LibreDWG source archive, license texts, and
the scripts used to rebuild the release.

From `source/ExcelsisView-1.1.25/app-asar-extract` on Windows with Node.js 24,
npm, PowerShell, the documented native prerequisites, and Zig 0.16.0:

```powershell
npm ci
npm run dist
```

See
[`source/ExcelsisView-1.1.25/app-asar-extract/SOURCE.md`](source/ExcelsisView-1.1.25/app-asar-extract/SOURCE.md)
for the complete build requirements.

## Project links

- Project site: https://simonsystem609.github.io/ExcelsisViewer/
- Excelsis Helper: https://simonsystem609.github.io/ExcelsisHelper/
- Support and issue reports: https://github.com/simonsystem609/ExcelsisViewer/issues
- Excelsis3D plans and development help: https://discord.gg/uJrSBQm68
- Support development: https://buymeacoffee.com/lakatos

Please do not upload confidential customer or CAD files to public issues.

## Contact

For collaboration, development, or general inquiries, email
[simonsystem609@gmail.com](mailto:simonsystem609@gmail.com).

For bug reports, please use
[GitHub Issues](https://github.com/simonsystem609/ExcelsisViewer/issues); it is
the preferred channel for reproducible problems. Do not email credentials or
confidential files.

## License

Authored ExcelsisView code is `AGPL-3.0-or-later`; see [LICENSE](LICENSE).
Bundled third-party components retain their own compatible licenses and
notices.
