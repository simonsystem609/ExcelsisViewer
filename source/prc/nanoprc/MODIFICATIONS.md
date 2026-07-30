# nanoPRC modification notice

Modified source: nanoPRC commit
`66cacb70ac1072e9f23b677c5ae8dd83e61709c5`.

Modification date: 2026-07-25

Locally modified upstream files:

- `upstream/src/prc_api.c`
  - Adds the application bridge needed to emit bounded product-tree metadata
    and compact indexed mesh data.
  - Corrects file-local tessellation index mapping used by assemblies.
- `upstream/demos/json_export/src/json_export.c`
  - Emits compressed geometry once and instances it from the product tree.
  - Handles representation-item sets and uses compact JSON for large models.

Build-only integration:

- Bundles zlib commit `f9dd6009be3ed32415edf1e89d1bc38380ecb95d`
  under `upstream/thirdparty/zlib`.
- Uses `-ffp-contract=off` so predictive compressed tessellation is decoded
  with the required stepwise IEEE-754 rounding.
- Adds `probe.c`, `generated/prc_version.h`, and `build.ps1` outside the
  upstream tree. These files are included in corresponding source.

No other file from the pinned nanoPRC source tree is modified.
