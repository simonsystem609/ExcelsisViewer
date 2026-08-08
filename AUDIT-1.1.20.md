# ExcelsisView 1.1.20 release audit

Audit date: 2026-08-08

Decision: **GO for GitHub review and publication only if the clean remote
CodeQL and release workflows pass, with the unsigned/no-Defender caveats
below**

This is an engineering and open-source-license assessment, not legal advice,
indemnity, or a promise that no third party can ever make a claim.

## Release and security delta

- All 59 CodeQL alerts open against the 1.1.19 baseline were reviewed against
  the exact release build. Twenty-one affected shipped code and were fixed;
  37 belong to preserved upstream demonstrations, tests, renderers, or bundled
  dependency branches that are not compiled; one is legacy PDF decryption
  required for document compatibility. The complete alert-by-alert grouping
  and build evidence are in `CODEQL-TRIAGE-1.1.20.md`.
- The generated 3D runtime is now reproducible from pinned Three.js 0.160.0,
  pako 2.1.0, buffer 6.0.3, ieee754 1.2.1, and base64-js 1.5.1 source
  tarballs. The single Three.js object-UUID generator uses Web Crypto instead
  of `Math.random`; a regression test disables `Math.random`, constructs the
  affected object types, and verifies UUID shape, uniqueness, source hashes,
  Buffer behavior, and pako round trips.
- nanoPRC now carries a checked NURBS count through allocation and indexing as
  `size_t`, compiles only the JPEG and PNG stb_image decoders used by PRC
  pictures, widens active PNG/conversion sizes, and rejects zlib allocation
  overflow. A native regression verifies PNG decoding and rejection of a
  disabled GIF decoder.
- Native release builds now strip debug paths and apply compiler prefix maps.
  This closed a newly discovered compiler-metadata leak of the local staging
  path. The security audit rejects future nanoPRC binaries containing private
  Windows build paths.

## Licensing and provenance

- Authored ExcelsisView code and the release are `AGPL-3.0-or-later`. The NSIS
  license page, packaged identity, installed license, source, and repository
  use the same identifier and complete text.
- nanoPRC is `AGPL-3.0-or-later`, pinned to
  `66cacb70ac1072e9f23b677c5ae8dd83e61709c5`. Its exact modified source,
  modifications, zlib source, generated header, probe, tests, build script,
  license, and notice are included.
- The U3D reference implementation is Apache-2.0, pinned to
  `5c141d9f0d366357e2b7cf93af2eade284a334be`. Its exact upstream and modified
  build, portability, pointer-safety, checked-size, image-hardening, bridge,
  hostile-test, license, and notice materials are included.
- LibreDWG 0.14.8492 is `GPL-3.0-or-later`, pinned to
  `c34d1efb8fce8dfcd5bd7b4308c0d5e0b9de0a30`, with exact source and license.
  Apache-2.0 is compatible with GPLv3/AGPLv3 distribution when its notices and
  terms are retained, as they are here.
- Complete and production npm audits report zero known vulnerabilities. Exact
  third-party texts and notices cover the bundled runtime, native libraries,
  fonts, language data, and build tools.

## Adobe-code boundary

No proprietary Adobe SDK, Adobe decoder binary, former embedded decoder
implementation, vendor-analysis material, or private decoder fixture was found
in the application, source, or installer. Literal Adobe names remain only in
licensed upstream compatibility material such as PDF.js CMaps/data and public
nanoPRC/U3D documentation and tests. Those names are not evidence of copied
proprietary implementation code.

## Build, containment, and packaged bytes

- A clean `npm ci` installed 309 packages and reported zero vulnerabilities.
  The complete `npm run dist` path rebuilt the native process guard, nanoPRC,
  U3D, deterministic PDF runtime, and Explorer thumbnail provider from the
  supplied corresponding source. Containment, native hostile-input,
  regular-PDF, 3D-PDF, DXF/DWG, print, icon, thumbnail, integrity, dependency,
  security, source-packaging, and final packaged-runtime gates passed.
- The installer expands to 132 files. Every file is byte-for-byte identical to
  the clean build's `win-unpacked` tree.
- The ASAR contains 287 files. All 286 non-package files match corresponding
  source byte-for-byte. The generated package identity preserves
  `excelsisview`, version `1.1.20`, `main.cjs`, `AGPL-3.0-or-later`, and
  `private: true`.
- Electron fuses disable RunAsNode, NODE_OPTIONS, CLI inspection, and extra
  file-protocol privileges; embedded ASAR integrity and ASAR-only loading are
  enabled. The embedded ASAR header SHA-256 is
  `9baa33b0b73aa44c5d16dda7ece45341ab0d43223abde24585879bdb4f223895`.
- Native PRC, U3D, and DWG processes retain zero-capability AppContainer, Job
  Object, process-count, time, memory, input, output, cache, and scene limits.
  PE format, imports/exports, mitigations, source-archive correspondence, and
  thumbnail-provider registration exports passed the packaged audit.
- The application source archive contains 2,412 files: 409 selected
  application files, 511 nanoPRC files, and 1,492 U3D files. Every archived
  file matches the clean selected source; nanoPRC and U3D also match their
  standalone source assets exactly.
- Source and payload scans found no private identity/path marker, customer
  fixture, Git metadata, settings sidecar, credential, private key, JWT, or
  high-confidence token. Four credential-like substrings in unchanged vendored
  OpenCV/Tesseract WebAssembly text are random encoded instruction bytes, not
  keys. Former decoder identifiers occur only in source-side negative tests
  that assert their absence.
