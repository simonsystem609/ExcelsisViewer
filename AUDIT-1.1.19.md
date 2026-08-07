# ExcelsisView 1.1.19 release audit

Audit date: 2026-08-07

Decision: **GO for public release, with the unsigned/no-Defender caveats
below**

This is an engineering and open-source-license assessment, not legal advice,
indemnity, or a promise that no third party can ever make a claim.

## Release and audit delta

- Version 1.1.19 keeps corresponding-source archives beside the standalone
  offline installer, updates PDF.js to 6.2.108, and updates Electron within
  supported major 43 from 43.2.0 to security-patched 43.3.0 (Chromium
  150.0.7871.212, Node.js 24.18.1).
- It includes the 1.1.16 format-specific icon work, the 1.1.17 print-preview
  and high-DPI source rendering, and the 1.1.18 per-page automatic print
  orientation behavior documented in the release source.
- The supplied corresponding source intentionally has no Git metadata, but its
  U3D build and source-packaging scripts originally required `git rev-parse`
  and `git ls-files`. That clean-source build defect was safely fixed: a full
  checkout still verifies Git directly, while the published Git-free archive
  verifies the exact commit through `u3d/UPSTREAM-COMMIT.txt` and enumerates
  every upstream file except `.git` metadata.
- Stale version, distribution-risk, U3D notice, nanoPRC, and security-posture
  documentation was corrected. The package install-script policy now exactly
  allows pinned Electron and esbuild while denying electron-winstaller and
  Tesseract scripts.

## Licensing and provenance

- Authored ExcelsisView code and the release are `AGPL-3.0-or-later`. The NSIS
  license page, packaged identity, installed license, and source use the same
  identifier and complete text.
- nanoPRC is `AGPL-3.0-or-later`, pinned to
  `66cacb70ac1072e9f23b677c5ae8dd83e61709c5`. Its exact modified source,
  modifications, zlib source, generated header, probe, portable build script,
  license, and notice are included.
- The U3D reference implementation is Apache-2.0, pinned to
  `5c141d9f0d366357e2b7cf93af2eade284a334be`. Exact upstream and modified
  portability, pointer-safety, checked-size, image-hardening, bridge, hostile
  test, build, and notice materials are included.
- LibreDWG 0.14.8492 is `GPL-3.0-or-later`, pinned to
  `c34d1efb8fce8dfcd5bd7b4308c0d5e0b9de0a30`, with exact source and license.
  Apache-2.0 is compatible with GPLv3/AGPLv3 distribution when its notices and
  terms are retained, as they are here.
- Complete and production npm audits report zero known vulnerabilities. Exact
  third-party texts and notices cover PDF.js, Tesseract, OpenCV.js, Electron,
  Chromium, native libraries, and build tools.

## Adobe-code boundary

No proprietary Adobe SDK, Adobe decoder binary, former embedded decoder
implementation, vendor-analysis material, or private decoder fixture was found
in the application, source, or installer. Literal Adobe names remain only in
licensed upstream compatibility material: PDF.js CMaps/data, nanoPRC and U3D
documentation/tests, and related open-source format references. Those names
are not evidence of copied proprietary implementation code.

## Build, containment, and packaged bytes

- The complete `npm run dist` path rebuilt the native process guard, nanoPRC,
  U3D, PDF runtime, and Explorer thumbnail provider from the supplied
  corresponding source. Containment, native hostile-input, regular-PDF,
  3D-PDF, DXF/DWG, print, icon, thumbnail, integrity, dependency, security,
  source-packaging, and final packaged-runtime gates passed.
- The installer expands to 132 files. Every file is byte-for-byte identical to
  the clean build's `win-unpacked` tree.
- The ASAR contains 287 files. All 286 non-package files match corresponding
  source byte-for-byte. The generated package identity preserves
  `excelsisview`, version `1.1.19`, `main.cjs`, `AGPL-3.0-or-later`, and
  `private: true`.
- Electron fuses disable RunAsNode, NODE_OPTIONS, CLI inspection, and extra
  file-protocol privileges; embedded ASAR integrity and ASAR-only loading are
  enabled. The embedded ASAR header SHA-256 is
  `2e141d46153416e80f14bff8b4df7eb616817a602ec72c96523bb7ed6cc73eeb`.
- Native PRC, U3D, and DWG processes retain zero-capability AppContainer, Job
  Object, process-count, time, memory, input, output, cache, and scene limits.
  PE format, imports/exports, mitigations, source-archive correspondence, and
  thumbnail-provider registration exports passed the packaged audit.
