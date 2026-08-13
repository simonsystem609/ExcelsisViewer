# ExcelsisView 1.1.25 release audit

Audit date: 2026-08-13

Decision: **GO for publication through the protected pull-request and
immutable-release workflow, subject to the server-side CodeQL and remote-byte
verification gates described below**

This is an engineering and open-source-license assessment, not legal advice,
indemnity, or a promise that no third party can ever make a claim.

## Release delta

- Update Center reads only the fixed ExcelsisViewer and ExcelsisHelper public
  release feeds. It accepts immutable, non-draft, non-prerelease releases whose
  tag, single installer asset, size, and GitHub SHA-256 digest correspond.
- Installed Viewer and Helper versions come from their fixed electron-builder
  NSIS uninstall identities. The renderer receives only sanitized product and
  status data, not download URLs, registry paths, or arbitrary path access.
- Equal or newer installed versions disable installation. The main process
  re-reads the installed version immediately before download, confines output
  to the user's Downloads directory, enforces byte and redirect limits,
  re-hashes the completed PE file, and only then asks Windows to open it.
- The DXF Rotate button retains its one-click 90-degree clockwise action and
  adds a split menu for signed-degree rotation and horizontal alignment from a
  selected straight line or straight polyline segment. Saved DXF output retains
  the resulting transform.
- The separate DXF, DWG, and PDF launcher choices and the responsive two-row
  DXF toolbar remain. PDF, PRC, U3D, active-space DWG handling, Explorer
  thumbnails, and containment behavior otherwise retain the audited baseline.

## Licensing and provenance

- Authored ExcelsisView code and the combined release are
  `AGPL-3.0-or-later`. The NSIS license page, package metadata, installed
  license, source, repository, and release assets use the same identifier and
  complete GNU AGPLv3 text.
- nanoPRC is `AGPL-3.0-or-later`, pinned to
  `66cacb70ac1072e9f23b677c5ae8dd83e61709c5`. Its exact modified source,
  modifications, zlib source, generated header, tests, build script, license,
  and notices accompany the installer. All 511 files are byte-identical to the
  already audited 1.1.23 public source baseline.
- The U3D reference implementation is Apache-2.0, pinned to
  `5c141d9f0d366357e2b7cf93af2eade284a334be`. Its exact upstream and modified
  source, build, portability, pointer-safety, checked-size, image-hardening,
  bridge, hostile-test, license, and notice materials accompany the installer.
  All 1,492 files are byte-identical to the audited public baseline.
- LibreDWG 0.14.8492 is `GPL-3.0-or-later`, pinned to
  `c34d1efb8fce8dfcd5bd7b4308c0d5e0b9de0a30`, with its exact source and
  license. Apache-2.0 terms and notices are retained alongside the
  GPLv3/AGPLv3 distribution.
- The complete and production npm audits report zero known vulnerabilities.
  Exact third-party texts and notices cover the bundled runtime, native
  libraries, fonts, language data, and build tools.

## Adobe-code boundary and privacy

No proprietary Adobe SDK, Adobe decoder binary, former embedded decoder
implementation, vendor-analysis material, private decoder fixture, customer
document, credentials, or private path was found in the application,
corresponding source, installer, or expanded payload. Literal Adobe names are
limited to licensed public compatibility material such as PDF.js CMaps/data and
public nanoPRC/U3D documentation. They are not evidence of copied proprietary
implementation code.

The 417 authored/application-source files passed focused path, credential,
private-material, and proprietary-binary scans. The complete 2,420-file source
tree has no Git metadata. Credential-shaped byte sequences in unchanged
generated OpenCV/Tesseract WebAssembly text are encoded program data without a
companion secret. U3D's use of “cracked side” is ordinary mesh-topology
terminology in unchanged Apache-2.0 source.

## Build, containment, updater, and packaged bytes

