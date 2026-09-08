# ExcelsisView 1.1.28 release audit

Audit date: 2026-09-08

Decision: **GO through the protected pull-request and immutable-release
workflow, subject to successful required CodeQL checks and remote asset
verification.** No application-code correction was made during this audit.

This is an engineering and open-source-license assessment, not legal advice,
indemnity, or a guarantee that no defect or third-party claim is possible.

## Scope and changes

The review was delta-focused because dependencies, native source, and the
non-DXF application are unchanged from the audited 1.1.27 release. The exact
expanded comparison contains 19 changed paths: two new DXF files, DXF UI and
serialization integration, focused tests, version/documentation metadata, four
rebuilt native binaries, their integrity manifest, and a regenerated U3D source
container. The native binaries differ from 1.1.27 only in rebuild metadata; the
expanded native source trees are byte-identical.

- Add Chamfer/Fillet accepts exactly two selected connected LINE entities or
  one eligible picked straight-sided LWPOLYLINE/shared-LINE vertex.
- Chamfers use an equal setback along both edges. Fillets use the entered
  tangent radius and exact corner-angle geometry, including a correctly signed
  polyline bulge.
- The command preserves applicable layer, linetype, color, width/elevation,
  owner/header, and subclass metadata; it participates in Undo and normal DXF
  Save.
- Arc-adjacent, collinear, degenerate, open-end, ambiguous, oversized,
  read-only, and block-expanded targets fail closed before mutation.
- After each successful DXF save, the live entity/pair model is reparsed from
  the exact written bytes and interaction IDs are remapped through serialized
  entity order. A later edit/save therefore cannot restore stale geometry from
  the originally opened file.
- DFT support is not part of this release: there is no DFT reader, dependency,
  file association, launcher route, or packaged DFT material.
- Dependencies and overrides are unchanged apart from the application version.
  Complete and production dependency audits report zero known vulnerabilities.

## Licensing and provenance

