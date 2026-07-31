import * as pdfjs from "./vendor/pdfjs/pdf.min.mjs";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "./vendor/pdfjs/pdf.worker.min.mjs",
  import.meta.url,
).href;

const api = window.batchPrintApp;
const paperMillimeters = {
  A3: [297, 420],
  A4: [210, 297],
  A5: [148, 210],
  Letter: [215.9, 279.4],
  Legal: [215.9, 355.6],
};
const controls = {
  printer: document.getElementById("printer"),
  paperSize: document.getElementById("paperSize"),
  orientation: document.getElementById("orientation"),
  margins: document.getElementById("margins"),
  scaleMode: document.getElementById("scaleMode"),
  customScale: document.getElementById("customScale"),
  copies: document.getElementById("copies"),
  color: document.getElementById("color"),
  duplexMode: document.getElementById("duplexMode"),
  pageRanges: document.getElementById("pageRanges"),
};
const previewSheet = document.getElementById("previewSheet");
const previewContent = document.getElementById("previewContent");
const previewCanvas = document.getElementById("previewCanvas");
const customScaleLabel = document.getElementById("customScaleLabel");
const printButton = document.getElementById("printBtn");
const closeButton = document.getElementById("closeBtn");
const status = document.getElementById("status");
const progress = document.getElementById("progress");
let firstPageSize = null;
let running = false;
let saveTimer = 0;

function bytesFrom(value) {
  return value instanceof Uint8Array ? new Uint8Array(value) : Uint8Array.from(value?.data || value || []);
}

function pdfResource(relativePath) {
  return new URL(`./vendor/pdfjs/${relativePath}`, import.meta.url).href;
}

function setControlValues(settings) {
  controls.paperSize.value = settings.paperSize;
  controls.orientation.value = settings.orientation;
  controls.margins.value = settings.margins;
  controls.scaleMode.value = settings.scaleMode;
  controls.customScale.value = String(settings.customScale);
  controls.copies.value = String(settings.copies);
  controls.color.value = settings.color ? "color" : "grayscale";
  controls.duplexMode.value = settings.duplexMode;
  controls.pageRanges.value = settings.pageRanges;
}

function selectedSettings() {
  return {
    deviceName: controls.printer.value,
    paperSize: controls.paperSize.value,
    orientation: controls.orientation.value,
    margins: controls.margins.value,
    scaleMode: controls.scaleMode.value,
    customScale: Number(controls.customScale.value),
    copies: Number(controls.copies.value),
    color: controls.color.value === "color",
    duplexMode: controls.duplexMode.value,
    pageRanges: controls.pageRanges.value,
  };
}

function updatePreviewLayout() {
  if (!firstPageSize) return;
  const settings = selectedSettings();
  const landscape = settings.orientation === "auto"
    ? firstPageSize.width > firstPageSize.height
    : settings.orientation === "landscape";
  let [paperWidth, paperHeight] = paperMillimeters[settings.paperSize] || paperMillimeters.A4;
  if (landscape) [paperWidth, paperHeight] = [paperHeight, paperWidth];
  previewSheet.style.aspectRatio = `${paperWidth}/${paperHeight}`;
  const marginPercent = settings.margins === "none" ? 0 : settings.margins === "normal" ? 5 : 2.2;
  previewContent.style.padding = `${marginPercent}%`;
  customScaleLabel.hidden = settings.scaleMode !== "custom";

  const naturalWidthMm = firstPageSize.width * 25.4 / 72;
  const naturalHeightMm = firstPageSize.height * 25.4 / 72;
  let scale = 1;
  if (settings.scaleMode === "custom") scale = Math.max(0.1, Math.min(2, settings.customScale / 100));
  if (settings.scaleMode === "fit") {
    const usable = 1 - marginPercent * 2 / 100;
    scale = Math.min(
      paperWidth * usable / naturalWidthMm,
      paperHeight * usable / naturalHeightMm,
    );
  }
  previewCanvas.style.width = `${naturalWidthMm * scale / paperWidth * 100}%`;
  previewCanvas.style.height = `${naturalHeightMm * scale / paperHeight * 100}%`;
  previewCanvas.style.maxWidth = settings.scaleMode === "fit" ? "100%" : "none";
  previewCanvas.style.maxHeight = settings.scaleMode === "fit" ? "100%" : "none";
}