- A clean `npm ci` installed 309 locked packages and reported zero
  vulnerabilities. The uninterrupted `npm run dist` path completed in 395.1
  seconds and rebuilt the process guard, nanoPRC, U3D, browser/PDF runtimes,
  and Explorer thumbnail provider from the supplied source.
- Native AppContainer and Job Object containment, hostile-input, worker,
  regular/3D PDF, PRC, U3D, DWG/DXF, print, icon, update-center, thumbnail,
  integrity, dependency, security, source-package, NSIS, and final
  packaged-runtime gates all passed.
- The update tests cover fixed repositories and uninstall GUIDs, version and
  public-suffix comparison, immutable-release enforcement, tag/asset/digest
  correspondence, HTTPS and redirect allowlists, size limits, downgrade
  prevention, renderer capability confinement, and packaged updater presence.
- Electron 43.3.0 embeds Chromium 150.0.7871.212. Fuses disable RunAsNode,
  `NODE_OPTIONS`, CLI inspection, and extra file-protocol privileges; embedded
  ASAR integrity and ASAR-only loading are enabled. The ASAR-header integrity
  SHA-256 is
  `4d782dfa095564db356c7c594b004484c599ebc7e5f63493c7d65b69b2e10890`.
- The clean unpacked runtime contains 132 files and 427,927,878 bytes. The
  packaged-runtime audit verified the NSIS payload, ASAR contents, native PE
  formats/imports/exports/mitigations, exact runtime/source correspondence, and
  all installer-adjacent source assets.
- The expanded application source archive contains exactly 2,420 files: 417
  application files, 511 nanoPRC files, and 1,492 U3D files. Archive paths are
  normalized and unique; every expanded application file matches the clean
  build tree, and both standalone native source trees match their application
  source copies.
- Kaspersky `21.26.4.406`, with full bases dated `2026-08-13 16:24`, scanned
  10,995 objects across the exact clean-built assets and unpacked runtime in
  all-file, cache-bypassed report-only mode. It reported zero detections,
  suspicions, skipped objects, password-protected objects, or errors. Six
  parser notices are the same three nested views of `Documentation.hhc` and
  `Documentation.hhk` inside pinned zlib's 72,726-byte `DotZLib.chm`
  (`20D0E3EDD57F849143255A7F0DF1CD59D41DB464A72C0D5AB42846438A729579`);
  the file was not classified as suspicious or malicious.

## Release SHA-256

```text
7D8BE25FFDBDB54080CC1AA3AD433045343B8DFAB3374A7F6AA2FD72181D3366  ExcelsisView-Setup-1.1.25.exe
42685D82DD5207352AFDBDCD4E0212A6A1FD50AD4E53E34DA3933FE04D74EB82  ExcelsisView-Setup-1.1.25.exe.blockmap
7463540AED8A0AE7BC5B45C043A8631A486ED179D7DFD83AC40673E5DE331D06  SOURCE-ExcelsisView-1.1.25.zip
E30BCC3966A339626E9119F44700CB60E87DCE75589F9EE7C4101EAF7E41F394  SOURCE-nanoPRC-66cacb70.zip
C88B6B26CD6A25296A5FFD51BF3E47AF33E46C0D01119DECF1026A52C99EC392  SOURCE-U3D-5c141d9f.zip
9935245817278C944C681527EF52EEE81CCF720FCE09F9FB467D0D6A926AE3CE  SOURCE-LibreDWG-0.14.8492.tar.gz
4DF3C306DDDAAF4BAFFDFF5CA820CC679AC8CD6DC263C6A74517783E42FA7A3B  LICENSE.txt
05F0FA73F11A14992EB312A4A3CA258A31A278DB111658CA3AD76F4D70CE1544  README.md
1DA04C0983A7ED095AA0478DCD36D1B55F5604FF22180272AF169D9388D05F3B  SOURCE.md
0E61CE2C5E94F2E87DC4755DC412D89BBB2D69212099ED14265536EC0586CDCC  THIRD_PARTY_NOTICES.md
916424261CC4646761C918BC1A54D66BC7168D6EDE5394183BC7A1CEB990D023  DISTRIBUTION-RISK-ACCEPTANCE.md
```

