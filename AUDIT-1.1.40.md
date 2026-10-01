# ExcelsisView 1.1.40 release audit

Audit date: 2026-10-01. This is a public-boundary assessment of an isolated
source build, not legal indemnity or installed-app acceptance. Publication
requires protected-branch checks and fresh remote-byte verification.

## Change and corresponding source

Version 1.1.40 adds compact folder tabs and a six-tile document overview
across DXF, DWG, and PDF sessions. Each document retains its own editor state;
switching and closing use guarded Save/Discard/Cancel file actions. The
existing manual **Update macros** button stays opt-in. A public-boundary
guard confines embedded document views to the intended application page and
rejects nested webviews. The producer's private source was not modified for
this guard; its source and regression tests are in the released package.

The corresponding source ZIP expands to 2,471 files / 222,089,896 bytes.
The application and nanoPRC use AGPL-3.0-or-later, U3D uses Apache-2.0,
and LibreDWG uses GPL-3.0-or-later. Pinned native-source packages, build
scripts, modification notes, licenses and notices accompany the installer.
No customer drawing or private regression fixture is included.

## Verification and limits

- A clean locked dependency install, full noninteractive distribution build,
  relevant functional/security tests, and a zero-vulnerability npm audit
  passed. The public installer and source were produced together by this
  isolated build; they differ from the local producer's original bytes.
- The source archive has no unsafe ZIP paths, Git metadata, `node_modules`,
  build logs or staging directories. Focused scans of source and packaged
  runtime found no private user, host-workspace or absolute user-path markers.
  These scans cannot prove the absence of unknown identifiers.
- The exact public installer was extracted without running it. Its 135
  payload files (458,122,891 bytes) match the audited unpacked build by
  path, size and SHA-256. Runtime version, fuses, ASAR integrity, source
  correspondence and native containment were checked.
- Kaspersky 21.26 scanned a byte-identical copy of the public installer on
  2026-10-01: 495 processed / 495 OK, with zero detections, suspicions,
  skips, protected objects, corruptions or errors. The copy remained
  unchanged. No Defender scan is claimed.
- First-party binaries are unsigned. Installed-app and live CAD/PDF
  workflows were not acceptance-tested for this public build. Older
  immutable releases and their historical source remain unchanged.

## Primary assets

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `ExcelsisView-Setup-1.1.40.exe` | 124,600,318 | `FB4337B6E1BDF3961CE492878FBDFEC3052867E313E0F313ACB8B69D556004A7` |
| `ExcelsisView-Setup-1.1.40.exe.blockmap` | 131,825 | `77CB610ADD8E1B97F1CA3D00B50B0E5B80214422C5724FDAE52AFF0D6CC77970` |
| `SOURCE-ExcelsisView-1.1.40.zip` | 110,837,054 | `2E778BCF664F1F791F5775DF5366BD0FA7A803DEB9152CD4C749AE026B04F512` |
| `SHA256SUMS.txt` | 998 | `B8416A768E1C78D73503BA50418C5C6EA52634B52E725F90DE57E21CDCC476B9` |

The checksum manifest records the remaining source, license and notice assets.