- Kaspersky `21.26.4.406`, with bases dated `2026-08-08 10:08`, scanned the
  exact release assets, expanded installer payload, and expanded corresponding
  source in report-only mode. It processed 7,700 objects with zero detections,
  suspicions, skipped objects, password-protected objects, or errors. Four
  archive-parser notices are duplicate views of `Documentation.hhc` and
  `Documentation.hhk` inside pinned zlib's `DotZLib.chm`; that 72,726-byte file
  has SHA-256
  `20D0E3EDD57F849143255A7F0DF1CD59D41DB464A72C0D5AB42846438A729579`
  and was not classified as suspicious or malicious.

## Release SHA-256

```text
8F09F763E98F029118C2F321FAE36318FE20FFAE62685FBE9DBD4AB93BD16C75  ExcelsisView-Setup-1.1.20.exe
04D3C7E8CA4032FF32E88D8F4B6F46562E2A57FE6B734167CC32AC47E28FFF3E  ExcelsisView-Setup-1.1.20.exe.blockmap
10D80B2C424A2278233261E80D38B4C6F02706A6B2BAD67AE15DD7406F9CD116  SOURCE-ExcelsisView-1.1.20.zip
D8292C2B4A8642023F58ACA300844D79A54433729F36C956C881B3924FC94EF8  SOURCE-nanoPRC-66cacb70.zip
8B4C2C71009F15CD617F36332FC27CDC0D4E01C053F59CDE8B14BE21C5040AB4  SOURCE-U3D-5c141d9f.zip
9935245817278C944C681527EF52EEE81CCF720FCE09F9FB467D0D6A926AE3CE  SOURCE-LibreDWG-0.14.8492.tar.gz
4DF3C306DDDAAF4BAFFDFF5CA820CC679AC8CD6DC263C6A74517783E42FA7A3B  LICENSE.txt
A3316AAF795C2BCCDA80D1FF7DEA3052F7F72D4573DED9B5DB1DFF37BD743067  README.md
6DA7893742D92016C8E2F33EC642BCF727176F44D687DF679500493A698E3738  SOURCE.md
2D9DDF3008D3DF6A8182E0A55AC3997A6E9BCDD62D50C3C1BEC141ED18B7F7C9  THIRD_PARTY_NOTICES.md
916424261CC4646761C918BC1A54D66BC7168D6EDE5394183BC7A1CEB990D023  DISTRIBUTION-RISK-ACCEPTANCE.md
```

The installer is `117,449,395` bytes. The packaged executable is
`225,512,960` bytes with SHA-256
`3136949CEEE93151E0BEDFC978E2A27DE41139EBA23EB4BAB2A57E865ECB7721`.
The ASAR is `51,671,351` bytes with SHA-256
`54244275747634DE26707D15269885A6C14729A8A7E042C58F8A42E2DBD60ED3`.

## Known caveats and follow-up

- The installer and first-party application/native binaries are not
  Authenticode-signed. SmartScreen warnings and weaker publisher identity are
  expected under the owner's standing risk acceptance. Signing remains
  recommended when practical.
- Microsoft Defender was disabled on the build machine. No Defender scan is
  claimed; the Kaspersky result above is the malware-scan evidence.
- The installer was audited non-interactively and the application was not
  launched. Install/upgrade, associations, Explorer thumbnails, mixed-page
  printing, representative PDF/PRC/U3D/DWG/DXF workflows, and uninstall should
  still be exercised on a disposable Windows machine.
- Alert #64 remains intentionally: RC4/MD5 are required by the legacy PDF
  Standard Security Handler when opening some user documents. This code is not
  used for credentials, authentication, updates, signatures, or application
  integrity. The other 37 proposed dismissals are target-specific, uncompiled
  upstream source; neither category weakens a shipped trust boundary.
- Continue sustained fuzzing of PRC/U3D/DWG/thumbnail inputs and reduce
  inherited native warnings through upstream-compatible changes where
  practical.

## Post-publication verification

- Pull request [#4](https://github.com/simonsystem609/ExcelsisViewer/pull/4)
  passed all three CodeQL language jobs and was merged normally. Release commit
  `f74eb74fdd8b01717b219fe8920bdbc28ff84082` is the exact target of annotated
  tag `excelsis-view-v1.1.20` (tag object
  `2b858aefab0446e4c17b56e22883fc622e8b4fbd`).
- GitHub release `367248698` is published and immutable. Its 12 uploaded assets
  have the expected names, sizes, and GitHub-reported SHA-256 digests. A fresh
  independent download matched all 12 staged files byte-for-byte, and the
  downloaded checksum manifest verified all 11 listed artifacts.
- GitHub's signed release attestation verifies the tag and all 12 asset
  digests. `gh release verify-asset` also verified each independently
  downloaded file against that release attestation.
- Default-branch CodeQL runs
  [31266916305](https://github.com/simonsystem609/ExcelsisViewer/actions/runs/31266916305)
  and
  [31267696053](https://github.com/simonsystem609/ExcelsisViewer/actions/runs/31267696053)
  passed. After publication, open CodeQL, Dependabot, and secret-scanning alert
  counts were all zero. The final triage consists of 21 shipped findings fixed
  in source and 38 findings dismissed individually with target-specific
  evidence; no blanket query suppression was added.
- Pages deployment
  [31266915778](https://github.com/simonsystem609/ExcelsisViewer/actions/runs/31266915778)
  succeeded at the release commit. The live
  [project page](https://simonsystem609.github.io/ExcelsisViewer/) returned
  HTTP 200 and exposed the 1.1.20 release, exact installer link, audit, separate
  Excelsis3D section, development-help content, and Helper cross-link. The
  independently downloaded installer is exactly `117,449,395` bytes.
