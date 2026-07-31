# ExcelsisView corresponding source

ExcelsisView 1.1.15 is licensed under the GNU Affero General Public License
version 3 or later (AGPL-3.0-or-later). The complete
application source is supplied beside the installer as
`ExcelsisView-1.1.15-source.zip` and inside the installed resources. It
includes `package.json`, `package-lock.json`, `main.cjs`, the preload scripts,
`modules/`, `launcher/`, native source, Explorer integration source, build
scripts, and exact third-party notices.

The exact modified nanoPRC source is supplied beside the installer as
`SOURCE-nanoPRC-66cacb70.zip` and inside the installed resources. It contains
the pinned upstream tree, both locally modified C files, `probe.c`, generated
headers, the modification notice, and a portable build script. nanoPRC is
AGPL-3.0-or-later and is pinned to commit
`66cacb70ac1072e9f23b677c5ae8dd83e61709c5`.

The exact modified U3D reference implementation source is supplied beside the
installer as `u3d-modified-source-5c141d9f.zip` and inside the installed
resources. It contains the pinned upstream tree, every locally modified
portability, runtime-selection, pointer-safety, and texture-size source file,
the added checked-size helper and hostile native test, the independently
written application bridge, modification notes, and the reproducible build
script. U3D is
Apache-2.0 and is pinned to commit
`5c141d9f0d366357e2b7cf93af2eade284a334be`.

The exact LibreDWG 0.14.8492 source is supplied beside the installer as
`SOURCE-LibreDWG-0.14.8492.tar.gz` and inside the installed resources.
LibreDWG is GPL-3.0-or-later and is pinned to commit
`c34d1efb8fce8dfcd5bd7b4308c0d5e0b9de0a30`.

## Reproducible local build

Requirements:

- Windows 10 or later, x64
- Node.js 24 and npm
- PowerShell 5.1 or later
- MSYS2 MinGW64 with GCC, CMake, Ninja, zlib, libpng, libjpeg-turbo, and
  winpthreads development/runtime packages
- Zig 0.16.0, either at
  `tools/zig-0.16.0/zig-x86_64-windows-0.16.0/zig.exe` relative to the
  extracted source workspace, on `PATH`, or selected with `EXCELSIS_ZIG`

Extract `ExcelsisView-1.1.15-source.zip`, then from
`ExcelsisView-1.1.15-source/ExcelsisView-1.1.15/app-asar-extract`:

```powershell
npm ci
npm run dist
```

`npm run dist` rebuilds the native process guard, nanoPRC bridge, U3D bridge,
PDF editing runtime, and Explorer thumbnail provider; generates and decodes
an upstream-owned synthetic teapot PRC-in-PDF fixture; extracts and decodes
the Apache-licensed U3D group and JPEG/PNG texture fixtures; runs checked-size,
truncated-image, decoder, dependency, security, and exact packaged-runtime
test suites; and creates the NSIS installer. No
mandatory test requires a private PDF, private PRC/U3D file, or a private
vendor decoder. The U3D corresponding source records its pinned revision in
`UPSTREAM-COMMIT.txt`, so rebuilding from this archive does not require a Git
database.

An additional private-fixture regression can be run when authorized local
fixtures are available:

```powershell
npm run test:nanoprc:private -- <single-part.pdf> <assembly.pdf>
```

This optional test is not required for a clean corresponding-source build and
no private fixture is included in the source archive.

The third-party license inventory is in `THIRD_PARTY_NOTICES.md`; exact
license texts are in `third_party/licenses/`, the LibreDWG bundle, nanoPRC
source package, and U3D source package.

The Windows binaries may be unsigned. The owner-accepted SmartScreen and
publisher-identity tradeoff is recorded in
`DISTRIBUTION-RISK-ACCEPTANCE.md`.
