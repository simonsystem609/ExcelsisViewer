# ExcelsisView 1.1.20 CodeQL triage

Snapshot date: 2026-08-08

This review covers all 59 alerts that were open against the 1.1.19 public
baseline. The default CodeQL build sees more of the preserved upstream trees
than the release build. Alerts were therefore classified by the exact
`npm run dist` build scripts before any code was changed or any alert was
dismissed.

## Outcome

- 21 alerts affect code compiled into the release and are fixed in 1.1.20.
- 37 alerts are in preserved upstream demonstrations, tests, renderers, or
  bundled-code branches that the release does not compile. They remain
  useful corresponding source and should be dismissed individually as
  `won't fix`, with the target-specific evidence below.
- 1 alert identifies format-mandated legacy PDF decryption. It should be
  dismissed individually as `won't fix`; it is compatibility code for user
  documents, not an application credential, signature, or trust mechanism.
- No global exclusion, query suppression, or blanket dismissal is used.

## Shipped-code fixes

| Alerts | Release path | Resolution |
| --- | --- | --- |
| #81-#92 | Generated Three.js runtime | The exact Three.js 0.160.0, pako 2.1.0, buffer 6.0.3, ieee754 1.2.1, and base64-js 1.5.1 sources are now pinned and supplied. `scripts/build-3d-runtime.mjs` verifies and replaces the one Three.js object-UUID generator with `crypto.getRandomValues` before deterministic bundling. The regression test disables `Math.random`, constructs affected Three.js objects, validates RFC 4122 v4-shaped identifiers, and exercises Buffer/pako round trips. |
| #36 | nanoPRC NURBS control points | The existing file-controlled count guard remains authoritative (`<= 16,000,000` interior points), and the checked count is now carried through allocation and indexing as `size_t` so it cannot narrow back to 32-bit arithmetic. |
| #37-#40, #42 | Unused stb_image decoders | PRC pictures are format-declared JPEG or PNG. The product build now compiles only those two memory decoders and disables GIF, PSD, HDR, BMP, TGA, PIC, PNM, file-I/O, and floating-point image entry points. A native regression decodes a generated RGBA PNG and verifies GIF rejection. |
| #41, #43 | Active stb_image PNG/conversion paths | The PNG row-copy byte count is explicitly widened to `size_t`; 16-bit conversion uses stb_image's checked four-factor allocation helper with an `INT_MAX` boundary before conversion. |
| #44 | nanoPRC bundled zlib | `zcalloc` rejects `items * size` overflow and performs the allocation multiplication in `size_t`. |

## Preserved source that is not in the release build

| Alerts | Preserved target | Release-build evidence and disposition |
| --- | --- | --- |
| #15-#19 | nanoPRC `obj_export` demo | `source/prc/nanoprc/build.ps1` enumerates the release sources and does not compile this demo or its `stb_image_write.h`. Dismiss `won't fix`. |
| #20-#35, #66 | nanoPRC graphical `viewer` demo | The release builds the application exporter, synthetic fixture tools, and probe only; it does not compile this viewer, its font/image writers, `text.cpp`, or `product.cpp`. Dismiss `won't fix`. |
| #45-#49, #63 | U3D IDTF tools/helpers | The release explicitly builds only `IFXCore`, `IFXImporting`, and `IFXCoreStatic`. It does not build IDTF conversion helpers, `TGAImage.cpp`, or `DebugInfo.cpp`. Dismiss `won't fix`. |
| #50-#53, #65 | U3D rendering/DX8/OpenGL targets | The importer build does not build or load rendering plugins; its component manager is restricted to `IFXImporting.dll`. Dismiss `won't fix`. |
| #59, #60 | U3D bundled JPEG/zlib branch | `source/u3d/build.ps1` explicitly configures `-DU3D_SHARED=ON`, so CMake links the documented MSYS2 zlib/png/jpeg libraries and does not add its historical bundled dependency sources to `IFXCore`. Dismiss `won't fix`. |
| #61, #62 | zlib `contrib/testzlib` | The nanoPRC build enumerates zlib runtime sources and does not compile contribution tests. Dismiss `won't fix`. |

These files remain in the public tree because they are part of the pinned
upstream source distributions. Removing or rewriting unrelated upstream
examples would not harden the shipped application and would make provenance
review harder.

## Format-required weak cryptography

Alert #64 is the nanoPRC implementation of legacy algorithms required by the
PDF Standard Security Handler for opening older encrypted user documents.
The routines are not used for application secrets, stored credentials,
software updates, signatures, network authentication, or integrity claims.
Removing them would make supported legacy PDFs unreadable without strengthening
any application security boundary. Dismiss #64 as `won't fix` with that exact
scope; retain process containment, file-size limits, and hostile-input tests.

## Release gate

Publication requires all of the following after the changes above:

1. clean dependency install and zero applicable `npm audit` findings;
2. deterministic 3D runtime rebuild and focused UUID/source-hash regression;
3. nanoPRC native hardening build plus synthetic PRC-in-PDF differential test;
4. the existing U3D hostile JPEG/PNG, PDF, DWG/DXF, containment, Explorer,
   license, source, and packaged-byte test suites;
5. non-interactive NSIS packaging, malware scan where available, source/archive
   hashes, and installed-payload inspection; and
6. a post-push CodeQL run showing the 21 shipped findings closed before the 38
   narrow, evidence-backed dispositions are applied.
