# ExcelsisView 1.1.35 release audit

Audit date: 2026-09-23. Engineering/public-boundary decision: GO for a
protected immutable release after required GitHub checks and fresh remote-byte
verification. This is not legal indemnity or an installed-app acceptance test.

## Scope and source

Viewer 1.1.35 adds a separate, opt-in **Update macros** action to Update
Center. It selects only immutable Helper macro prereleases whose tag names the
installed Helper app version; each SWP requires a matching readable SWB asset
and a valid GitHub SHA-256 digest. Only nine fixed macro names are allowed.
The current user's Documents/Excelsis Helper/Macros path is resolved by the
trusted main process; the renderer cannot provide a path or release URL.
Helper must be installed and launched once to establish its bundled-macro
marker. Verified new bytes are staged, prior SWPs are backed up, and multi-file
failure rolls back earlier replacements. A lock shows Save work, close/restart
SOLIDWORKS and VBA, then Retry or Later; no SOLIDWORKS process is terminated.
No update runs in the background. The initial macro revision already matches
the SWPs bundled in Helper 1.4.19.

The exact expanded corresponding source in [source/](source/) is 2,451 files /
205,619,292 bytes: 448 application, 511 nanoPRC and 1,492 U3D. The two native
source trees, pinned LibreDWG archive, dependencies, licenses, notices and
provenance are unchanged from [1.1.34](AUDIT-1.1.34.md). Project-owned Viewer
code remains AGPL-3.0-or-later; nanoPRC is AGPL-3.0-or-later, U3D is
Apache-2.0, and LibreDWG is GPL-3.0-or-later. New updater code and tests are
included in both expanded and installer-adjacent source.

## Verification and limits

- Clean locked dependency install and complete `npm run dist` passed native
  build, containment, PDF/DWG/DXF, navigation, updater, shell, dependency,
  security, source and packaged-runtime gates. The new focused tests cover
  immutable release and asset validation, source pairing, SHA-256 rejection,
  backup, Windows-style locked-file failure, rollback and retry.
- The installer contains 132 runtime files / 428,104,665 bytes, identical to
  the clean unpacked build. All 308 non-metadata ASAR files match their exact
  corresponding source. The application, nanoPRC and U3D source ZIPs match
  the frozen expanded source. No private/proprietary byte marker was found.
- Application and ASAR secret scans are clear. The one whole-source Gitleaks
  hit is the unchanged public nanoPRC C enum at
  `prc_internal_proto_api.h:48`; its SHA-256 matches the prior release and it
  is not a credential. Kaspersky 21.26 scanned 486/486 objects in an exact
  installer copy, with zero detections, suspicions, skips, password-protected
  objects, corruption or errors. The copy and original stayed unchanged.
- The first-party installer and binaries remain unsigned. Neither the raw app
  nor installer was launched here. Installed Helper/SOLIDWORKS lock and
  restart behavior still requires user acceptance testing. Defender was
  disabled on the audit host and is not claimed as evidence.

## Frozen primary assets

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `ExcelsisView-Setup-1.1.35.exe` | 117,503,837 | `06C51C44C447F687889754CB70109EB7A0080328389879E05DDD6469C45C54B3` |
| `ExcelsisView-Setup-1.1.35.exe.blockmap` | 123,438 | `88C3938D930A4F112905EF9B9055B86BAA91E07AEC071EBF6CDF32C3BE014FA4` |
| `SOURCE-ExcelsisView-1.1.35.zip` | 105,755,486 | `736609E6231F0E512B87DB178A74497F7259EF6F66F51E1D2A5A740C82CD1F1C` |
| `SHA256SUMS.txt` | 1,009 | `83EEC4B5E4535FD3BEBCDE3097BFEE9D7CFABBE6FA3CD7DFCD2C12B593BEAEAD` |

The manifest records the remaining unchanged native-source, license, notice
and distribution-risk assets. Earlier immutable Viewer and Helper releases
remain unchanged.
