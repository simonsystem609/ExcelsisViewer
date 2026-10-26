import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createCanvas } from "@napi-rs/canvas";
import { PDFDocument, PDFName, PDFArray, PDFDict, rgb, degrees } from "pdf-lib";
import { installPdfJsNodeTestShims } from "./pdfjs-node-test-shims.mjs";
import { transformPdfPages, validatePageTransform } from "../modules/3dpdf/pdf-page-transform.mjs";

installPdfJsNodeTestShims();
const pdfjs = await import("../modules/3dpdf/vendor/pdfjs/pdf.min.mjs");
pdfjs.GlobalWorkerOptions.workerSrc = new URL("../modules/3dpdf/vendor/pdfjs/pdf.worker.min.mjs", import.meta.url).href;
const doc = await PDFDocument.create();
doc.setTitle("Synthetic vector transform fixture");
for (const angle of [0, 90]) {
  const page = doc.addPage([300, 230]);
  page.setMediaBox(20, 30, 300, 230); page.setCropBox(40, 60, 240, 160); page.setRotation(degrees(angle));
  page.drawRectangle({ x: 50, y: 180, width: 30, height: 25, color: rgb(1, 0, 0) });
  page.drawRectangle({ x: 225, y: 75, width: 40, height: 15, color: rgb(0, 0, 1) });
  page.drawText("VECTOR F 123", { x: 90, y: 170, size: 15 });
  page.drawLine({ start: { x: 90, y: 100 }, end: { x: 180, y: 140 }, thickness: 3, color: rgb(0, .6, 0) });
  const appearance = doc.context.register(doc.context.flateStream("0 0.6 0.8 rg 0 0 40 10 re f 0 0 8 30 re f", { Type: "XObject", Subtype: "Form", BBox: [0, 0, 40, 30], Resources: {} }));
  const annotation = doc.context.obj({ Type: "Annot", Subtype: "Stamp", Rect: [185,110,225,140], AP: { N: appearance }, F: 4 });
  page.node.set(PDFName.of("Annots"), doc.context.obj([doc.context.register(annotation)]));
}
const original = await doc.save();
const unchanged = new Uint8Array(original);

async function render(bytes, pageNumber, rotation = 0) {
  const task = pdfjs.getDocument({ data: new Uint8Array(bytes), isEvalSupported: false, disableFontFace: true,
    standardFontDataUrl: fileURLToPath(new URL("../modules/3dpdf/vendor/pdfjs/standard_fonts/", import.meta.url)).replaceAll("\\", "/") });
  try {
    const parsed = await task.promise, page = await parsed.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1, rotation: (page.rotate + rotation) % 360 });
    const canvas = createCanvas(Math.round(viewport.width), Math.round(viewport.height));
    await page.render({ canvas, canvasContext: canvas.getContext("2d"), viewport }).promise;
    const content = await page.getTextContent();
    assert(content.items.some(item => item.str.includes("VECTOR")), "Text remains searchable, not rasterized");
    return canvas;
  } finally { await task.destroy(); }
}

function compare(actual, base, kind, axis, sx = 1, sy = 1) {
  const width = Math.round(base.width*sx), height = Math.round(base.height*sy);
  assert.equal(actual.width, width); assert.equal(actual.height, height);
  const expected = createCanvas(width, height), context = expected.getContext("2d");
  context.fillStyle = "white"; context.fillRect(0,0,width,height);
  if (kind === "mirror") {
    context.translate(axis === "horizontal" ? width : 0, axis === "vertical" ? height : 0);
    context.scale(axis === "horizontal" ? -1 : 1, axis === "vertical" ? -1 : 1);
  }
  context.drawImage(base, 0, 0, width, height);
  const a = actual.getContext("2d").getImageData(0,0,width,height).data;
  const b = context.getImageData(0,0,width,height).data;
  let difference = 0;
  for (let i = 0; i < a.length; i += 4) difference += Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);
  assert(difference/(width*height*3*255) < 0.014, `Unexpected ${kind}/${axis} rendering: ${difference/(width*height*3*255)}`);
}

