# ExcelsisView U3D decoder

This directory contains the pinned Apache-2.0 U3D reference implementation
and the ExcelsisView application bridge used to open ECMA-363 U3D streams
embedded in 3D PDF files.

Run `build.ps1` on Windows with the current MinGW64 CMake, Ninja, zlib,
libpng, and libjpeg development packages installed. The build uses the
current system codec libraries rather than the obsolete bundled copies and
places the four required runtime files in the private application's native
U3D directory. `UPSTREAM-COMMIT.txt` records the exact pinned revision so the
corresponding-source archive can be rebuilt without Git metadata.

The decoder runs behind the same AppContainer, Job Object, time, memory,
process-count, input, output, cache, and scene-complexity boundaries used by
the existing native 3D decoder.
