import * as pdfjs from "./vendor/pdfjs/pdf.min.mjs";
import {
  layoutForPage,
  selectedPages,
} from "./print-layout.mjs";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "./vendor/pdfjs/pdf.worker.min.mjs",
  import.meta.url,
).href;

const api = window.batchPrintApp;
const controls = {
  printer: document.getElementById("printer"),
  paperSize: document.getElementById("paperSize"),
  orientation: document.getElementById("orientation"),
  margins: document.getElementById("margins"),
  scaleMode: document.getElementById("scaleMode"),
  customScale: document.getElementById("customScale"),
  copies: document.getElementById("copies"),
  qualityDpi: document.getElementById("qualityDpi"),
  color: document.getElementById("color"),
  duplexMode: document.getElementById("duplexMode"),
  pageRanges: document.getElementById("pageRanges"),
};
const previewStage = document.querySelector(".preview-stage");
const previewSheet = document.getElementById("previewSheet");
const previewContent = document.getElementById("previewContent");
let previewCanvas = document.getElementById("previewCanvas");
const previewPageCount = document.getElementById("previewPageCount");
const previewDecision = document.getElementById("previewDecision");
const borderlessWarning = document.getElementById("borderlessWarning");
const customScaleLabel = document.getElementById("customScaleLabel");
const printButton = document.getElementById("printBtn");
const closeButton = document.getElementById("closeBtn");
const status = document.getElementById("status");
const progress = document.getElementById("progress");
let previewLoadingTask = null;
let previewPdf = null;
let previewRenderTask = null;
let previewRenderGeneration = 0;
let previewPageSize = null;
let previewPageNumber = 0;
let mode = "batch";
let running = false;
let saveTimer = 0;
let previewTimer = 0;

function bytesFrom(value) {
  return value instanceof Uint8Array ? new Uint8Array(value) : Uint8Array.from(value?.data || value || []);
}

function pdfResource(relativePath) {
  return new URL(`./vendor/pdfjs/${relativePath}`, import.meta.url).href;
}

function idlePrintLabel(repeat = false) {
  if (repeat) return mode === "single" ? "Print again" : "Print batch again";
  return mode === "single" ? "Print" : "Print batch";
}

function configureMode(job) {
  mode = job.mode === "single" ? "single" : "batch";
  if (mode !== "single") return;
  document.title = "ExcelsisView Print";
  document.getElementById("printTitle").textContent = "Print PDF";
  document.getElementById("batchSummary").textContent = job.files[0].name;
  document.getElementById("previewHeading").textContent = "Print preview";
  document.getElementById("previewNote").textContent =
    "The first selected page is previewed. Auto orientation is evaluated independently for every printed page; the other settings apply to all selected pages.";
  document.getElementById("copiesLabel").textContent = "Copies";
  document.getElementById("pagesLabel").textContent = "Pages";
  printButton.textContent = idlePrintLabel();
}

function setControlValues(settings) {
  controls.paperSize.value = settings.paperSize;
  controls.orientation.value = settings.orientation;
  controls.margins.value = settings.margins;
  controls.scaleMode.value = settings.scaleMode;
  controls.customScale.value = String(settings.customScale);
  controls.copies.value = String(settings.copies);
  controls.qualityDpi.value = String(settings.qualityDpi || 600);
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
    qualityDpi: Number(controls.qualityDpi.value),
    color: controls.color.value === "color",
    duplexMode: controls.duplexMode.value,
    pageRanges: controls.pageRanges.value,
  };
}

function updateDependentControls() {
  const custom = controls.scaleMode.value === "custom";
  const borderless = controls.scaleMode.value === "fit-border";
  customScaleLabel.hidden = !custom;
  controls.customScale.disabled = running || !custom;
  controls.margins.disabled = running || borderless;
  borderlessWarning.hidden = !borderless;
}

function updatePreviewLayout() {
  updateDependentControls();
  if (!previewPageSize) return;
  const settings = selectedSettings();
  const layout = layoutForPage(previewPageSize, settings);
  const availableWidth = Math.max(1, previewStage.clientWidth - 40);
  const availableHeight = Math.max(1, previewStage.clientHeight - 40);
  const displayScale = Math.min(
    availableWidth / layout.paperWidthMm,
    availableHeight / layout.paperHeightMm,
  );
  previewSheet.style.width = `${Math.max(1, layout.paperWidthMm * displayScale)}px`;
  previewSheet.style.height = `${Math.max(1, layout.paperHeightMm * displayScale)}px`;
  previewContent.style.left = `${layout.marginMm / layout.paperWidthMm * 100}%`;
  previewContent.style.top = `${layout.marginMm / layout.paperHeightMm * 100}%`;
  previewContent.style.width = `${layout.usableWidthMm / layout.paperWidthMm * 100}%`;
  previewContent.style.height = `${layout.usableHeightMm / layout.paperHeightMm * 100}%`;
  previewCanvas.style.width = `${layout.contentWidthMm / layout.usableWidthMm * 100}%`;
  previewCanvas.style.height = `${layout.contentHeightMm / layout.usableHeightMm * 100}%`;
  previewCanvas.style.maxWidth = "none";
  previewCanvas.style.maxHeight = "none";
  const orientation = layout.landscape ? "Landscape" : "Portrait";
  const edgeNote = layout.fitToBorder ? " - paper border" : "";
  previewDecision.textContent = settings.orientation === "auto"
    ? `Auto -> ${orientation}${edgeNote}`
    : `${orientation}${edgeNote}`;
}

