const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(projectRoot, "..", "..");
const u3dRoot = path.join(workspaceRoot, "u3d");

function read(relativePath) {
  return fs.readFileSync(path.join(u3dRoot, relativePath), "utf8");
}

const helper = read("upstream/RTL/Component/Texture/IFXImageSizeUtils.h");
const imageTools = read("upstream/RTL/Component/Texture/CIFXImageTools.cpp");
const textureTools = read("upstream/RTL/Component/Texture/CIFXTextureImageTools.cpp");
const baseTriangle = read("upstream/RTL/Component/Subdiv/IFXTQTBaseTriangle.h");
const animation = read("upstream/RTL/Component/Bones/CIFXAnimationModifier.cpp");
const nativeTest = read("tests/image_size_utils_test.cpp");
const build = read("build.ps1");
const packageSource = fs.readFileSync(
  path.join(projectRoot, "scripts", "package-u3d-source.ps1"),
  "utf8",
);

for (const token of [
  "IFX_U3D_IMAGE_MAX_WIDTH",
  "IFX_U3D_IMAGE_MAX_HEIGHT",
  "IFX_U3D_IMAGE_MAX_COMPONENTS",
  "IFX_U3D_IMAGE_MAX_PITCH",
  "IFX_U3D_IMAGE_MAX_DECODED_BYTES",
  "IFXCheckedMultiplySize",
  "IFXCheckedImageByteCount",
  "IFXCheckedImagePitchByteCount",
  "IFXAllocateCheckedImageBytes",
  "IFXReallocateCheckedImageBytes",
]) {
  assert.ok(helper.includes(token), `U3D image hardening helper omits ${token}.`);
}

assert.doesNotMatch(
  imageTools,
  /pImageInfo->m_width\s*\*\s*pImageInfo->m_height\s*\*\s*m_pContinuationFormats/,
  "JPEG resize allocation still uses a narrow product.",
);
assert.doesNotMatch(
  imageTools,
  /new\s+png_byte\s*\[\s*ulRowBytes\s*\*\s*height_png\s*\]/,
  "PNG decode allocation still uses a narrow row-bytes x height product.",
);
assert.match(
  imageTools,
  /\(size_t\)length\s*>\s*pReadState->uRemaining/,
  "PNG input reads are not bounded by the supplied compressed byte count.",
);
assert.match(
  imageTools,
  /uCompressedByteCount\s*<\s*8[\s\S]*png_sig_cmp/,
  "PNG signature inspection is not preceded by an eight-byte input boundary.",
);
assert.doesNotMatch(
  textureTools,
  /IFXAllocate\s*\(\s*m_uHeight\s*\*\s*m_uPitch\s*\)/,
  "Render-copy allocation still uses a narrow height x pitch product.",
);
assert.doesNotMatch(
  textureTools,
  /memcpy\s*\([^;]*m_uPitch\s*\*\s*m_uHeight\s*\)/,
  "Render copy still recalculates a narrow height x pitch product.",
);
assert.doesNotMatch(
  textureTools,
  /IFXAllocate\s*\(\s*dest_height\s*\*\s*src_width\s*\*\s*m_u8PixelSize\s*\)/,
  "Vertical-first temporary resize allocation is still narrow.",
);
assert.doesNotMatch(
  textureTools,
  /IFXAllocate\s*\(\s*src_height\s*\*\s*dest_width\s*\*\s*m_u8PixelSize\s*\)/,
  "Horizontal-first temporary resize allocation is still narrow.",
);

const baseGuard = baseTriangle.indexOf(
  "if (NULL == ppBaseNeighbor || NULL == pOrientation)",
);
const baseDeref = baseTriangle.indexOf("*ppBaseNeighbor = m_pNeighbor");
assert.ok(
  baseGuard >= 0 && baseDeref >= 0 && baseGuard < baseDeref,
  "Base-neighbor output pointers are not checked before dereference.",
);

const motionGuard = animation.indexOf("if(NULL == ppMotion)");
const motionDeref = animation.indexOf("*ppMotion = NULL", motionGuard);
assert.ok(
  motionGuard >= 0 && motionDeref >= 0 && motionGuard < motionDeref,
  "Motion output pointer is not rejected before dereference.",
);
assert.match(
  animation.slice(motionGuard, motionGuard + 160),
  /return IFX_E_INVALID_POINTER;/,
  "Null motion output does not return IFX_E_INVALID_POINTER.",
);

for (const token of [
  "IFXCheckedMultiplySize((size_t)-1, 2",
  "IFXCheckedImageByteCount(0, 1, 1",
  "IFXCheckedImageByteCount(1, 1, 1",
  "IFX_U3D_IMAGE_MAX_WIDTH + 1",
  "IFXCheckedImageByteCount(U32_MAX, U32_MAX",
  "IFX_U3D_IMAGE_MAX_DECODED_BYTES == byteCount",
  "IFXCheckedImagePitchByteCount",
  "FailAllocate",
  "FailReallocate",
]) {
  assert.ok(nativeTest.includes(token), `Native U3D boundary test omits ${token}.`);
}

assert.match(
  build,
  /tests\\image_size_utils_test\.cpp[\s\S]*u3d_image_size_tests\.exe/,
  "The U3D build does not compile its native boundary tests.",
);
assert.match(
  packageSource,
  /IFXImageSizeUtils\.h/,
  "The U3D source package omits the added hardening header.",
);
assert.match(
  packageSource,
  /"tests"/,
  "The U3D source package omits its hostile boundary tests.",
);

console.log("U3D source hardening regression checks passed.");
