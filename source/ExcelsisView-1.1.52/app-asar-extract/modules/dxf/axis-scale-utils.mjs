import { bulgeArcGeometry } from "./geometry-utils.mjs";

const TAU = Math.PI * 2;
const EPSILON = 1e-10;
const BULGE_EPSILON = 1e-8;
const DEFAULT_FULL_ELLIPSE_SEGMENTS = 128;

function normalizeRadians(value) {
  let normalized = Number(value) % TAU;
  if (normalized < 0) normalized += TAU;
  return normalized;
}

export function ellipseParameterRange(startParam, endParam) {
  const start = Number.isFinite(Number(startParam)) ? Number(startParam) : 0;
  const end = Number.isFinite(Number(endParam)) ? Number(endParam) : TAU;
  const rawSweep = end - start;
  const full = Math.abs(rawSweep) >= TAU - EPSILON || Math.abs(rawSweep) <= EPSILON;
  if (full) {
    return { startParam: normalizeRadians(start), endParam: TAU, sweep: TAU, full: true };
  }
  let sweep = rawSweep % TAU;
  if (sweep < 0) sweep += TAU;
  return {
    startParam: normalizeRadians(start),
    endParam: normalizeRadians(start + sweep),
    sweep,
    full: false,
  };
}

function ellipseBasis(definition) {
  const majorAxis = definition?.majorAxis || { x: 0, y: 0 };
  const ratio = Math.abs(Number(definition?.ratio));
  return {
    major: { x: Number(majorAxis.x), y: Number(majorAxis.y) },
    minor: {
      x: -Number(majorAxis.y) * ratio,
      y: Number(majorAxis.x) * ratio,
    },
  };
}

export function pointOnEllipseDefinition(definition, parameter) {
  const center = definition?.center || { x: 0, y: 0 };
  const { major, minor } = ellipseBasis(definition);
  return {
    x: Number(center.x) + major.x * Math.cos(parameter) + minor.x * Math.sin(parameter),
    y: Number(center.y) + major.y * Math.cos(parameter) + minor.y * Math.sin(parameter),
  };
}

function relativeParameter(parameter, start) {
  return normalizeRadians(parameter - start);
}

function ellipseCriticalParameters(definition) {
  const { major, minor } = ellipseBasis(definition);
  const xExtremum = Math.atan2(minor.x, major.x);
  const yExtremum = Math.atan2(minor.y, major.y);
  return [xExtremum, xExtremum + Math.PI, yExtremum, yExtremum + Math.PI];
}

export function sampleEllipseDefinition(definition, fullEllipseSegments = DEFAULT_FULL_ELLIPSE_SEGMENTS) {
  const range = definition?.full
    ? { startParam: 0, endParam: TAU, sweep: TAU, full: true }
    : ellipseParameterRange(definition?.startParam, definition?.endParam);
  const requestedSegments = Math.max(16, Math.min(2048, Math.round(Number(fullEllipseSegments) || 0)));
  const segmentCount = Math.max(2, Math.ceil(requestedSegments * range.sweep / TAU));
  const relativeParameters = [];
  const terminalIndex = range.full ? segmentCount - 1 : segmentCount;
  for (let index = 0; index <= terminalIndex; index += 1) {
    relativeParameters.push((range.sweep * index) / segmentCount);
  }
  if (!range.full) relativeParameters.push(range.sweep);
  for (const critical of ellipseCriticalParameters(definition)) {
    const relative = relativeParameter(critical, range.startParam);
    if (relative > EPSILON && relative < range.sweep - EPSILON) relativeParameters.push(relative);
  }
  relativeParameters.sort((left, right) => left - right);

  const points = [];
  for (const relative of relativeParameters) {
    const point = pointOnEllipseDefinition(definition, range.startParam + relative);
    const previous = points[points.length - 1];
    if (previous && Math.hypot(previous.x - point.x, previous.y - point.y) <= EPSILON) continue;
    points.push(point);
  }
  return points;
}

