import * as pdfjs from "./vendor/pdfjs/pdf.min.mjs";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "./vendor/pdfjs/pdf.worker.min.mjs",
  import.meta.url,
).href;

function resourceUrl(relativePath) {
  return new URL(`./vendor/pdfjs/${relativePath}`, import.meta.url).href;
}

async function renderThumbnail() {
  const request = await window.thumbnailApp.request();
  const pixels = Math.max(32, Math.min(2048, Number(request.pixels) || 256));
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(request.bytes),
    cMapUrl: resourceUrl("cmaps/"),
    cMapPacked: true,
    standardFontDataUrl: resourceUrl("standard_fonts/"),
    wasmUrl: resourceUrl("wasm/"),
    iccUrl: resourceUrl("iccs/"),
    enableScripting: false,
    isEvalSupported: false,
    useWorkerFetch: true,
  });
  const documentHandle = await loadingTask.promise;
  const page = await documentHandle.getPage(1);
  const natural = page.getViewport({ scale: 1 });
  const scale = Math.min(
    (pixels * 0.92) / Math.max(1, natural.width),
    (pixels * 0.92) / Math.max(1, natural.height),
  );
  const viewport = page.getViewport({ scale });
  const canvas = document.getElementById("thumbnail");
  canvas.width = pixels;
  canvas.height = pixels;
  const context = canvas.getContext("2d", { alpha: false });
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, pixels, pixels);
  context.save();
  context.translate(
    Math.floor((pixels - viewport.width) / 2),
    Math.floor((pixels - viewport.height) / 2),
  );
  await page.render({
    canvasContext: context,
    viewport,
    background: "#ffffff",
  }).promise;
  context.restore();
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((value) => (
      value ? resolve(value) : reject(new Error("Canvas PNG encoding failed."))
    ), "image/png");
  });
  await window.thumbnailApp.complete(await blob.arrayBuffer());
  await documentHandle.destroy();
}

renderThumbnail().catch((error) => {
  window.thumbnailApp.fail(error?.message || String(error));
});
