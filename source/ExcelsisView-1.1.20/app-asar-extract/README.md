# ExcelsisView

ExcelsisView 1.1.20 is a Windows viewer for DXF, DWG, regular PDF, and 3D PDF
documents.

Version 1.1.20 makes the generated Three.js/pako/browser-buffer runtime fully
reproducible from pinned source tarballs, replaces Three.js object-identifier
randomness with Web Crypto, narrows the nanoPRC image decoder to its declared
JPEG/PNG formats, and keeps all file-controlled allocation arithmetic wide and
checked. The focused UUID, image-decoder, synthetic PRC/PDF, and existing
security tests run automatically before packaging.

Version 1.1.19 keeps the installer as one standalone offline executable while
placing the non-runtime corresponding-source archives beside it instead of
nesting more than 137 MB of already-compressed development sources inside the
NSIS payload. All application runtimes, native decoders, Explorer integration,
licenses, and notices remain in the installer; the adjacent sources remain the
exact AGPL/GPL compliance materials for redistribution.

The release also updates PDF.js to 6.2.108 and Electron to 43.3.0, keeps PDF.js
dynamic evaluation and scripting disabled in every production loader, and
retains the isolated native-parser and exact packaged-runtime gates.

Version 1.1.18 evaluates Auto print orientation independently for every page.
Mixed A4 portrait and A3 landscape sheets remain one ordered, collated,
duplex-capable printer job; landscape content is rotated inside the physical
sheet coordinate instead of splitting the document into separate spool jobs.
Manual Portrait and Landscape continue to force every selected page.

Version 1.1.17 adds a shared in-app and Explorer-batch print preview with exact
Auto/Portrait/Landscape orientation, margins, actual/custom scaling, printable-
area fitting, and borderless paper-edge fitting. PDF pages render from the
source at selectable 150/300/600 DPI instead of printing the current viewer
canvas; large jobs adapt within explicit memory limits. The regular PDF viewer
also uses higher adaptive supersampling for crisper technical text while keeping
the existing smooth compositor zoom.

Version 1.1.16 adds distinct Royal Vivid DXF, DWG, and PDF identities while
keeping the red ExcelsisView launcher unchanged. Viewer titlebar/taskbar icons
follow the currently open format, including DXF/DWG navigation and DWG-to-DXF
Save As. Windows Explorer uses the matching per-format icon as its fallback in
Details, List, and other modes where it does not display document thumbnails;
thumbnail-capable views continue to use the existing thumbnail provider. The
release also pins the fixed brace-expansion 5.0.9, fast-uri 3.1.5, and Undici
6.28.0/7.29.0 transitive build dependencies after the current advisory gate
identified their superseded versions.

Version 1.1.15 automatically detects whether a 3D PDF embeds PRC or ECMA-363
U3D. PRC continues through nanoPRC; U3D is extracted in a background worker
and decoded by the pinned Apache-2.0 U3D reference implementation behind the
same native AppContainer, Job Object, resource, cache, and scene-complexity
limits. Both formats use the same assembly tree, component selection,
hide/isolate/delete, opacity, edge, fit, pan, zoom, and quaternion-rotation
viewer. U3D JPEG/PNG texture dimensions, pitches, component counts, input
reads, allocations, reallocations, resize buffers, and render copies now pass
through checked size boundaries. Null output pointers in the animation and
subdivision paths are rejected before dereference, and mandatory hostile tests
cover overflow, excessive dimensions and pitches, allocation failure, and
truncated JPEG/PNG texture continuations.

Version 1.1.13 keeps the in-place regular-PDF Save button and compact Save As
menu, and improves image OCR typography. Every editable word is now painted as
one uniformly transformed text run with normal kerning; related small words
share the same mask-selected font, size, scale, and spacing. Editable SVG text
also exposes normal glyph overhang so the final character is not clipped by
its word box. A bundled light sans family plus remembered per-box regular,
bold, slanted, bold-slanted, color, and character-spacing controls provide
closer manual fine tuning.

Version 1.1.10 gives embedded PDF text priority over overlapping background
image objects, while the image remains selectable outside known text zones.
Double-clicking text opens an in-place editor on the page; Enter applies the
edit, Escape restores the previous text, and the toolbar stays synchronized.

Version 1.1.9 automatically edits embedded PDF text directly and falls back
to offline OCR only for raster text. Native edits preserve the embedded font,
font size, horizontal scale, character spacing, rotation, baseline, and fixed
left edge. OCR results are split into smaller independently editable words and
use per-word visual typography matching.

Version 1.1.8 makes the uniform selected-contour Offset use the same exact
bounding-box transform as Per direction with equal X/Y values. Open or
otherwise unrecognized straight contours now grow or shrink by the requested
millimetres on every side instead of using aspect-dependent radial scaling.

Version 1.1.7 extends the opt-in less-safe chamfer/fillet cleanup to complex
branched outer-offset exports. It only activates when at least four coherent
short bridges isolate one unique global exterior contour; slot cleanup and
strict mode keep their previous behavior. Repeated contour analysis is now
non-mutating, and Save As notifies other windows when overwriting an open DXF.

Version 1.1.6 adds a compact Save As menu beside the DXF Save button and an
opt-in relaxed chamfer/fillet cleanup mode. Relaxed cleanup accepts only
unambiguous pairs of nested closed contours with matching shape and a nearly
uniform offset of 2 mm or less, including drawings whose short cross-bridges
vary around corners. Strict bridge-proven cleanup remains the default.

Version 1.1.5 keeps expensive DXF contour analysis, 3D PDF decoding and mesh
preparation, PDF.js rendering, OCR, image separation, and inpainting away from
the window UI event loop. It also reduces redundant DXF redraw, hit-testing,
feature-list DOM work, and regular-PDF render contention so controls remain
responsive while documents are processed.

Version 1.1.4 adds a fixed lower-left X/Y coordinate-system indicator and a
zoom-aware royal-purple marker at the DXF world origin `(0, 0)`. The origin
marker remains legible over geometry by keeping a black gap between its center
dot and outer ring.

Version 1.1.3 preserves the source font metrics and left anchor when native PDF
text is edited. DXF selection is now red, arc and bulge bounds use exact
quadrant extrema, safe contours support independent X/Y offsets, and
measurement mode adds arc-center, quadrant, and tangent snaps.

Version 1.1.2 added smooth live PDF zooming, remembered multi-PDF batch-print
settings with a first-document preview, conservative removal of narrow
duplicated DXF chamfer/fillet contours, and persistent dissolved DXF entities
until the user explicitly chooses Rebuild.

Copyright in the authored ExcelsisView product code is licensed under the GNU
Affero General Public License version 3 or later
(`AGPL-3.0-or-later`). The complete license text is in `LICENSE.txt`.

Third-party components are not relicensed by this declaration. In particular,
nanoPRC is `AGPL-3.0-or-later`, LibreDWG is `GPL-3.0-or-later`, the U3D
reference implementation is `Apache-2.0`, and the other bundled libraries
retain the individual licenses listed in `THIRD_PARTY_NOTICES.md`.

Corresponding-source contents and the clean Windows build procedure are
documented in `SOURCE.md`.
