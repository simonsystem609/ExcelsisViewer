# ExcelsisView 1.1.36 release audit

Audit date: 2026-09-27. This is a public-boundary assessment of the isolated
release build, not legal indemnity or installed-app acceptance. Publication
still requires the protected-branch checks and fresh remote-byte verification.

## Change and source

Version 1.1.36 changes 3D PDF navigation: wheel zoom follows the picked
surface point, while close-up pan and rotation gain bounded speed boosts.
The local producer source had not incorporated the public 1.1.35 **Update
macros** button. Its exact reviewed nine-file patch was carried forward in
isolated release staging, with version-specific package and audit entries
merged. Focused catalog/hash, backup, lock, rollback and Retry tests pass.
No raw or unpacked Viewer app was launched.

The expanded corresponding source contains 2,452 files / 205,625,638 bytes.
Against the exact 1.1.35 public tree, one first-party navigation module was
added and 14 paths changed; the nanoPRC, U3D and LibreDWG source trees are
byte-unchanged. Native executables and the U3D source ZIP were rebuilt.
The project code is AGPL-3.0-or-later, nanoPRC is AGPL-3.0-or-later, U3D is
Apache-2.0, and LibreDWG is GPL-3.0-or-later. The release includes each
modified component's source and notices.

## Verification and limits

- A clean locked dependency install reported zero vulnerabilities. The full
  `npm run dist` build passed native containment, PDF/DWG/DXF, navigation,
  updater, shell, security, source and exact packaged-runtime gates. After a
  README-only clarification, the source archive and installer were rebuilt
  and the packaged-runtime gate passed again.
- The final 11 payload assets match `SHA256SUMS.txt`. The application source
  ZIP is 105,757,758 bytes and the installer is 117,504,372 bytes. The
  source ZIP has 2,471 entries, no traversal or private/staging directories,
  and expands to the frozen source tree. Changed text has no private user path,
  email or key marker; rebuilt native binaries have no known host/user/drive
  marker. This focused scan cannot prove absence of unknown identifiers.
- Kaspersky 21.26 scanned an exact installer copy: 486 processed / 486 OK,
  with zero detections, suspicions, skips, password-protected objects,
  corruption or errors. The copy's SHA-256 remained unchanged. No Defender
  scan is claimed.
- First-party binaries are unsigned. The installed app, live SOLIDWORKS
  macro-lock flow and 3D navigation with user documents were not acceptance-
  tested here. Prior immutable releases remain unchanged.

## Primary assets

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `ExcelsisView-Setup-1.1.36.exe` | 117,504,372 | `8164ECD02A55B3443A7699989DC0E476B405CD1BD5D2F1DC1E6FC2349BA704EF` |
| `ExcelsisView-Setup-1.1.36.exe.blockmap` | 123,975 | `567B20320738538D66C2E6A0857EAE9A48C1B311ADE3E1F2FF024F161E2B6BAF` |
| `SOURCE-ExcelsisView-1.1.36.zip` | 105,757,758 | `78E9ED9142E589525EED60B0F09B7F47E5EDB023CFB09A03D70D6F79F9AEDE7A` |
| `SHA256SUMS.txt` | 1,009 | `690AB1351BF354E49D0CE57D341FC07044A6A8577ED9A56E4B741168ED4FB715` |

The manifest records all remaining source, license and notice assets.