async function renderPreviewPage(pageNumber) {
  if (!previewPdf) return;
  const generation = ++previewRenderGeneration;
  previewRenderTask?.cancel();
  const page = await previewPdf.getPage(pageNumber);
  if (generation !== previewRenderGeneration) return;
  const base = page.getViewport({ scale: 1 });
  previewPageSize = { width: base.width, height: base.height };
  previewPageNumber = pageNumber;
  const renderScale = Math.min(1600 / base.width, 1600 / base.height, 2.5);
  const viewport = page.getViewport({ scale: renderScale });
  const nextCanvas = document.createElement("canvas");
  nextCanvas.id = "previewCanvas";
  nextCanvas.width = Math.max(1, Math.ceil(viewport.width));
  nextCanvas.height = Math.max(1, Math.ceil(viewport.height));
  const task = page.render({
    canvas: nextCanvas,
    canvasContext: nextCanvas.getContext("2d", { alpha: false }),
    viewport,
  });
  previewRenderTask = task;
  try {
    await task.promise;
  } catch (error) {
    if (error?.name === "RenderingCancelledException") return;
    throw error;
  } finally {
    if (previewRenderTask === task) previewRenderTask = null;
  }
  if (generation !== previewRenderGeneration) return;
  previewCanvas.replaceWith(nextCanvas);
  previewCanvas = nextCanvas;
  previewPageCount.textContent = `Page ${pageNumber} of ${previewPdf.numPages}`;
  updatePreviewLayout();
}

async function renderSelectedPreview() {
  if (!previewPdf) return;
  const pages = selectedPages(controls.pageRanges.value, previewPdf.numPages);
  if (!pages.length) {
    previewDecision.textContent = "No page selected";
    return;
  }
  if (pages[0] === previewPageNumber && previewPageSize) {
    updatePreviewLayout();
    return;
  }
  await renderPreviewPage(pages[0]);
}

async function loadPreview(bytes) {
  previewLoadingTask = pdfjs.getDocument({
    data: bytesFrom(bytes),
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
  previewPdf = await previewLoadingTask.promise;
  await renderSelectedPreview();
}

function setDisabled(disabled) {
  for (const control of Object.values(controls)) control.disabled = disabled;
  printButton.disabled = disabled;
  updateDependentControls();
}

api.onProgress((state) => {
  status.textContent = state.message || "";
  progress.value = state.total ? Math.round((state.index / state.total) * 100) : 0;
  if (state.phase === "complete" || state.phase === "canceled" || state.phase === "error") {
    running = false;
    setDisabled(false);
    printButton.textContent = state.phase === "complete" ? idlePrintLabel(true) : idlePrintLabel();
    closeButton.textContent = "Close";
    if (state.phase === "complete") progress.value = 100;
  }
});

for (const control of Object.values(controls)) {
  const onChange = () => {
    updatePreviewLayout();
    if (control === controls.pageRanges) {
      clearTimeout(previewTimer);
      previewTimer = setTimeout(() => {
        renderSelectedPreview().catch((error) => {
          status.textContent = error?.message || "Could not update the preview page.";
        });
      }, 220);
    }
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
    closeButton.textContent = mode === "single" ? "Stop after this PDF" : "Stop after current PDF";
    status.textContent = mode === "single" ? "Starting print..." : "Starting batch print...";
    progress.value = 0;
    await api.start(selectedSettings());
  } catch (error) {
    running = false;
    setDisabled(false);
    closeButton.textContent = "Close";
    status.textContent = error?.message || "Could not start printing.";
  }
});

closeButton.addEventListener("click", async () => {
  if (running) {
    await api.cancel();
    status.textContent = mode === "single"
      ? "Waiting for the current PDF to finish..."
      : "Stopping after the current PDF...";
    closeButton.disabled = true;
    return;
  }
  clearTimeout(saveTimer);
  clearTimeout(previewTimer);
  await api.saveSettings(selectedSettings()).catch(() => {});
  window.close();
});

new ResizeObserver(updatePreviewLayout).observe(previewStage);
window.addEventListener("unload", () => {
  previewRenderGeneration += 1;
  previewRenderTask?.cancel();
  previewLoadingTask?.destroy().catch(() => {});
});

try {
  const job = await api.getJob();
  configureMode(job);
  if (mode === "batch") {
    document.getElementById("batchSummary").textContent = `${job.files.length} selected PDF document(s)`;
  }
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
  await loadPreview(job.firstBytes);
  status.textContent = mode === "single"
    ? "Review the preview and settings, then print."
    : "Review the first PDF and settings, then print the batch.";
  printButton.disabled = false;
  updateDependentControls();
} catch (error) {
  status.textContent = error?.message || "Could not prepare the print preview.";
  printButton.disabled = true;
}
