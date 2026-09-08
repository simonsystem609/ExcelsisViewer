const POINTS_PER_INCH = 72;
const MILLIMETERS_PER_INCH = 25.4;

export const PAPER_MILLIMETERS = Object.freeze({
  A0: Object.freeze([841, 1189]),
  A1: Object.freeze([594, 841]),
  A2: Object.freeze([420, 594]),
  A3: Object.freeze([297, 420]),
  A4: Object.freeze([210, 297]),
  A5: Object.freeze([148, 210]),
  A6: Object.freeze([105, 148]),
  Letter: Object.freeze([215.9, 279.4]),
  Legal: Object.freeze([215.9, 355.6]),
  Tabloid: Object.freeze([279.4, 431.8]),
});

export const MARGIN_MILLIMETERS = Object.freeze({
  none: 0,
  minimum: 5,
  normal: 12.7,
});

export const PRINT_QUALITY_DPI = Object.freeze([150, 300, 600]);
export const DEFAULT_PRINT_QUALITY_DPI = 600;
export const MAX_PRINT_PAGE_PIXELS = 160_000_000;
export const MAX_PRINT_JOB_PIXELS = 180_000_000;
export const MIN_PRINT_DPI = 150;

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function finiteDimension(value, label) {
  const dimension = Number(value);
  if (!Number.isFinite(dimension) || dimension <= 0) {
    throw new Error(`The PDF ${label} is invalid.`);
  }
  return dimension;
}

export function selectedPages(text, pageCount) {
  const count = Math.max(0, Math.floor(Number(pageCount) || 0));
  if (!count) return [];
  if (!text || String(text).trim().toLowerCase() === "all") {
    return Array.from({ length: count }, (_value, index) => index + 1);
  }

  const pages = new Set();
  for (const rawPart of String(text).split(",")) {
    const [rawStart, rawEnd] = rawPart.trim().split("-").map((value) => value.trim());
    const parsedStart = Math.floor(Number(rawStart));
    const parsedEnd = rawEnd ? Math.floor(Number(rawEnd)) : parsedStart;
    if (!Number.isFinite(parsedStart) || !Number.isFinite(parsedEnd)) continue;
    const lower = Math.max(1, Math.min(parsedStart, parsedEnd));
    const upper = Math.min(count, Math.max(parsedStart, parsedEnd));
    if (lower > upper) continue;
    for (let page = lower; page <= upper; page += 1) pages.add(page);
  }
  return [...pages].sort((first, second) => first - second);
}

export function landscapeForPage(settings, pageSize) {
  if (settings?.orientation === "landscape") return true;
  if (settings?.orientation === "portrait") return false;
  return finiteDimension(pageSize?.width, "page width")
    > finiteDimension(pageSize?.height, "page height");
}

export function layoutForPage(pageSize, settings, forcedLandscape = null) {
  const pageWidthPoints = finiteDimension(pageSize?.width, "page width");
  const pageHeightPoints = finiteDimension(pageSize?.height, "page height");
  const landscape = forcedLandscape == null
    ? landscapeForPage(settings, pageSize)
    : !!forcedLandscape;
  let [paperWidthMm, paperHeightMm] = PAPER_MILLIMETERS[settings?.paperSize]
    || PAPER_MILLIMETERS.A4;
  if (landscape) [paperWidthMm, paperHeightMm] = [paperHeightMm, paperWidthMm];

  const fitToBorder = settings?.scaleMode === "fit-border";
  const marginMm = fitToBorder
    ? 0
    : MARGIN_MILLIMETERS[settings?.margins] ?? MARGIN_MILLIMETERS.minimum;
  const usableWidthMm = Math.max(1, paperWidthMm - marginMm * 2);
  const usableHeightMm = Math.max(1, paperHeightMm - marginMm * 2);
  const naturalWidthMm = pageWidthPoints * MILLIMETERS_PER_INCH / POINTS_PER_INCH;
  const naturalHeightMm = pageHeightPoints * MILLIMETERS_PER_INCH / POINTS_PER_INCH;

  let printScale = 1;
  if (settings?.scaleMode === "fit" || fitToBorder) {
    printScale = Math.min(
      usableWidthMm / naturalWidthMm,
      usableHeightMm / naturalHeightMm,
    );
  } else if (settings?.scaleMode === "custom") {
    printScale = clamp((Number(settings?.customScale) || 100) / 100, 0.1, 2);
  }

  return {
    landscape,
    paperWidthMm,
    paperHeightMm,
    marginMm,
    usableWidthMm,
    usableHeightMm,
    naturalWidthMm,
    naturalHeightMm,
    printScale,
    contentWidthMm: naturalWidthMm * printScale,
    contentHeightMm: naturalHeightMm * printScale,
    fitToBorder,
  };
}

function pixelsAtDpi(layout, dpi) {
  return (
    layout.contentWidthMm / MILLIMETERS_PER_INCH
    * layout.contentHeightMm / MILLIMETERS_PER_INCH
    * dpi
    * dpi
  );
}

export function computePrintRenderPlan(pageSizes, settings, limits = {}) {
  if (!Array.isArray(pageSizes) || !pageSizes.length) {
    throw new Error("The page range does not select any pages.");
  }
  const layouts = pageSizes.map((pageSize) => layoutForPage(pageSize, settings));
  const pageLandscapes = layouts.map((layout) => layout.landscape);
  const requestedDpi = PRINT_QUALITY_DPI.includes(Number(settings?.qualityDpi))
    ? Number(settings.qualityDpi)
    : DEFAULT_PRINT_QUALITY_DPI;
  const maximumPagePixels = Number(limits.maximumPagePixels) || MAX_PRINT_PAGE_PIXELS;
  const maximumJobPixels = Number(limits.maximumJobPixels) || MAX_PRINT_JOB_PIXELS;
  const minimumDpi = Number(limits.minimumDpi) || MIN_PRINT_DPI;
  const oneDpiAreas = layouts.map((layout) => pixelsAtDpi(layout, 1));
  const largestOneDpiArea = Math.max(...oneDpiAreas);
  const totalOneDpiArea = oneDpiAreas.reduce((sum, area) => sum + area, 0);
  const effectiveDpi = Math.floor(Math.min(
    requestedDpi,
    Math.sqrt(maximumPagePixels / Math.max(largestOneDpiArea, Number.EPSILON)),
    Math.sqrt(maximumJobPixels / Math.max(totalOneDpiArea, Number.EPSILON)),
  ));

  if (!Number.isFinite(effectiveDpi) || effectiveDpi < minimumDpi) {
    throw new Error(
      `This ${pageSizes.length}-page print would exceed the safe render-memory limit even at ${minimumDpi} DPI. `
      + "Print a smaller page range or choose a smaller paper/scale.",
    );
  }

  return {
    // The printer job stays in one canonical portrait coordinate system.
    // Individual landscape pages are rotated inside that physical sheet so a
    // mixed-orientation PDF keeps one collated/duplex-capable spool job.
    landscape: false,
    pageLandscapes,
    mixedOrientation: new Set(pageLandscapes).size > 1,
    layouts,
    requestedDpi,
    effectiveDpi,
    reducedQuality: effectiveDpi < requestedDpi,
    estimatedTotalPixels: Math.ceil(totalOneDpiArea * effectiveDpi * effectiveDpi),
    estimatedLargestPagePixels: Math.ceil(largestOneDpiArea * effectiveDpi * effectiveDpi),
  };
}
