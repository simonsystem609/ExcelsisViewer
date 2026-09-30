# ExcelsisView 1.1.38 release audit

Audit date: 2026-09-30. This is a public-boundary assessment of an isolated
source build, not legal indemnity or installed-app acceptance. Publication
still requires protected-branch checks and fresh remote-byte verification.

## Change and corresponding source

Version 1.1.38 adds bounded DXF/DWG preview buffering during pan and zoom,
places Recents first in the regular toolbar, and moves PDF folder-file
navigation to a centered bottom bar. It includes the earlier 1.1.37 repair
for nested/forward-referenced DWG blocks. The LibreDWG 0.14.8492 ASCII-DXF
writer differs from pinned upstream `out_dxf.c` by a seven-line addition and
one replacement: a polyline entity index no longer advances the surrounding
block-header scan. Its synthetic 24-polyline/26-block fixture and test are
included. The opt-in Helper **Update macros** implementation is retained;
there is no background macro installation.

The complete source ZIP expands to 2,464 files / 222,005,621 bytes. Against
public 1.1.36, 12 application paths were added and 27 changed. The expanded
nanoPRC and U3D source trees are byte-unchanged; the rebuilt U3D source ZIP
has the same member contents as before. The application and nanoPRC use
AGPL-3.0-or-later, U3D uses Apache-2.0, and LibreDWG uses GPL-3.0-or-later.
Exact source, build scripts, modifications, licenses and notices accompany
the installer. No customer drawing or private regression fixture is included.

## Verification and limits

- A clean locked dependency install and full noninteractive `npm run dist`
  passed the native containment, DWG/DXF/PDF/3D PDF, navigation, macro
  updater, shell, security, source and packaged-runtime gates. `npm audit`
  reported zero vulnerabilities. The public installer and source archive
  were produced together by this isolated build; they are not the earlier
  local producer installer/source bytes.
- The source archive has no unsafe ZIP paths, Git metadata, `node_modules`,
  build logs or staging directories. A focused scan of the expanded source
  and 135-file packaged runtime found no private user, host-workspace or
  absolute user-path markers. This cannot prove absence of unknown identifiers.
- The exact public installer was extracted without running it. All 135
  extracted payload files (458,071,381 bytes) match the audited unpacked
  build by path, size and SHA-256. The package audit checked runtime version,
  Electron fuses, ASAR integrity, source correspondence, 12 external-runtime
  hashes and native mitigations.
- Kaspersky 21.26 scanned a byte-identical copy of the exact public installer
  on 2026-09-30: 491 processed / 491 OK, zero detections, suspicions, skips,
  protected objects, corruptions or errors. The copy's SHA-256 was unchanged.
  No Defender scan is claimed.
- First-party binaries are unsigned. The installed app and live SOLIDWORKS,
  DWG and 3D PDF workflows were not acceptance-tested here. Older immutable
  releases and their historical source remain unchanged.

## Primary assets

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `ExcelsisView-Setup-1.1.38.exe` | 124,592,233 | `AE09F84A7C5E8530E362BA716BB113F003F17773D64CD039999DE570C38E3099` |
| `ExcelsisView-Setup-1.1.38.exe.blockmap` | 131,687 | `3DB6FE0D7B34AD7289C237DEC5AACE50B633629C933FDB0A4865F975DF65F86F` |
| `SOURCE-ExcelsisView-1.1.38.zip` | 110,809,361 | `9704AFB3AA16DE1185EB239F1F1EC3466325DC4463C0F94995E0F2C8BB3BF0BA` |
| `SHA256SUMS.txt` | 998 | `1B59AD18878F43249F5D28729EC7C1D1EF5E458D19F68A583B9D612EA4FC1D25` |

The checksum manifest records all remaining source, license and notice assets.
