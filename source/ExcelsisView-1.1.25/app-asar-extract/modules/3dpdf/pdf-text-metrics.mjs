function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizedText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function sourceText(value) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .replace(/[\r\n\t\f\v]+/g, " ");
}

function boundsFromPoints(points) {
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  const left = Math.min(...xs);
  const bottom = Math.min(...ys);
  return {
    x: left,
    y: bottom,
    width: Math.max(0, Math.max(...xs) - left),
    height: Math.max(0, Math.max(...ys) - bottom),
  };
}

function fontTraits(style = {}) {
  const description = [
    style.fontFamily,
    style.loadedName,
    style.fontName,
  ].filter(Boolean).join(" ").toLowerCase();
  return {
    fontFamily: /mono|courier|typewriter|fixed/.test(description)
      ? "mono"
      : /sans|arial|helvetica/.test(description)
        ? "sans"
      : /serif|times|roman|georgia|garamond/.test(description)
        ? "serif"
        : "sans",
    fontWeight: /bold|black|heavy|semibold|demi/.test(description) ? "700" : "400",
    fontStyle: /italic|oblique/.test(description) ? "italic" : "normal",
  };
}

export function pdfTextMetricFromItem(item, style = {}, index = 0) {
  const text = sourceText(item?.str);
  const transform = Array.from(item?.transform || []).map(Number);
  if (!text.trim() || transform.length < 6 || transform.some((value) => !Number.isFinite(value))) {
    return null;
  }

  const [a, b, c, d, e, f] = transform;
  const horizontalMagnitude = Math.hypot(a, b);
  const verticalMagnitude = Math.hypot(c, d);
  const fontSize = verticalMagnitude
    || Math.abs(finiteNumber(item.height))
    || horizontalMagnitude;
  const width = Math.abs(finiteNumber(item.width));
  if (!(fontSize > 0) || !(width > 0)) return null;

  const horizontal = horizontalMagnitude > 0.0001
    ? [a / horizontalMagnitude, b / horizontalMagnitude]
    : [1, 0];
  const vertical = verticalMagnitude > 0.0001
    ? [c / verticalMagnitude, d / verticalMagnitude]
    : [-horizontal[1], horizontal[0]];
  const ascent = Math.abs(finiteNumber(style.ascent, 0.8)) || 0.8;
  const descent = Math.abs(finiteNumber(style.descent, 0.2)) || 0.2;
  const baselineStart = [e, f];
  const baselineEnd = [
    e + horizontal[0] * width,
    f + horizontal[1] * width,
  ];
  const lowerOffset = [-vertical[0] * descent * fontSize, -vertical[1] * descent * fontSize];
  const upperOffset = [vertical[0] * ascent * fontSize, vertical[1] * ascent * fontSize];
  const bounds = boundsFromPoints([
    [baselineStart[0] + lowerOffset[0], baselineStart[1] + lowerOffset[1]],
    [baselineEnd[0] + lowerOffset[0], baselineEnd[1] + lowerOffset[1]],
    [baselineStart[0] + upperOffset[0], baselineStart[1] + upperOffset[1]],
    [baselineEnd[0] + upperOffset[0], baselineEnd[1] + upperOffset[1]],
  ]);

  return {
    id: index,
    text,
    bounds,
    baselineStart,
    baselineEnd,
    fontSize,
    horizontalScale: horizontalMagnitude > 0.0001
      ? horizontalMagnitude / fontSize
      : 1,
    width,
    angle: Math.atan2(horizontal[1], horizontal[0]),
    pdfFontName: String(item?.fontName || ""),
    ...fontTraits(style),
  };
}

function centerOf(bounds) {
  return [
    finiteNumber(bounds?.x) + finiteNumber(bounds?.width) / 2,
    finiteNumber(bounds?.y) + finiteNumber(bounds?.height) / 2,
  ];
}

