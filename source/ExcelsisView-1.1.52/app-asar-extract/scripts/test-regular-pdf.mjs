import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { installPdfJsNodeTestShims } from "./pdfjs-node-test-shims.mjs";
import {
  editedSingleLineWidth,
  fittedTracking,
  matchPdfTextMetric,
  pdfTextMetricFromItem,
  typographyFromPdfTextMetrics,
} from "../modules/3dpdf/pdf-text-metrics.mjs";

installPdfJsNodeTestShims();
const pdfjs = await import("../modules/3dpdf/vendor/pdfjs/pdf.min.mjs");

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "../modules/3dpdf/vendor/pdfjs/pdf.worker.min.mjs",
  import.meta.url,
).href;

function createFixture() {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Length 51 >>\nstream\nBT /F1 24 Tf 72 720 Td (Excelsis PDF test) Tj ET\nendstream",
  ];
  let source = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.byteLength(source));
    source += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(source);
  source += `xref\n0 ${objects.length + 1}\n`;
  source += "0000000000 65535 f \n";
  for (const offset of offsets.slice(1)) {
    source += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  source += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return new Uint8Array(Buffer.from(source, "ascii"));
}

const task = pdfjs.getDocument({
  data: createFixture(),
  enableScripting: false,
  isEvalSupported: false,
  disableFontFace: true,
  standardFontDataUrl: `${fileURLToPath(new URL(
    "../modules/3dpdf/vendor/pdfjs/standard_fonts/",
    import.meta.url,
  )).replaceAll("\\", "/")}/`,
});
const documentHandle = await task.promise;
assert.equal(documentHandle.numPages, 1);
const page = await documentHandle.getPage(1);
const viewport = page.getViewport({ scale: 1 });
assert.equal(viewport.width, 612);
assert.equal(viewport.height, 792);
const content = await page.getTextContent();
assert.ok(content.items.some((item) => item.str.includes("Excelsis PDF test")));
const textItem = content.items.find((item) => item.str.includes("Excelsis PDF test"));
const textMetric = pdfTextMetricFromItem(
  textItem,
  content.styles[textItem.fontName],
  0,
);
assert.ok(textMetric);
const deliberatelyTallOperatorBounds = {
  x: textMetric.bounds.x - 1,
  y: textMetric.bounds.y - 12,
  width: textMetric.bounds.width + 2,
  height: textMetric.bounds.height + 48,
};
const matchedMetric = matchPdfTextMetric(
  [textMetric],
  textItem.str,
  deliberatelyTallOperatorBounds,
);
assert.equal(matchedMetric, textMetric);
const typography = typographyFromPdfTextMetrics(
  [matchedMetric],
  deliberatelyTallOperatorBounds,
);
assert.ok(Math.abs(typography.fontSize - 24) < 0.001);
assert.ok(typography.fontSize < deliberatelyTallOperatorBounds.height / 2);
assert.equal(typography.fontFamily, "sans");

const compressedMetric = pdfTextMetricFromItem({
  str: "12",
  transform: [9.724, 0, 0, 14.3, 100, 200],
  width: 12.700496,
  height: 14.3,
  fontName: "Monospace821BT-Roman",
}, {
  fontFamily: "Monospace821BT-Roman",
  ascent: 0.8,
  descent: -0.2,
}, 1);
assert.ok(Math.abs(compressedMetric.fontSize - 14.3) < 0.0001);
assert.ok(Math.abs(compressedMetric.horizontalScale - 0.68) < 0.0001);
const tracking = fittedTracking({
  sourceWidth: compressedMetric.width,
  naturalWidth: 17.16,
  horizontalScale: compressedMetric.horizontalScale,
  characterCount: 2,
  fontSize: compressedMetric.fontSize,
});
assert.ok(Math.abs(tracking - 1.031696) < 0.000001);
assert.ok(Math.abs(editedSingleLineWidth({
  naturalWidth: 17.16,
  horizontalScale: compressedMetric.horizontalScale,
  letterSpacing: tracking,
  characterCount: 2,
}) - compressedMetric.width) < 0.000001);

const rotatedMetric = pdfTextMetricFromItem({
  str: "Rotated",
  transform: [0, 8.16, -12, 0, 240, 320],
  width: 42,
  height: 12,
  fontName: "RotatedSans",
}, {
  fontFamily: "sans-serif",
  ascent: 0.8,
  descent: -0.2,
}, 2);
const rotatedTypography = typographyFromPdfTextMetrics(
  [rotatedMetric],
  rotatedMetric.bounds,
);
assert.ok(rotatedTypography);
assert.ok(Math.abs(rotatedTypography.rotation - Math.PI / 2) < 0.0001);
assert.ok(Math.abs(rotatedTypography.horizontalScale - 0.68) < 0.0001);

const renderViewport = page.getViewport({ scale: 0.25 });
const renderTarget = documentHandle.canvasFactory.create(
  Math.ceil(renderViewport.width),
  Math.ceil(renderViewport.height),
);
await page.render({
  canvas: renderTarget.canvas,
  canvasContext: renderTarget.context,
  viewport: renderViewport,
}).promise;
documentHandle.canvasFactory.destroy(renderTarget);
await task.destroy();

console.log(JSON.stringify({
  pages: 1,
  width: viewport.width,
  height: viewport.height,
  textItems: content.items.length,
  rendered: true,
}, null, 2));