function isFinitePoint(point) {
  return Number.isFinite(Number(point?.x)) && Number.isFinite(Number(point?.y));
}

export function isUniformAxisScale(scaleX, scaleY) {
  const x = Number(scaleX);
  const y = Number(scaleY);
  return Number.isFinite(x)
    && Number.isFinite(y)
    && Math.abs(x - y) <= 1e-12 * Math.max(1, Math.abs(x), Math.abs(y));
}

// R(angle) * diag(parallel, perpendicular) * R(-angle). The drawing does not
// rotate: the picked line only establishes the two perpendicular scale axes.
function createScaleTransform(center, scaleX, scaleY, axisAngleRadians) {
  const cos = Math.cos(axisAngleRadians);
  const sin = Math.sin(axisAngleRadians);
  const xx = scaleX * cos * cos + scaleY * sin * sin;
  const xy = (scaleX - scaleY) * cos * sin;
  const yy = scaleX * sin * sin + scaleY * cos * cos;
  const cx = Number(center?.x) || 0;
  const cy = Number(center?.y) || 0;
  const vector = (point) => ({
    x: xx * Number(point.x) + xy * Number(point.y),
    y: xy * Number(point.x) + yy * Number(point.y),
  });
  return {
    vector,
    point(point) {
      const offset = vector({ x: Number(point.x) - cx, y: Number(point.y) - cy });
      return { x: cx + offset.x, y: cy + offset.y };
    },
  };
}

export function lineScaleOptions(reference, targetLength, nonUniform = false, perpendicularPercent = 100) {
  const dx = Number(reference?.end?.x) - Number(reference?.start?.x);
  const dy = Number(reference?.end?.y) - Number(reference?.start?.y);
  const length = Math.hypot(dx, dy);
  const scaleX = Number(targetLength) / length;
  const scaleY = nonUniform ? Number(perpendicularPercent) / 100 : scaleX;
  if (!(length > EPSILON) || !Number.isFinite(scaleX) || !(scaleX > 0)
    || !Number.isFinite(scaleY) || !(scaleY > 0)) {
    throw new RangeError("Pick a valid line and enter positive finite scale values.");
  }
  return { scaleX, scaleY, axisAngleRadians: nonUniform ? Math.atan2(dy, dx) : 0 };
}

function transformedEllipseDefinition(definition, transform) {
  const sourceCenter = definition?.center;
  const { major, minor } = ellipseBasis(definition);
  if (!isFinitePoint(sourceCenter) || !isFinitePoint(major) || !isFinitePoint(minor)) return null;

  const transformedCenter = transform.point(sourceCenter);
  const transformedMajor = transform.vector(major);
  const transformedMinor = transform.vector(minor);

  // Eigenvectors of M*M^T are the orthogonal axes of the transformed ellipse,
  // where M has the transformed cosine/sine basis vectors as its columns.
  const xx = transformedMajor.x ** 2 + transformedMinor.x ** 2;
  const xy = transformedMajor.x * transformedMajor.y + transformedMinor.x * transformedMinor.y;
  const yy = transformedMajor.y ** 2 + transformedMinor.y ** 2;
  const trace = xx + yy;
  const discriminant = Math.hypot(xx - yy, 2 * xy);
  const majorSquared = Math.max(0, (trace + discriminant) / 2);
  const minorSquared = Math.max(0, (trace - discriminant) / 2);
  const majorLength = Math.sqrt(majorSquared);
  const minorLength = Math.sqrt(minorSquared);
  if (!(majorLength > EPSILON) || !(minorLength > EPSILON)) return null;

  let axisX;
  let axisY;
  if (Math.abs(xy) > EPSILON) {
    axisX = majorSquared - yy;
    axisY = xy;
  } else if (xx >= yy) {
    axisX = 1;
    axisY = 0;
  } else {
    axisX = 0;
    axisY = 1;
  }
  const axisLength = Math.hypot(axisX, axisY);
  axisX /= axisLength;
  axisY /= axisLength;
  if (axisX < -EPSILON || (Math.abs(axisX) <= EPSILON && axisY < 0)) {
    axisX = -axisX;
    axisY = -axisY;
  }
  const minorUnit = { x: -axisY, y: axisX };
  const transformedStart = transform.point(pointOnEllipseDefinition(definition, definition.startParam));
  const startOffset = {
    x: transformedStart.x - transformedCenter.x,
    y: transformedStart.y - transformedCenter.y,
  };
  const startCos = (startOffset.x * axisX + startOffset.y * axisY) / majorLength;
  const startSin = (startOffset.x * minorUnit.x + startOffset.y * minorUnit.y) / minorLength;
  const transformedStartParam = normalizeRadians(Math.atan2(startSin, startCos));
  const sourceRange = definition.full
    ? { sweep: TAU, full: true }
    : ellipseParameterRange(definition.startParam, definition.endParam);
  const transformedEndParam = sourceRange.full
    ? TAU
    : normalizeRadians(transformedStartParam + sourceRange.sweep);

  return {
    center: transformedCenter,
    majorAxis: { x: axisX * majorLength, y: axisY * majorLength },
    ratio: minorLength / majorLength,
    startParam: sourceRange.full ? 0 : transformedStartParam,
    endParam: transformedEndParam,
    sweep: sourceRange.sweep,
    full: sourceRange.full,
  };
}

