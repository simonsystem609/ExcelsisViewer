import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as pdfjs from "../modules/3dpdf/vendor/pdfjs/pdf.min.mjs";
import {
  beginText,
  endText,
  PDFDocument,
  fontkit,
  popGraphicsState,
  pushGraphicsState,
  rgb,
  setCharacterSpacing,
  setCharacterSqueeze,
  setFillingColor,
  setFontAndSize,
  setTextMatrix,
  showText,
} from "../modules/3dpdf/vendor/pdf-edit/pdf-export-runtime.mjs";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "../modules/3dpdf/vendor/pdfjs/pdf.worker.min.mjs",
  import.meta.url,
).href;

const expectedText = "Árvíztűrő tükörfúrógép őű";
const document = await PDFDocument.create();
document.registerFontkit(fontkit);
const page = document.addPage([612, 792]);
const fontBytes = await readFile(new URL(
  "../modules/3dpdf/vendor/pdfjs/standard_fonts/LiberationSans-Regular.ttf",
  import.meta.url,
));
const font = await document.embedFont(fontBytes, { subset: true });
page.drawText(expectedText, {
  x: 72,
  y: 700,
  size: 20,
  font,
  color: rgb(0.1, 0.15, 0.2),
});
const { newFontKey } = page.setOrEmbedFont(font);
page.pushOperators(
  pushGraphicsState(),
  beginText(),
  setFillingColor(rgb(0.2, 0.2, 0.2)),
  setFontAndSize(newFontKey, 20),
  setCharacterSqueeze(68),
  setCharacterSpacing(1.46 / 0.68),
  setTextMatrix(1, 0, 0, 1, 72, 650),
  showText(font.encodeText("SCALED")),
  endText(),
  popGraphicsState(),
);

const outputBytes = await document.save({ useObjectStreams: true });
assert.ok(outputBytes.byteLength > 1_000, "Edited PDF export should contain an embedded font.");

const task = pdfjs.getDocument({
  data: new Uint8Array(outputBytes),
  isEvalSupported: false,
  disableFontFace: true,
});
const parsed = await task.promise;
const parsedPage = await parsed.getPage(1);
const textContent = await parsedPage.getTextContent();
const extractedText = textContent.items.map((item) => item.str).join(" ");
assert.ok(
  extractedText.includes(expectedText),
  `Unicode export text was not preserved: ${JSON.stringify(extractedText)}`,
);
const scaledItem = textContent.items.find((item) => item.str === "SCALED");
assert.ok(scaledItem, "Low-level scaled text was not exported.");
assert.ok(
  Math.abs(Math.hypot(scaledItem.transform[0], scaledItem.transform[1]) / 20 - 0.68) < 0.001,
  "Horizontal character scaling was not preserved.",
);
await task.destroy();

console.log(JSON.stringify({
  bytes: outputBytes.byteLength,
  extractedText,
  unicodePreserved: true,
}, null, 2));
