const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const regularPdf = read("modules/3dpdf/regular-pdf.mjs");
const pdfEditor = read("modules/3dpdf/pdf-editor.mjs");
const pdfStyles = read("modules/3dpdf/styles.css");
const pdfHtml = read("modules/3dpdf/index.html");
const preload = read("preload.cjs");
const main = read("main.cjs");
const batchPrint = read("modules/3dpdf/batch-print.mjs");
const batchPrintHtml = read("modules/3dpdf/batch-print.html");
const printDocument = read("modules/3dpdf/print-document.mjs");
const printDocumentStyles = read("modules/3dpdf/print-document.css");
const printLayout = read("modules/3dpdf/print-layout.mjs");
const installer = read("build/installer.nsh");
const pkg = JSON.parse(read("package.json"));

assert.match(regularPdf, /const canvas = document\.createElement\("canvas"\)/);
assert.match(regularPdf, /entry\.canvas\.replaceWith\(canvas\)/);
assert.match(regularPdf, /applyLiveWheelZoom/);
assert.match(regularPdf, /setTimeout\(commitLiveWheelZoom,\s*140\)/);
assert.match(regularPdf, /pageSurface\.style\.transform = `scale/);
assert.match(pdfStyles, /\.pdf-page-surface\{[^}]*will-change:transform/);
assert.match(regularPdf, /const MAX_CANVAS_PIXELS = 32_000_000/);
assert.match(regularPdf, /const MIN_DISPLAY_PIXEL_RATIO = 2/);
assert.match(regularPdf, /desktopApi\.openPrintPreview/);
assert.match(regularPdf, /const outputBytes = await editor\.exportBytes\(\)/);
assert.doesNotMatch(regularPdf, /for \(const entry of pageEntries\) await renderPage\(entry, true\)/);

const zIndexOf = (selector) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = pdfStyles.match(new RegExp(`${escapedSelector}\\{[^}]*z-index:(\\d+)`));
  assert.ok(match, `Missing z-index for ${selector}.`);
  return Number(match[1]);
};
assert.ok(
  zIndexOf(".pdf-native-hit.native-text") > zIndexOf(".pdf-edit-object"),
  "Embedded text hit zones must stay above materialized image objects.",
);
assert.ok(
  zIndexOf(".pdf-native-hit.native-text") > zIndexOf(".pdf-native-hit.native-image"),
  "Embedded text must win over an overlapping image hit zone.",
);
assert.match(pdfStyles, /\.pdf-inline-text-editor\{[^}]*position:absolute/);
assert.match(pdfEditor, /hit\.addEventListener\("dblclick"[\s\S]{0,600}beginInlineRewrite\(object\)/);
assert.match(pdfEditor, /function openInlineTextEditor\(object\)/);
assert.match(pdfEditor, /object\.root\.classList\.add\("inline-editing"\)/);
assert.match(pdfEditor, /closeInlineTextEditor\(\{ commit: false, revert: true \}\)/);
assert.match(pdfHtml, /id="pdfRecognizeImageText"[^>]*>Recognize text in image<\/button>/);
assert.match(pdfHtml, /id="pdfTextColorControl"[\s\S]{0,260}>Color<\/span>/);
assert.match(pdfHtml, /id="pdfFontVariant"[\s\S]{0,300}>Slanted<\/option>/);
assert.match(pdfHtml, /id="pdfCharacterSpacingControl"[\s\S]{0,260}id="pdfCharacterSpacing"/);
assert.match(pdfHtml, /id="pdfFontFamily"[\s\S]{0,220}value="light">Light sans<\/option>/);
assert.match(pdfEditor, /function recognizeImageText\(object\)/);
assert.match(pdfEditor, /liftOcrRegion\([\s\S]{0,180}\{ replaceObject: object \}/);
assert.match(pdfEditor, /region\.color \|\| dominantForegroundColor\(foregroundCrop\)/);
assert.match(pdfEditor, /tessedit_pageseg_mode:\s*sparseLayout\s*\?\s*"11"\s*:\s*"3"/);
assert.match(pdfEditor, /new ImageData\([\s\S]{0,220}prepared\.width[\s\S]{0,80}prepared\.height/);
assert.match(pdfStyles, /\.pdf-text-color-control\{[^}]*display:inline-flex/);
assert.match(pdfStyles, /\.pdf-character-spacing-control\{[^}]*display:inline-flex/);
assert.match(pdfEditor, /function harmonizeSmallOcrLines\(specifications\)/);
assert.match(pdfEditor, /harmonizeSmallOcrLines\(recognizedSpecifications\)/);

const saveSplitIndex = pdfHtml.indexOf('id="pdfSaveSplit"');
const openPdfIndex = pdfHtml.indexOf('for="file"');
assert.ok(saveSplitIndex >= 0 && saveSplitIndex < openPdfIndex, "Split Save must sit beside and before Open PDF.");
assert.match(pdfHtml, /id="pdfSave"[^>]*>Save<\/button>/);
assert.match(pdfHtml, /id="pdfSaveMenuButton"[^>]*aria-haspopup="menu"/);
assert.match(pdfHtml, /id="pdfSaveAs"[^>]*>Save As\.\.\.<\/button>/);
assert.doesNotMatch(pdfHtml, /pdfSaveCopy|Save edited copy/);
assert.match(pdfStyles, /\.pdf-save-split\{[^}]*position:relative/);
assert.match(pdfStyles, /\.pdf-save-menu\{[^}]*position:absolute[^}]*z-index:50/);
assert.match(regularPdf, /saveDocument\(\{ saveAs = false \} = \{\}\)/);
assert.match(regularPdf, /desktopApi\.writeFile\(sourcePath,/);
assert.match(regularPdf, /desktopApi\.saveAs\(sourcePath,/);
assert.match(regularPdf, /event\.ctrlKey[\s\S]{0,180}event\.key\.toLowerCase\(\) === "s"/);
assert.match(preload, /writeFile:[\s\S]{0,120}"fs:write-pdf"/);
assert.match(preload, /saveAs:[\s\S]{0,160}"fs:save-pdf-as"/);
assert.match(preload, /openPrintPreview:[\s\S]{0,180}"print:open-preview"/);
assert.doesNotMatch(preload, /fs:save-pdf-copy|saveCopy:/);

assert.match(main, /findBatchPrintArgs/);
assert.match(main, /queueBatchPrint/);
assert.match(main, /getPrintersAsync/);
assert.match(main, /webContents\.print/);
assert.match(main, /validateBatchPrintSettings/);
assert.match(main, /handleTrusted\("print:open-preview", \["3dpdf"\]/);
assert.match(main, /readPrintFileBytes/);
assert.match(main, /dpi:\s*\{\s*horizontal: prepared\.effectiveDpi,\s*vertical: prepared\.effectiveDpi/);
assert.match(batchPrint, /from "\.\/print-layout\.mjs"/);
assert.match(printDocument, /from "\.\/print-layout\.mjs"/);
assert.match(printDocument, /layout\.printScale \* plan\.effectiveDpi \/ 72/);
assert.match(printDocument, /canvas\.style\.width = `\$\{layout\.contentWidthMm\}mm`/);
assert.match(printDocument, /Math\.min\(layout\.paperWidthMm, layout\.paperHeightMm\)/);
assert.match(printDocument, /canvas\.classList\.toggle\("rotate-landscape", layout\.landscape\)/);
assert.match(printDocumentStyles, /\*\{box-sizing:border-box\}/);
assert.match(printDocumentStyles, /canvas\.rotate-landscape\{transform:rotate\(90deg\)\}/);
assert.match(batchPrintHtml, /value="fit-border">Fit to paper border \(borderless\)/);
assert.match(batchPrintHtml, /value="auto">Auto per page<\/option>/);
assert.match(batchPrintHtml, /id="qualityDpi"[\s\S]{0,180}value="600"/);
assert.match(printLayout, /MAX_PRINT_PAGE_PIXELS = 160_000_000/);
assert.match(printLayout, /MAX_PRINT_JOB_PIXELS = 180_000_000/);
assert.match(installer, /MultiSelectModel"\s+"Player"/);
assert.match(installer, /--batch-print %\*/);
for (const preload of ["batch-print-preload.cjs", "print-document-preload.cjs"]) {
  assert.ok(pkg.build.files.includes(preload), `${preload} is omitted from app.asar.`);
}

function exposedApi(preloadPath) {
  let exposed = null;
  const ipcRenderer = {
    invoke: () => Promise.resolve(),
    on: () => {},
    removeListener: () => {},
  };
  vm.runInNewContext(read(preloadPath), {
    require(moduleName) {
      assert.equal(moduleName, "electron");
      return {
        contextBridge: {
          exposeInMainWorld(name, api) {
            exposed = { name, api };
          },
        },
        ipcRenderer,
      };
    },
  });
  return exposed;
}

const batchApi = exposedApi("batch-print-preload.cjs");
assert.equal(batchApi.name, "batchPrintApp");
assert.deepEqual(
  Object.keys(batchApi.api).sort(),
  ["cancel", "getJob", "onProgress", "saveSettings", "start"],
);
const documentApi = exposedApi("print-document-preload.cjs");
assert.equal(documentApi.name, "printDocumentApp");
assert.deepEqual(Object.keys(documentApi.api).sort(), ["fail", "getJob", "ready"]);

console.log(JSON.stringify({
  smoothZoom: "compositor preview plus delayed detached-canvas render",
  batchPrint: "bounded Explorer multi-select with per-page Auto orientation",
  textPriority: "embedded text above overlapping image hit zones",
  inlineTextEditing: "double-click editor with commit and escape restore",
  pdfSave: "claimed-path overwrite plus split-menu Save As",
  imageTextOcr: "framed-logo OCR with mixed source-color runs",
}, null, 2));
