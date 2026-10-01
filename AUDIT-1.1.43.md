# ExcelsisView 1.1.43 release audit

Audit date: 2026-10-01. This records the public release assessment and its
limits. Publication requires protected-branch checks and fresh remote-byte
verification.

## Changes and corresponding source

Folder file lists overlay the selected DXF, DWG, PDF or 3D PDF editor rather
than hiding it. The dropdown arrow, Escape and outside clicks dismiss the
list; keyboard selection and Save/Discard/Cancel protections remain. Tile
switching, viewport centering, overview return and preview reuse are improved.
The manual **Update macros** button is retained. The public build carries
forward the embedded-view navigation and nested-webview guard from 1.1.40,
including its source and regression checks.

The source ZIP expands to 2,472 files / 222,143,575 bytes. Dependencies and
native decoder source are unchanged from 1.1.40. The application and nanoPRC
use AGPL-3.0-or-later, U3D uses Apache-2.0 and LibreDWG uses GPL-3.0-or-later.
Pinned native source, build scripts, modification records and notices are
supplied with the installer. No private drawing or regression fixture is
included.

## Verification and limits

- A clean locked dependency install and the noninteractive distribution build
  passed, including the existing functional/security tests, native rebuilds,
  corresponding-source packaging and a zero-vulnerability npm audit.
- The installer was extracted without running it. All 135 payload files /
  458,139,191 bytes exactly match the audited unpacked build by path, size
  and SHA-256. Version, fuses, ASAR integrity, native containment and runtime
  source correspondence passed.
- The archive has no unsafe paths, Git metadata, dependency-install folders,
  build logs or private control files. Known private-path/user/credential
  marker scans covered 2,936 source, runtime and installer-content files.
  The unchanged upstream Hungarian locale's ordinary word for cat was
  separately verified. Gitleaks reported one unchanged upstream C enum
  declaration, reviewed as a false positive. These checks cannot establish
  the absence of unknown private identifiers.
- Kaspersky 21.26 scanned an unchanged, byte-identical installer copy in
  report-only mode: 496 processed / 496 OK; zero detections, suspicions,
  skipped, protected, corrupted or erroneous objects. No Defender scan is
  claimed.
- The installer and first-party binaries remain unsigned. Installed-app and
  live CAD/PDF acceptance have not been performed for this public build.
  Previous immutable releases remain available.

## Primary assets

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `ExcelsisView-Setup-1.1.43.exe` | 124,606,322 | `53088FB35D16CBF1EB7192514301B1945E721A820489B67AA948730291AB0B85` |
| `ExcelsisView-Setup-1.1.43.exe.blockmap` | 131,559 | `893BE351E49DC7D2B8F67EBCD23680C5D0979B6C03CD0B77E91BCFA825D347D4` |
| `SOURCE-ExcelsisView-1.1.43.zip` | 110,851,818 | `EB2C20407AE2E06ECF91C01D59821127703D0FC853B86CA23B4DD5CBE753AB94` |
| `SHA256SUMS.txt` | 998 | `FF92428BE5D62941A56C28DE22BD931373547B6DC98E558D583F3BD4AE8E0CFD` |

The checksum manifest records the remaining source, license and notice assets.
