# ExcelsisView 1.1.52 release audit

Assessment date: 2026-10-26. Publication also requires protected-branch checks
and verification of the exact remote assets.

## Changes and corresponding source

This release adds same-size DXF hole editing, configurable batch thread-hole
offsets, selection-following feature lists and next-file navigation after a
delete. It prevents overlapping DXF saves and disables file actions during
navigation. PDF filenames wrap in full and PDF navigation reuses file bytes
and cached folder listings. Supported FreeText annotations and older covered
labels can be edited. Text editing and Whiteout are not secure redaction.

The prior exact-entry navigation and nested-webview guard was restored with
its tests only in public staging. The manual Helper macro updater remains,
including backups and SOLIDWORKS close/restart guidance on file locks.

The complete source archive has 2,504 files / 222,677,470 bytes. Full pinned
nanoPRC and U3D source is unchanged from public 1.1.50; five exact previously
verified public native decoder/converter outputs are retained, not newly
rebuilt. The thumbnail provider was rebuilt from the unchanged included source.
Electron is updated to 43.8.3, with compatible undici and fast-uri patches.
Application/nanoPRC AGPL-3.0-or-later, U3D Apache-2.0 and LibreDWG
GPL-3.0-or-later source, licenses, notices and build scripts accompany the
installer. No private PDF, customer data, diagnostic export or build log is
included.

## Verification and limitations

- Clean locked installation and dependency audit passed with zero findings.
  Focused DXF, file-action, folder-navigation, PDF annotation/editor/navigation,
  workspace, update and shell checks passed. One folder-list count assertion
  passed an unchanged replay; its original failure remains recorded locally.
  Static source/security, package, fuse/ASAR, thumbnail and containment audits
  passed. The builder's full feature gate supports unchanged work.
- The installer was extracted, not launched. All 136 payload files /
  458,953,211 bytes match the unpacked package by path, size and SHA-256.
  Source/package privacy checks covered 2,981 files; a further byte scan checks
  Latin-1 and both UTF-16 alignments. Only the exact unchanged upstream
  Hungarian locale word is exempted.
- Kaspersky 21.26 scanned an exact installer copy: 506 processed / 506 OK;
  detection, suspicion, skipped, protected, corrupt and error counters zero.
  Original and copy hashes are unchanged. No protection setting changed.
- Distribution is unsigned. Installed public-build behavior, physical printing,
  real NAS timing and live CAD workflows remain user acceptance work. Existing
  immutable releases remain unchanged. No Microsoft Defender scan is claimed.

## Primary assets

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `ExcelsisView-Setup-1.1.52.exe` | 124,832,701 | `BD144386F6717BD7E47A621EB57FD98FF87E235F11366A343A9263C73DE8742B` |
| `ExcelsisView-Setup-1.1.52.exe.blockmap` | 132,322 | `7BEFA4E19396B55CEC9E3729ED12F5D3C59A06EC5128D35D478C6F36466BBF04` |
| `SOURCE-ExcelsisView-1.1.52.zip` | 111,053,056 | `AB09C87CB6749DC26B01F7456C3C3FF33C164DAAA93D8CB4574F19F48BEE6161` |
| `SHA256SUMS.txt` | 998 | `01E389BD99B5B661F4E7F27C60F5F24E39141D46F8707EC824DC0F72C8922E2D` |

Public bytes differ from the producer installer because the reviewed guard,
retained public native outputs and rebuilt thumbnail provider are included.
