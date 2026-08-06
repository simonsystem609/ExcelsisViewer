# ExcelsisView U3D decoder

This directory contains the pinned Apache-2.0 U3D reference implementation
and the ExcelsisView application bridge used to open ECMA-363 U3D streams
embedded in 3D PDF files.

Run `build.ps1` on Windows with the current MinGW64 CMake, Ninja, zlib,
libpng, and libjpeg development packages installed. The build uses the
current system codec libraries rather than the obsolete bundled copies and
places the four required runtime files in the application's native
U3D directory.

The decoder runs behind the same AppContainer, Job Object, time, memory,
process-count, input, output, cache, and scene-complexity boundaries used by
the existing native 3D decoder.

The local texture hardening also checks every decoded dimension, component
count, pitch, multiplication, allocation, reallocation, and resize buffer.
Current per-image limits are 32768 x 32768 pixels, one to four components,
a 131072-byte pitch, and 256 MiB of decoded storage. `build.ps1` compiles and
runs `tests/image_size_utils_test.cpp` before installing the runtime.
