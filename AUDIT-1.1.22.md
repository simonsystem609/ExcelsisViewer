# ExcelsisView 1.1.22 release audit

Audit date: 2026-08-08

Decision: **GO for the protected, immutable GitHub release workflow, with the
unsigned/no-Defender caveats below**

This is an engineering and open-source-license assessment, not legal advice,
indemnity, or a promise that no third party can ever make a claim.

## Release delta

- DXF toolbar labels remain one line high. At widths up to 1,320 pixels, the
  toolbar changes from one row to an explicit two-row grid instead of creating
  a horizontal scrollbar. The file controls and mode controls occupy the first
  row; the remaining view/edit controls occupy the second row.
- The responsive regression test requires the compact rules, non-wrapping
  labels, non-shrinking control groups, two-row breakpoint, group placement,
  and absence of toolbar scrolling.
- The built application was visually measured at 1,500, 1,321, 1,225, and 900
  pixels. It remained one row above the breakpoint and exactly two rows at and
  below the breakpoint, with no clipped controls or page/toolbar overflow.
  The regular-PDF toolbar retained its existing wrapping behavior and required
  no change.
- Product behavior, native decoders, format handling, process containment,
  licenses, and third-party source contents are unchanged from the audited
  1.1.21 baseline. The full build, source, security, dependency, containment,
  format, and packaged-byte gates were nevertheless rerun against the exact
  1.1.22 candidate.

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
  hostile-test, license, and notice materials are included. The 1.1.22 U3D ZIP
  has regenerated ZIP metadata, but all 1,492 expanded files are byte-identical
  to the audited 1.1.21 source.
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
- The installer expands to 132 files and 427,870,562 bytes. Every file is
  byte-for-byte identical to the audited build's `win-unpacked` tree.
- The generated package identity preserves `excelsisview`, version `1.1.22`,
  `main.cjs`, `AGPL-3.0-or-later`, and `private: true`.
- Electron 43.3.0 embeds Chromium 150.0.7871.212. Fuses disable RunAsNode,
  `NODE_OPTIONS`, CLI inspection, and extra file-protocol privileges; embedded
  ASAR integrity and ASAR-only loading are enabled. The embedded ASAR header
  SHA-256 is
  `7c409b7ec01c906da3e854e30db00163ebb50f25b9b6a71f9043ee291a1ebf5d`.
- Native PRC, U3D, and DWG processes retain zero-capability AppContainer, Job
  Object, process-count, time, memory, input, output, cache, and scene limits.
  PE format, imports/exports, mitigations, source-archive correspondence, and
  thumbnail-provider registration exports passed the packaged audit.
- The application source archive contains 2,412 files: 409 selected
  application files, 511 nanoPRC files, and 1,492 U3D files. Every archived
  file matches the selected build input; nanoPRC and U3D also match their
  standalone source assets exactly.
- Source, expanded ASAR, and payload scans found no private identity/path
  marker, customer fixture, `.git` repository/history directory, settings
  sidecar, credential,
  private key, JWT, or high-confidence token. Credential-shaped matches in
  four vendored OpenCV/Tesseract WebAssembly text files are unchanged random
  encoded instruction bytes; all four files are byte-identical to 1.1.21 and
  no companion secret is present.
- Kaspersky `21.26.4.406`, with full bases dated `2026-08-08 17:31`, scanned
  the exact release assets, expanded installer payload, expanded corresponding
  source, and expanded standalone third-party sources in report-only mode. It
  processed 21,043 objects with zero detections, suspicions, skipped objects,
  password-protected objects, or errors. Twelve archive-parser notices are
  duplicate views of `Documentation.hhc` and `Documentation.hhk` inside pinned
  zlib's `DotZLib.chm`; that 72,726-byte file has SHA-256
  `20D0E3EDD57F849143255A7F0DF1CD59D41DB464A72C0D5AB42846438A729579`
  and was not classified as suspicious or malicious.

## Release SHA-256

```text
BA39596982B58FFA04F41FDB47847ECEFDA5946A76F086C084F44DD1323C99B7  ExcelsisView-Setup-1.1.22.exe
474F1FC840F18E87D20C81F6966F9095ED1C7585E5223DD3413341988B83AAEB  ExcelsisView-Setup-1.1.22.exe.blockmap
8D47EE36C6F30AD6EED31DD0F27899D4AA52525431AFD707758373B2476745D9  SOURCE-ExcelsisView-1.1.22.zip
0D06CBDA0F02149E0212D8007C541721D81874E7D34595AD30875EBAE633104F  SOURCE-nanoPRC-66cacb70.zip
93B713F1DC31BD545C0AB04FEA179FD73AF45B722AC03098633CBC70E68EB6F5  SOURCE-U3D-5c141d9f.zip
9935245817278C944C681527EF52EEE81CCF720FCE09F9FB467D0D6A926AE3CE  SOURCE-LibreDWG-0.14.8492.tar.gz
4DF3C306DDDAAF4BAFFDFF5CA820CC679AC8CD6DC263C6A74517783E42FA7A3B  LICENSE.txt
613C789FE49B746293753F1D01F0E8AA40ACB2BE598E9CE2DAAD541C37984CD6  README.md
47D42F760A8CCCC22B42716F08869E80E05C68212D4AABB5077F8C3CF7109F97  SOURCE.md
0D42840143564621D46423F302F0DDF4FA4C1FF507DF1BE9D84F7996C5087638  THIRD_PARTY_NOTICES.md
916424261CC4646761C918BC1A54D66BC7168D6EDE5394183BC7A1CEB990D023  DISTRIBUTION-RISK-ACCEPTANCE.md
```

The checksum-manifest SHA-256 is
`784ADA11F40E98808DA7DE6E017A3A411DAACC441D8925BD78C86357B7946BF4`.
The installer is 117,449,603 bytes. The packaged executable is 225,512,960
bytes with SHA-256
`C52490151D375EFE6E09365AD38E1E77D7C96BDDA3050EC517048F46AA8F5D61`.
The ASAR is 51,672,056 bytes with SHA-256
`F41F8256B62F2AAD2603B533B9FC01C600ED9F704A2B2C64DE6AC49E4E725229`.

## Known caveats and follow-up

- The installer and first-party application/native binaries are not
  Authenticode-signed. SmartScreen warnings and weaker publisher identity are
  expected under the owner's standing risk acceptance. Signing remains
  recommended when practical.
- Microsoft Defender was disabled on the build machine. No Defender scan is
  claimed; the Kaspersky result above is the malware-scan evidence.
- Install/upgrade, file associations, Explorer thumbnails, mixed-page
  printing, representative PDF/PRC/U3D/DWG/DXF workflows, and uninstall should
  still be exercised on a disposable Windows machine. The installer will be
  launched only after its published bytes are independently verified.
- Continue sustained fuzzing of PRC/U3D/DWG/thumbnail inputs and reduce
  inherited native warnings through upstream-compatible changes where
  practical.

## Publication controls

Publication requires a protected pull request with all three language-specific
CodeQL checks passing, an annotated `excelsis-view-v1.1.22` tag, a draft
release whose 12 assets match this audit, an independent remote download and
checksum verification before publication, release immutability, signed GitHub
release attestation verification, Pages verification, and zero open CodeQL,
Dependabot, or secret-scanning alerts. Post-publication evidence will be added
to this audit without changing the immutable release or tag.
