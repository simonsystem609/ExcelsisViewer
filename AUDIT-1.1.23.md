# ExcelsisView 1.1.23 release audit

Audit dates: 2026-08-11 to 2026-08-12

Decision: **GO for publication through the protected pull-request and
immutable-release workflow, with the unsigned/no-Defender caveats below**

This is an engineering and open-source-license assessment, not legal advice,
indemnity, or a promise that no third party can ever make a claim.

## Release delta

- DXF/DWG loading now uses `$TILEMODE` and entity group 67 to display the
  active model or paper space instead of drawing both spaces together.
  `POLYLINE`/`VERTEX` and attributed `INSERT`/`ATTRIB` sequences are advanced
  as complete records so an inactive child cannot leak into the visible view.
- Large converted DWGs defer editable contour grouping until Save As DXF,
  cache world-space `Path2D` render batches, use spatially indexed pointer
  candidates, and limit feature-list DOM creation to 1,000 ordinary entries
  plus selected entries.
- Repeated full-document serialization was removed from ordinary dirty-state
  updates, duplicate raw pair fields were removed, and transformed annotation
  and attributed-insert records remain covered by the DXF tests.
- The authorized private regression DWG converted successfully inside the
  application's AppContainer. Its converted DXF has `$TILEMODE=1`, 11,014
  model-space records, 10,923 paper-space records, and one paper-space set;
  only the 46,001 active expanded entities are retained instead of 90,258
  entities from both spaces. No private drawing or converted output is in the
  repository or release.
- The responsive two-row DXF toolbar fix from 1.1.22 is retained. Regular-PDF
  and 3D-PDF behavior is otherwise unchanged.

## Licensing and provenance

- Authored ExcelsisView code and the release are `AGPL-3.0-or-later`. The NSIS
  license page, package metadata, installed license, source, and repository use
  the same identifier and complete GNU AGPLv3 text.
- nanoPRC is `AGPL-3.0-or-later`, pinned to
  `66cacb70ac1072e9f23b677c5ae8dd83e61709c5`. Its exact modified source,
  modifications, zlib source, generated header, probe, tests, build script,
  license, and notices accompany the installer. Its 511 expanded files match
  the copy inside the application corresponding source exactly.
- The U3D reference implementation is Apache-2.0, pinned to
  `5c141d9f0d366357e2b7cf93af2eade284a334be`. Its exact upstream and modified
  build, portability, pointer-safety, checked-size, image-hardening, bridge,
  hostile-test, license, and notice materials accompany the installer. All
  1,492 expanded files match the application corresponding source exactly.
- LibreDWG 0.14.8492 is `GPL-3.0-or-later`, pinned to
  `c34d1efb8fce8dfcd5bd7b4308c0d5e0b9de0a30`, with exact source and license.
  Apache-2.0 is compatible with GPLv3/AGPLv3 distribution when its notices and
  terms are retained, as they are here.
- The complete and production npm audits report zero known vulnerabilities.
  Exact third-party texts and notices cover the bundled runtime, native
  libraries, fonts, language data, and build tools.

## Adobe-code boundary

No proprietary Adobe SDK, Adobe decoder binary, former embedded decoder
implementation, vendor-analysis material, or private decoder fixture was found
in the application, corresponding source, installer, or expanded payload.
Literal Adobe names remain only in licensed upstream compatibility material,
primarily PDF.js CMaps/data and public nanoPRC/U3D documentation and tests.
Those names are not evidence of copied proprietary implementation code.

## Build, containment, and packaged bytes

- A clean `npm ci` installed 309 packages and reported zero vulnerabilities.
  The complete `npm run dist` path rebuilt the native process guard, nanoPRC,
  U3D, browser/PDF runtimes, and Explorer thumbnail provider from the supplied
  source. Containment, hostile-input, PDF/PRC/U3D, DWG/DXF, print, icon,
  thumbnail, integrity, dependency, security, source-package, and final
  packaged-runtime gates passed.
- The supplied installer independently expands to 132 files and 427,881,432
  bytes. Every file is byte-for-byte identical to the supplied audited
  `win-unpacked` tree. The complete packaged-runtime audit also passed against
  the pristine corresponding source and all installer-adjacent source assets.
- A second clean build reproduced 126 of the 132 runtime files byte-for-byte.
  The remaining differences are the expected linker timestamp/build-ID fields
  in four rebuilt native images and the cascading external-integrity/ASAR
  metadata in `app.asar` and `ExcelsisView.exe`. The executable code/data
  sections match; nanoPRC differs only in `.buildid`, U3D libraries only in PE
  timestamps/checksums and `.edata`, and the U3D exporter has no differing
  section. The process guard and stamped Explorer provider reproduce exactly.
- Electron 43.3.0 embeds Chromium 150.0.7871.212. Fuses disable RunAsNode,
  `NODE_OPTIONS`, CLI inspection, and extra file-protocol privileges; embedded
  ASAR integrity and ASAR-only loading are enabled. The supplied ASAR header
  SHA-256 is
  `c67e3e3f0da2994ced443905ec8f04d5cbc5f31a4cde0cf0653822f8da58a1b9`.
