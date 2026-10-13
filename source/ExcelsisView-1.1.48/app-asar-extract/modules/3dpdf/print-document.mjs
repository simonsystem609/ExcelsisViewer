import * as pdfjs from "./vendor/pdfjs/pdf.min.mjs";
import {
  computePrintRenderPlan,
  selectedPages,
} from "./print-layout.mjs";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "./vendor/pdfjs/pdf.worker.min.mjs",
  import.meta.url,
).href;

function bytesFrom(value) {
  return value instanceof Uint8Array ? new Uint8Array(value) : Uint8Array.from(value?.data || value || []);
}

function pdfResource(relativePath) {
  return new URL(`./vendor/pdfjs/${relativePath}`, import.meta.url).href;
}

try {
  const job = await window.printDocumentApp.getJob();
  const task = pdfjs.getDocument({
    data: bytesFrom(job.bytes),
    cMapUrl: pdfResource("cmaps/"),
    cMapPacked: true,
    standardFontDataUrl: pdfResource("standard_fonts/"),
    wasmUrl: pdfResource("wasm/"),
    iccUrl: pdfResource("iccs/"),
    enableXfa: true,
    enableScripting: false,
    isEvalSupported: false,
    useWorkerFetch: false,
  });
  const pdf = await task.promise;
  const pageNumbers = selectedPages(job.settings.pageRanges, pdf.numPages);
  if (!pageNumbers.length) throw new Error("The page range does not select any pages.");

  const records = [];
  for (const pageNumber of pageNumbers) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    records.push({
      page,
      pageNumber,
      size: { width: viewport.width, height: viewport.height },
    });
  }
  const plan = computePrintRenderPlan(records.map((record) => record.size), job.settings);
  const pagesElement = document.getElementById("pages");

  for (let index = 0; index < records.length; index += 1) {
    const { page } = records[index];
    const layout = plan.layouts[index];
    const renderViewport = page.getViewport({
      scale: layout.printScale * plan.effectiveDpi / 72,
    });
    const sheet = document.createElement("section");
    sheet.className = "print-sheet";
    sheet.style.width = `${Math.min(layout.paperWidthMm, layout.paperHeightMm)}mm`;
    sheet.style.height = `${Math.max(layout.paperWidthMm, layout.paperHeightMm)}mm`;
    const pageFrame = document.createElement("div");
    pageFrame.className = "print-page-frame";
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.ceil(renderViewport.width));
    canvas.height = Math.max(1, Math.ceil(renderViewport.height));
    canvas.style.width = `${layout.contentWidthMm}mm`;
    canvas.style.height = `${layout.contentHeightMm}mm`;
    canvas.classList.toggle("rotate-landscape", layout.landscape);
    pageFrame.append(canvas);
    sheet.append(pageFrame);
    pagesElement.append(sheet);
    await page.render({
      canvas,
      canvasContext: canvas.getContext("2d", { alpha: false }),
      viewport: renderViewport,
    }).promise;
  }
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  await window.printDocumentApp.ready({
    landscape: plan.landscape,
    pageCount: pageNumbers.length,
    requestedDpi: plan.requestedDpi,
    effectiveDpi: plan.effectiveDpi,
    reducedQuality: plan.reducedQuality,
    mixedOrientation: plan.mixedOrientation,
  });
} catch (error) {
  await window.printDocumentApp.fail(error?.message || "Could not render the PDF for printing.");
}
