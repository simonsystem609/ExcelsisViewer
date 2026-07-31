import * as pdfjs from "./vendor/pdfjs/pdf.min.mjs";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "./vendor/pdfjs/pdf.worker.min.mjs",
  import.meta.url,
).href;

const CSS_UNITS = 96 / 72;
const paperMillimeters = {
  A3: [297, 420],
  A4: [210, 297],
  A5: [148, 210],
  Letter: [215.9, 279.4],
  Legal: [215.9, 355.6],
};
const marginMillimeters = { none: 0, minimum: 5, normal: 12.7 };

function bytesFrom(value) {
  return value instanceof Uint8Array ? new Uint8Array(value) : Uint8Array.from(value?.data || value || []);
}

function pdfResource(relativePath) {
  return new URL(`./vendor/pdfjs/${relativePath}`, import.meta.url).href;
}

function selectedPages(text, pageCount) {
  if (!text || text.trim().toLowerCase() === "all") {
    return Array.from({ length: pageCount }, (_value, index) => index + 1);
  }
  const pages = new Set();
  for (const part of text.split(",")) {
    const [startText, endText] = part.trim().split("-").map((value) => value.trim());
    const start = Math.max(1, Math.min(pageCount, Number(startText) || 1));
    const end = endText ? Math.max(1, Math.min(pageCount, Number(endText) || start)) : start;
    for (let page = Math.min(start, end); page <= Math.max(start, end); page += 1) pages.add(page);
  }
  return [...pages].sort((first, second) => first - second);
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
    isEvalSupported: false,
    useWorkerFetch: false,
  });
  const pdf = await task.promise;
  const pageNumbers = selectedPages(job.settings.pageRanges, pdf.numPages);
  if (!pageNumbers.length) throw new Error("The page range does not select any pages.");
  const firstPage = await pdf.getPage(pageNumbers[0]);
  const firstViewport = firstPage.getViewport({ scale: 1 });
  const landscape = job.settings.orientation === "auto"
    ? firstViewport.width > firstViewport.height
    : job.settings.orientation === "landscape";
  let [paperWidth, paperHeight] = paperMillimeters[job.settings.paperSize] || paperMillimeters.A4;
  if (landscape) [paperWidth, paperHeight] = [paperHeight, paperWidth];
  const margin = marginMillimeters[job.settings.margins] ?? marginMillimeters.minimum;
  const usableWidth = Math.max(1, paperWidth - margin * 2);
  const usableHeight = Math.max(1, paperHeight - margin * 2);
  const pagesElement = document.getElementById("pages");

  for (const pageNumber of pageNumbers) {
    const page = pageNumber === pageNumbers[0] ? firstPage : await pdf.getPage(pageNumber);
    const base = page.getViewport({ scale: 1 });
    const naturalWidth = base.width * 25.4 / 72;
    const naturalHeight = base.height * 25.4 / 72;
    let printScale = 1;
    if (job.settings.scaleMode === "fit") {
      printScale = Math.min(usableWidth / naturalWidth, usableHeight / naturalHeight);
    } else if (job.settings.scaleMode === "custom") {
      printScale = Math.max(0.1, Math.min(2, job.settings.customScale / 100));
    }
    const cssViewport = page.getViewport({ scale: CSS_UNITS * printScale });
    const maximumPagePixels = 12_000_000;
    const batchPixelBudget = 72_000_000;
    const pixelRatio = Math.max(0.75, Math.min(
      2,
      Math.sqrt(maximumPagePixels / Math.max(1, cssViewport.width * cssViewport.height)),
      Math.sqrt(batchPixelBudget / Math.max(1, cssViewport.width * cssViewport.height * pageNumbers.length)),
    ));
    const renderViewport = page.getViewport({ scale: CSS_UNITS * printScale * pixelRatio });
    const sheet = document.createElement("section");
    sheet.className = "print-sheet";
    sheet.style.width = `${paperWidth}mm`;
    sheet.style.height = `${paperHeight}mm`;
    sheet.style.padding = `${margin}mm`;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.ceil(renderViewport.width));
    canvas.height = Math.max(1, Math.ceil(renderViewport.height));
    canvas.style.width = `${cssViewport.width}px`;
    canvas.style.height = `${cssViewport.height}px`;
    sheet.append(canvas);
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
    landscape,
    pageCount: pageNumbers.length,
  });
} catch (error) {
  await window.printDocumentApp.fail(error?.message || "Could not render the PDF for printing.");
}
