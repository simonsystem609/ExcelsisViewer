# ExcelsisView third-party notices

ExcelsisView 1.1.14 is licensed at product level under the GNU Affero General
Public License version 3 or later (AGPL-3.0-or-later). See `LICENSE.txt`.
Component-specific licenses remain in force; this inventory covers the
libraries and build components distributed in the Windows installer. Exact
license texts are installed under `resources/third_party/licenses/` unless
another location is stated below.

## Native document components

- nanoPRC, commit `66cacb70ac1072e9f23b677c5ae8dd83e61709c5`,
  AGPL-3.0-or-later. Its license, third-party notices, modification record, and exact
  corresponding source are under `resources/third_party/source/nanoprc/`.
- U3D reference implementation, commit
  `5c141d9f0d366357e2b7cf93af2eade284a334be`, Apache-2.0. Its license,
  modification record, application bridge, and exact corresponding source
  are under `resources/third_party/source/u3d/` and
  `resources/third_party/licenses/u3d/`.
- GNU LibreDWG 0.14.8492, commit
  `c34d1efb8fce8dfcd5bd7b4308c0d5e0b9de0a30`, GPL-3.0-or-later. Its license,
  upstream notice, and exact source archive are under
  `resources/third_party/libredwg/`.
- zlib 1.3.2, zlib license; libpng 1.6.58, libpng license; and
  libjpeg-turbo 3.2.0, BSD-style/IJG/zlib licenses. These current MSYS2
  libraries are statically linked into the U3D runtime. Exact license texts
  are under `resources/third_party/licenses/u3d/`.
- zlib, commit `f9dd6009be3ed32415edf1e89d1bc38380ecb95d`, zlib
  license. This separate copy is included in the nanoPRC source tree and
  documented by the nanoPRC third-party notice.
- MinGW-w64 winpthreads runtime (`libwinpthread-1.dll`), permissive
  MinGW-w64 runtime license. Its exact license text is under
  `resources/third_party/licenses/u3d/`.
- MinGW-w64 runtime and LLVM libc++, libc++abi, and libunwind runtime
  components. See `mingw-w64-runtime.txt`, `llvm-libcxx.txt`,
  `llvm-libcxxabi.txt`, and `llvm-libunwind.txt`.

## PDF and 3D browser components

- PDF.js 6.1.200, Apache-2.0. See `pdfjs-6.1.200.txt`. PDF.js also carries
  component-specific license files next to its CMaps, ICC profiles, standard
  fonts, and WASM assets.
- pdf-lib 1.17.1, MIT. See `pdf-lib-1.17.1.txt`.
- @pdf-lib/fontkit 1.1.1, MIT. See `fontkit-1.1.1.txt`.
- Three.js 0.160.0, MIT. See `three-0.160.0.txt`.
- pako 2.1.0 and pako 1.0.11, MIT/Zlib. See `pako-2.1.0.txt` and
  `pako-1.0.11.txt`.
- buffer 6.0.3, MIT; ieee754 1.2.1, BSD-3-Clause; and base64-js 1.5.1, MIT.
  See the correspondingly named license files.
- Tesseract.js 7.0.0 and tesseract.js-core 6.1.2, Apache-2.0. See
  `tesseract-js-7.0.0.txt` and `tesseract-js-core-6.1.2.txt`.
- OpenCV.js 4.11.0, Apache-2.0. See `opencv-js-4.11.0.txt`.
- English and Hungarian tessdata 1.0.0 packages, Apache-2.0. See
  `tessdata-eng-hun-1.0.0.txt`.
- Liberation fonts, SIL Open Font License 1.1. See
  `liberation-fonts.txt`.
- Roboto 3.008 Light, Light Italic, Bold, and Bold Italic fonts,
  Apache-2.0. See `roboto-3.008.txt`.

## DXF geometry components

- concaveman 2.0.0, ISC; rbush 3.0.1, MIT; tinyqueue 2.0.3, ISC;
  robust-predicates 3.0.2, Unlicense; and point-in-polygon 1.1.0, MIT. See
  the correspondingly named license files.

## Application and installer runtime

- Electron 43.2.0, MIT. `LICENSE.electron.txt` is installed beside the
  application executable.
- Chromium and its third-party components. `LICENSES.chromium.html` is
  installed beside the application executable.
- electron-builder 26.15.3, MIT. See
  `electron-builder-26.15.3.txt`.
- NSIS 3.0.4.1 and its compression components. See `nsis-3.0.4.1.txt`.
  The per-machine installer requires electron-builder's NSIS `elevate.exe`
  application helper. The packaged helper is the pinned NSIS 3.0.4.1 tool
  (`SHA-256 9B1FBF0C11C520AE714AF8AA9AF12CFD48503EEDECD7398D8992EE94D1B4DC37`);
  it is covered by the electron-builder/NSIS notices above.
- Zig 0.16.0, MIT. Zig is a build tool and is not installed with the
  application; its notice is retained as `zig-0.16.0.txt`.

This notice is informational and does not replace the exact license texts.
