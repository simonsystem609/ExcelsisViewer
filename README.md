# ExcelsisView

ExcelsisView 1.1.34 is an open-source Windows viewer for DXF, DWG, regular
PDF, and supported PRC/U3D 3D PDF documents. Document processing is local,
and native document parsers run behind Windows process-containment and
resource limits.

## Download

- [Windows installer](https://github.com/simonsystem609/ExcelsisViewer/releases/download/excelsis-view-v1.1.34/ExcelsisView-Setup-1.1.34.exe)
- [Release notes and all assets](https://github.com/simonsystem609/ExcelsisViewer/releases/tag/excelsis-view-v1.1.34)
- [Exact corresponding-source archive](https://github.com/simonsystem609/ExcelsisViewer/releases/download/excelsis-view-v1.1.34/SOURCE-ExcelsisView-1.1.34.zip)
- [SHA-256 checksums](SHA256SUMS.txt)
- [Licensing and security audit](AUDIT-1.1.34.md)

Version 1.1.34 adds same-size multi-contour DXF size editing for holes,
straight racetracks, rectangles and rounded rectangles. Selection fields
accept comma or dot decimals and retain 0.1-step controls.

The included 1.1.33 change attempts to stop new Windows network `Thumbs.db`
storage for the current user. This Windows Explorer policy affects all network
folders for that user, not only Viewer files. Existing policies are preserved;
Windows may deny the write, and an installer run as a different administrator
may configure that account instead. Viewer retries for the actual user at
startup. It does not delete old cache files or force-close Explorer handles.
An unchanged value created by Viewer is restored for the invoking user on
uninstall; see the release README for limitations.

Version 1.1.32 adds Left/Right arrow-key folder-file navigation across DXF, DWG
and PDF, with separate PDF file buttons and unchanged PDF page buttons. Typing,
dialogs and busy operations keep their own controls; unsaved edits require
saving before switching, and Cancel stays on the file.

It also adds Mirror/Scale for ordinary PDF pages, saving new copies with
unsaved edits and displayed rotation while preserving searchable text/vectors.
Shared Rename/Delete controls cover DXF, DWG and PDF: rename preserves edits;
confirmed deletion uses the Recycle Bin with no permanent-delete fallback.
PDF gains Discard Changes, and the responsive CAD toolbar is reordered.
PDF transforms reject forms, signatures, multimedia and unsupported annotations;
they do not transform 3D models. Existing Recents, racetrack, editing, Update
Center, PDF/3D PDF, DWG and Explorer integration remain included.
The clean-build, security, source and packaged-byte gates passed for this release.

The installer and ExcelsisView binaries are currently unsigned, so Windows
may show a SmartScreen warning. Microsoft Defender was disabled in the build
environment, so no Defender scan is claimed. Kaspersky 21.26 on 2026-09-23
recursively scanned 484 objects in an exact installer copy with zero
detections or suspicions. Verify the installer SHA-256 before running it.

## Source and build

The exact expanded source is committed under [`source/`](source/). It
contains the application source, the pinned modified nanoPRC source, the
pinned modified U3D source, the LibreDWG source archive, license texts, and
the scripts used to rebuild the release.

From `source/ExcelsisView-1.1.34/app-asar-extract` on Windows with Node.js 24,
npm, PowerShell, the documented native prerequisites, and Zig 0.16.0:

```powershell
npm ci
npm run dist
```

See
[`source/ExcelsisView-1.1.34/app-asar-extract/SOURCE.md`](source/ExcelsisView-1.1.34/app-asar-extract/SOURCE.md)
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
