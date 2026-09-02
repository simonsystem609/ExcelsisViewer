# ExcelsisView 1.1.27 release audit

Audit date: 2026-09-02

Decision: **GO through the protected pull-request and immutable-release
workflow, subject to successful required CodeQL checks and remote asset
verification.** No application-code correction was needed during this audit.

This is an engineering and open-source-license assessment, not legal advice,
indemnity, or a guarantee that no defect or third-party claim is possible.

## Scope and changes

The review concentrated on changes since the previously audited source. The
1.1.26 scaling implementation had already been reviewed and independently
clean-built; 1.1.27 superseded it before publication. The 1.1.27 delta contains
the scaling controls, line-relative affine transformation, focused tests,
version/documentation changes, and regenerated build artifacts. Its dependency
lock differs from 1.1.26 only in the application version.

- Percentage scaling now uses a Non-uniform checkbox to switch between one
  percentage and independent X/Y factors.
- Line-reference scaling optionally uses a parallel target length and a
  perpendicular percentage. At 100%, the perpendicular dimension is unchanged;
  clearing the checkbox restores uniform scaling.
- The selected line establishes the scale axes through the drawing origin,
  without rotating the drawing. Exact DXF ellipse output preserves connected
  arcs, circles, and bulged polylines under unequal scaling.
- Relative to public 1.1.25, dependency overrides update `@xmldom/xmldom` to
  0.8.15 and `fast-uri` to 3.1.7. Both complete and production audits report
  zero known vulnerabilities.

## Licensing and provenance

