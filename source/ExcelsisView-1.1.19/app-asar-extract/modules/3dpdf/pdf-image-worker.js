let imageToolsPromise = null;
let openCvPromise = null;

function imageTools() {
  imageToolsPromise ||= import("./pdf-image-tools.mjs");
  return imageToolsPromise;
}

function unpackImage(value) {
  return {
    data: value?.data instanceof Uint8ClampedArray
      ? value.data
      : new Uint8ClampedArray(value?.data || 0),
    width: Number(value?.width) || 0,
    height: Number(value?.height) || 0,
  };
}

async function openCv() {
  if (openCvPromise) return openCvPromise;
  openCvPromise = (async () => {
    const source = new URL("./vendor/opencv/opencv.js", self.location.href).href;
    importScripts(source);
    const runtime = await Promise.resolve(self.cv);
    if (!runtime?.inpaint) throw new Error("Inpainting runtime is unavailable.");
    return runtime;
  })().catch((error) => {
    openCvPromise = null;
    throw error;
  });
  return openCvPromise;
}

async function inpaintImage(imageData, mask, fallback) {
  try {
    const cv = await openCv();
    const source = cv.matFromImageData(imageData);
    const sourceRgb = new cv.Mat();
    const maskMat = new cv.Mat(imageData.height, imageData.width, cv.CV_8UC1);
    const resultRgb = new cv.Mat();
    const resultRgba = new cv.Mat();
    try {
      maskMat.data.set(mask);
      cv.cvtColor(source, sourceRgb, cv.COLOR_RGBA2RGB);
      cv.inpaint(sourceRgb, maskMat, resultRgb, 3, cv.INPAINT_TELEA);
      cv.cvtColor(resultRgb, resultRgba, cv.COLOR_RGB2RGBA);
      return {
        data: new Uint8ClampedArray(resultRgba.data),
        width: imageData.width,
        height: imageData.height,
      };
    } finally {
      source.delete();
      sourceRgb.delete();
      maskMat.delete();
      resultRgb.delete();
      resultRgba.delete();
    }
  } catch (error) {
    console.warn("OpenCV inpainting unavailable in image worker; using local fallback.", error);
    return fallback(imageData, mask);
  }
}

async function separateOcr(payload) {
  const tools = await imageTools();
  const source = unpackImage(payload?.source);
  const mask = tools.buildTextMask(source, payload?.wordBoxes || []);
  let maskedPixels = 0;
  for (const value of mask) maskedPixels += value ? 1 : 0;
  if (!maskedPixels) {
    return { maskedPixels: 0, regions: [] };
  }
  const background = await inpaintImage(source, mask, tools.inpaintFallback);
  const foreground = tools.foregroundFromDifference(source, background, mask);
  let regions = tools.ocrWordRegionsFromBlocks(
    payload?.blocks,
    source.width,
    source.height,
  );
  if (!regions.length) {
    regions = tools.ocrLineRegionsFromBlocks(
      payload?.blocks,
      source.width,
      source.height,
    );
  }
  if (!regions.length) {
    regions = tools.groupOcrWordBoxes(
      payload?.wordBoxes || [],
      source.width,
      source.height,
    );
  }
  if (!regions.length) {
    const text = String(payload?.text || "").trim();
    const textLines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    regions = tools.segmentMaskRegions(mask, source.width, source.height)
      .map((region, index) => ({
        ...region,
        confidence: 0,
        text: textLines[index] || (index === 0 ? text : ""),
        words: [],
      }));
  }
  const textHeights = regions
    .filter((region) => /[\p{L}\p{N}]/u.test(String(region.text || "")))
    .map((region) => Number(region.height))
    .filter(Number.isFinite)
    .sort((first, second) => first - second);
  const typicalTextHeight = textHeights.length
    ? textHeights[Math.floor((textHeights.length - 1) / 2)]
    : 0;
  regions = regions.filter((region) => (
    !/^[\[\]\|]+$/.test(String(region.text || "").trim())
    || !typicalTextHeight
    || region.height < typicalTextHeight * 1.3
  ));
  regions = tools.splitOcrRegionsByColor(source, regions, { sourcePixels: true });
  return {
    background,
    foreground,
    maskedPixels,
    regions,
  };
}

async function prepareOcr(payload) {
  const tools = await imageTools();
  return tools.suppressOcrFrameLines(unpackImage(payload?.source));
}

async function separateNative(payload) {
  const tools = await imageTools();
  const source = unpackImage(payload?.source);
  let background = unpackImage(payload?.renderedBackground);
  let foreground = null;
  let regions = [];
  if (payload?.maskLike) {
    const mask = tools.buildTextMask(source);
    let maskedPixels = 0;
    for (const value of mask) maskedPixels += value ? 1 : 0;
    if (maskedPixels) {
      background = await inpaintImage(source, mask, tools.inpaintFallback);
      foreground = tools.foregroundFromDifference(source, background, mask);
    }
    if (payload?.segment && maskedPixels) {
      regions = tools.segmentMaskRegions(mask, source.width, source.height, { rowGap: 1 });
    }
  }
  foreground ||= tools.foregroundFromDifference(source, background);
  return { background, foreground, regions };
}

function resultTransfers(result) {
  const buffers = new Set();
  for (const image of [result?.background, result?.foreground]) {
    if (image?.data?.buffer instanceof ArrayBuffer) buffers.add(image.data.buffer);
  }
  if (result?.data?.buffer instanceof ArrayBuffer) buffers.add(result.data.buffer);
  return [...buffers];
}

self.addEventListener("message", async (event) => {
  const taskId = Number(event.data?.taskId);
  try {
    let result;
    if (event.data?.type === "separate-ocr") {
      result = await separateOcr(event.data?.payload);
    } else if (event.data?.type === "separate-native") {
      result = await separateNative(event.data?.payload);
    } else if (event.data?.type === "prepare-ocr") {
      result = await prepareOcr(event.data?.payload);
    } else {
      throw new Error(`Unknown PDF image background task: ${event.data?.type}`);
    }
    self.postMessage({ taskId, result }, resultTransfers(result));
  } catch (error) {
    self.postMessage({
      taskId,
      error: {
        message: error?.message || String(error),
        name: error?.name || "Error",
        stack: error?.stack || "",
      },
    });
  }
});
