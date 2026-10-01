const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");
const moduleRoot = path.join(projectRoot, "modules", "3dpdf");
const html = fs.readFileSync(path.join(moduleRoot, "index.html"), "utf8");
const applicationModule = fs.readFileSync(path.join(moduleRoot, "app.mjs"), "utf8");
const regularModule = fs.readFileSync(path.join(moduleRoot, "regular-pdf.mjs"), "utf8");
const nanoPrcModule = fs.readFileSync(path.join(moduleRoot, "nano-prc.mjs"), "utf8");
const nanoWorkerModule = fs.readFileSync(path.join(moduleRoot, "nano-prc-worker.mjs"), "utf8");
const u3dWorkerModule = fs.readFileSync(path.join(moduleRoot, "u3d-pdf-worker.mjs"), "utf8");
const editorModule = fs.readFileSync(path.join(moduleRoot, "pdf-editor.mjs"), "utf8");
const imageToolsModule = fs.readFileSync(path.join(moduleRoot, "pdf-image-tools.mjs"), "utf8");
const imageWorkerModule = fs.readFileSync(path.join(moduleRoot, "pdf-image-worker.js"), "utf8");
const workerClientModule = fs.readFileSync(path.join(moduleRoot, "..", "shared", "worker-client.mjs"), "utf8");
const moduleStyles = fs.readFileSync(path.join(moduleRoot, "styles.css"), "utf8");

