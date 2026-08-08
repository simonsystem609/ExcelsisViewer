# nanoPRC modification notice

Modified source: nanoPRC commit
`66cacb70ac1072e9f23b677c5ae8dd83e61709c5`.

Latest modification date: 2026-08-08

Locally modified upstream files:

- `upstream/src/prc_api.c`
  - Adds the application bridge needed to emit bounded product-tree metadata
    and compact indexed mesh data.
  - Corrects file-local tessellation index mapping used by assemblies.
- `upstream/demos/json_export/src/json_export.c`
  - Emits compressed geometry once and instances it from the product tree.
  - Handles representation-item sets and uses compact JSON for large models.
- `upstream/src/prc_parse_extra_geometry.c`
  - Carries the already-bounded NURBS interior-point count in `size_t` through
    allocation and indexing so the checked multiplication cannot be narrowed.
- `upstream/src/prc_parse_global.c` and added
  `upstream/src/prc_stb_image_config.h`
  - Compile only the JPEG and PNG memory decoders used for format-declared PRC
    pictures; disable unused file and floating-point image entry points.
- `upstream/src/stb_image.h`
  - Use stb_image's checked four-factor allocation helper for 16-bit format
    conversion and make the validated PNG row-copy size explicit in `size_t`.
- `upstream/thirdparty/zlib/zutil.c`
  - Reject allocation-size overflow and multiply in `size_t` in `zcalloc`.

Build-only integration:

- Bundles zlib commit `f9dd6009be3ed32415edf1e89d1bc38380ecb95d`
  under `upstream/thirdparty/zlib`.
- Uses `-ffp-contract=off` so predictive compressed tessellation is decoded
  with the required stepwise IEEE-754 rounding.
- Removes release debug information and remaps compiler file, macro, and debug
  prefixes to `nanoPRC` so published binaries do not disclose the local build
  directory. Debug builds retain symbols with the same neutral prefix.
- Adds `probe.c`, `generated/prc_version.h`, and `build.ps1` outside the
  upstream tree. These files are included in corresponding source.
- Adds `tests/stb_image_hardening_test.c`, which decodes a generated one-pixel
  PNG and verifies that a disabled GIF input is rejected.

No other file from the pinned nanoPRC source tree is modified.
