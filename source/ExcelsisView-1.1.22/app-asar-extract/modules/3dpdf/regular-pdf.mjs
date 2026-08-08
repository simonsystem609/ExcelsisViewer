import * as pdfjs from "./vendor/pdfjs/pdf.min.mjs";
import { createPdfEditor } from "./pdf-editor.mjs";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "./vendor/pdfjs/pdf.worker.min.mjs",
  import.meta.url,
).href;

const CSS_UNITS = 96 / 72;
const MAX_CANVAS_PIXELS = 32_000_000;
const MIN_DISPLAY_PIXEL_RATIO = 2;
const MAX_CONCURRENT_RENDERS = 2;

function resourceUrl(relativePath) {
  return new URL(`./vendor/pdfjs/${relativePath}`, import.meta.url).href;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function bytesFrom(value) {
  const source = value instanceof Uint8Array ? value : new Uint8Array(value);
  return new Uint8Array(source);
}

function downloadBytes(bytes, fileName) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName || "document.pdf";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function createRegularPdfViewer({ onModeChange, onStatus, onPathChange } = {}) {
  const workspace = document.getElementById("pdfWorkspace");
  const pagesElement = document.getElementById("pdfPages");
  const scroller = document.getElementById("pdfScroller");
  const thumbnailsElement = document.getElementById("pdfThumbnails");
  const pageNumberInput = document.getElementById("pdfPageNumber");
  const pageCountElement = document.getElementById("pdfPageCount");
  const zoomSelect = document.getElementById("pdfZoom");
  const zoomCustomOption = document.getElementById("pdfZoomCustom");
  const searchInput = document.getElementById("pdfSearch");
  const searchState = document.getElementById("pdfSearchState");
  const desktopApi = window.pdfApp?.isDesktop ? window.pdfApp : null;
  const saveSplit = document.getElementById("pdfSaveSplit");
  const saveButton = document.getElementById("pdfSave");
  const saveMenuButton = document.getElementById("pdfSaveMenuButton");
  const saveMenu = document.getElementById("pdfSaveMenu");
  const saveAsButton = document.getElementById("pdfSaveAs");

  let documentHandle = null;
  let loadingTask = null;
  let sourceBytes = null;
  let sourceLabel = "document.pdf";
  let sourcePath = null;
  let readOnly = false;
  let saveBusy = false;
  let generation = 0;
  let rotation = 0;
  let zoomMode = "fit-width";
  let currentPage = 1;
  let pageEntries = [];
  let renderTasks = new Map();
  let pageObserver = null;
  let thumbnailObserver = null;
  let scrollFrame = 0;
  let resizeTimer = 0;
  let searchGeneration = 0;
  let searchMatches = [];
  let searchIndex = -1;
  let pendingWheelZoom = null;
  let wheelZoomFrame = 0;
  let wheelZoomTimer = 0;
  let activeRenderJobs = 0;
  const renderJobQueue = [];

  function releaseRenderJob() {
    const next = renderJobQueue.shift();
    if (next) next.resolve();
    else activeRenderJobs = Math.max(0, activeRenderJobs - 1);
  }

  function acquireRenderJob(priority = 0) {
    if (activeRenderJobs < MAX_CONCURRENT_RENDERS) {
      activeRenderJobs += 1;
      return Promise.resolve(releaseRenderJob);
    }
    return new Promise((resolve) => {
      renderJobQueue.push({
        priority,
        resolve: () => resolve(releaseRenderJob),
      });
      renderJobQueue.sort((first, second) => second.priority - first.priority);
    });
  }

  const editor = createPdfEditor({
    pdfjs,
    getCurrentPage: () => currentPage,
    getEntries: () => pageEntries,
    getSourceBytes: () => sourceBytes,
    getSourceLabel: () => sourceLabel,
    onStatus: setStatus,
  });

  function setStatus(text) {
    onStatus?.(text);
  }

  function documentStatus() {
    return documentHandle
      ? `${sourceLabel} - ${documentHandle.numPages} page(s)`
      : sourceLabel;
  }

  function setSaveMenuOpen(open) {
    const nextOpen = !!open && !saveBusy && !!documentHandle;
    saveMenu.hidden = !nextOpen;
    saveMenuButton.setAttribute("aria-expanded", String(nextOpen));
  }

  function updateSaveControls() {
    const loaded = !!documentHandle && !!sourceBytes;
    saveButton.disabled = saveBusy
      || readOnly
      || !loaded
      || !sourcePath
      || !desktopApi?.writeFile;
    saveMenuButton.disabled = saveBusy || !loaded;
    saveAsButton.disabled = saveBusy || !loaded;
    saveSplit.classList.toggle("saving", saveBusy);
  }

  function setReadOnly(nextReadOnly) {
    readOnly = !!nextReadOnly;
    editor.setReadOnly(readOnly);
    updateSaveControls();
  }

  function setCurrentPage(pageNumber) {
    if (!documentHandle) return;
    currentPage = clamp(Number(pageNumber) || 1, 1, documentHandle.numPages);
    pageNumberInput.value = String(currentPage);
    for (const entry of pageEntries) {
      entry.thumbnailButton.classList.toggle("current", entry.pageNumber === currentPage);
    }
  }

  function cancelRenders() {
    for (const task of renderTasks.values()) task.cancel();
    renderTasks = new Map();
    for (const entry of pageEntries) {
      entry.renderRequestId += 1;
      entry.renderRequestedKey = "";
      entry.thumbnailRenderRequestId += 1;
      entry.thumbnailRenderRequestedKey = "";
    }
  }

  async function clearDocument() {
    generation += 1;
    searchGeneration += 1;
    clearTimeout(wheelZoomTimer);
    wheelZoomTimer = 0;
    pendingWheelZoom = null;
    cancelRenders();
    editor.clear();
    pageObserver?.disconnect();
    thumbnailObserver?.disconnect();
    pageObserver = null;
    thumbnailObserver = null;
    pageEntries = [];
    pagesElement.replaceChildren();
    thumbnailsElement.replaceChildren();
    searchMatches = [];
    searchIndex = -1;
    searchState.textContent = "0/0";
    sourceBytes = null;
    sourcePath = null;
    setSaveMenuOpen(false);
    const oldLoadingTask = loadingTask;
    documentHandle = null;
    loadingTask = null;
    if (oldLoadingTask) await oldLoadingTask.destroy().catch(() => {});
    updateSaveControls();
  }

  function viewportFor(entry) {
    return entry.page.getViewport({ scale: 1, rotation: effectiveRotation(entry) });
  }

  function effectiveRotation(entry) {
    return ((Number(entry.page.rotate) || 0) + rotation + 360) % 360;
  }

  function displayScaleFor(entry) {
    const viewport = viewportFor(entry);
    if (zoomMode === "fit-page") {
      const widthScale = Math.max(0.05, (scroller.clientWidth - 56) / viewport.width);
      const heightScale = Math.max(0.05, (scroller.clientHeight - 48) / viewport.height);
      return Math.min(widthScale, heightScale);
    }
    if (zoomMode === "fit-width") {
      return Math.max(0.05, (scroller.clientWidth - 56) / viewport.width);
    }
    return clamp(Number(zoomMode) || 1, 0.2, 6) * CSS_UNITS;
  }

  function updateEntrySize(entry) {
    const viewport = entry.page.getViewport({
      scale: displayScaleFor(entry),
      rotation: effectiveRotation(entry),
    });
    entry.displayViewport = viewport;
    entry.pageElement.style.width = `${Math.ceil(viewport.width)}px`;
    entry.pageElement.style.height = `${Math.ceil(viewport.height)}px`;
    entry.pageSurface.style.width = `${Math.ceil(viewport.width)}px`;
    entry.pageSurface.style.height = `${Math.ceil(viewport.height)}px`;
    entry.canvas.style.width = `${Math.ceil(viewport.width)}px`;
    entry.canvas.style.height = `${Math.ceil(viewport.height)}px`;
    editor.refreshEntry(entry);
  }

  async function renderPage(entry, force = false) {
    if (!documentHandle) return;
    const requestedKey = `${effectiveRotation(entry)}:${zoomMode}:${scroller.clientWidth}:${scroller.clientHeight}`;
    if (entry.renderPromise && entry.renderRequestedKey === requestedKey) return entry.renderPromise;
    if (!force && entry.renderedKey === requestedKey) return;
    const localGeneration = generation;
    const requestId = ++entry.renderRequestId;
    entry.renderRequestedKey = requestedKey;
    const previousPromise = entry.renderPromise;
    entry.renderTask?.cancel();
    const promise = (async () => {
      if (previousPromise) await previousPromise.catch(() => {});
      if (
        !documentHandle
        || localGeneration !== generation
        || requestId !== entry.renderRequestId
      ) return;
      const releaseSlot = await acquireRenderJob(10);
      try {
        if (
          !documentHandle
          || localGeneration !== generation
          || requestId !== entry.renderRequestId
        ) return;
        const viewport = entry.displayViewport;
        const pixelRatioLimit = Math.sqrt(MAX_CANVAS_PIXELS / Math.max(1, viewport.width * viewport.height));
        const pixelRatio = Math.min(
          Math.max(devicePixelRatio || 1, MIN_DISPLAY_PIXEL_RATIO),
          3,
          pixelRatioLimit,
        );
        const renderViewport = entry.page.getViewport({
          scale: displayScaleFor(entry) * pixelRatio,
          rotation: effectiveRotation(entry),
        });
        // Render into a detached canvas. The previous bitmap stays visible and
        // compositor-scaled until the new one is complete, so zoom never flashes
        // a blank/repainted sheet.
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.ceil(renderViewport.width));
        canvas.height = Math.max(1, Math.ceil(renderViewport.height));
        canvas.style.width = `${Math.ceil(viewport.width)}px`;
        canvas.style.height = `${Math.ceil(viewport.height)}px`;
        const context = canvas.getContext("2d", { alpha: false });
        const shouldDiscover = !entry.nativeDiscovered && !entry.page.recordedBBoxes;
        const task = entry.page.render({
          canvas,
          canvasContext: context,
          viewport: renderViewport,
          recordImages: shouldDiscover,
          recordOperations: shouldDiscover,
        });
        const taskKey = `page:${entry.pageNumber}`;
        entry.renderTask = task;
        renderTasks.set(taskKey, task);
        try {
          await task.promise;
          if (
            localGeneration !== generation
            || requestId !== entry.renderRequestId
          ) return;
          entry.canvas.replaceWith(canvas);
          entry.canvas = canvas;
          entry.hasBitmap = true;
          entry.renderedKey = requestedKey;
          entry.loading.hidden = true;
          await new Promise((resolve) => requestAnimationFrame(resolve));
          if (
            localGeneration !== generation
            || requestId !== entry.renderRequestId
          ) return;
          await editor.discoverEntry(entry, renderViewport);
          editor.refreshEntry(entry);
        } catch (error) {
          if (error?.name !== "RenderingCancelledException") throw error;
        } finally {
          if (entry.renderTask === task) entry.renderTask = null;
          if (renderTasks.get(taskKey) === task) renderTasks.delete(taskKey);
        }
      } finally {
        releaseSlot();
      }
    })();
    entry.renderPromise = promise;
    try {
      return await promise;
    } finally {
      if (entry.renderPromise === promise) {
        entry.renderPromise = null;
        if (entry.renderRequestedKey === requestedKey) entry.renderRequestedKey = "";
      }
    }
  }

  async function renderThumbnail(entry, force = false) {
    if (!documentHandle) return;
    const requestedKey = String(effectiveRotation(entry));
    if (
      entry.thumbnailRenderPromise
      && entry.thumbnailRenderRequestedKey === requestedKey
    ) return entry.thumbnailRenderPromise;
    if (!force && entry.thumbnailRenderedKey === requestedKey) return;
    const localGeneration = generation;
    const requestId = ++entry.thumbnailRenderRequestId;
    entry.thumbnailRenderRequestedKey = requestedKey;
    const previousPromise = entry.thumbnailRenderPromise;
    entry.thumbnailRenderTask?.cancel();
    const promise = (async () => {
      if (previousPromise) await previousPromise.catch(() => {});
      if (
        !documentHandle
        || localGeneration !== generation
        || requestId !== entry.thumbnailRenderRequestId
      ) return;
      const releaseSlot = await acquireRenderJob(1);
      try {
        if (
          !documentHandle
          || localGeneration !== generation
          || requestId !== entry.thumbnailRenderRequestId
        ) return;
        const pageRotation = effectiveRotation(entry);
        const viewport = entry.page.getViewport({ scale: 1, rotation: pageRotation });
        const scale = Math.min(130 / viewport.width, 160 / viewport.height);
        const thumbnailViewport = entry.page.getViewport({ scale, rotation: pageRotation });
        entry.thumbnailCanvas.width = Math.max(1, Math.floor(thumbnailViewport.width));
        entry.thumbnailCanvas.height = Math.max(1, Math.floor(thumbnailViewport.height));
        entry.thumbnailCanvas.style.width = `${Math.ceil(thumbnailViewport.width)}px`;
        entry.thumbnailCanvas.style.height = `${Math.ceil(thumbnailViewport.height)}px`;
        const task = entry.page.render({
          canvasContext: entry.thumbnailCanvas.getContext("2d", { alpha: false }),
          viewport: thumbnailViewport,
        });
        const taskKey = `thumb:${entry.pageNumber}`;
        entry.thumbnailRenderTask = task;
        renderTasks.set(taskKey, task);
        try {
          await task.promise;
          if (
            localGeneration !== generation
            || requestId !== entry.thumbnailRenderRequestId
          ) return;
          entry.thumbnailRenderedKey = requestedKey;
        } catch (error) {
          if (error?.name !== "RenderingCancelledException") throw error;
        } finally {
          if (entry.thumbnailRenderTask === task) entry.thumbnailRenderTask = null;
          if (renderTasks.get(taskKey) === task) renderTasks.delete(taskKey);
        }
      } finally {
        releaseSlot();
      }
    })();
    entry.thumbnailRenderPromise = promise;
    try {
      return await promise;
    } finally {
      if (entry.thumbnailRenderPromise === promise) {
        entry.thumbnailRenderPromise = null;
        if (entry.thumbnailRenderRequestedKey === requestedKey) {
          entry.thumbnailRenderRequestedKey = "";
        }
      }
    }
  }

  function observePages() {
    pageObserver?.disconnect();
    thumbnailObserver?.disconnect();
    pageObserver = new IntersectionObserver((records) => {
      for (const record of records) {
        if (!record.isIntersecting) continue;
        const entry = pageEntries[Number(record.target.dataset.page) - 1];
        if (entry) renderPage(entry).catch((error) => setStatus(`PDF render error: ${error.message}`));
      }
    }, { root: scroller, rootMargin: "1000px 0px" });
    thumbnailObserver = new IntersectionObserver((records) => {
      for (const record of records) {
        if (!record.isIntersecting) continue;
        const entry = pageEntries[Number(record.target.dataset.page) - 1];
        if (entry) renderThumbnail(entry).catch(() => {});
      }
    }, { root: document.getElementById("pdfSidebar"), rootMargin: "500px 0px" });
    for (const entry of pageEntries) {
      pageObserver.observe(entry.pageElement);
      thumbnailObserver.observe(entry.thumbnailButton);
    }
  }

  async function buildPages(localGeneration) {
    let firstPageRender = null;
    for (let pageNumber = 1; pageNumber <= documentHandle.numPages; pageNumber += 1) {
      const page = await documentHandle.getPage(pageNumber);
      if (localGeneration !== generation) return;
      const pageElement = document.createElement("section");
      pageElement.className = "pdf-page";
      pageElement.dataset.page = String(pageNumber);
      pageElement.setAttribute("aria-label", `Page ${pageNumber}`);
      const pageSurface = document.createElement("div");
      pageSurface.className = "pdf-page-surface";
      const canvas = document.createElement("canvas");
      const loading = document.createElement("div");
      loading.className = "pdf-page-loading";
      loading.textContent = `Page ${pageNumber}`;
      pageSurface.append(canvas, loading);
      pageElement.append(pageSurface);

      const thumbnailButton = document.createElement("button");
      thumbnailButton.className = "pdf-thumb";
      thumbnailButton.type = "button";
      thumbnailButton.dataset.page = String(pageNumber);
      const thumbnailCanvas = document.createElement("canvas");
      const thumbnailLabel = document.createElement("span");
      thumbnailLabel.textContent = String(pageNumber);
      thumbnailButton.append(thumbnailCanvas, thumbnailLabel);
      thumbnailButton.addEventListener("click", () => goToPage(pageNumber));

      const entry = {
        pageNumber,
        page,
        pageElement,
        pageSurface,
        canvas,
        loading,
        thumbnailButton,
        thumbnailCanvas,
        displayViewport: null,
        renderedKey: "",
        renderPromise: null,
        renderRequestId: 0,
        renderRequestedKey: "",
        renderTask: null,
        thumbnailRenderedKey: "",
        thumbnailRenderPromise: null,
        thumbnailRenderRequestId: 0,
        thumbnailRenderRequestedKey: "",
        thumbnailRenderTask: null,
        nativeDiscovered: false,
        hasBitmap: false,
        searchText: null,
        searchTextPromise: null,
      };
      editor.attachEntry(entry);
      pageEntries.push(entry);
      updateEntrySize(entry);
      pagesElement.append(pageElement);
      thumbnailsElement.append(thumbnailButton);
      if (pageNumber === 1) {
        setCurrentPage(1);
        firstPageRender = renderPage(entry, true);
        renderThumbnail(entry).catch(() => {});
      }
      if (pageNumber % 4 === 0) await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    observePages();
    await firstPageRender;
  }

  function goToPage(pageNumber) {
    const entry = pageEntries[clamp(Number(pageNumber) || 1, 1, pageEntries.length) - 1];
    if (!entry) return;
    setCurrentPage(entry.pageNumber);
    entry.pageElement.scrollIntoView({ block: "start" });
    renderPage(entry).catch(() => {});
  }

  function updateCurrentPageFromScroll() {
    scrollFrame = 0;
    if (!pageEntries.length) return;
    const scrollerRect = scroller.getBoundingClientRect();
    const marker = scrollerRect.top + Math.min(scrollerRect.height * 0.38, 260);
    let best = pageEntries[0];
    let bestDistance = Infinity;
    for (const entry of pageEntries) {
      const rect = entry.pageElement.getBoundingClientRect();
      const distance = Math.abs(clamp(marker, rect.top, rect.bottom) - marker);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = entry;
      }
    }
    setCurrentPage(best.pageNumber);
  }

  function captureViewportAnchor(clientX, clientY) {
    if (!pageEntries.length) return null;
    const scrollerRect = scroller.getBoundingClientRect();
    const anchorX = Number.isFinite(clientX) ? clientX : scrollerRect.left + scrollerRect.width / 2;
    const anchorY = Number.isFinite(clientY) ? clientY : scrollerRect.top + scrollerRect.height / 2;
    let entry = pageEntries.find((candidate) => {
      const rect = candidate.pageElement.getBoundingClientRect();
      return anchorX >= rect.left && anchorX <= rect.right && anchorY >= rect.top && anchorY <= rect.bottom;
    });
    if (!entry) {
      entry = pageEntries.reduce((best, candidate) => {
        const rect = candidate.pageElement.getBoundingClientRect();
        const dx = anchorX < rect.left ? rect.left - anchorX : anchorX > rect.right ? anchorX - rect.right : 0;
        const dy = anchorY < rect.top ? rect.top - anchorY : anchorY > rect.bottom ? anchorY - rect.bottom : 0;
        const distance = Math.hypot(dx, dy);
        return !best || distance < best.distance ? { entry: candidate, distance } : best;
      }, null)?.entry;
    }
    if (!entry?.displayViewport) return null;
    const pageRect = entry.pageElement.getBoundingClientRect();
    return {
      entry,
      clientX: anchorX,
      clientY: anchorY,
      pdfPoint: entry.displayViewport.convertToPdfPoint(
        clamp(anchorX - pageRect.left, 0, pageRect.width),
        clamp(anchorY - pageRect.top, 0, pageRect.height),
      ),
    };
  }

  function restoreViewportAnchor(anchor) {
    if (!anchor?.entry?.displayViewport) return;
    const viewportPoint = anchor.entry.displayViewport.convertToViewportPoint(...anchor.pdfPoint);
    const pageRect = anchor.entry.pageElement.getBoundingClientRect();
    scroller.scrollLeft += pageRect.left + viewportPoint[0] - anchor.clientX;
    scroller.scrollTop += pageRect.top + viewportPoint[1] - anchor.clientY;
    setCurrentPage(anchor.entry.pageNumber);
    renderPage(anchor.entry).catch(() => {});
  }

  function relayout({ anchor = captureViewportAnchor() } = {}) {
    if (!documentHandle) return;
    clearTimeout(wheelZoomTimer);
    wheelZoomTimer = 0;
    pendingWheelZoom = null;
    for (const entry of pageEntries) entry.pageSurface.style.transform = "";
    cancelRenders();
    for (const entry of pageEntries) {
      entry.renderedKey = "";
      entry.loading.hidden = entry.hasBitmap;
      updateEntrySize(entry);
    }
    observePages();
    requestAnimationFrame(() => restoreViewportAnchor(anchor));
  }

  function setZoom(nextZoom, { anchor = captureViewportAnchor() } = {}) {
    clearTimeout(wheelZoomTimer);
    wheelZoomTimer = 0;
    pendingWheelZoom = null;
    for (const entry of pageEntries) entry.pageSurface.style.transform = "";
    zoomMode = String(nextZoom);
    zoomSelect.value = zoomMode;
    if (!zoomSelect.value && Number.isFinite(Number(zoomMode))) {
      zoomCustomOption.hidden = false;
      zoomCustomOption.value = zoomMode;
      zoomCustomOption.textContent = `${Math.round(Number(zoomMode) * 100)}%`;
      zoomSelect.value = zoomMode;
    } else {
      zoomCustomOption.hidden = true;
    }
    relayout({ anchor });
  }

  function viewportForLiveZoom(entry, zoom) {
    return entry.page.getViewport({
      scale: zoom * CSS_UNITS,
      rotation: effectiveRotation(entry),
    });
  }

  function captureLiveZoomAnchor(zoom, clientX, clientY) {
    if (!pageEntries.length) return null;
    const scrollerRect = scroller.getBoundingClientRect();
    const anchorX = Number.isFinite(clientX) ? clientX : scrollerRect.left + scrollerRect.width / 2;
    const anchorY = Number.isFinite(clientY) ? clientY : scrollerRect.top + scrollerRect.height / 2;
    let entry = pageEntries.find((candidate) => {
      const rect = candidate.pageElement.getBoundingClientRect();
      return anchorX >= rect.left && anchorX <= rect.right && anchorY >= rect.top && anchorY <= rect.bottom;
    });
    if (!entry) {
      entry = pageEntries.reduce((best, candidate) => {
        const rect = candidate.pageElement.getBoundingClientRect();
        const dx = anchorX < rect.left ? rect.left - anchorX : anchorX > rect.right ? anchorX - rect.right : 0;
        const dy = anchorY < rect.top ? rect.top - anchorY : anchorY > rect.bottom ? anchorY - rect.bottom : 0;
        const distance = Math.hypot(dx, dy);
        return !best || distance < best.distance ? { entry: candidate, distance } : best;
      }, null)?.entry;
    }
    if (!entry) return null;
    const pageRect = entry.pageElement.getBoundingClientRect();
    const viewport = viewportForLiveZoom(entry, zoom);
    return {
      entry,
      clientX: anchorX,
      clientY: anchorY,
      pdfPoint: viewport.convertToPdfPoint(
        clamp(anchorX - pageRect.left, 0, pageRect.width),
        clamp(anchorY - pageRect.top, 0, pageRect.height),
      ),
    };
  }

  function applyLiveWheelZoom(zoom, anchor) {
    for (const entry of pageEntries) {
      const targetViewport = viewportForLiveZoom(entry, zoom);
      const currentViewport = entry.displayViewport;
      if (!currentViewport) continue;
      entry.pageElement.style.width = `${Math.ceil(targetViewport.width)}px`;
      entry.pageElement.style.height = `${Math.ceil(targetViewport.height)}px`;
      entry.pageSurface.style.transform = `scale(${targetViewport.width / currentViewport.width}, ${targetViewport.height / currentViewport.height})`;
    }
    if (anchor?.entry) {
      const viewport = viewportForLiveZoom(anchor.entry, zoom);
      const point = viewport.convertToViewportPoint(...anchor.pdfPoint);
      const pageRect = anchor.entry.pageElement.getBoundingClientRect();
      scroller.scrollLeft += pageRect.left + point[0] - anchor.clientX;
      scroller.scrollTop += pageRect.top + point[1] - anchor.clientY;
      setCurrentPage(anchor.entry.pageNumber);
    }
    zoomCustomOption.hidden = false;
    zoomCustomOption.value = String(zoom);
    zoomCustomOption.textContent = `${Math.round(zoom * 100)}%`;
    zoomSelect.value = String(zoom);
  }

  function commitLiveWheelZoom() {
    wheelZoomTimer = 0;
    const pending = pendingWheelZoom;
    pendingWheelZoom = null;
    if (!pending || !documentHandle) return;
    zoomMode = String(Math.round(pending.zoom * 1000) / 1000);
    zoomCustomOption.hidden = false;
    zoomCustomOption.value = zoomMode;
    zoomCustomOption.textContent = `${Math.round(Number(zoomMode) * 100)}%`;
    zoomSelect.value = zoomMode;
    cancelRenders();
    for (const entry of pageEntries) {
      entry.pageSurface.style.transform = "";
      entry.renderedKey = "";
      entry.loading.hidden = entry.hasBitmap;
      updateEntrySize(entry);
    }
    observePages();
    if (pending.anchor?.entry) {
      renderPage(pending.anchor.entry, true).catch((error) => setStatus(`PDF render error: ${error.message}`));
    }
  }

  function stepZoom(direction) {
    const steps = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 6];
    let current = Number(zoomMode);
    if (!Number.isFinite(current)) {
      const entry = pageEntries[currentPage - 1];
      current = entry ? displayScaleFor(entry) / CSS_UNITS : 1;
    }
    const index = direction > 0
      ? steps.findIndex((value) => value > current + 0.01)
      : [...steps].reverse().findIndex((value) => value < current - 0.01);
    const next = direction > 0
      ? (index < 0 ? steps.at(-1) : steps[index])
      : (index < 0 ? steps[0] : [...steps].reverse()[index]);
    setZoom(next, { anchor: captureViewportAnchor() });
  }

  function updateSearchState() {
    searchState.textContent = searchMatches.length ? `${searchIndex + 1}/${searchMatches.length}` : "0/0";
  }

  async function entrySearchText(entry) {
    if (entry.searchText !== null) return entry.searchText;
    if (!entry.searchTextPromise) {
      entry.searchTextPromise = entry.page.getTextContent().then((content) => {
        entry.searchText = content.items
          .map((item) => item.str || "")
          .join(" ")
          .toLocaleLowerCase();
        return entry.searchText;
      }).finally(() => {
        entry.searchTextPromise = null;
      });
    }
    return entry.searchTextPromise;
  }

  async function findText({ direction = 1, restart = false } = {}) {
    const query = searchInput.value.trim().toLocaleLowerCase();
    if (!query || !documentHandle) {
      searchMatches = [];
      searchIndex = -1;
      updateSearchState();
      return;
    }
    if (restart || searchInput.dataset.query !== query) {
      const localSearchGeneration = ++searchGeneration;
      searchInput.dataset.query = query;
      searchMatches = [];
      searchIndex = -1;
      searchState.textContent = "...";
      for (const [entryIndex, entry] of pageEntries.entries()) {
        const text = await entrySearchText(entry);
        if (localSearchGeneration !== searchGeneration) return;
        let offset = 0;
        while ((offset = text.indexOf(query, offset)) >= 0) {
          searchMatches.push(entry.pageNumber);
          offset += Math.max(query.length, 1);
        }
        if ((entryIndex + 1) % 4 === 0) {
          await new Promise((resolve) => requestAnimationFrame(resolve));
        }
      }
      if (localSearchGeneration !== searchGeneration) return;
      searchIndex = searchMatches.findIndex((pageNumber) => pageNumber >= currentPage);
      if (searchIndex < 0 && searchMatches.length) searchIndex = 0;
    } else if (searchMatches.length) {
      searchIndex = (searchIndex + direction + searchMatches.length) % searchMatches.length;
    }
    updateSearchState();
    if (searchIndex >= 0) goToPage(searchMatches[searchIndex]);
  }

  function transferableBytes(bytes) {
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  }

  async function saveDocument({ saveAs = false } = {}) {
    if (!sourceBytes || saveBusy) return;
    if (!saveAs && (readOnly || !sourcePath || !desktopApi?.writeFile)) return;
    setSaveMenuOpen(false);
    saveBusy = true;
    updateSaveControls();
    const viewState = { page: currentPage, rotation, zoomMode };
    const wasDirty = editor.isDirty();
    try {
      setStatus(saveAs ? `Saving ${sourceLabel} as...` : `Saving ${sourceLabel}...`);
      const outputBytes = await editor.exportBytes();
      if (saveAs && (!desktopApi?.saveAs || !sourcePath)) {
        downloadBytes(outputBytes, sourceLabel);
        setStatus(`${sourceLabel} saved.`);
        return;
      }
      const result = saveAs
        ? await desktopApi.saveAs(sourcePath, transferableBytes(outputBytes), sourceLabel)
        : await desktopApi.writeFile(sourcePath, transferableBytes(outputBytes));
      if (result?.canceled) {
        setStatus(documentStatus());
        return;
      }
      if (!result?.ok) throw new Error(result?.error || "Could not save the PDF.");
      const nextPath = result.path || sourcePath;
      const nextLabel = result.name
        || String(nextPath || sourceLabel).split(/[\\/]/).pop()
        || sourceLabel;
      if (saveAs) onPathChange?.(nextPath, result.lockState);
      if (wasDirty || saveAs) {
        await load(outputBytes, nextLabel, nextPath, { viewState });
      } else {
        sourcePath = nextPath;
        sourceLabel = nextLabel;
        updateSaveControls();
      }
      setStatus(`${nextLabel} saved.`);
    } finally {
      saveBusy = false;
      updateSaveControls();
    }
  }

  async function printDocument() {
    if (!documentHandle) return;
    if (!desktopApi?.openPrintPreview) {
      window.print();
      return;
    }
    setStatus(`Preparing ${sourceLabel} for print preview...`);
    const outputBytes = await editor.exportBytes();
    const result = await desktopApi.openPrintPreview(
      sourcePath,
      transferableBytes(outputBytes),
      sourceLabel,
    );
    if (!result?.ok) throw new Error(result?.error || "Could not open the print preview.");
    setStatus(`${sourceLabel} print preview opened.`);
  }

  async function load(data, label = "document.pdf", filePath = null, { viewState = null } = {}) {
    await clearDocument();
    onModeChange?.("regular");
    workspace.hidden = false;
    sourceBytes = bytesFrom(data);
    sourceLabel = label || "document.pdf";
    sourcePath = filePath ? String(filePath) : null;
    rotation = Number.isFinite(Number(viewState?.rotation))
      ? ((Number(viewState.rotation) % 360) + 360) % 360
      : 0;
    zoomMode = viewState?.zoomMode ? String(viewState.zoomMode) : "fit-width";
    zoomSelect.value = zoomMode;
    if (!zoomSelect.value && Number.isFinite(Number(zoomMode))) {
      zoomCustomOption.hidden = false;
      zoomCustomOption.value = zoomMode;
      zoomCustomOption.textContent = `${Math.round(Number(zoomMode) * 100)}%`;
      zoomSelect.value = zoomMode;
    } else {
      zoomCustomOption.hidden = true;
    }
    currentPage = 1;
    const localGeneration = generation;
    setStatus(`Opening ${sourceLabel}...`);
    loadingTask = pdfjs.getDocument({
      data: bytesFrom(sourceBytes),
      cMapUrl: resourceUrl("cmaps/"),
      cMapPacked: true,
      standardFontDataUrl: resourceUrl("standard_fonts/"),
      wasmUrl: resourceUrl("wasm/"),
      iccUrl: resourceUrl("iccs/"),
      enableXfa: true,
      enableScripting: false,
      fontExtraProperties: true,
      isEvalSupported: false,
      useWorkerFetch: false,
    });
    documentHandle = await loadingTask.promise;
    if (localGeneration !== generation) return null;
    pageCountElement.textContent = `/ ${documentHandle.numPages}`;
    pageNumberInput.max = String(documentHandle.numPages);
    await buildPages(localGeneration);
    if (viewState?.page) goToPage(clamp(Number(viewState.page) || 1, 1, documentHandle.numPages));
    updateSaveControls();
    setStatus(`${sourceLabel} - ${documentHandle.numPages} page(s)`);
    return { pageCount: documentHandle.numPages };
  }

  scroller.addEventListener("scroll", () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateCurrentPageFromScroll);
  }, { passive: true });
  scroller.addEventListener("wheel", (event) => {
    if (!event.ctrlKey || !documentHandle) return;
    event.preventDefault();
    const delta = event.deltaY * (
      event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? Math.max(scroller.clientHeight, 1)
          : 1
    );
    const entry = pageEntries[currentPage - 1];
    const currentZoom = pendingWheelZoom?.zoom
      ?? (Number.isFinite(Number(zoomMode))
        ? Number(zoomMode)
        : entry
          ? displayScaleFor(entry) / CSS_UNITS
          : 1);
    const nextZoom = clamp(currentZoom * Math.exp(-delta * 0.002), 0.2, 6);
    pendingWheelZoom = {
      anchor: captureLiveZoomAnchor(currentZoom, event.clientX, event.clientY),
      zoom: nextZoom,
    };
    if (!wheelZoomFrame) {
      wheelZoomFrame = requestAnimationFrame(() => {
        wheelZoomFrame = 0;
        const pending = pendingWheelZoom;
        if (pending) applyLiveWheelZoom(pending.zoom, pending.anchor);
      });
    }
    clearTimeout(wheelZoomTimer);
    wheelZoomTimer = setTimeout(commitLiveWheelZoom, 140);
  }, { passive: false });
  new ResizeObserver(() => {
    // Live wheel zoom intentionally changes page layout before committing the
    // numeric zoom. Ignore scrollbar/client-size observations during that
    // short compositor-only phase or fit-width would overwrite the gesture.
    if (!documentHandle || pendingWheelZoom || !zoomMode.startsWith("fit-")) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => relayout(), 100);
  }).observe(scroller);
  document.getElementById("pdfPrevPage").addEventListener("click", () => goToPage(currentPage - 1));
  document.getElementById("pdfNextPage").addEventListener("click", () => goToPage(currentPage + 1));
  pageNumberInput.addEventListener("change", () => goToPage(pageNumberInput.value));
  zoomSelect.addEventListener("change", () => setZoom(zoomSelect.value));
  document.getElementById("pdfZoomOut").addEventListener("click", () => stepZoom(-1));
  document.getElementById("pdfZoomIn").addEventListener("click", () => stepZoom(1));
  document.getElementById("pdfRotate").addEventListener("click", () => {
    const anchor = captureViewportAnchor();
    rotation = (rotation + 90) % 360;
    relayout({ anchor });
  });
  searchInput.addEventListener("input", () => {
    searchGeneration += 1;
    searchInput.dataset.query = "";
    searchMatches = [];
    searchIndex = -1;
    updateSearchState();
  });
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") findText({ direction: event.shiftKey ? -1 : 1 }).catch((error) => setStatus(error.message));
  });
  document.getElementById("pdfSearchPrev").addEventListener("click", () => findText({ direction: -1 }).catch((error) => setStatus(error.message)));
  document.getElementById("pdfSearchNext").addEventListener("click", () => findText({ direction: 1 }).catch((error) => setStatus(error.message)));
  saveButton.addEventListener("click", () => saveDocument().catch((error) => setStatus(error.message)));
  saveMenuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    setSaveMenuOpen(saveMenu.hidden);
  });
  saveAsButton.addEventListener("click", () => saveDocument({ saveAs: true }).catch((error) => setStatus(error.message)));
  document.addEventListener("pointerdown", (event) => {
    if (!saveSplit.contains(event.target)) setSaveMenuOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !saveMenu.hidden) {
      event.preventDefault();
      setSaveMenuOpen(false);
      saveMenuButton.focus();
    }
    if (
      event.ctrlKey
      && event.key.toLowerCase() === "s"
      && !workspace.hidden
      && documentHandle
    ) {
      event.preventDefault();
      saveDocument({ saveAs: event.shiftKey }).catch((error) => setStatus(error.message));
    }
  });
  document.getElementById("pdfPrint").addEventListener("click", () => printDocument().catch((error) => setStatus(error.message)));

  updateSaveControls();

  return {
    load,
    clear: clearDocument,
    setReadOnly,
  };
}
