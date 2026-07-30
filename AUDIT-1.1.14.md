# ExcelsisView 1.1.14 release audit

Audit date: 2026-07-30

Decision: **GO for public release, with the unsigned/no-Defender caveats below**

This is an engineering and open-source-license assessment, not legal advice,
indemnity, or a promise that no third party can ever make a claim.

## Licensing and provenance

- Authored ExcelsisView code and the release as a whole are declared
  `AGPL-3.0-or-later`. The NSIS installer displays the complete AGPL text,
  the packaged `package.json` retains the same SPDX identifier, and the
  installed resources include the license and third-party notices.
- nanoPRC is pinned to commit
  `66cacb70ac1072e9f23b677c5ae8dd83e61709c5` and is
  `AGPL-3.0-or-later`. Its exact modified source, modification record, zlib
  source, build script, and license are included.
- GNU LibreDWG 0.14.8492 is pinned to commit
  `c34d1efb8fce8dfcd5bd7b4308c0d5e0b9de0a30` and is
  `GPL-3.0-or-later`. Its exact source archive and license are included.
- The [U3D reference implementation](https://github.com/ningfei/u3d/tree/5c141d9f0d366357e2b7cf93af2eade284a334be)
  is Apache-2.0. All 1,485 pinned upstream files were present; only the two
  documented portability/runtime-selection files differ, and the
  independently authored application bridge is included separately. Apache
  License 2.0 is GPLv3-compatible according to the
  [GNU license list](https://www.gnu.org/licenses/license-list.html#apache2).
- The npm lock contains 337 package records, all with recorded permissive
  license metadata. `npm audit` reported zero vulnerabilities; npm registry
  signatures were verified for 302 packages and attestations for 43.
- Install scripts are explicitly allowed only for the pinned Electron and
  esbuild packages; the pinned electron-winstaller and Tesseract scripts are
  denied.

## Adobe-code boundary

No proprietary Adobe SDK, Adobe decoder binary, or previous embedded decoder
implementation was found in the shipped application. The four known previous
decoder identifiers are absent from the packaged ASAR. They remain only as
negative assertions in two source-only audit/test scripts.

Literal `Adobe` references do exist and are expected:

- PDF.js includes standard Adobe-named CMap data. Its bundled CMap license
  expressly permits source and binary redistribution subject to retaining
  its notice and disclaimer, which are included.
- Open-source nanoPRC/U3D/PDF dependencies contain compatibility wording
  referring to Adobe or Acrobat formats.

Those references are licensed data and upstream documentation, not the
previous decoder code.

## Build and packaged-byte results

- The full release was rebuilt from a fresh extracted corresponding-source
  archive with `npm ci` and `npm run dist`.
- Process-guard/AppContainer tests, nanoPRC and U3D synthetic fixture tests,
  regular-PDF rendering and editing tests, offline OCR tests, DXF geometry and
  encoding tests, DWG-converter checks, and Explorer thumbnail-provider tests
  passed.
- The ASAR contains 285 files. 284 are byte-for-byte identical to the audited
  build source. The sole difference is `package.json`, where Electron Builder
  removes build/dev-only fields; name, version `1.1.14`, entry point, and
  `AGPL-3.0-or-later` remain.
- Electron is 43.2.0 with Chromium 150.0.7871.129. Electron fuses disable
  RunAsNode, NODE_OPTIONS, CLI inspection, and extra file-protocol privileges;
  embedded ASAR integrity and ASAR-only application loading are enabled.
- Native parsers are launched through a process guard with AppContainer, Job
  Object, process-count, time, memory, input, output, cache, and
  scene-complexity limits.
- The corresponding-source archive contains 2,383 files and no Git metadata,
  node_modules, build caches, temporary files, private fixtures, or logs.
- Expanded source, ASAR, runtime resources, native binaries, installer, and
  source archives were scanned for private paths, the build account, the
  observed public IP address, credential filenames, private keys, and
  high-confidence token patterns. No releasable hit remained.

## Known caveats and TODOs

- The installer and first-party application/native binaries are not
  Authenticode-signed. The owner accepted this distribution risk; SmartScreen
  warnings and weaker publisher identity are expected.
- Microsoft Defender and its signatures were disabled on the build machine.
  No Defender malware-signature scan was possible. Do not describe this build
  as antivirus-scanned.
- The packaged installer was audited non-interactively but was not installed
  during the release audit. Test installation and uninstall on a disposable
  Windows machine remain recommended.
- Future hardening work: obtain a code-signing certificate when practical,
  scan release bytes on a protected machine with current signatures, add
  sustained fuzzing for the PRC/U3D/DWG/thumbnail boundaries, and reduce
  upstream U3D compiler warnings.

## Release SHA-256

```text
B42FBA7B526F1759DD67A51FF97540CA2DB2EE0F8544D2639A8DB3827A80ECAF  ExcelsisView-Setup-1.1.14.exe
95B297F325731D8DB9BDE39D72A1BA7647E5C03AF028CE43A3A9579AB544B0DF  ExcelsisView-Setup-1.1.14.exe.blockmap
550321D374BC0185F3BD9016B1C58F387344488CE14B95B7CD3CA27C1A1299C4  SOURCE-ExcelsisView-1.1.14.zip
E71F71BDF44D73898B10EA3CD150B42714703D5D96D7692A6DC4B94253136968  SOURCE-nanoPRC-66cacb70.zip
824D4A94AD12E9EC41153F0CB026A64784131980C43DFE19E075B758BD53E24B  SOURCE-U3D-5c141d9f.zip
9935245817278C944C681527EF52EEE81CCF720FCE09F9FB467D0D6A926AE3CE  SOURCE-LibreDWG-0.14.8492.tar.gz
4DF3C306DDDAAF4BAFFDFF5CA820CC679AC8CD6DC263C6A74517783E42FA7A3B  LICENSE.txt
A0465A64E784E6D6EF180A179583DB47C7C146E81CCA5DDAA89C9A12FBC94115  README.md
45AF690625FED3090CF67EAAA5D76E9485C2B737E43B8EE248D88A888480302D  SOURCE.md
6ACCC2E7482F2B7E53D1250A8D40337B2FCD05978295AFBB8C96197BB6EEA0D3  THIRD_PARTY_NOTICES.md
329538444D744E35FCFEBEDA411D4DFAFD1576FFDDB45DB1B8832FC24B3D0A5C  DISTRIBUTION-RISK-ACCEPTANCE.md
```