function circularDefinition(cx, cy, radius, startRadians, sweepRadians) {
  let start = Number(startRadians);
  let sweep = Number(sweepRadians);
  if (sweep < 0) {
    start += sweep;
    sweep = -sweep;
  }
  const full = sweep >= TAU - EPSILON;
  return {
    center: { x: Number(cx), y: Number(cy) },
    majorAxis: { x: Math.abs(Number(radius)), y: 0 },
    ratio: 1,
    startParam: full ? 0 : normalizeRadians(start),
    endParam: full ? TAU : normalizeRadians(start + sweep),
    sweep: full ? TAU : sweep,
    full,
  };
}

function counterClockwiseArcSweepRadians(startDegrees, endDegrees) {
  const start = normalizeRadians(Number(startDegrees) * Math.PI / 180);
  const end = normalizeRadians(Number(endDegrees) * Math.PI / 180);
  let sweep = end - start;
  if (sweep <= EPSILON) sweep += TAU;
  return { start, sweep };
}

function replacementEllipsePreview(entity, definition) {
  entity.originalType = "ELLIPSE";
  entity.type = "LWPOLYLINE";
  entity.points = sampleEllipseDefinition(definition).map((point) => ({ ...point, bulge: 0 }));
  entity.closed = !!definition.full;
  entity.ellipseDefinition = definition;
  entity.axisScaleReplacementEntities = [{ type: "ELLIPSE", ...definition }];
  entity.forceRebuildPairs = true;
}

function appendUnique(points, point) {
  if (!isFinitePoint(point)) return;
  const previous = points[points.length - 1];
  if (previous && Math.hypot(previous.x - point.x, previous.y - point.y) <= EPSILON) return;
  points.push({ x: point.x, y: point.y, bulge: 0 });
}

function sampleTransformedCircularArc(arc, transform) {
  const segmentCount = Math.max(
    2,
    Math.ceil(DEFAULT_FULL_ELLIPSE_SEGMENTS * Math.abs(arc.sweep) / TAU),
  );
  const points = [];
  for (let index = 0; index <= segmentCount; index += 1) {
    const angle = arc.start + arc.sweep * index / segmentCount;
    appendUnique(points, transform.point({
      x: arc.cx + arc.r * Math.cos(angle),
      y: arc.cy + arc.r * Math.sin(angle),
    }));
  }
  return points;
}

