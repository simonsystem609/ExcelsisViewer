# ExcelsisView

ExcelsisView 1.1.52 is an open-source Windows viewer for DXF, DWG, regular
PDF, and supported PRC/U3D 3D PDF documents. Document processing is local,
and native document parsers run behind Windows process-containment and
resource limits.

## Download

- [Windows installer](https://github.com/simonsystem609/ExcelsisViewer/releases/download/excelsis-view-v1.1.52/ExcelsisView-Setup-1.1.52.exe)
- [Release notes and all assets](https://github.com/simonsystem609/ExcelsisViewer/releases/tag/excelsis-view-v1.1.52)
- [Exact corresponding-source archive](https://github.com/simonsystem609/ExcelsisViewer/releases/download/excelsis-view-v1.1.52/SOURCE-ExcelsisView-1.1.52.zip)
- [SHA-256 checksums](SHA256SUMS.txt)
- [Licensing and security audit](AUDIT-1.1.52.md)

Version 1.1.52 adds same-size DXF hole editing and batch thread-hole offsets,
keeps the feature list aligned with selection, and opens the next file after
deleting the current one. PDF filenames wrap in full; folder navigation reuses
file bytes and directory listings. Supported FreeText annotations and older
covered labels can be edited. These editing tools are not secure redaction.
The runtime is updated to Electron 43.8.3.

Version 1.1.50 fixes Explorer multi-selection for **Merge PDFs** and **Batch
print**. Merge selects 2–64 PDFs from one folder, defaults to oldest-modified
first, permits reordering and rotation, and writes a new `Merged.pdf` without
overwriting existing files. The included 1.1.49 changes improve PDF editing
and print controls and add per-folder close buttons. Physical printer behavior
and Windows selection prompts depend on the environment.

Version 1.1.48 improves ordinary PDF text/image editing, selection controls,
shapes and visual Whiteout. Native text replacement removes supported glyph
strings from page content while preserving positioning; unsupported content
fails without saving over the original. Neither text editing nor Whiteout is
secure redaction. There is no new editing engine or cloud upload.

The included 1.1.47 **Cut File** action supports DXF, DWG, PDF and 3D PDF,
with Save/Discard/Cancel before cutting and a read-only view while pending.
An independently authored bounded Windows clipboard helper receives paste
feedback; only a verified move closes the affected document. Real Explorer/NAS
interoperability requires environment-specific testing. Version 1.1.46 adds a
separate, Cancel-default **permanent-delete** warning if recycling fails: only
explicit approval permits one nonrecursive file deletion, with no retry.
Version 1.1.45 adds guarded **Close tabs** without deleting files. Full names
embedded in compatible laser DXFs are displayed as untrusted labels, never
used as file-action paths. The confined embedded-view guard and manual macro
updater remain.

Version 1.1.44 shows up to five trailing folders on tabs when they fit, with
adaptive shortening on narrow tabs. Right-clicking a tab body offers **Open
folder**; the arrow retains its document list. Folder identity is checked in
the main process before opening Explorer. Existing document/session protections,
keyboard file navigation and the manual macro updater remain unchanged.

Version 1.1.43 keeps the current DXF, DWG, PDF or 3D PDF editor visible
while its folder file list is open. The arrow, Escape or an outside click
closes the overlay, and keyboard selection and guarded closing are retained.
Tile switching and overview return are faster; DXF/DWG drawings center
correctly after viewport changes while deliberate pan/zoom stays preserved.
Folder tabs, independent document sessions and the manual opt-in Helper
macro updater remain available. The public build retains confined embedded-view
navigation and rejects nested webviews.

Version 1.1.38 buffers DXF/DWG drawing previews during pan and zoom, then
restores full detail after the gesture. Recents is the first regular toolbar
button, and PDF folder-file Previous/Next controls sit in a centered bottom
bar, separate from page navigation. Drawing coordinates and saved geometry
are unchanged.

Version 1.1.37 fixes DWG/DXF geometry missing from nested and forward-
referenced blocks. Its rebuilt LibreDWG converter no longer skips block
definitions after older polyline sequences; conversion caches are invalidated.
The manual **Update macros** button remains opt-in and never installs a macro
in the background.

Version 1.1.36 improves 3D PDF navigation. Wheel zoom follows the surface
point under the pointer, and close-up pan and rotation have bounded speed
boosts for inspecting small parts in spread-out assemblies.

Version 1.1.35 adds an opt-in **Update macros** button in Update Center for
compatible, immutable Excelsis Helper macro-only revisions. It verifies the
new SWPs against GitHub SHA-256 digests, backs up the originals, and offers
Retry or Later with a SOLIDWORKS close/restart prompt if a macro is locked.
Helper 1.4.19 or newer must be installed and launched once first. The initial
macro revision already matches the macros bundled in Helper 1.4.19.

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
may show a SmartScreen warning. No Microsoft Defender scan is claimed.
Kaspersky 21.26 on 2026-10-14
scanned an exact installer copy with zero
detections or suspicions. Verify the installer SHA-256 before running it.

## Source and build

The exact expanded source is committed under [`source/`](source/). It
contains the application source, the pinned modified nanoPRC source, the
pinned modified U3D source, the LibreDWG source archive, license texts, and
the scripts used to rebuild the release.

From `source/ExcelsisView-1.1.52/app-asar-extract` on Windows with Node.js 24,
npm, PowerShell, the documented native prerequisites, and Zig 0.16.0:

```powershell
npm ci
npm run dist
```

See
[`source/ExcelsisView-1.1.52/app-asar-extract/SOURCE.md`](source/ExcelsisView-1.1.52/app-asar-extract/SOURCE.md)
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