let checks = 0;
for (const viewRotation of [0, 90, 180, 270]) {
  for (const axis of ["horizontal", "vertical"]) {
    const transformed = await transformPdfPages(original, { kind: "mirror", axis, viewRotation });
    for (const number of [1,2]) compare(await render(transformed, number), await render(original, number, viewRotation), "mirror", axis);
    checks += 2;
  }
  const scaled = await transformPdfPages(original, { kind: "scale", xPercent: 150, yPercent: 75, viewRotation });
  for (const number of [1,2]) compare(await render(scaled, number), await render(original, number, viewRotation), "scale", "", 1.5, .75);
  checks += 2;
}
const selected = await transformPdfPages(original, { kind: "scale", scope: "current", page: 2, xPercent: 200 });
const selectedDoc = await PDFDocument.load(selected);
assert.deepEqual(selectedDoc.getPage(0).getCropBox(), doc.getPage(0).getCropBox());
assert.equal(selectedDoc.getPage(1).getCropBox().width, 480);
assert.equal(selectedDoc.getTitle(), doc.getTitle());
const mirrored = await PDFDocument.load(await transformPdfPages(original, { kind: "mirror" }));
const annot = mirrored.getPage(0).node.Annots().lookup(0, PDFDict);
assert.deepEqual(annot.lookup(PDFName.of("Rect"), PDFArray).asArray().map(n=>n.asNumber()), [95,110,135,140]);
assert.deepEqual(original, unchanged, "Input bytes must not be mutated");
for (const invalid of [0, -10, 1001, NaN, Infinity, "100"]) assert.throws(() => validatePageTransform({kind:"scale",xPercent:invalid},2), /percentages/);
assert.throws(() => validatePageTransform({kind:"mirror",page:3},2), /unavailable/);
assert.throws(() => validatePageTransform({kind:"mirror",viewRotation:12},2), /rotation/);
const huge = await PDFDocument.create(); huge.addPage([2000,2000]);
await assert.rejects(transformPdfPages(await huge.save(), {kind:"scale",xPercent:1000}), /14,400/);
const form = await PDFDocument.create(); form.addPage(); form.getForm().createTextField("DoNotFlatten").setText("Preserve me");
await assert.rejects(transformPdfPages(await form.save(), {kind:"mirror"}), /interactive forms/);
const signed = await PDFDocument.create(); signed.addPage(); signed.catalog.set(PDFName.of("Perms"), signed.context.obj({}));
await assert.rejects(transformPdfPages(await signed.save(), {kind:"scale"}), /Signed PDFs/);
const unsupported = await PDFDocument.load(original);
unsupported.getPage(0).node.Annots().lookup(0, PDFDict).set(PDFName.of("Subtype"), PDFName.of("3D"));
await assert.rejects(transformPdfPages(await unsupported.save(), {kind:"mirror"}), /3D PDF annotations/);
if (process.env.PDF_TRANSFORM_EVIDENCE) {
  const root = process.env.PDF_TRANSFORM_EVIDENCE;
  await mkdir(root, { recursive:true });
  await writeFile(`${root}/original.pdf`, original);
  await writeFile(`${root}/mirror-horizontal.pdf`, await transformPdfPages(original, {kind:"mirror"}));
  await writeFile(`${root}/mirror-vertical.pdf`, await transformPdfPages(original, {kind:"mirror",axis:"vertical"}));
  await writeFile(`${root}/scale-150x75.pdf`, await transformPdfPages(original, {kind:"scale",xPercent:150,yPercent:75}));
}
console.log(JSON.stringify({renderComparisons:checks, rotations:[0,90,180,270], croppedOffsetPages:true, vectorText:true, annotationAppearances:true, currentPageOnly:true, boundsAndUnsupportedGuard:true}));
