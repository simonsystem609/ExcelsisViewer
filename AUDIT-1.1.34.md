# ExcelsisView 1.1.34 release audit

Audit date: 2026-09-23. This is a scoped engineering and open-source assessment, not legal indemnity or a guarantee against every defect. Remote publication is conditional on protected PR checks and fresh download verification.

## Focused change review

Against the verified 1.1.32 public baseline, the complete candidate adds six application files and changes 23; the 511 nanoPRC and 1,492 U3D source files are byte-identical. The changes are DXF selection sizing, the Windows network-thumbnail-cache policy, version/build metadata, tests, and rebuilt native assets. No private product workspace was edited for this release.

- Same-size selected DXF holes, straight racetracks, rectangles, and rounded rectangles gain shared target-size controls. A group is eligible only when every selected contour has the same supported shape and dimensions and can be edited. Number fields accept comma or dot decimals and have 0.1-step controls. Synthetic renderer and geometry tests passed; no customer document was used.
- The included 1.1.33 policy change attempts to set `HKCU\Software\Policies\Microsoft\Windows\Explorer\DisableThumbsDBOnNetworkFolders=1` only when absent and not overridden by machine policy. This Windows Explorer setting affects **all network folders for that user**, not only Viewer files. The installer and packaged primary app attempt it; a different administrator account or denied registry permissions can leave the intended user unconfigured. The code tracks ownership, preserves existing values, and attempts to remove only an unchanged app-owned value on uninstall for the invoking user. It does not delete existing `Thumbs.db` files, force-close Explorer, or disable thumbnail display. Startup/native tests used mocks and isolated test keys; live SMB/profile and uninstall acceptance remain unclaimed.
- Existing 1.1.32 DXF/DWG/PDF Left/Right folder navigation and earlier regular-PDF/rename/delete behavior remain in the source. The full automated suite, including the hidden navigation suite, passed. An initial full run timed out on the first DXF test under load; the same test passed independently, then passed in an unchanged second full run.

## Licensing and corresponding source

Authored product code remains `AGPL-3.0-or-later`. Reviewed pinned nanoPRC (AGPL), U3D (Apache-2.0), and LibreDWG (GPL-3.0-or-later) sources and notices remain included; the native PRC/U3D source trees are unchanged from 1.1.32. The combined source archive expands to **2,449 files / 205,592,015 bytes**: 446 application, 511 PRC and 1,492 U3D files. Every file matches both the isolated build and the supplied builder source archive. Standalone native source archives expand to the same native trees. Build scripts, lockfiles, license and third-party notices accompany the release; development caches, Git metadata, private fixtures and build logs do not.

See [SOURCE.md](source/ExcelsisView-1.1.34/app-asar-extract/SOURCE.md) and [THIRD_PARTY_NOTICES.md](source/ExcelsisView-1.1.34/app-asar-extract/THIRD_PARTY_NOTICES.md). No former proprietary decoder, vendor SDK/analysis material, customer file, real-world preset or targeted private path was found in the release bytes.

## Independent build and security evidence

- Clean `npm ci` installed 309 locked packages and audited 310: zero known vulnerabilities. The unchanged second `npm run dist` passed native builds, containment, hostile-input, PDF/3D PDF, DXF/DWG, file navigation, updater, shell/native policy tests, dependency/security audits, source packaging, NSIS and packaged-runtime audit.
- All **132 extracted installer runtime files / 428,083,139 bytes** match build output; **307 non-metadata ASAR files** match corresponding source. ASAR metadata, runtime assets, containment, Electron fuses and integrity checks passed.
- Private/proprietary byte-marker scans across source, ASAR and runtime found nothing. Gitleaks found no packaged-app secret and the one unchanged, previously reviewed false-positive C enum in nanoPRC source at `prc_internal_proto_api.h:48` (file SHA-256 `B97879CAFE6DA69219333946B77673A53B087FA091015C88041FDE51C08B4218`), not a credential.
- Kaspersky 21.26 scanned an exact copy of the freshly built installer on 2026-09-23: **484 processed / 484 OK**, zero detections, suspicions, skipped, password-protected, corrupted or error objects; exit code zero. Scan copy and original remained hash-identical. No Microsoft Defender scan is claimed.

## Frozen artifacts and publication boundary

The 12 release assets include a [SHA-256 manifest](SHA256SUMS.txt), installer/blockmap, complete application source, three native source archives, license, README, source guide, notices and unsigned-distribution risk acceptance.

- Installer: 117,500,249 bytes, SHA-256 `56CB7A8853EF26DC08B79B6A8334DE99C0868385DEEA162FB22E884D60B88D84`.
- Combined source: 105,747,649 bytes, SHA-256 `8B2213D20E2C49D877F4A262FA2F5CA7598BC7BA861388DE5AF45766C6BA3B49`.
- Manifest: 1,009 bytes, SHA-256 `83B98DD7111E63ACB6C108BF56516D275DFA7D04FF98D683F096919BD0C8E12C`.
- Extracted executable: SHA-256 `581E2EC139254B815ACEDB0D633FEAE2CCB693B3830D6A1D221BC763F6CD2C84`.
- ASAR: SHA-256 `ADBACC1791D18E41B48A3CDB447841517BFA7581076621E4521BB6A9BC305BAA`.

The installer and application remain **unsigned** under the owner's recorded risk acceptance; SmartScreen may warn, and GitHub attestations are not Authenticode. This public build was not installed or interactively launched. Real-world SMB policy, profile switching, upgrade/associations, Explorer behavior and uninstall merit user acceptance. Sustained native fuzzing and signing remain follow-up work. Protected PR CodeQL checks, zero new open alerts, exact merge/tag/source identity, signed GitHub attestations, fresh downloads, Pages and live links are required before release completion; prior immutable releases and history remain unchanged.
