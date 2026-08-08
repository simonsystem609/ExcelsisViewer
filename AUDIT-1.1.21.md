# ExcelsisView 1.1.21 release audit

Audit date: 2026-08-08

Decision: **GO - published as an immutable, attested, remotely verified
GitHub Release, with the unsigned/no-Defender caveats below**

This is an engineering and open-source-license assessment, not legal advice,
indemnity, or a promise that no third party can ever make a claim.

## Release delta

- DXF toolbar controls no longer shrink or wrap their labels below their
  30-pixel button boxes when the application window narrows. Controls remain
  one line high, compact at laptop-sized widths, and use contained horizontal
  overflow only when the full control set cannot fit.
- The regression test now requires the non-wrapping, non-shrinking, and
  overflow-containment rules. The corrected DXF toolbar was visually checked
  at the reported 1,225-pixel content width. The regular-PDF/3D-PDF toolbar was
  also checked at that width and did not require a change.
- Product behavior, native decoders, format handling, process containment,
  licenses, and third-party sources are unchanged from the audited 1.1.20
  baseline. The full build, source, security, dependency, containment, format,
  and packaged-byte gates were nevertheless rerun against the exact 1.1.21
  candidate.

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
- The installer expands to 132 files and 427,870,227 bytes. Every file is
  byte-for-byte identical to the audited build's `win-unpacked` tree.
- The generated package identity preserves `excelsisview`, version `1.1.21`,
  `main.cjs`, `AGPL-3.0-or-later`, and `private: true`.
- Electron fuses disable RunAsNode, NODE_OPTIONS, CLI inspection, and extra
  file-protocol privileges; embedded ASAR integrity and ASAR-only loading are
  enabled. The embedded ASAR header SHA-256 is
  `d328f3ca433330cf49e4832cc5b76b02e174e499ea3cfde14096a5ff3e16f555`.
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
  keys, and no companion AWS-secret pattern is present.
- Kaspersky `21.26.4.406`, with full bases dated `2026-08-08 17:31`, scanned
  the exact release assets, expanded installer payload, expanded corresponding
  source, and expanded standalone third-party sources in report-only mode. It
  processed 20,597 objects with zero detections, suspicions, skipped objects,
  password-protected objects, or errors. Twelve archive-parser notices are
  duplicate views of `Documentation.hhc` and `Documentation.hhk` inside pinned
  zlib's `DotZLib.chm`; that 72,726-byte file has SHA-256
  `20D0E3EDD57F849143255A7F0DF1CD59D41DB464A72C0D5AB42846438A729579`
  and was not classified as suspicious or malicious.

## Release SHA-256

```text
D5F91BF4D8437EC024AED6C27E7A11B3EB8DF8CC293CF519975428E00441A4F8  ExcelsisView-Setup-1.1.21.exe
8C3FAD232FCCA4D1D2BE213B738B1C5B2B734B72405A14A254F14856096885D7  ExcelsisView-Setup-1.1.21.exe.blockmap
74F1D6E29C750E20173235F212018762CEB51C1701520BAA28C4164433972C80  SOURCE-ExcelsisView-1.1.21.zip
0D06CBDA0F02149E0212D8007C541721D81874E7D34595AD30875EBAE633104F  SOURCE-nanoPRC-66cacb70.zip
E7B057AE8998933266EEC481B0A81B995BED9B9D588295BA96384D372CF8BF5D  SOURCE-U3D-5c141d9f.zip
9935245817278C944C681527EF52EEE81CCF720FCE09F9FB467D0D6A926AE3CE  SOURCE-LibreDWG-0.14.8492.tar.gz
4DF3C306DDDAAF4BAFFDFF5CA820CC679AC8CD6DC263C6A74517783E42FA7A3B  LICENSE.txt
5F28D02359617DC094746E388FF4CFA083FC0FEBD47B5F9DC60D1E24FC58804C  README.md
7B1D28D2F83A444A7F1C7823445DC0A0674DB74EB8BE385C834EE4120AC5ADC9  SOURCE.md
13ECFC45D0060CBF6ED52C17F9CF3327E4E831101F036D0A965FC5A1C9615D30  THIRD_PARTY_NOTICES.md
916424261CC4646761C918BC1A54D66BC7168D6EDE5394183BC7A1CEB990D023  DISTRIBUTION-RISK-ACCEPTANCE.md
```

The installer is `117,449,542` bytes. The packaged executable is
`225,512,960` bytes with SHA-256
`1B1A091A2D86C9635CB7DF51121E7C44783B24CE93632FD4B3D713C6BC5DFD8B`.
The ASAR is `51,671,735` bytes with SHA-256
`BB5F4F4B6733F8BD7F5627A036010AF3F3EF8174CAED66417BF68F1BB40CE3AD`.

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

## Post-publication verification

- PR [#5](https://github.com/simonsystem609/ExcelsisViewer/pull/5) merged
  normally after protected CodeQL run `31274889548` passed C/C++,
  JavaScript/TypeScript, and Python. Release commit
  `ec93709358af23dad4cea25e424652d8c0c3cd81` contains the audited source and
  site; the feature commit is
  `e57750c30c1ea41f4d6e79c24a38042dbaa1b340`.
- Annotated tag `excelsis-view-v1.1.21` is object
  `7089215e8c69974d70c32954722306353161339e` and dereferences to the exact
  release commit.
- GitHub Release ID `367289918` is non-draft, non-prerelease, latest, and
  immutable with all 12 intended assets. Before publication, GitHub's recorded
  names, sizes, and SHA-256 digests matched the audited staging set; all 12
  draft assets were independently downloaded, all bytes matched, and the
  downloaded checksum manifest verified its 11 listed payloads. After
  publication, all 12 unauthenticated public asset URLs returned HTTP 200.
- GitHub's signed in-toto release attestation uses predicate
  `https://in-toto.io/attestation/release/v0.2` and was decoded and checked: it
  covers the exact annotated-tag object and all 12 exact asset SHA-256 values.
- Main-branch Pages run `31275151457` and `Push on main` run `31275152356`
  passed for the release commit. The HTTPS Pages site is built, returns the
  1.1.21 installer link, and retains the Helper cross-link and separate
  Excelsis3D plans/development-help section.
- GitHub reports zero open CodeQL, Dependabot, and secret-scanning alerts.
- Viewer `main` now requires a pull request, an up-to-date branch, the three
  language-specific CodeQL `Analyze` checks, and conversation resolution.
  Administrator bypass, force pushes, and branch deletion are disabled.
  Actions must be pinned to full-length commit SHAs.
- Independent remote-download evidence is preserved under
  `C:\GITHUB\viewer-1.1.21-remote-verify-20260808`; intake and final staging
  evidence are under `C:\GITHUB\viewer-1.1.21-intake-20260808` and
  `C:\GITHUB\viewer-1.1.21-final-20260808`.
