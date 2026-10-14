# ExcelsisView 1.1.50 release audit

Assessment date: 2026-10-14. Publication also requires protected-branch checks
and verification of the exact remote assets.

## Changes and corresponding source

This release fixes Explorer multi-file Merge PDFs and Batch print startup.
It includes the 1.1.49 PDF editing/printing improvements and per-folder close
buttons. Merge accepts 2–64 PDFs from one folder, defaults to oldest-modified
first, supports reordering/rotation, and exclusively creates a new output.
It bounds inputs, total bytes, pages and worker resources and validates
main-owned file identities. Those checks are not an atomic filesystem transaction.
Merge is not a PDF sanitization or secure-redaction service.

The existing exact-entry navigation/nested-webview guard, absent from the
producer snapshot, was restored with its matching tests in isolated staging.
Private source remains unchanged. The manual Helper macro updater remains,
including verified downloads, backups and the SOLIDWORKS restart prompt on lock.

The complete source archive expands to 2,498 files / 222,583,841 bytes.
The entire pinned nanoPRC/U3D source and locked dependencies are unchanged
from public 1.1.48; five previously verified public native decoder/converter
outputs are carried forward byte-for-byte. The thumbnail provider is rebuilt
from the unchanged included source. No fresh rebuild of those five retained
outputs is claimed. Application/nanoPRC AGPL-3.0-or-later, U3D Apache-2.0 and
LibreDWG GPL-3.0-or-later corresponding source, build scripts, licenses and
notices accompany the installer. No private fixtures or build logs are included.

## Verification and limitations

- Clean locked install, focused PDF editor/image/print/merge/Explorer-startup,
  workspace, macro-update and shell tests passed. Static security, dependency,
  thumbnail-provider, source packaging and packaged-runtime gates passed; the
  dependency audit reports zero vulnerabilities. The producer's earlier full
  feature gate was reused for unchanged work. An unchanged renderer-readiness
  timeout passed its unchanged replay; no timeout or gate was weakened.
- The installer was extracted without running it. All 136 payload files /
  458,471,832 bytes match the unpacked package by path, size and SHA-256.
  Source correspondence, fuse/ASAR integrity, native mitigations and parser
  containment passed. No raw/unpacked Viewer application was launched.
- Source/runtime/package privacy scanning covered 2,974 files, including
  Latin-1 and both UTF-16 alignments. The unchanged
  upstream Hungarian Chromium locale's ordinary cat label is the sole
  exact-hash exception. Gitleaks' sole source result is a byte-identical
  upstream C enum, not a credential. New-commit verification also applies.
- Kaspersky 21.26 scanned the exact installer copy: 503 processed / 503 OK;
  all detection, suspicion, skipped, protected, corrupt and error counters
  zero. Original and copy hashes are unchanged; no protection setting changed.
  No Microsoft Defender scan is claimed.
- Distribution is unsigned. No installed public-build, physical printer,
  real Explorer/NAS or live CAD acceptance is claimed. The private builder's
  installed shell-selection evidence concerns its different producer bytes.
  Existing immutable releases remain unchanged.

## Primary assets

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `ExcelsisView-Setup-1.1.50.exe` | 124,704,260 | `BC4C3F8A3B81CC58A4E049CFFB7897DBD5EC6DD9E893A51E1AB7EF46EDDC71F1` |
| `ExcelsisView-Setup-1.1.50.exe.blockmap` | 132,179 | `E814AD24C3E88AB6BCFDEC4112B901EC6D171C995294E23C3F9E85B85BFC77B8` |
| `SOURCE-ExcelsisView-1.1.50.zip` | 111,020,972 | `5C6DEF092825B4FD11BFB90D3FA13BB6B1CCA2B543EE846597F1FB22459D417B` |
| `SHA256SUMS.txt` | 998 | `EE7E1510A14B93B4DCA6799D1D5635A074ED07313FF2701C9210DE817B9EF485` |

The checksum manifest covers the remaining source, license and notice assets.
Public bytes differ from the producer installer because the reviewed guard,
retained public native outputs and rebuilt thumbnail provider are included.
