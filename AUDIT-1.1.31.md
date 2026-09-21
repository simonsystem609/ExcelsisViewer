# ExcelsisView 1.1.31 release audit

Audit date: 2026-09-21. Local gates passed; publication requires the protected
PR and remote verification below. This is a scoped engineering/open-source
assessment, not legal indemnity or a guarantee against every defect or claim.

## Focused change review

The 1.1.29-to-1.1.31 comparison has 40 changed application paths, including
the unpublished 1.1.30 changes. No product-code correction was made during
public release preparation. Unchanged dependency, native-source, license,
attribution and artwork evidence was reused by exact hashes.

- Shared Rename/Delete controls for DXF, DWG and PDF require the current file
  capability and sole window ownership. Rename keeps folder/type and unsaved
  edits, validates names and uses a no-overwrite Windows rename operation.
  Confirmed deletion uses the Recycle Bin, with no permanent-delete fallback.
  Recents follows successful changes. PDF gains Discard Changes.
- Ordinary PDF Mirror/Scale transforms current/all pages into a new copy,
  including unsaved edits and displayed rotation. Supported text/vector content,
  page boxes and annotation geometry/appearances are transformed without
  rasterization. Native Save selection, source-claim recheck and exclusive file
  creation prevent original/existing-target overwrite, including file aliases.
- Forms/XFA, signatures, multimedia and unsupported annotations are rejected.
  These tools do not transform 3D models or remap bookmark destinations. Full
  format-tool parity is not claimed. Invalid percentages/page bounds fail closed.
- Responsive CAD toolbar ordering is revised; geometry tools remain DXF-only.
  Dependency versions and lockfile resolutions are unchanged from 1.1.29.

## Licensing, provenance and corresponding source

Product, installer, source and notices remain AGPL-3.0-or-later. All 511 PRC and
1,492 U3D source files match the reviewed baseline. nanoPRC remains at
66cacb70ac1072e9f23b677c5ae8dd83e61709c5 (AGPL-3.0-or-later), U3D at
5c141d9f0d366357e2b7cf93af2eade284a334be (Apache-2.0), and LibreDWG 0.14.8492
at c34d1efb8fce8dfcd5bd7b4308c0d5e0b9de0a30 (GPL-3.0-or-later).

The combined source ZIP contains **2,441 files / 205,534,701 bytes**: 438
application, 511 PRC and 1,492 U3D files. Every file matches the independent
build. Standalone native source archives expand to identical native trees;
regenerated ZIP metadata is not a source change. Exact source, build scripts,
lockfiles, dependency source archives, licenses and notices accompany the release.
Git metadata, development caches, private fixtures and build logs are excluded.

See [SOURCE.md](source/ExcelsisView-1.1.31/app-asar-extract/SOURCE.md) and
[THIRD_PARTY_NOTICES.md](source/ExcelsisView-1.1.31/app-asar-extract/THIRD_PARTY_NOTICES.md).
No former proprietary decoder, vendor SDK/analysis material, customer file,
real-world preset or targeted private path was found in this release.

## Independent build and security evidence

- Clean npm ci installed 309 locked packages and audited 310: zero known
  vulnerabilities. Full npm run dist passed native rebuilds, containment,
  hostile-input, workers, PDF/PRC/U3D/OCR, DXF/DWG, Recents/racetrack/file actions,
  icon, updater, thumbnail, dependency, security, source, NSIS and runtime gates.
  The separate production dependency audit also reports zero vulnerabilities.
- New tests passed 24 PDF render comparisons across rotations/crops/annotations,
  text preservation, page scope and rejection cases. Hidden isolated Electron
  tests cover cancel/dirty edits, source confinement, overwrite refusal, rotation,
  Recents and responsive controls. File-action tests exercise real no-overwrite
  Windows rename; recycling is replaced by an asserted synthetic recovery move.
  Neither real user files nor the OS Recycle Bin are modified by these tests.
- All **132 extracted runtime files / 428,060,325 bytes** match build output.
  All **304 non-metadata ASAR files** match corresponding source;
  packaged metadata, feature assets, native mitigations, Electron fuses and
  embedded ASAR integrity pass the runtime audit.
- Private/proprietary byte-marker scans of source, extracted ASAR and runtime
  found nothing. Gitleaks source/history findings consist only of the previously
  reviewed C enum at prc_internal_proto_api.h:48, not a credential. That unchanged
  file has SHA-256 B97879CAFE6DA69219333946B77673A53B087FA091015C88041FDE51C08B4218.
  ASAR and release-commit scans are clear; staged source/index and links verify.
- Kaspersky 21.26, full bases 2026-09-21 02:59, scanned the exact isolated installer copy at 07:37:34-07:37:56 local: **481 processed / 481 OK**, zero detections, suspicions, skipped/protected/corrupt/error counters. Exit zero. Host non-interactive mode ignored the requested report-only action.
  Exact scan copy and original remain hash-identical. WinDefend is stopped;
  no Microsoft Defender scan is claimed.

## Frozen artifacts

Twelve assets include [SHA256SUMS.txt](SHA256SUMS.txt), covering eleven payloads:
installer/blockmap, complete application source, three native source archives,
license, README, source guide, notices and unsigned-distribution risk acceptance.

- Installer: 117,491,257 bytes, SHA-256 `32A361500AA8E65AE466F6EA50B8562A14EC00D31E6822A608E067E9E12DCBCF`.
- Combined source: 105,727,214 bytes, SHA-256 `84D153FB9A3C52985D0B0971B6BAFF6B93F3DD0F13129C072E3B729092B814B0`.
- Manifest: 1,009 bytes, SHA-256 `2CCEA71DE2000D181833E95B087BE596F1FE04605C4F1E58A27595CB506F3B71`.
- Extracted executable SHA-256: `139F31352CA52A800D8A07AE2DCA66933211FC6031CF3894FCAD14E78055F90C`.
- ASAR SHA-256: `47C596ED11F9852FB697D5D3EAE9352348CFD912BCBF805F203E777A3DDD9129`.

## Publication and limits

All three required CodeQL language checks and exact-head analysis receipts must
pass without bypass. Existing reviewed native-code dismissals are retained;
40 raw native analysis results are not described as zero raw findings. New open
alerts block publication. The merge, source tree, annotated tag and twelve draft
assets must match. Fresh public downloads, checksums, signed GitHub release/asset
attestations, main checks, Pages and security-alert counts are verified after
publishing; the final receipt is recorded on the PR. Earlier immutable releases
and history remain unchanged.

Installer/application binaries remain **unsigned** under the existing owner
acceptance. SmartScreen may warn; GitHub attestations are not Authenticode.
This public build was not installed or interactively launched. Automated hidden
renderer tests are not installed-app acceptance. Representative documents,
upgrade, associations, Explorer integration and uninstall still merit user tests.
No confidential document was used. Sustained native fuzzing and signing remain
follow-up work.