async function renderPreview(bytes) {
  const task = pdfjs.getDocument({
    data: bytesFrom(bytes),
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
  const page = await pdf.getPage(1);
  const base = page.getViewport({ scale: 1 });
  firstPageSize = { width: base.width, height: base.height };
  const scale = Math.min(1200 / base.width, 1200 / base.height, 2);
  const viewport = page.getViewport({ scale });
  previewCanvas.width = Math.max(1, Math.ceil(viewport.width));
  previewCanvas.height = Math.max(1, Math.ceil(viewport.height));
  await page.render({
    canvas: previewCanvas,
    canvasContext: previewCanvas.getContext("2d", { alpha: false }),
    viewport,
  }).promise;
  document.getElementById("previewPageCount").textContent = `${pdf.numPages} page(s)`;
  updatePreviewLayout();
  await task.destroy();
}

function setDisabled(disabled) {
  for (const control of Object.values(controls)) control.disabled = disabled;
  printButton.disabled = disabled;
}

api.onProgress((state) => {
  status.textContent = state.message || "";
  progress.value = state.total ? Math.round((state.index / state.total) * 100) : 0;
  if (state.phase === "complete" || state.phase === "canceled" || state.phase === "error") {
    running = false;
    setDisabled(false);
    printButton.textContent = state.phase === "complete" ? "Print again" : "Print batch";
    closeButton.textContent = "Close";
    if (state.phase === "complete") progress.value = 100;
  }
});

for (const control of Object.values(controls)) {
  const onChange = () => {
    updatePreviewLayout();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      api.saveSettings(selectedSettings()).catch(() => {});
    }, 250);
  };
  control.addEventListener("input", onChange);
  control.addEventListener("change", onChange);
}

printButton.addEventListener("click", async () => {
  try {
    running = true;
    setDisabled(true);
    closeButton.disabled = false;
    closeButton.textContent = "Stop after current PDF";
    status.textContent = "Starting batch print...";
    progress.value = 0;
    await api.start(selectedSettings());
  } catch (error) {
    running = false;
    setDisabled(false);
    closeButton.textContent = "Close";
    status.textContent = error?.message || "Could not start batch printing.";
  }
});

closeButton.addEventListener("click", async () => {
  if (running) {
    await api.cancel();
    status.textContent = "Stopping after the current PDF...";
    closeButton.disabled = true;
    return;
  }
  clearTimeout(saveTimer);
  await api.saveSettings(selectedSettings()).catch(() => {});
  window.close();
});

try {
  const job = await api.getJob();
  document.getElementById("batchSummary").textContent = `${job.files.length} selected PDF document(s)`;
  document.getElementById("previewLabel").textContent = job.files[0].name;
  controls.printer.replaceChildren();
  for (const printer of job.printers) {
    const option = document.createElement("option");
    option.value = printer.name;
    option.textContent = `${printer.displayName}${printer.isDefault ? " (default)" : ""}`;
    controls.printer.append(option);
  }
  setControlValues(job.settings);
  const savedPrinter = job.printers.find((printer) => printer.name === job.settings.deviceName);
  const defaultPrinter = job.printers.find((printer) => printer.isDefault) || job.printers[0];
  controls.printer.value = savedPrinter?.name || defaultPrinter?.name || "";
  if (!job.printers.length) throw new Error("No Windows printers are available.");
  await renderPreview(job.firstBytes);
  status.textContent = "Review the first PDF and settings, then print the batch.";
  printButton.disabled = false;
} catch (error) {
  status.textContent = error?.message || "Could not prepare the batch-print preview.";
  printButton.disabled = true;
}
