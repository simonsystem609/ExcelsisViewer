# ExcelsisView 1.1.32 release audit

Audit date: 2026-09-21. Local gates passed; publication requires the protected
PR and remote verification below. This is a scoped engineering/open-source
assessment, not legal indemnity or a guarantee against every defect or claim.

## Focused change review

The release includes the unpublished 1.1.30/1.1.31 changes and the owner's
explicitly requested keyboard-navigation addition, implemented in isolated
staging as 1.1.32. No private workspace was modified. Unchanged dependency,
native-source, license, attribution and artwork evidence was reused by hashes.

- Left/Right activates the same previous/next file actions as the mouse in DXF,
  DWG and PDF. PDF gains separate file buttons without changing its page
  buttons. Typing/contenteditable controls, open dialogs, modifier/repeated/
  composing keys and busy operations are guarded. Boundaries do not wrap;
  other-window files are skipped. Dirty editable DXF/PDF navigation requires
  saving; Cancel stays on the original. DWG remains read-only.

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

The combined source ZIP contains **2,443 files / 205,548,112 bytes**: 440
application, 511 PRC and 1,492 U3D files. Every file matches the independent
build. Standalone native source archives expand to identical native trees;
regenerated ZIP metadata is not a source change. Exact source, build scripts,
lockfiles, dependency source archives, licenses and notices accompany the release.
Git metadata, development caches, private fixtures and build logs are excluded.

See [SOURCE.md](source/ExcelsisView-1.1.32/app-asar-extract/SOURCE.md) and
[THIRD_PARTY_NOTICES.md](source/ExcelsisView-1.1.32/app-asar-extract/THIRD_PARTY_NOTICES.md).
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
- The new hidden-renderer navigation suite passes both directions and boundaries
  for DXF, DWG and PDF, input/textarea/select/contenteditable and modal guards,
  modifier/repeat/composition guards, other-window skipping, and dirty DXF/PDF
  save/cancel preservation. Only synthetic fixtures and isolated profiles are used.
- All **132 extracted runtime files / 428,066,044 bytes** match build output.
  All **305 non-metadata ASAR files** match corresponding source;
  packaged metadata, feature assets, native mitigations, Electron fuses and
  embedded ASAR integrity pass the runtime audit.
- Private/proprietary byte-marker scans of source, extracted ASAR and runtime
  found nothing. Gitleaks source/history findings consist only of the previously
  reviewed C enum at prc_internal_proto_api.h:48, not a credential. That unchanged
  file has SHA-256 B97879CAFE6DA69219333946B77673A53B087FA091015C88041FDE51C08B4218.
  ASAR and release-commit scans are clear; staged source/index and links verify.
- Kaspersky 21.26, full bases 2026-09-21 08:37, scanned the exact isolated installer at 13:45:28-13:45:49 local: **482 processed / 482 OK**, zero adverse counters, exit zero. Host non-interactive mode ignored the requested report-only action.
  Exact scan copy and original remain hash-identical. WinDefend is stopped;
  no Microsoft Defender scan is claimed.

## Frozen artifacts

Twelve assets include [SHA256SUMS.txt](SHA256SUMS.txt), covering eleven payloads:
installer/blockmap, complete application source, three native source archives,
license, README, source guide, notices and unsigned-distribution risk acceptance.

- Installer: 117,495,037 bytes, SHA-256 `AEAF55B9E37C51C9043F2DEC01055670D9C1A5878CA7D9712C219383C1E42AC1`.
- Combined source: 105,731,953 bytes, SHA-256 `A6948B31F9FD0D312A9DBBC1C20B671D59BE9E002053F66E5C47801B46834BB3`.
- Manifest: 1,009 bytes, SHA-256 `F9BB2E7DB310A11ADF508E801BBC20009E72CD19E86AD27D946509DCA101D6B6`.
- Extracted executable SHA-256: `9CA01C9415D908E4C728FC7F637504193C51EB5CEB4AF8CBCB5ACF9AA1241C23`.
- ASAR SHA-256: `F616CA5430B615528F688A41B26607C6848F1D47FAFA7A4A358488D0E97751BF`.

## Publication and limits

All three required CodeQL language checks and exact-head analysis receipts must
pass without bypass. Existing reviewed native-code dismissals are retained;
40 raw native and 3 raw JavaScript analysis results are not described as zero
raw findings. The three JavaScript alerts are individually reviewed test-only
JSON string argument literals passed to executeJavaScript, not HTML interpolation;
six independent quoting/injection cases preserve inputs without executing them.
The harness is absent from the runtime. Exact file/line/hash evidence and
false-positive dispositions are recorded on PR #17. No rule is disabled. New
open alerts block publication. The merge, source tree, annotated tag and twelve draft
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