function scaleBulgedPolyline(entity, transform) {
  const sourcePoints = entity.points || [];
  const segmentCount = entity.closed ? sourcePoints.length : Math.max(0, sourcePoints.length - 1);
  const previewPoints = [];
  const replacements = [];
  for (let index = 0; index < segmentCount; index += 1) {
    const a = sourcePoints[index];
    const b = sourcePoints[(index + 1) % sourcePoints.length];
    const bulge = Number(a?.bulge) || 0;
    const transformedA = transform.point(a);
    const transformedB = transform.point(b);
    if (Math.abs(bulge) <= BULGE_EPSILON) {
      appendUnique(previewPoints, transformedA);
      appendUnique(previewPoints, transformedB);
      replacements.push({ type: "LINE", start: transformedA, end: transformedB });
      continue;
    }
    const arc = bulgeArcGeometry(a, b, bulge);
    if (!arc) {
      appendUnique(previewPoints, transformedA);
      appendUnique(previewPoints, transformedB);
      replacements.push({ type: "LINE", start: transformedA, end: transformedB });
      continue;
    }
    for (const point of sampleTransformedCircularArc(arc, transform)) {
      appendUnique(previewPoints, point);
    }
    const sourceDefinition = circularDefinition(arc.cx, arc.cy, arc.r, arc.start, arc.sweep);
    const ellipse = transformedEllipseDefinition(sourceDefinition, transform);
    if (ellipse) replacements.push({ type: "ELLIPSE", ...ellipse });
  }
  if (entity.closed && previewPoints.length > 1) {
    const first = previewPoints[0];
    const last = previewPoints[previewPoints.length - 1];
    if (Math.hypot(first.x - last.x, first.y - last.y) <= EPSILON) previewPoints.pop();
  }
  entity.points = previewPoints;
  entity.axisScaleReplacementEntities = replacements;
  entity.forceRebuildPairs = true;
}

export function scaleEntitiesByAxesInPlace(entities, center, scaleX, scaleY, axisAngleRadians = 0) {
  const numericScaleX = Number(scaleX);
  const numericScaleY = Number(scaleY);
  if (!Number.isFinite(numericScaleX)
    || !Number.isFinite(numericScaleY)
    || !(numericScaleX > 0)
    || !(numericScaleY > 0)) {
    throw new RangeError("Scale factors must be positive numbers.");
  }
  if (!Number.isFinite(axisAngleRadians)) throw new RangeError("Scale axis angle must be finite.");
  const uniform = isUniformAxisScale(numericScaleX, numericScaleY);
  const transform = createScaleTransform(center, numericScaleX, numericScaleY, uniform ? 0 : axisAngleRadians);
  let scaled = 0;
  let exactEllipseReplacements = 0;

  for (const entity of entities || []) {
    if (!entity || entity.deleted || entity.virtual) continue;
    delete entity.axisScaleReplacementEntities;

    if (entity.type === "LINE") {
      const start = transform.point({ x: entity.x1, y: entity.y1 });
      const end = transform.point({ x: entity.x2, y: entity.y2 });
      entity.x1 = start.x;
      entity.y1 = start.y;
      entity.x2 = end.x;
      entity.y2 = end.y;
    } else if (entity.type === "CIRCLE") {
      if (uniform) {
        const transformedCenter = transform.point({ x: entity.cx, y: entity.cy });
        entity.cx = transformedCenter.x;
        entity.cy = transformedCenter.y;
        entity.r *= numericScaleX;
      } else {
        const source = circularDefinition(entity.cx, entity.cy, entity.r, 0, TAU);
        const ellipse = transformedEllipseDefinition(source, transform);
        if (!ellipse) continue;
        replacementEllipsePreview(entity, ellipse);
        exactEllipseReplacements += 1;
      }
    } else if (entity.type === "ARC") {
      if (uniform) {
        const transformedCenter = transform.point({ x: entity.cx, y: entity.cy });
        entity.cx = transformedCenter.x;
        entity.cy = transformedCenter.y;
        entity.r *= numericScaleX;
      } else {
        const range = counterClockwiseArcSweepRadians(entity.a1, entity.a2);
        const source = circularDefinition(entity.cx, entity.cy, entity.r, range.start, range.sweep);
        const ellipse = transformedEllipseDefinition(source, transform);
        if (!ellipse) continue;
        replacementEllipsePreview(entity, ellipse);
        exactEllipseReplacements += 1;
      }
    } else if (entity.type === "LWPOLYLINE") {
      const hasBulges = (entity.points || []).some((point) => Math.abs(Number(point?.bulge) || 0) > BULGE_EPSILON);
      if (!uniform && entity.originalType === "ELLIPSE" && entity.ellipseDefinition) {
        const ellipse = transformedEllipseDefinition(
          entity.ellipseDefinition,
          transform,
        );
        if (!ellipse) continue;
        replacementEllipsePreview(entity, ellipse);
        exactEllipseReplacements += 1;
      } else if (!uniform && hasBulges) {
        scaleBulgedPolyline(entity, transform);
        exactEllipseReplacements += entity.axisScaleReplacementEntities
          .filter((replacement) => replacement.type === "ELLIPSE").length;
      } else {
        entity.points = (entity.points || []).map((point) => ({
          ...transform.point(point),
          bulge: point.bulge || 0,
        }));
      }
    } else {
      continue;
    }

    entity.modified = true;
    scaled += 1;
  }
  return { scaled, exactEllipseReplacements, uniform };
}