The checksum-manifest SHA-256 is
`7CCC477A3BA6453826B00823B4BEEE62CF73F1779DD7A56873B36C62A3C2536D`.
The installer is 117,464,217 bytes. The packaged executable is 225,512,960
bytes with SHA-256
`A2D090AC8CEF1376AFFD63A041B7A653D73A08556551F2584CE98D7EBA8656E3`.
The ASAR is 51,727,541 bytes with SHA-256
`79F7BC2147942B397BBBCABAC0A9A28352F51F2E3800E8174748279E3F314A57`.

## Known caveats and follow-up

- The installer and first-party application/native binaries are not
  Authenticode-signed. SmartScreen warnings and weaker publisher identity are
  expected under the owner's standing risk acceptance. Signing remains
  recommended when practical.
- Microsoft Defender is disabled on the build machine. No Defender scan is
  claimed; the Kaspersky result above is the malware-scan evidence.
- The updater's immutable-release digest, HTTPS, redirect, size, PE-header,
  destination, and downgrade checks materially reduce supply-chain risk, but
  an unsigned installer still lacks an independent publisher signature. The
  application therefore presents the verified local path and hash before
  Windows opens it.
- Install/upgrade, file associations, Explorer thumbnails, Update Center,
  mixed-page printing, representative PDF/PRC/U3D/DWG/DXF workflows, and
  uninstall should still be exercised on a disposable Windows machine. The
  public installer will be launched only after its published bytes are
  independently downloaded and verified.
- Continue sustained fuzzing of PRC/U3D/DWG/thumbnail inputs and reduce
  inherited native warnings through upstream-compatible changes where
  practical.

## Publication verification

Publication completed through protected pull request
[#12](https://github.com/simonsystem609/ExcelsisViewer/pull/12). The required
C/C++, JavaScript/TypeScript, and Python CodeQL jobs passed in
[run 31735551916](https://github.com/simonsystem609/ExcelsisViewer/actions/runs/31735551916),
and GitHub created release commit
`e300fcfb7ad9d2950da0edde6b2b95dc90c3d119` without a force push or protection
bypass.

- Annotated tag `excelsis-view-v1.1.25` has tag-object SHA
  `d6b3e649872a19c17033c9f2ebacf3b54f55f430` and dereferences to the exact
  release commit above.
- [Immutable release 370155730](https://github.com/simonsystem609/ExcelsisViewer/releases/tag/excelsis-view-v1.1.25)
  is public, non-draft, non-prerelease, and contains exactly the 12 intended
  assets. Names, sizes, and GitHub SHA-256 digests matched before publication.
- Authenticated draft downloads and fresh unauthenticated public downloads of
  all 12 assets matched the staged bytes and checksum manifest. GitHub's
  signed release attestation verified successfully for every downloaded asset.
- The post-merge CodeQL analysis passed all three language jobs in
  [run 31736041001](https://github.com/simonsystem609/ExcelsisViewer/actions/runs/31736041001).
  The CodeQL, Dependabot, and secret-scanning APIs each reported zero open
  alerts after that run.
- [Pages run 31736039759](https://github.com/simonsystem609/ExcelsisViewer/actions/runs/31736039759)
  deployed the exact release commit. The live page was byte-identical to the
  local `index.html` (SHA-256
  `5DCE4E72005DC2ED35414957249AAB071997CC566B1E20BB5D66D250F7580677`),
  and the live raw README was byte-identical to the local file (SHA-256
  `4671C74AEB3FA1CF7846C852CCF041C50F4C5FA6D5D3B34F960EF17B4CC1FD5A`).
- Repository hardening remained enabled: strict required CodeQL checks,
  administrator enforcement, conversation resolution, pull-request flow,
  blocked force pushes and branch deletion, read-only default Actions token
  permissions, immutable releases, and HTTPS-only Pages from `main`.