export function matchPdfTextMetric(metrics, text, bounds, usedIds = new Set()) {
  const targetText = normalizedText(text);
  if (!targetText) return null;
  const [targetX, targetY] = centerOf(bounds);
  let best = null;
  for (const metric of metrics || []) {
    if (!metric || usedIds.has(metric.id)) continue;
    const exact = metric.text === targetText;
    const compatible = exact
      || metric.text.includes(targetText)
      || targetText.includes(metric.text);
    if (!compatible) continue;
    const [metricX, metricY] = centerOf(metric.bounds);
    const scale = Math.max(
      1,
      finiteNumber(bounds?.width),
      finiteNumber(bounds?.height),
      metric.bounds.width,
      metric.bounds.height,
    );
    const distance = Math.hypot(metricX - targetX, metricY - targetY) / scale;
    const score = (exact ? 10_000 : 1_000) - distance;
    if (!best || score > best.score) best = { metric, score };
  }
  if (!best) return null;
  usedIds.add(best.metric.id);
  return best.metric;
}

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((first, second) => first - second);
  if (!sorted.length) return 0;
  const middle = sorted.length >> 1;
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function mostCommon(values, fallback) {
  const counts = new Map();
  for (const value of values.filter(Boolean)) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()].sort((first, second) => second[1] - first[1])[0]?.[0] || fallback;
}

export function typographyFromPdfTextMetrics(metrics, objectBounds) {
  const runs = (metrics || []).filter(Boolean);
  if (!runs.length || !objectBounds) return null;

  const fontSize = median(runs.map((metric) => metric.fontSize));
  const angle = median(runs.map((metric) => metric.angle));
  const horizontal = [Math.cos(angle), Math.sin(angle)];
  const vertical = [-horizontal[1], horizontal[0]];
  const baselinePosition = (metric) => (
    metric.baselineStart[0] * vertical[0] + metric.baselineStart[1] * vertical[1]
  );
  const baseline = median(runs.map(baselinePosition));
  if (!(fontSize > 0) || runs.some(
    (metric) => (
      Math.abs(Math.sin(metric.angle - angle)) > 0.04
      || Math.abs(baselinePosition(metric) - baseline) > fontSize * 0.4
    ),
  )) {
    return null;
  }

  const along = (point) => point[0] * horizontal[0] + point[1] * horizontal[1];
  const startRun = [...runs].sort(
    (first, second) => along(first.baselineStart) - along(second.baselineStart),
  )[0];
  const start = startRun.baselineStart;
  const endDistance = Math.max(...runs.map((metric) => along(metric.baselineEnd)));
  const startDistance = along(start);
  const nativeFontKey = mostCommon(runs.map((metric) => metric.nativeFontKey), "");
  const nativeFontRun = runs.find((metric) => (
    nativeFontKey
    && metric.nativeFontKey === nativeFontKey
    && metric.nativeFontData
  ));
  return {
    fontFamily: mostCommon(runs.map((metric) => metric.fontFamily), "sans"),
    fontWeight: mostCommon(runs.map((metric) => metric.fontWeight), "400"),
    fontStyle: mostCommon(runs.map((metric) => metric.fontStyle), "normal"),
    fontSize,
    horizontalScale: median(runs.map((metric) => metric.horizontalScale)) || 1,
    rotation: angle,
    textInsetX: start[0] - finiteNumber(objectBounds.x),
    baselineOffset: finiteNumber(objectBounds.y)
      + finiteNumber(objectBounds.height)
      - start[1],
    sourceTextWidth: Math.max(0.01, endDistance - startDistance),
    nativeFontData: nativeFontRun?.nativeFontData || null,
    nativeFontFamily: nativeFontRun?.nativeFontFamily || "",
    nativeFontKey,
    nativeFontName: nativeFontRun?.nativeFontName || "",
    useNativeFont: !!nativeFontRun,
  };
}

export function fittedTracking({
  sourceWidth,
  naturalWidth,
  horizontalScale = 1,
  characterCount,
  fontSize = 12,
} = {}) {
  const count = Math.max(0, Math.trunc(finiteNumber(characterCount)));
  if (count < 2 || !(finiteNumber(sourceWidth) > 0)) return 0;
  const scale = Math.max(0.05, finiteNumber(horizontalScale, 1));
  const residual = finiteNumber(sourceWidth) - finiteNumber(naturalWidth) * scale;
  return Math.max(
    -Math.max(0.05, finiteNumber(fontSize, 12) * scale * 0.95),
    Math.min(finiteNumber(fontSize, 12) * 2, residual / (count - 1)),
  );
}

export function editedSingleLineWidth({
  naturalWidth,
  horizontalScale = 1,
  letterSpacing = 0,
  characterCount,
} = {}) {
  return Math.max(
    0,
    finiteNumber(naturalWidth) * Math.max(0.05, finiteNumber(horizontalScale, 1))
      + Math.max(0, Math.trunc(finiteNumber(characterCount)) - 1)
        * finiteNumber(letterSpacing),
  );
}