Application metadata, installer license configuration, installed license text,
source, notices, and repository retain `AGPL-3.0-or-later` and the complete GNU
AGPLv3 license. Corresponding source and build scripts accompany the binary as
described in [GNU AGPLv3](https://www.gnu.org/licenses/agpl-3.0.en.html).
Third-party attribution and component-specific licenses remain intact.

- nanoPRC remains pinned to `66cacb70ac1072e9f23b677c5ae8dd83e61709c5`
  under AGPL-3.0-or-later. All 511 native-source files match the audited public
  baseline byte-for-byte.
- U3D remains pinned to `5c141d9f0d366357e2b7cf93af2eade284a334be`
  under Apache-2.0. All 1,492 source files match the public baseline
  byte-for-byte. Apache-2.0 attribution is preserved; the Apache project
  documents its [GPLv3 compatibility](https://www.apache.org/licenses/GPL-compatibility).
- LibreDWG 0.14.8492 remains pinned to
  `c34d1efb8fce8dfcd5bd7b4308c0d5e0b9de0a30` under GPL-3.0-or-later, with
  its unchanged exact source archive and license.
- Standalone nanoPRC and U3D archives expand to the exact native trees in the
  application-source archive. U3D ZIP hashes may change with regenerated
  container metadata while their 1,492-file payload remains identical.

No former proprietary decoder, vendor binary or analysis material, private
fixture, customer document, real-world preset, private path, credential, or
build log was found. Unchanged licensed public compatibility data and
third-party notices remain.

## Build, security, and packaged-byte evidence

- A clean `npm ci` installed 309 locked packages and audited 310 with zero
  vulnerabilities. The uninterrupted `npm run dist` then passed native builds,
  containment, hostile-input, worker, PDF/PRC/U3D, DXF/DWG, printing, icon,
  updater, thumbnail, dependency, security, source-package, NSIS, and
  packaged-runtime gates. A separate production-only audit also found zero
  vulnerabilities.
- Focused chamfer/fillet tests cover right-angle and 60-degree construction,
  reversed line endpoints, clockwise/counter-clockwise bulges, size limits,
  invalid targets, planner immutability, UI wiring, style preservation, and
  save rebasing. Product-development renderer and installed-build smoke
  evidence covered a polyline fillet followed by a two-line chamfer and two
  saves; the independent public rebuild was not installed or launched.
- Electron 43.3.0 / Chromium 150.0.7871.212 retains renderer/process
  containment, ASAR integrity, ASAR-only loading, and disabled RunAsNode,
  NODE_OPTIONS, CLI inspection, and extra file-protocol privileges.
- The installer was independently extracted. All 132 runtime files, totaling
  427,982,843 bytes, exactly match the tested clean-build output.
- All 2,425 corresponding-source files match the build: 422 application files,
  511 nanoPRC files, and 1,492 U3D files. Archive paths are normalized and
  unique, with no Git metadata or development caches.
- All 294 non-metadata ASAR files match corresponding source byte-for-byte;
  packaged application metadata is consistent. Source, extracted ASAR, and
  runtime checks found no targeted private/proprietary markers.
- Four regenerated native files retain identical sizes and differ from 1.1.27
  only in 6-20 bytes of PE timestamps, checksums, export timestamps, or build-ID
  fields. Their source, executable sections, and surrounding bytes are
  otherwise identical.
- Gitleaks 8.30.1 found no secret in the extracted application. The source scan
  reported one false positive: adjacent `PRC_INTERNAL_API_EDGE_02` and
  `PRC_INTERNAL_API_EDGE_12` enum identifiers in unchanged public nanoPRC
  `prc_internal_proto_api.h`, not an API key. The file's SHA-256 is
  `B97879CAFE6DA69219333946B77673A53B087FA091015C88041FDE51C08B4218`.
- Kaspersky 21.26, full bases dated 2026-09-08 13:56, recursively scanned the
  exact final installer in cache-bypassed report-only mode: 472 processed/OK;
  zero detections, suspicions, skips, password-protected objects, corruption,
  or errors. Microsoft Defender was disabled and had no signatures, so no
  Defender scan is claimed.

## Exact release artifacts

The installer is 117,474,421 bytes. The application-source ZIP is 105,684,938
bytes. [SHA256SUMS.txt](SHA256SUMS.txt) lists all 11 payload assets; together
with the checksum manifest, the release contains 12 assets.

```text
C3CAA9A65C459926CAD09B472DB9857E8515D26FD7B8A468192BFD361544FE45  ExcelsisView-Setup-1.1.28.exe
E80C7FEFD04C2199A162F38A074B800C8EB9E445A0DEFFF5807AE29701EFFC88  ExcelsisView-Setup-1.1.28.exe.blockmap
8A1CCCD9522F8F240331810D1AA8D0191B7F85F006C837FA6DCEF34630A71AF3  SOURCE-ExcelsisView-1.1.28.zip
E30BCC3966A339626E9119F44700CB60E87DCE75589F9EE7C4101EAF7E41F394  SOURCE-nanoPRC-66cacb70.zip
2ACD1A251CB2D7C79FBD9B3D801C9776F709F724ABEA7BEBE9CBEE1D396924D5  SOURCE-U3D-5c141d9f.zip
9935245817278C944C681527EF52EEE81CCF720FCE09F9FB467D0D6A926AE3CE  SOURCE-LibreDWG-0.14.8492.tar.gz
4DF3C306DDDAAF4BAFFDFF5CA820CC679AC8CD6DC263C6A74517783E42FA7A3B  LICENSE.txt
57C8154C11B5F593EDBED25641F0C41BA05E2E634B8779821A7F7015B55E0B57  README.md
CADFC4C2F6B709F35D0BDE1D019C8146C3882D07D2C010BA27897369B97C7F37  SOURCE.md
4323F97D24F48915ED7A59B1379B774C8AEAADDE6F2273B2E69FEED6FB37ABF8  THIRD_PARTY_NOTICES.md
916424261CC4646761C918BC1A54D66BC7168D6EDE5394183BC7A1CEB990D023  DISTRIBUTION-RISK-ACCEPTANCE.md
```

Checksum manifest SHA-256:
`606BB963F4C83DF4EBF46882B5A8E3F5449FE00542ABC3D572DFB2591E0724AA`.
Packaged executable SHA-256:
`FC24E24B383AD3BB7107C1D75C143DE2268042875CBA3B1330AB8A105CCF88B9`.
ASAR SHA-256:
`3A86BF365F00D437A01AC18AB80BBEA9230709E5000D381C1CEB5FBEF738ABAB`.
Embedded ASAR-header SHA-256:
`b859797ac0945ed6170297999b9e8ccca18dd1aa85ba17ca370755520f72cd45`.

## Publication gates and limitations

The release must pass the three required CodeQL language checks without a
protection bypass. Draft asset names, sizes, and server-side hashes must match
staging before immutable publication. Fresh public downloads, GitHub release
attestations, the remote commit, and deployed Pages links must then be verified.
Prior immutable releases are not replaced or relabeled.

The installer and first-party binaries remain unsigned under the owner's
documented risk acceptance; SmartScreen warnings and weaker publisher identity
are expected. No raw/unpacked public build or public installer was launched.
Installed interactive workflows have not been independently re-certified by
this release audit. User testing of chamfer/fillet geometry, repeated saves,
install/upgrade, associations, Explorer thumbnails, and representative
documents remains appropriate. Sustained native fuzzing and eventual code
signing remain follow-up hardening work, not claims made by this release.
