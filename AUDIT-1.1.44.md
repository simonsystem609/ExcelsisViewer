# ExcelsisView 1.1.44 release audit

Assessment date: 2026-10-08. Publication also requires protected-branch
checks and fresh remote-byte verification.

## Changes and corresponding source

Folder tabs show up to five trailing folders when space permits, adapting
to narrower windows. Overview labels use three folder segments, and the
folder context menu can open the exact folder. The public embedded-view
navigation/nested-webview guard and manual **Update macros** action remain.
The guard and its matching checks were carried forward only in isolated
public staging; the producer workspace was not modified.

The complete source ZIP expands to 2,473 files / 222,137,153 bytes. Pinned
nanoPRC and U3D source trees are byte-identical to public 1.1.43; native
executables were rebuilt. The build-only Electron downloader override was
updated. The app/nanoPRC use AGPL-3.0-or-later, U3D Apache-2.0 and LibreDWG
GPL-3.0-or-later. Source, build scripts, modification records and notices
are supplied. No private drawing or regression fixture is included.

## Verification and limitations

- Clean locked dependency installation, native rebuilds, the existing
  functional/security test groups, corresponding-source packaging and the
  package audit completed. Current npm audit reports zero vulnerabilities.
  An initial build needed a process-local Windows PowerShell module-path
  correction. An unchanged folder-key test later timed out; its unchanged
  isolated replay passed DXF/DWG/PDF checks, and the remaining unchanged dist
  commands completed. No test, timeout, security rule or gate was weakened.
- The installer was extracted without running it. All 135 payload files /
  458,142,888 bytes exactly match the audited unpacked build by path, size and
  SHA-256. Version, hardened fuses, embedded ASAR integrity, native mitigation,
  containment and packaged-source correspondence passed.
- Archive paths exclude Git/dependency metadata, build logs and private
  control files. Known private-path/user/credential marker checks covered
  2,937 source/runtime/installer-content files with zero findings. The
  unchanged Hungarian Chromium locale's ordinary cat label was verified.
  Gitleaks' only whole-source match is a byte-identical upstream C enum,
  not a credential. These checks cannot exclude unknown identifiers/defects.
- Kaspersky 21.26 scanned a byte-verified installer copy: 495 processed /
  495 OK; detections, suspicions, skipped/protected/corrupted objects and
  errors were all zero. Both copy and original remained unchanged. No
  protection setting was altered and no Defender scan is claimed.
- The installer and first-party binaries remain unsigned. No installed-app
  or live CAD/PDF acceptance is claimed. Prior immutable releases remain.

## Primary assets

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `ExcelsisView-Setup-1.1.44.exe` | 124,609,132 | `B7AAB5D528FE792F743C32DB3F63A5B285F02ED048701DC1E420E1C5CFD458DE` |
| `ExcelsisView-Setup-1.1.44.exe.blockmap` | 131,388 | `1F512D1601E76C14C07741A6BDA76A0BA4DDD1C2366CB99958E15631F22B1943` |
| `SOURCE-ExcelsisView-1.1.44.zip` | 110,851,703 | `BAE57BE3F2DD6FDB82DA97484896416C133150ADC59F688ABABDB636EDF69208` |
| `SHA256SUMS.txt` | 998 | `74E27CB8ED56BAD3182DA6473D75C2A26702CD2B84CED056BE8080409B904AD0` |

The checksum manifest covers the other source, license and notice assets.
