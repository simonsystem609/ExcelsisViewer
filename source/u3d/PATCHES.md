# ExcelsisView U3D source changes

Upstream is pinned to `ningfei/u3d` commit
`5c141d9f0d366357e2b7cf93af2eade284a334be` under the Apache License 2.0.

ExcelsisView makes two narrow portability/runtime-selection changes:

1. `RTL/Component/Include/IFXVoidStar.h` uses `uintptr_t` instead of the
   Windows `long` type for pointer-sized type identifiers. This prevents
   pointer truncation in 64-bit builds.
2. `RTL/Kernel/IFXCom/CIFXComponentManager.cpp` loads only
   `IFXImporting.dll`. The viewer is an importer and does not ship the
   exporter, renderer, or scheduling plugins.

The independently written application bridge is in
`bridge/u3d_app_export.cpp`. It uses public U3D interfaces and exports a
bounded, renderer-neutral mesh and product-tree representation.

