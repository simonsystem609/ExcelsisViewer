# ExcelsisView 1.1.29 release audit

Audit date: 2026-09-20. Local gates passed; publication requires the protected
PR and remote verification below. This is a scoped engineering/open-source
assessment, not legal indemnity or a guarantee against every defect or claim.

## Focused change review

The 1.1.28-to-1.1.29 comparison has 28 changed application paths. Review reused
unchanged native, license, attribution, artwork and dependency evidence by exact
hashes. No application-code correction was made during release preparation.

- Recents provides a near-full-window, closable/searchable local history,
  separated into DXF, DWG and PDF sections. Entries focus an existing document
  or open a new window without replacing unsaved work. History starts with
  this version and is limited to 60 paths per section and a 2 MiB history file.
  Trusted IPC resolves stored section-bound IDs; display text is not HTML.
- DXF Connect with racetrack takes two snapped or arbitrary end-cap centers.
  Straight and curved tracks use closed LWPOLYLINEs with exact circular bulges.
  Width and end radius are linked; curved centerline radius and bend side are
  independent. Invalid inputs fail before mutation; original entities remain,
  with normal style, Undo-before-Save and Save behavior. DWG remains read-only.
- The sole dependency-resolution change is build-only js-yaml 4.3.1 to 4.3.2,
  addressing GHSA-2883-xcg3-v3hh while retaining its MIT license. Runtime pins,
  including Electron 43.3.0 / Chromium 150.0.7871.212, are unchanged.

## Licensing, provenance and corresponding source

The product, source, installer and notices remain AGPL-3.0-or-later. All 511
nanoPRC source files and 1,492 U3D source files match the reviewed public baseline.
nanoPRC remains at 66cacb70ac1072e9f23b677c5ae8dd83e61709c5 (AGPL-3.0-or-later),
U3D at 5c141d9f0d366357e2b7cf93af2eade284a334be (Apache-2.0), and LibreDWG
0.14.8492 at c34d1efb8fce8dfcd5bd7b4308c0d5e0b9de0a30 (GPL-3.0-or-later).
Exact sources, build scripts, license texts and attribution accompany the package.

The combined source ZIP contains **2,432 files / 205,459,953 bytes**: 429
application, 511 nanoPRC and 1,492 U3D files. Every file matches the clean build;
standalone native archives expand to the same native trees. Regenerated ZIP
metadata can change archive hashes without changing native source. Git metadata,
development caches, private fixtures and build logs are excluded.

See [SOURCE.md](https://github.com/simonsystem609/ExcelsisViewer/blob/6c5e4055ec8ae06dc305461e9f93b20cf1ffc0db/source/ExcelsisView-1.1.29/app-asar-extract/SOURCE.md) and
[THIRD_PARTY_NOTICES.md](https://github.com/simonsystem609/ExcelsisViewer/blob/6c5e4055ec8ae06dc305461e9f93b20cf1ffc0db/source/ExcelsisView-1.1.29/app-asar-extract/THIRD_PARTY_NOTICES.md).
Unchanged public compatibility data, fonts and licenses retain their upstream
attribution. No former proprietary decoder, vendor SDK/analysis material,
customer file, real-world preset or private path was found in this release.

## Independent build and security evidence

- Clean npm ci installed 309 locked packages and audited 310: zero known
  vulnerabilities. After selecting the documented Zig 0.16.0 compiler, the
  uninterrupted full npm run dist passed native rebuilds, containment,
  hostile-input, workers, PDF/PRC/U3D/OCR, DXF/DWG, Recents/racetrack, icon,
  updater, thumbnail, dependency, security, source-package, NSIS and packaged
  runtime gates. The separate production audit also found zero vulnerabilities.
- Recents tests cover persistence, section isolation, deduplication, ordered
  writes, bounds, bad-history recovery and safe DOM. Racetrack tests cover
  84 geometry cases, exact tangency, independent radii, invalid-input rejection,
  UI wiring and planner immutability. No raw/unpacked Viewer was launched.
- All **132 extracted runtime files / 428,018,171 bytes** match clean build
  output. All **299 non-metadata ASAR files** match corresponding source;
  packaged metadata, feature assets, native mitigations, Electron fuses and
  embedded ASAR integrity pass the runtime audit.
- Private/proprietary byte-marker scans of source, extracted ASAR and runtime
  found nothing. Gitleaks history/source findings consist only of the already
  reviewed nanoPRC C enum at prc_internal_proto_api.h:48, not a credential.
  That unchanged file has SHA-256
  `B97879CAFE6DA69219333946B77673A53B087FA091015C88041FDE51C08B4218`.
  Extracted ASAR has no secret findings. Staged/commit checks are required
  before push; existing native-source review is not reopened by a ZIP timestamp.
- Kaspersky 21.26, full bases dated 2026-09-19 23:14, recursively scanned an
  exact isolated installer copy at 03:52:31-03:52:50 local on 2026-09-20:
  **476 processed / 476 OK**, zero detections, suspicions, skipped, protected,
  corrupt or error counters; exit zero. Host non-interactive mode ignored the
  requested report-only action. Scan copy and original stayed hash-identical.
  WinDefend was stopped; no independent Defender scan is claimed.

## Frozen artifacts

There are 12 assets, including [SHA256SUMS.txt](https://github.com/simonsystem609/ExcelsisViewer/blob/6c5e4055ec8ae06dc305461e9f93b20cf1ffc0db/SHA256SUMS.txt), which covers all
11 payloads: installer/blockmap, complete application source, three native
source archives, license, README, source guide, notices and risk acceptance.

- Installer: 117,481,169 bytes, SHA-256
  `66346E1AD2117597C25F94DED806F5E0F32EBA050C8A7D151DB3FCD9DE6705EF`.
- Combined source: 105,700,974 bytes, SHA-256
  `112F41C68D603FBA0959E658050F9A19846811C59FCDCA7BAAA1DAED13FD9DAE`.
- Checksum manifest: 1,009 bytes, SHA-256
  `65CB8980619719268658EA041BE1CEBD63899F204773B6539B1E4098DAF9408C`.
- Extracted executable SHA-256:
  `4C010114292CD9E3784E046CF211DBC2E1A3B0BDD29AA779A76B9F54B023358F`.
- ASAR SHA-256:
  `D760BA906E5D14E43B8069640554646C01557CD59333C3BF3A9AB72E3B8A9277`.

## Publication and limits

All three required CodeQL language checks must pass without bypass; new open
alerts block publication. Existing reviewed native-code dismissals are retained,
not reclassified as zero raw analysis results. The merge, source tree, annotated
tag and all 12 draft assets must match. Fresh public downloads, manifest entries,
signed GitHub release/asset attestations, live Pages and all open security-alert
counts are verified after publishing; the final receipt is recorded on the PR.
Earlier immutable releases and history are not replaced or relabeled.

Installer and application remain **unsigned** under the existing owner acceptance.
SmartScreen may warn; GitHub attestations are not Authenticode. The independent
public rebuild was not installed or interactively tested. Product-development
renderer/installed evidence is separate and is not claimed as this audit's own.
Representative document workflows, upgrade, associations, Explorer integration
and uninstall still merit user acceptance; sustained native fuzzing and signing
remain follow-up work. No confidential document was used in this release review.