- The application source archive contains 2,400 files: 399 application files,
  509 nanoPRC files, and 1,492 U3D files. Every archived file matches the
  selected clean source; nanoPRC and U3D also match their standalone source
  assets exactly.
- Source and payload scans found no private identity/path marker, the observed
  public IP address, customer fixture, Git metadata, settings sidecar,
  credential, private key, or high-confidence token. Credential-like strings
  in four vendored Tesseract/OpenCV WebAssembly-text files are random encoded
  instruction substrings, not keys.
- Kaspersky `21.26.4.406`, with full bases dated `2026-08-06 20:00`, scanned
  the exact release assets, expanded installer payload, and expanded
  corresponding source in report-only mode. It processed 10,052 objects with
  zero detections, suspicions, skipped objects, or errors. Six archive-parser
  notices are three repetitions of the same two legacy index members inside
  upstream zlib's `DotZLib.chm`; that 72,726-byte file has SHA-256
  `20D0E3EDD57F849143255A7F0DF1CD59D41DB464A72C0D5AB42846438A729579`,
  exactly matching pinned zlib commit
  `f9dd6009be3ed32415edf1e89d1bc38380ecb95d`, and was not classified as
  suspicious or malicious.

## Release SHA-256

```text
0CB721AD5878424E138C1AE4C25513D62188470F68BBDA15A3E3C46A9119BEFB  ExcelsisView-Setup-1.1.19.exe
2BEE0510B36B31D845A5B8027761DEC4F0AFB552677623CDE7CAD7470B40E99D  ExcelsisView-Setup-1.1.19.exe.blockmap
A7F306D0806CB16289193CC9EEFDA44DCA7926DF3EA4EA70BCD4E6A24FC5062D  SOURCE-ExcelsisView-1.1.19.zip
29BDC1C05140C2CD29A530E9FC0494016B79C19FA4D9F1F48A49D83FDCB8D257  SOURCE-nanoPRC-66cacb70.zip
716717464DDB13D6FF39BE0B2D56D04986B54C3FF9D9AB7FD698958216ADE046  SOURCE-U3D-5c141d9f.zip
9935245817278C944C681527EF52EEE81CCF720FCE09F9FB467D0D6A926AE3CE  SOURCE-LibreDWG-0.14.8492.tar.gz
4DF3C306DDDAAF4BAFFDFF5CA820CC679AC8CD6DC263C6A74517783E42FA7A3B  LICENSE.txt
67E3B89362EFF4296D294018724A4AF971C3F32714B13455438D77D0BFED25A6  README.md
78AE88054467FB105B9A3CEFDFE7021B07A2537B25F17E9FCB7A14B60A0A7CC6  SOURCE.md
FF56419A2168F39E8AA974E6AAAC620467C68B9DFF486317E457FD5AABD2617C  THIRD_PARTY_NOTICES.md
916424261CC4646761C918BC1A54D66BC7168D6EDE5394183BC7A1CEB990D023  DISTRIBUTION-RISK-ACCEPTANCE.md
```

The installer is `117,456,685` bytes. The packaged executable is
`225,512,960` bytes with SHA-256
`375E3A51A8C2FD9416D77160473F831B97729E05FBA9C36FC97DA810DB5B980E`.
The ASAR is `51,532,578` bytes with SHA-256
`F522B727786C272D6A5039679422A3E20A7ABB8FB77EA478B5B34F2889AC9171`.

## Known caveats and follow-up

- The installer and first-party application/native binaries are not
  Authenticode-signed. SmartScreen warnings and weaker publisher identity are
  expected under the owner's standing risk acceptance. Signing remains
  recommended when practical.
- Microsoft Defender was disabled on the build machine. No Defender scan is
  claimed; the Kaspersky result above is the malware-scan evidence.
- The installer was audited non-interactively and the application was not
  launched. Install/upgrade, associations, Explorer thumbnails, mixed-page
  printing, representative document workflows, and uninstall should still be
  exercised on a disposable Windows machine.
- Continue sustained fuzzing of PRC/U3D/DWG/thumbnail inputs and reduce
  inherited U3D warnings as upstream-compatible maintenance permits.

## Post-publication verification

The exact tag target, immutable release, downloaded-back assets, Pages
deployment, and GitHub analysis results are recorded here after publication.
