# 3D web runtime corresponding source

These are the exact npm source tarballs used to generate
`modules/3dpdf/vendor/runtime.mjs`:

- `three-0.160.0.tgz` (MIT)
- `pako-2.1.0.tgz` (MIT and Zlib)
- `buffer-6.0.3.tgz` (MIT)
- `ieee754-1.2.1.tgz` (BSD-3-Clause)
- `base64-js-1.5.1.tgz` (MIT)

They were obtained from the public npm registry with `npm pack` and are
verified against the SHA-512 integrity values in `package-lock.json` as well
as the SHA-256 values in `SHA256SUMS.txt`. The tarballs are unmodified.

`scripts/build-3d-runtime.mjs` is the preferred build form for the one local
Three.js modification: it verifies the exact upstream 0.160.0 UUID generator,
replaces its non-security randomness with `crypto.getRandomValues`, and then
bundles the pinned sources with esbuild 0.25.12. The generated runtime retains
the upstream license comments.