function firstPairValue(pairs, code) {
  const pair = (pairs || []).find((candidate) => candidate.code === code);
  return pair?.value == null ? "" : String(pair.value).trim();
}

function defaultFormatNumber(value) {
  if (!Number.isFinite(Number(value))) return "0";
  let formatted = Number(value).toFixed(6).replace(/\.?0+$/, "");
  if (formatted === "-0") formatted = "0";
  return formatted;
}

function replacementEntityStylePairs(source) {
  const pairs = [
    { code: "100", value: "AcDbEntity" },
    { code: "8", value: String(source.layer || "0") },
  ];
  for (const code of ["6", "62", "370", "48", "60", "67", "410"]) {
    const value = firstPairValue(source.pairs, code);
    if (value !== "") pairs.push({ code, value });
  }
  return pairs;
}

function replacementLinePairs(replacement, source, formatNumber) {
  return [
    { code: "0", value: "LINE" },
    ...replacementEntityStylePairs(source),
    { code: "100", value: "AcDbLine" },
    { code: "10", value: formatNumber(replacement.start.x) },
    { code: "20", value: formatNumber(replacement.start.y) },
    { code: "30", value: "0" },
    { code: "11", value: formatNumber(replacement.end.x) },
    { code: "21", value: formatNumber(replacement.end.y) },
    { code: "31", value: "0" },
  ];
}

function replacementEllipsePairs(replacement, source, formatNumber) {
  const startParam = replacement.full ? 0 : replacement.startParam;
  const endParam = replacement.full ? TAU : replacement.endParam;
  return [
    { code: "0", value: "ELLIPSE" },
    ...replacementEntityStylePairs(source),
    { code: "100", value: "AcDbEllipse" },
    { code: "10", value: formatNumber(replacement.center.x) },
    { code: "20", value: formatNumber(replacement.center.y) },
    { code: "30", value: "0" },
    { code: "11", value: formatNumber(replacement.majorAxis.x) },
    { code: "21", value: formatNumber(replacement.majorAxis.y) },
    { code: "31", value: "0" },
    { code: "40", value: formatNumber(replacement.ratio) },
    { code: "41", value: formatNumber(startParam) },
    { code: "42", value: formatNumber(endParam) },
  ];
}

export function buildAxisScaleReplacementPairs(entity, formatter = defaultFormatNumber) {
  const formatNumber = typeof formatter === "function" ? formatter : defaultFormatNumber;
  const output = [];
  for (const replacement of entity?.axisScaleReplacementEntities || []) {
    if (replacement.type === "LINE") {
      output.push(...replacementLinePairs(replacement, entity, formatNumber));
    } else if (replacement.type === "ELLIPSE") {
      output.push(...replacementEllipsePairs(replacement, entity, formatNumber));
    }
  }
  return output;
}