- Native PRC, U3D, and DWG processes retain zero-capability AppContainer, Job
  Object, process-count, time, memory, input, output, cache, and scene limits.
  PE format, imports/exports, ASLR/NX mitigations, source correspondence, and
  thumbnail-provider registration exports passed the packaged audit.
- The application source archive contains 2,414 files: 411 selected
  application files, 511 nanoPRC files, and 1,492 U3D files. Archive paths are
  normalized and unique, and every standalone native source file matches its
  application-source copy.
- Source and payload scans found no private identity/path marker, customer
  fixture, Git metadata, settings sidecar, private key, JWT, high-confidence
  token, or public contact email. Credential-shaped matches in four unchanged
  vendored OpenCV/Tesseract WebAssembly text files are encoded instruction
  bytes without a companion secret.
- Kaspersky `21.26.4.406`, with full bases dated `2026-08-11 20:36`, scanned
  the exact candidate assets and independently extracted runtime in all-file,
  cache-bypassed report-only mode. It processed 10,976 objects with zero
  detections, suspicions, skipped objects, password-protected objects, or
  errors. Six archive-parser notices are three nested views of
  `Documentation.hhc` and `Documentation.hhk` inside pinned zlib's
  `DotZLib.chm`; that 72,726-byte file has SHA-256
  `20D0E3EDD57F849143255A7F0DF1CD59D41DB464A72C0D5AB42846438A729579`
  and was not classified as suspicious or malicious.

## Release SHA-256

```text
1B40EB47E5C47E7C7E4E9F66144525D4B2FF1C37957D54D64D7C0407C68DA0DE  ExcelsisView-Setup-1.1.23.exe
B0F772837AE03E8D2FB0D8764BE0D22A1C1C3B6586440618C7EB07C48B151C13  ExcelsisView-Setup-1.1.23.exe.blockmap
5ACFE320927B5C087EED513C8581C1E5D3F8ECFD2DC10C53EEF33BC499FCD26C  SOURCE-ExcelsisView-1.1.23.zip
E30BCC3966A339626E9119F44700CB60E87DCE75589F9EE7C4101EAF7E41F394  SOURCE-nanoPRC-66cacb70.zip
BF0A55376688DAE383DA147E2E41FD4766E6543492D9D6601FD5F8209581883C  SOURCE-U3D-5c141d9f.zip
9935245817278C944C681527EF52EEE81CCF720FCE09F9FB467D0D6A926AE3CE  SOURCE-LibreDWG-0.14.8492.tar.gz
4DF3C306DDDAAF4BAFFDFF5CA820CC679AC8CD6DC263C6A74517783E42FA7A3B  LICENSE.txt
4233F4539856B1866477828C4DDFF51BAB53D8DE3B0426721C6EA909AB495D6C  README.md
25740194898A1A491D18BC0BC3BCA2A9C8107FE73857829AA5C65392C912DD5E  SOURCE.md
3A32C7D76DE01108CABCCFE6CBA8FE71F0F4B0C151D8475B27D79C003316F36F  THIRD_PARTY_NOTICES.md
916424261CC4646761C918BC1A54D66BC7168D6EDE5394183BC7A1CEB990D023  DISTRIBUTION-RISK-ACCEPTANCE.md
```

The checksum-manifest SHA-256 is
`8570B0411E549E73F8C7D19EB1D723A0B93607374F3CB02F3F27CB2FEF1A136D`.
The installer is 117,452,188 bytes. The packaged executable is 225,512,960
bytes with SHA-256
`D1BEA3F15AE3B1C620D2D7BF70CA643A98AC68042A5E4497EB591AA600CD415C`.
The ASAR is 51,682,478 bytes with SHA-256
`EB35772CA6DE2008C41216B55649BB5B9CCC7484EA18EF79E283983734629D2E`.

## Known caveats and follow-up

- The installer and first-party application/native binaries are not
  Authenticode-signed. SmartScreen warnings and weaker publisher identity are
  expected under the owner's standing risk acceptance. Signing remains
  recommended when practical.
- Microsoft Defender is disabled on the build machine. No Defender scan is
  claimed; the Kaspersky result above is the malware-scan evidence.
- `$TILEMODE` and group 67 fully distinguish the model/paper sets in the
  regression conversion. A future compatibility improvement should also use
  `$CTAB` and entity group 410 when a DXF contains multiple named paper-layout
  tabs; this is not needed by the one-layout regression file.
- Install/upgrade, file associations, Explorer thumbnails, mixed-page
  printing, representative PDF/PRC/U3D/DWG/DXF workflows, and uninstall should
  still be exercised on a disposable Windows machine. The installer will be
  launched only after its published bytes are independently verified.
- Continue sustained fuzzing of PRC/U3D/DWG/thumbnail inputs and reduce
  inherited native warnings through upstream-compatible changes where
  practical.

## Publication verification

Publication through the protected branch, immutable GitHub Release,
attestation, remote-download, Pages, CodeQL, and alert checks is pending. This
section will be updated with exact commit, tag, release, run, and verification
identifiers after those remote gates complete.
