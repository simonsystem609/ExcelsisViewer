# ExcelsisView 1.1.48 release audit

Assessment date: 2026-10-13. Publication also requires protected-branch checks and fresh remote-byte verification.

## Changes and corresponding source

Ordinary PDF text/image editing, selection controls, shape/visual Whiteout editing, guarded Close tabs, Windows Cut File and display-only embedded DXF labels are included. Text editing and Whiteout are **not secure redaction**: unused PDF objects can remain. Unsupported native content fails without saving over the original. No new third-party PDF engine or cloud upload is used.

The independently authored clipboard helper is a bounded desktop OLE service, not a document decoder. Copy/failure feedback does not authorize deletion; an unoptimized move requires both MOVE receipts before one unchanged regular-file unlink. Delete first attempts recycling; a separate main-process Cancel-default warning permits explicit irreversible single-file fallback. There is no recursive deletion or retry. Real Explorer/NAS/permission/locking acceptance remains environment-specific; identity rechecks are not an atomic filesystem transaction.

The embedded-view navigation and nested-webview guard, missing in the producer snapshot, was restored with its existing checks only in isolated public staging. Private source was not changed. The opt-in Helper macro updater remains.

The exact complete source archive expands to 2,489 files / 222,519,538 bytes. Pinned nanoPRC/U3D source and third-party dependency versions are unchanged from 1.1.44. Native outputs were rebuilt, including `native/file-clipboard.cpp`. AGPL-3.0-or-later application/nanoPRC, Apache-2.0 U3D and GPL-3.0-or-later LibreDWG source, build scripts, modification records and notices accompany the installer. No private drawings, vendor decoder or producer audit logs are included.

## Verification and limitations

- Clean locked dependency install, native rebuilds, all existing functional/security test groups, zero-vulnerability dependency audit, source packaging and packaged-runtime audit passed. A process-local Windows PowerShell module-path correction was necessary. An extra command-line argument reached the last package audit; that exact audit passed separately without the argument. Final extraction also corrected a local host quoting/assembly issue. No test, timeout, protection or release gate was weakened.
- Installer extracted without executing it. All 136 payload files / 458,440,723 bytes match the unpacked build by path, size and SHA-256. Version, nine fuse slots, embedded ASAR integrity, native mitigations, parser containment and source correspondence pass.
- Privacy checks cover all 2,960 source/runtime/installer-content files, including Latin-1 and both UTF-16 alignments. The pinned unchanged Hungarian Chromium locale's ordinary cat label is the only exact-hash exception. Gitleaks' sole full-source match is an unchanged upstream C enum, not a credential. New-commit scanning is also required. These scans cannot exclude unknown identifiers or defects.
- Kaspersky 21.26 scanned the exact installer copy: 496 processed / 496 OK; detection, suspicion, skipped/protected/corrupt and error counters all zero. Copy and original hashes remained unchanged; no protection setting was changed and no Defender scan is claimed.
- Binaries remain unsigned. No installed application, live CAD/PDF, Explorer clipboard or NAS acceptance is claimed. Previous immutable releases remain unchanged.

## Primary assets

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `ExcelsisView-Setup-1.1.48.exe` | 124,694,430 | `2A1CF610F74838F7EDF6D867978FF4898A3BDE3FBF20896561BBD776CA43F871` |
| `ExcelsisView-Setup-1.1.48.exe.blockmap` | 131,397 | `84DF4309D2874A2DBBD70114D11E948383B37F61501366AA4AF8D8467F925AC8` |
| `SOURCE-ExcelsisView-1.1.48.zip` | 110,995,569 | `D45CB464FA1750E03B4CD0306A74FDB7E6A13F0DB8EAE83650C39C93F8185183` |
| `SHA256SUMS.txt` | 998 | `341C85BACFE3138C0C0DC6701638DBBB727B2CBA94BFAC4D1E4394477ECBD0D3` |

The checksum manifest covers all other source, license and notice assets. Public bytes differ from the producer installer because the reviewed guard and native rebuilds are included.
