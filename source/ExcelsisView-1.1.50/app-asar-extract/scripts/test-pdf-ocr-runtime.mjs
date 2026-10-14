import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { createCanvas } from "@napi-rs/canvas";
import { createWorker, OEM } from "tesseract.js";
import { ocrLineRegionsFromBlocks } from "../modules/3dpdf/pdf-image-tools.mjs";

const canvas = createCanvas(720, 220);
const context = canvas.getContext("2d");
const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
gradient.addColorStop(0, "#f3e5e7");
gradient.addColorStop(1, "#d4e3f1");
context.fillStyle = gradient;
context.fillRect(0, 0, canvas.width, canvas.height);
context.fillStyle = "#44242f";
context.font = "bold 46px Arial";
context.fillText("RASTER TEXT 123 őű", 46, 112);

const worker = await createWorker(["hun", "eng"], OEM.LSTM_ONLY, {
  cacheMethod: "none",
  langPath: fileURLToPath(new URL(
    "../modules/3dpdf/vendor/tesseract/lang/",
    import.meta.url,
  )),
});

let result;
try {
  await worker.setParameters({
    hocr_font_info: "1",
    preserve_interword_spaces: "1",
  });
  result = await worker.recognize(canvas.toBuffer("image/png"), {}, {
    blocks: true,
    hocr: true,
    text: true,
    tsv: true,
  });
} finally {
  await worker.terminate();
}

const recognizedText = result.data.text.trim();
assert.match(recognizedText, /RASTER TEXT 123/i);
assert.ok(result.data.tsv.includes("\tRASTER"), "OCR should return word geometry.");
const lineRegions = ocrLineRegionsFromBlocks(result.data.blocks, canvas.width, canvas.height);
assert.ok(lineRegions.length, "OCR should return detailed line geometry.");
assert.ok(lineRegions[0].fontSizePixels >= 35, "OCR should preserve the source line height.");
assert.ok(lineRegions[0].baselineY > lineRegions[0].top, "OCR should return a usable baseline.");

console.log(JSON.stringify({
  recognizedText,
  confidence: result.data.confidence,
  lineFontSizePixels: lineRegions[0].fontSizePixels,
  lineBaseline: lineRegions[0].baselineY,
  offlineLanguages: ["hun", "eng"],
}, null, 2));