Application metadata, installer license configuration, installed license text,
source, notices, and repository retain `AGPL-3.0-or-later` and the complete
GNU AGPLv3 license. Corresponding source and build scripts accompany the binary
as described in [GNU AGPLv3](https://www.gnu.org/licenses/agpl-3.0.en.html).
Third-party attribution and component-specific licenses remain intact.

- nanoPRC remains pinned to `66cacb70ac1072e9f23b677c5ae8dd83e61709c5` under
  AGPL-3.0-or-later. All 511 native-source files match the audited public
  baseline byte-for-byte.
- U3D remains pinned to `5c141d9f0d366357e2b7cf93af2eade284a334be` under
  Apache-2.0. All 1,492 source files match the public baseline byte-for-byte.
  Apache-2.0 attribution is preserved; the Apache project documents its
  [GPLv3 compatibility](https://www.apache.org/licenses/GPL-compatibility).
- LibreDWG 0.14.8492 remains pinned to
  `c34d1efb8fce8dfcd5bd7b4308c0d5e0b9de0a30` under GPL-3.0-or-later, with
  its unchanged exact source archive and license.
- Standalone nanoPRC and U3D source archives expand to the exact native trees
  included in the application-source archive. Container timestamps may change
  without changing their source payloads.

No new proprietary Adobe implementation, vendor binary, research material,
customer document, private preset, private path, or credential was found.
Unchanged licensed public compatibility data and third-party notices remain.

## Build, security, and packaged-byte evidence

- A clean `npm ci` installed 309 locked packages with zero vulnerabilities.
  The uninterrupted `npm run dist` completed successfully, including clean
  native builds, containment, hostile-input, worker, PDF/PRC/U3D, DXF/DWG,
  printing, icon, updater, thumbnail, dependency, security, source-package,
  NSIS, and packaged-runtime gates.
- Focused scaling tests cover diagonal line-relative factors, exact connected
  joins, serialized ellipse endpoints, invalid values, checkbox visibility,
  input preservation, repeated opening, and unchecked uniform fallback.
- Electron 43.3.0 / Chromium 150.0.7871.212 retains renderer/process
  containment, ASAR integrity, ASAR-only loading, and disabled RunAsNode,
  NODE_OPTIONS, CLI inspection, and extra file-protocol privileges.
- The installer was independently extracted. All 132 runtime files, totaling
  427,946,809 bytes, exactly match the tested clean-build output.
- All 2,423 corresponding-source files match the build inputs/output source:
  420 application files, 511 nanoPRC files, and 1,492 U3D files. Archive paths
  are normalized and unique, with no Git metadata or development caches.
- All 293 non-metadata ASAR files match corresponding source byte-for-byte;
  packaged application metadata is also consistent. Source, extracted ASAR,
  and runtime checks found no targeted private/proprietary markers.
- Gitleaks 8.30.1 found no secret in the extracted application. The source scan
  reported one false positive: adjacent `PRC_INTERNAL_API_EDGE_02` and
  `PRC_INTERNAL_API_EDGE_12` enum identifiers in unchanged public nanoPRC
  `prc_internal_proto_api.h`, not an API key. The file's SHA-256 is
  `B97879CAFE6DA69219333946B77673A53B087FA091015C88041FDE51C08B4218`.
- Kaspersky 21.26.4.406, full bases dated 2026-09-02 20:09, scanned the exact
  final assets and unpacked runtime in cache-bypassed, report-only mode:
  11,000 processed/OK; zero detections, suspicions, skips, password-protected
  objects, or errors. Six parser notices are three nested views of the same
  two help-index members in pinned zlib's unchanged `DotZLib.chm`, not malware
  detections. Microsoft Defender was not used.

## Exact release artifacts

The installer is 117,467,913 bytes. The application-source ZIP is 105,674,028
bytes. [SHA256SUMS.txt](SHA256SUMS.txt) lists all 11 payload assets; together
with the checksum manifest, the release contains 12 assets.

```text
A71737B429FF1918FF72F951783D586DB1FD57011CC9C017149EF154469DC833  ExcelsisView-Setup-1.1.27.exe
1CE6022C6D9BC6763284ADCC8423EB6A2CEB0AC22B2C10A270792CCC5AFEA6A6  ExcelsisView-Setup-1.1.27.exe.blockmap
BF1D69785D774487B18B731E8E6F67B41523C2307088DB3405C287D3BF77CCC9  SOURCE-ExcelsisView-1.1.27.zip
E30BCC3966A339626E9119F44700CB60E87DCE75589F9EE7C4101EAF7E41F394  SOURCE-nanoPRC-66cacb70.zip
8AF1CBAEC7B6758B9FC5CB955E3966D5F9121D81CA4FC47565A9DF0FECA7BB43  SOURCE-U3D-5c141d9f.zip
9935245817278C944C681527EF52EEE81CCF720FCE09F9FB467D0D6A926AE3CE  SOURCE-LibreDWG-0.14.8492.tar.gz
4DF3C306DDDAAF4BAFFDFF5CA820CC679AC8CD6DC263C6A74517783E42FA7A3B  LICENSE.txt
3A9232A6D3EC82C1C4C53436D6BA132A3ECE05FDF755F9352389212EB61C836B  README.md
3FB8B2BC38547CE661961686D8BCD3F14932D28C78BDC2410F7CD183F7073FE4  SOURCE.md
6AC4090E94C212A99184BF07484600B0A3C76E78FED70F2D278F683A5914EE47  THIRD_PARTY_NOTICES.md
916424261CC4646761C918BC1A54D66BC7168D6EDE5394183BC7A1CEB990D023  DISTRIBUTION-RISK-ACCEPTANCE.md
```

Checksum manifest SHA-256:
`E8046A1178D2E8DFC868F4FF9104B54F6B5F3B56BFDF8490DEB9C659A22EA3A8`.
Packaged executable SHA-256:
`76DDC572961D0C4B52B70F9DE62079619A1612816736281B3F07D565FC6DAD1C`.
ASAR SHA-256:
`50D4DC4E8A00440DA06E3FEF7FADB0AC8490EC76A779BC5D66529D57B8D2CA90`.
Embedded ASAR-header SHA-256:
`ca1f13b67699bb92117e9e9bcc0b77633aad269abd073b8f9948c9563f5e6ccd`.

## Publication gates and limitations

The release must pass the three required CodeQL language checks without a
protection bypass. Draft asset names, sizes, and server-side hashes must match
staging before immutable publication. Fresh public downloads, GitHub release
attestations, the remote commit, and deployed Pages links must then be verified.
Prior immutable releases are not replaced or relabeled.

The installer and first-party binaries remain unsigned under the owner's
documented risk acceptance; SmartScreen warnings and weaker publisher identity
are expected. No raw/unpacked Viewer was launched. Installed interactive
workflows have not been re-certified by this audit. User testing of scaling,
install/upgrade, associations, Explorer thumbnails, and representative documents
remains appropriate. Sustained native fuzzing and eventual code signing remain
follow-up hardening work, not claims made by this release.