assert.match(
  html,
  /<script\s+type=["']module["']\s+src=["']\.\/app\.mjs["']\s*><\/script>/i,
  "The PDF page must load its application code from the CSP-safe external module.",
);
assert.doesNotMatch(html, /<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/i, "The PDF page must not contain inline scripts.");
assert.doesNotMatch(html, /<style\b[^>]*>[\s\S]*?<\/style>/i, "The PDF page must not contain inline styles.");
assert.match(
  html,
  /id=["']pdfOcrRegion["'][^>]*>Edit text<\/button>/i,
  "The region command must present automatic text editing, not require users to choose OCR.",
);
assert.match(
  html,
  /id=["']pdfSaveSplit["'][\s\S]*id=["']pdfSave["'][^>]*>Save<\/button>[\s\S]*id=["']pdfSaveMenuButton["'][\s\S]*id=["']pdfSaveAs["'][^>]*>Save As\.\.\.<\/button>/i,
  "Regular PDFs must expose a split Save button with Save As in its menu.",
);
assert.doesNotMatch(
  html,
  /pdfSaveCopy|Save edited copy/i,
  "The obsolete copy-only PDF save control must not remain.",
);
new vm.SourceTextModule(applicationModule, { identifier: "app.mjs" });
new vm.SourceTextModule(regularModule, { identifier: "regular-pdf.mjs" });
new vm.SourceTextModule(nanoPrcModule, { identifier: "nano-prc.mjs" });
new vm.SourceTextModule(nanoWorkerModule, { identifier: "nano-prc-worker.mjs" });
new vm.SourceTextModule(u3dWorkerModule, { identifier: "u3d-pdf-worker.mjs" });
new vm.SourceTextModule(editorModule, { identifier: "pdf-editor.mjs" });
new vm.SourceTextModule(imageToolsModule, { identifier: "pdf-image-tools.mjs" });
new vm.Script(imageWorkerModule, { filename: "pdf-image-worker.js" });
new vm.SourceTextModule(workerClientModule, { identifier: "worker-client.mjs" });

assert.match(
  applicationModule,
  /createWorkerTaskClient\([\s\S]{0,250}nano-prc-worker\.mjs/,
  "nanoPRC decoding and mesh preparation must stay off the 3D viewer UI thread.",
);
assert.match(
  applicationModule,
  /createWorkerTaskClient\([\s\S]{0,250}u3d-pdf-worker\.mjs/,
  "U3D PDF extraction must stay off the 3D viewer UI thread.",
);
assert.match(
  u3dWorkerModule,
  /decodePDFRawStream[\s\S]{0,8000}extract-u3d/,
  "The U3D PDF worker must decode and validate embedded U3D streams.",
);
assert.match(
  editorModule,
  /createWorkerTaskClient\([\s\S]{0,250}pdf-image-worker\.js/,
  "PDF image separation and inpainting must stay off the PDF viewer UI thread.",
);
assert.doesNotMatch(
  editorModule,
  /\bensureOpenCv\b|\bcv\.inpaint\b/,
  "The PDF viewer UI module must not load or execute OpenCV directly.",
);
assert.match(
  regularModule,
  /fontExtraProperties:\s*true/,
  "PDF.js must expose embedded font programs so native edits can preserve the source font.",
);
assert.match(
  regularModule,
  /desktopApi\.writeFile\(sourcePath,[\s\S]{0,160}transferableBytes\(outputBytes\)/,
  "The main PDF Save action must write the edited bytes back to the claimed source path.",
);
assert.match(
  regularModule,
  /desktopApi\.saveAs\(sourcePath,[\s\S]{0,180}sourceLabel\)/,
  "PDF Save As must use the separately brokered save-dialog capability.",
);
assert.match(
  editorModule,
  /getTextContent\(\)[\s\S]{0,300}textContent\.items/,
  "Native PDF selection must use complete logical text runs from PDF.js.",
);
assert.match(
  imageWorkerModule,
  /ocrWordRegionsFromBlocks\(/,
  "OCR must partition recognized lines into independently editable word objects.",
);
assert.match(
  imageWorkerModule,
  /splitOcrRegionsByColor\(source,\s*regions,\s*\{\s*sourcePixels:\s*true\s*\}\)/,
  "OCR must split mixed-color text into independently colored editable runs.",
);
assert.match(
  editorModule,
  /tessedit_pageseg_mode:\s*sparseLayout\s*\?\s*"11"\s*:\s*"3"/,
  "Wide image text must use sparse-layout OCR so logos and small taglines are recognized.",
);
assert.match(
  html,
  /id=["']pdfTextColorControl["'][\s\S]*>Color<\/span>[\s\S]*id=["']pdfObjectColor["'][\s\S]*id=["']pdfObjectColorValue["']/i,
  "The PDF text editor must expose an explicit, readable source-color control.",
);
assert.match(
  html,
  /id=["']pdfFontVariant["'][\s\S]{0,300}>Slanted<\/option>[\s\S]{0,160}>Bold slanted<\/option>/i,
  "The PDF text editor must expose regular, bold, slanted, and bold-slanted text.",
);
assert.match(
  html,
  /id=["']pdfCharacterSpacingControl["'][\s\S]*>Spacing<\/span>[\s\S]*id=["']pdfCharacterSpacing["']/i,
  "The PDF text editor must expose per-object character spacing.",
);
assert.match(
  html,
  /id=["']pdfFontFamily["'][\s\S]{0,220}value=["']light["']>Light sans<\/option>/i,
  "The PDF text editor must expose the bundled light sans family.",
);
assert.match(
  editorModule,
  /function harmonizeSmallOcrLines\(specifications\)[\s\S]{0,9000}uniformMaskFit:\s*true/,
  "Small same-line OCR words must share one mask-selected font and uniform text transform.",
);
assert.match(
  editorModule,
  /textMeasureContext\.measureText\(String\(text\)\)\.width/,
  "Editable PDF text must preserve whole-run kerning while measuring.",
);
const refreshObjectSource = editorModule.slice(
  editorModule.indexOf("function refreshObject"),
  editorModule.indexOf("function refreshEntry"),
);
assert.match(
  refreshObjectSource,
  /text\.textContent\s*=\s*object\.text[\s\S]{0,900}text\.setAttribute\("letter-spacing"[\s\S]{0,260}group\.append\(text\)/,
  "Each editable word box must render as one uniformly transformed text run.",
);
assert.match(
  refreshObjectSource,
  /svg\.setAttribute\("overflow",\s*"visible"\)/,
  "Editable SVG text must expose glyph overhang instead of clipping its final character.",
);
assert.match(
  moduleStyles,
  /\.pdf-edit-object\.text-object\s+\.pdf-edit-content,[\s\S]{0,160}\.pdf-edit-object\.text-object\s+\.pdf-edit-content\s+svg\s*\{\s*overflow:visible\s*\}/,
  "Text object containers must expose glyph overhang while image content remains clipped.",
);
assert.doesNotMatch(
  refreshObjectSource,
  /for\s*\([^)]*characters/,
  "Editable word boxes must not render or transform characters separately.",
);
assert.match(
  html,
  /id=["']pdfRecognizeImageText["'][^>]*>Recognize text in image<\/button>/i,
  "The image context menu must offer text recognition.",
);

const htmlIds = new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]));
const referencedIds = new Set();
for (const source of [applicationModule, regularModule, editorModule]) {
  for (const match of source.matchAll(/getElementById\(["']([^"']+)["']\)/g)) {
    referencedIds.add(match[1]);
  }
}
for (const id of referencedIds) {
  assert.ok(htmlIds.has(id), `PDF script references missing element #${id}.`);
}

assert.match(
  editorModule,
  /source:\s*"ocr"[\s\S]{0,700}renderMode:\s*"text"/,
  "Manual OCR must replace the source region with editable text immediately.",
);
const nativeHitSource = editorModule.slice(
  editorModule.indexOf("function nativeHitElement"),
  editorModule.indexOf("async function discoverEntry"),
);
assert.match(
  nativeHitSource,
  /addEventListener\("contextmenu"/,
  "Native PDF text and images must expose the edit context menu.",
);
assert.ok(htmlIds.has("pdfCropImage"), "The image edit menu must include a crop command.");

const textEditListenerSource = editorModule.slice(
  editorModule.indexOf('textInput?.addEventListener("input"'),
  editorModule.indexOf('widthInput?.addEventListener("input"'),
);
assert.match(
  textEditListenerSource,
  /resizeEditedTextBounds\(object\)/,
  "Edited text must resize naturally from its fixed left edge.",
);
assert.doesNotMatch(
  textEditListenerSource,
  /fitOriginalTextSpacing|fittedLetterSpacing/,
  "Editing text must not redistribute characters across the original width.",
);
const resizeEditedTextSource = editorModule.slice(
  editorModule.indexOf("function resizeEditedTextBounds"),
  editorModule.indexOf("function mutateSelectedBounds"),
);
assert.match(
  resizeEditedTextSource,
  /object\.bounds\.width\s*=/,
  "Edited text must update only its natural width.",
);
assert.doesNotMatch(
  resizeEditedTextSource,
  /object\.bounds\.x\s*=/,
  "Edited text must preserve its original left coordinate.",
);
assert.match(
  editorModule,
  /setCharacterSqueeze\(horizontalScale \* 100\)[\s\S]{0,180}setCharacterSpacing\([\s\S]{0,180}setTextMatrix\(/,
  "Native PDF export must preserve horizontal scale, character spacing, rotation, and baseline.",
);

for (const relativePath of [
  "nano-prc.mjs",
  "nano-prc-worker.mjs",
  "u3d-pdf-worker.mjs",
  "pdf-image-worker.js",
  "native/nano_prc_app_export.exe",
  "native/LICENSE-nanoPRC.txt",
  "native/THIRD_PARTY_NOTICES-nanoPRC.md",
  "native/u3d/u3d_app_export.exe",
  "native/u3d/IFXCore.dll",
  "native/u3d/IFXImporting.dll",
  "native/u3d/libwinpthread-1.dll",
  "vendor/runtime.mjs",
  "vendor/pdfjs/pdf.min.mjs",
  "vendor/pdfjs/pdf.worker.min.mjs",
  "vendor/pdfjs/cmaps",
  "vendor/pdfjs/standard_fonts",
  "vendor/pdfjs/wasm",
  "vendor/pdfjs/iccs",
  "vendor/pdf-edit/pdf-export-runtime.mjs",
  "vendor/pdf-edit/fonts/LiberationSans-Regular.ttf",
  "vendor/pdf-edit/fonts/LiberationSans-Bold.ttf",
  "vendor/pdf-edit/fonts/LiberationSans-Italic.ttf",
  "vendor/pdf-edit/fonts/LiberationSans-BoldItalic.ttf",
  "vendor/pdf-edit/fonts/LiberationSerif-Regular.ttf",
  "vendor/pdf-edit/fonts/LiberationSerif-Bold.ttf",
  "vendor/pdf-edit/fonts/LiberationSerif-Italic.ttf",
  "vendor/pdf-edit/fonts/LiberationSerif-BoldItalic.ttf",
  "vendor/pdf-edit/fonts/LiberationMono-Regular.ttf",
  "vendor/pdf-edit/fonts/LiberationMono-Bold.ttf",
  "vendor/pdf-edit/fonts/LiberationMono-Italic.ttf",
  "vendor/pdf-edit/fonts/LiberationMono-BoldItalic.ttf",
  "vendor/pdf-edit/fonts/LICENSE_LIBERATION",
  "vendor/pdf-edit/fonts/Roboto-Light.ttf",
  "vendor/pdf-edit/fonts/Roboto-LightItalic.ttf",
  "vendor/pdf-edit/fonts/Roboto-Bold.ttf",
  "vendor/pdf-edit/fonts/Roboto-BoldItalic.ttf",
  "vendor/pdf-edit/fonts/LICENSE_ROBOTO",
  "vendor/tesseract/tesseract.min.js",
  "vendor/tesseract/worker.min.js",
  "vendor/tesseract/core/tesseract-core-lstm.wasm.js",
  "vendor/tesseract/core/tesseract-core-simd-lstm.wasm.js",
  "vendor/tesseract/lang/eng.traineddata.gz",
  "vendor/tesseract/lang/hun.traineddata.gz",
  "vendor/opencv/opencv.js",
]) {
  assert.ok(fs.existsSync(path.join(moduleRoot, relativePath)), `Missing PDF runtime asset: ${relativePath}`);
}

console.log(JSON.stringify({
  applicationModuleBytes: Buffer.byteLength(applicationModule),
  regularModuleBytes: Buffer.byteLength(regularModule),
  editorModuleBytes: Buffer.byteLength(editorModule),
  imageToolsModuleBytes: Buffer.byteLength(imageToolsModule),
  nanoWorkerModuleBytes: Buffer.byteLength(nanoWorkerModule),
  u3dWorkerModuleBytes: Buffer.byteLength(u3dWorkerModule),
  imageWorkerModuleBytes: Buffer.byteLength(imageWorkerModule),
  elementIds: htmlIds.size,
  referencedIds: referencedIds.size,
}, null, 2));
