# ExcelsisView 1.1.15 release audit

Audit date: 2026-07-31

Decision: **GO for public release after the release-branch CodeQL gate, with
the unsigned/no-Defender caveats below**

This is an engineering and open-source-license assessment, not legal advice,
indemnity, or a promise that no third party can ever make a claim.

## 1.1.15 security delta

The 1.1.15 source delta from the audited 1.1.14 release is narrow: 3 files
were added, none removed, and 27 changed. The security changes add checked
U3D image dimensions, pitch, component-count, multiplication, allocation,
reallocation, resize-buffer, and render-copy limits; validate animation and
subdivision output pointers before dereference; and add hostile native and
bridge tests for overflow, excessive sizes, allocation failure, and truncated
JPEG/PNG data.

The seven previously release-blocking U3D CodeQL paths were reviewed against
these changes. A fresh GitHub default-setup scan of the release branch remains
the final publication gate and will be recorded here before merge.

## Licensing and provenance

- Authored ExcelsisView code and the release as a whole are declared
  `AGPL-3.0-or-later`. The NSIS configuration uses `LICENSE.txt` as its license
  page, the packaged `package.json` retains the same SPDX identifier, and the
  installed resources include the full license and third-party notices.
- nanoPRC is pinned to commit
  `66cacb70ac1072e9f23b677c5ae8dd83e61709c5` and is
  `AGPL-3.0-or-later`. Its exact modified source, modification record, bundled
  zlib source, portable build script, license, and 1.1.15 integration notice
  are included.
- GNU LibreDWG 0.14.8492 is pinned to commit
  `c34d1efb8fce8dfcd5bd7b4308c0d5e0b9de0a30` and is
  `GPL-3.0-or-later`. Its exact source archive and license are included in the
  installer and beside it.
- The [U3D reference implementation](https://github.com/ningfei/u3d/tree/5c141d9f0d366357e2b7cf93af2eade284a334be)
  is Apache-2.0. All 1,485 pinned upstream files remain present; the exact
  locally changed and added hardening files, hostile test, application bridge,
  build script, modification record, and pinned-commit marker are included.
  Apache License 2.0 is GPLv3-compatible according to the
  [GNU license list](https://www.gnu.org/licenses/license-list.html#apache2).
- The npm lock contains 337 package records, all with recorded permissive
  license metadata and registry URLs. Full and runtime-only `npm audit`
  reported zero vulnerabilities; npm verified 302 registry signatures and 43
  attestations during the clean install.
- Install scripts are explicitly allowed only for pinned Electron and esbuild;
  electron-winstaller and Tesseract scripts are denied.

## Adobe-code boundary

No proprietary Adobe SDK, Adobe decoder binary, or previous embedded decoder
implementation was found in the shipped application. The four known previous
decoder identifiers are absent from the installer and packaged ASAR. They
remain only as negative assertions in two source-only audit/test scripts.

Literal `Adobe` references do exist and are expected:

- PDF.js includes standard Adobe-named CMap data. Its bundled CMap license
  permits source and binary redistribution subject to retaining its notice and
  disclaimer, which are included.
- Open-source nanoPRC, U3D, and PDF dependencies contain compatibility wording
  referring to Adobe or Acrobat formats.

Those references are licensed data and upstream documentation, not the
previous decoder code.

## Build and packaged-byte results

- The release was rebuilt from isolated corresponding source with a clean
  `npm ci` followed by the complete `npm run dist` route.
- Process-guard/AppContainer tests, nanoPRC fixtures, U3D checked-size and
  JPEG/PNG/truncation fixtures, regular-PDF rendering/editing/OCR/export tests,
  DXF/DWG checks, Explorer thumbnail tests, dependency audit, source packaging,
  and final packaged-runtime audit passed.
- The installer expands to 130 files. Every file is byte-for-byte identical to
  the clean build's `win-unpacked` tree.
- The ASAR contains 285 files. 284 are byte-for-byte identical to the exact
  corresponding source; the sole difference is Electron Builder's expected
  `package.json` pruning. Name, version `1.1.15`, entry point, and
  `AGPL-3.0-or-later` remain.
- Electron is 43.2.0 with Chromium 150.0.7871.129. Electron fuses disable
  RunAsNode, NODE_OPTIONS, CLI inspection, and extra file-protocol privileges;
  embedded ASAR integrity and ASAR-only application loading are enabled.
- Native parsers run through a process guard with zero-capability AppContainer,
  Job Object, process-count, time, memory, input, output, cache, and
  scene-complexity limits.
- The application corresponding-source archive contains 2,386 files. Its 509
  nanoPRC and 1,492 U3D files match their standalone source archives exactly;
  no Git metadata is included. The exact LibreDWG archive is also embedded.
- Installer, ASAR, source, and native payloads were scanned for private paths,
  build identity, the observed public IP address, credentials, private keys,
  and high-confidence token patterns. No releasable hit remained.

## Known caveats and TODOs

- The installer and first-party application/native binaries are not
  Authenticode-signed. The owner accepted this distribution risk; SmartScreen
  warnings and weaker publisher identity are expected. Microsoft's
  `d3dcompiler_47.dll` is the only shipped file with a valid signature.
- Microsoft Defender and its signatures are disabled on the build machine.
  No Defender malware-signature scan was possible. Do not describe this build
  as antivirus-scanned.
- The installer was audited non-interactively but was not launched or installed
  during the release audit. Test installation, upgrade, file associations,
  Explorer thumbnails, document workflows, and uninstall on a disposable
  Windows machine remain recommended.
- Future hardening work: obtain a code-signing certificate when practical,
  scan release bytes on a protected machine with current signatures, add
  sustained fuzzing for PRC/U3D/DWG/thumbnail boundaries, reduce upstream U3D
  compiler warnings, and make the already-guarded nanoPRC NURBS product
  explicitly `size_t`.

## Release SHA-256

```text
76A70483F941983E39DBC4F0CAE9D85FCD57448C17731927A24EE9354969024F  ExcelsisView-Setup-1.1.15.exe
7803598515EDA6B8032AA3AF9C0D87085802DA8697F434FEAEF094AB5C819BA5  ExcelsisView-Setup-1.1.15.exe.blockmap
B4C5D7FC5D50F3D3EB159D8181CAA19FF42233FE0BB434A44D2927E999BCFC28  SOURCE-ExcelsisView-1.1.15.zip
7F37F50D19CBD676550AEC862590CAA579E33767D2DA7DBEF5749C3806FE8A9C  SOURCE-nanoPRC-66cacb70.zip
A8ABCC6C1256A80398FEF65E0E30992E711021466E43E5F22D8FAA18A2750054  SOURCE-U3D-5c141d9f.zip
9935245817278C944C681527EF52EEE81CCF720FCE09F9FB467D0D6A926AE3CE  SOURCE-LibreDWG-0.14.8492.tar.gz
4DF3C306DDDAAF4BAFFDFF5CA820CC679AC8CD6DC263C6A74517783E42FA7A3B  LICENSE.txt
4A6ADCE589719D10CBC7366D548FCA62A44A19DB1D3C68935BE4EAAC077C1A1A  README.md
88264F30B138F2C3D9D3E670BFDE0450991A8210EE8A0CDAA684275AA2CADA66  SOURCE.md
7F746F2F0E21E0A42254C1543D90EE3ED9578C59779C2CA1E1B91199B8241919  THIRD_PARTY_NOTICES.md
FF0F5486076B991BA4B8200ABAE7CAD162EEFB4BE4F65574AFA9385279D5EB69  DISTRIBUTION-RISK-ACCEPTANCE.md
```
