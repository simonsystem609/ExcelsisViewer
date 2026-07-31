# ExcelsisView U3D source changes

Upstream is pinned to `ningfei/u3d` commit
`5c141d9f0d366357e2b7cf93af2eade284a334be` under the Apache License 2.0.

ExcelsisView carries the following documented local changes:

1. `RTL/Component/Include/IFXVoidStar.h` uses `uintptr_t` instead of the
   Windows `long` type for pointer-sized type identifiers. This prevents
   pointer truncation in 64-bit builds.
2. `RTL/Kernel/IFXCom/CIFXComponentManager.cpp` loads only
   `IFXImporting.dll`. The viewer is an importer and does not ship the
   exporter, renderer, or scheduling plugins.
3. `RTL/Component/Texture/IFXImageSizeUtils.h` provides shared checked
   `size_t` multiplication, image-layout validation, and bounded
   allocation/reallocation helpers. U3D textures are limited to 32768 pixels
   per dimension, four components, a 131072-byte pitch, and 256 MiB of
   decoded storage.
4. `RTL/Component/Texture/CIFXImageTools.cpp` applies those boundaries to
   JPEG and PNG decoding, channel split/merge buffers, PNG row storage, and
   resize destinations. PNG input callbacks track the supplied compressed
   byte count and reject truncated reads before copying.
5. `RTL/Component/Texture/CIFXTextureImageTools.cpp` applies the same checked
   layout to texture setup, mip copies, render-format conversion, image
   resizing, and both temporary resize orientations. Degenerate one-pixel
   and luminance resizes use a bounded nearest-neighbor path because the
   legacy bilinear helpers require larger RGB/RGBA inputs.
6. `RTL/Component/Subdiv/IFXTQTBaseTriangle.h` validates neighbor and
   orientation output pointers, initializes them, and rejects invalid
   directions before dereference.
7. `RTL/Component/Bones/CIFXAnimationModifier.cpp` rejects a null motion
   output pointer and does not dereference a missing motion resource.

`tests/image_size_utils_test.cpp` exercises overflow, zero and excessive
dimensions, all valid one-to-four-component layouts, pitch boundaries, the
256 MiB ceiling, both temporary resize orientations, and allocation failure.
The application bridge regression additionally decodes upstream-owned JPEG
and PNG texture scenes and requires truncated continuations to fail.

The independently written application bridge is in
`bridge/u3d_app_export.cpp`. It uses public U3D interfaces and exports a
bounded, renderer-neutral mesh and product-tree representation.
