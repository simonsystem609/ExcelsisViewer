import { createWorkerTaskClient } from "../shared/worker-client.mjs";
import {
  angleOnCounterClockwiseArcDegrees,
  angleOnSignedSweepRadians,
  arcExtremaPoints,
  arcQuadrantPoints,
  axisOffsetDimensions,
  bulgeArcExtremaPoints,
  circleQuadrantPoints,
  pointAngleDegrees,
  pointAngleRadians,
  scalePointByAxes,
  signedArcQuadrantPoints,
  tangentPointsToCircle,
} from "./geometry-utils.mjs";
import {
  drawDxfCoordinateSystem,
  drawDxfOriginMarker,
} from "./coordinate-overlays.mjs";
import { rotateEntityInPlace } from "./transform-utils.mjs";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const desktopApi = window.dxfApp?.isDesktop ? window.dxfApp : null;

const ui = {
  saveSplit: document.getElementById("saveSplit"),
  saveBtn: document.getElementById("saveBtn"),
  saveMenuBtn: document.getElementById("saveMenuBtn"),
  saveMenu: document.getElementById("saveMenu"),
  saveAsBtn: document.getElementById("saveAsBtn"),
  discardBtn: document.getElementById("discardBtn"),
  mirrorBtn: document.getElementById("mirrorBtn"),
  rotateBtn: document.getElementById("rotateBtn"),
  fitBtn: document.getElementById("fitBtn"),
  dissolveBtn: document.getElementById("dissolveBtn"),
  rebuildBtn: document.getElementById("rebuildBtn"),
  fixOuterContourBtn: document.getElementById("fixOuterContourBtn"),
  removeChamferFilletBtn: document.getElementById("removeChamferFilletBtn"),
  showOriginalBtn: document.getElementById("showOriginalBtn"),
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  fileCounter: document.getElementById("fileCounter"),
  fileName: document.getElementById("fileName"),
  dirtyState: document.getElementById("dirtyState"),
  lockState: document.getElementById("lockState"),
  modeState: document.getElementById("modeState"),
  selectionInfo: document.getElementById("selectionInfo"),
  measureInfo: document.getElementById("measureInfo"),
  featureList: document.getElementById("featureList"),
  panel: document.querySelector(".panel"),
  hud: document.getElementById("hud"),
  snapBadge: document.getElementById("snapBadge"),
  appVersion: document.getElementById("appVersion"),
  outerRepairDialog: document.getElementById("outerRepairDialog"),
  outerRepairProgress: document.getElementById("outerRepairProgress"),
  outerRepairPercent: document.getElementById("outerRepairPercent"),
  outerRepairStatus: document.getElementById("outerRepairStatus"),
  outerRepairSummary: document.getElementById("outerRepairSummary"),
  mirrorDialog: document.getElementById("mirrorDialog"),
  mirrorLeftRightBtn: document.getElementById("mirrorLeftRightBtn"),
  mirrorTopBottomBtn: document.getElementById("mirrorTopBottomBtn"),
  mirrorCancelBtn: document.getElementById("mirrorCancelBtn"),
  scaleBtn: document.getElementById("scaleBtn"),
  scaleDialog: document.getElementById("scaleDialog"),
  scaleModeChooser: document.getElementById("scaleModeChooser"),
  scaleModeXYBtn: document.getElementById("scaleModeXYBtn"),
  scaleModeLineBtn: document.getElementById("scaleModeLineBtn"),
  scaleModeUniformBtn: document.getElementById("scaleModeUniformBtn"),
  scaleXYFieldset: document.getElementById("scaleXYFieldset"),
  scaleXInput: document.getElementById("scaleXInput"),
  scaleYInput: document.getElementById("scaleYInput"),
  scaleLineFieldset: document.getElementById("scaleLineFieldset"),
  scaleLineHint: document.getElementById("scaleLineHint"),
  scalePickLineBtn: document.getElementById("scalePickLineBtn"),
  scaleLinePickedInfo: document.getElementById("scaleLinePickedInfo"),
  scaleLineLengthInput: document.getElementById("scaleLineLengthInput"),
  scaleUniformFieldset: document.getElementById("scaleUniformFieldset"),
  scaleUniformInput: document.getElementById("scaleUniformInput"),
  scaleBackBtn: document.getElementById("scaleBackBtn"),
  scaleApplyBtn: document.getElementById("scaleApplyBtn"),
  scaleCancelBtn: document.getElementById("scaleCancelBtn"),
  outerRepairMethodDialog: document.getElementById("outerRepairMethodDialog"),
  outerRepairHdBtn: document.getElementById("outerRepairHdBtn"),
  outerRepairArcLineBtn: document.getElementById("outerRepairArcLineBtn"),
  outerRepairMethodCancelBtn: document.getElementById("outerRepairMethodCancelBtn"),
  outerRepairOutputNote: document.getElementById("outerRepairOutputNote"),
  lineArcSimplifySlider: document.getElementById("lineArcSimplifySlider"),
  lineArcSimplifyOutput: document.getElementById("lineArcSimplifyOutput"),
  outerRepairCompareToggle: document.getElementById("outerRepairCompareToggle"),
  cleanupDialog: document.getElementById("cleanupDialog"),
  cleanupProgress: document.getElementById("cleanupProgress"),
  cleanupStatus: document.getElementById("cleanupStatus"),
  cleanupSummary: document.getElementById("cleanupSummary"),
  cleanupRelaxedToggle: document.getElementById("cleanupRelaxedToggle"),
  cleanupApplyBtn: document.getElementById("cleanupApplyBtn"),
  cleanupCancelBtn: document.getElementById("cleanupCancelBtn"),
};

const state = {
  files: [],
  fileIndex: -1,
  doc: null,
  features: [],
  selectedEntityIds: new Set(),
  selectedFeatureIds: new Set(),
  dissolvedEntityIds: new Set(),
  mode: "select",
  dirty: false,
  readOnly: false,
  readOnlyReason: null,
  savedText: "",
  undoStack: [],
  measure: [],
  measureDetails: [],
  measureEntityIds: [],
  hoverSnap: null,
  mouse: { x: 0, y: 0 },
  view: { scale: 1, fitScale: 1, ox: 0, oy: 0 },
  panning: false,
  panLast: null,
  selectionBox: null,
  repairBusy: false,
  mirrorBusy: false,
  rotateBusy: false,
  scaleBusy: false,
  pickingLine: false,
  pickHoverEntity: null,
  repairCompareOriginal: null,
  repairCompareFixed: null,
  repairCompareDeviation: null,
  repairCompareVisible: false,
  originalOverlayBusy: false,
  originalOverlaySourcePath: null,
  cleanupBusy: false,
};

const GEOM_TYPES = new Set(["LINE", "ARC", "CIRCLE", "LWPOLYLINE"]);
const CONNECT_TOL = 0.05;
const HIT_PX = 9;
const BULGE_TOL = 1e-8;
const SELECTION_COLOR = "#ff4f5f";
const SNAP_COLOR = "#39ff88";
const OUTLINE_ACCEPTANCE_MM = 0.1;
const CLOCKWISE_QUARTER_TURN_DEGREES = -90;
// Arc & line method: clean features and feature vertices must match the source
// closely (tight), but where the source outline is broken/noisy we reconstruct
// the intended geometry logically instead of chasing mesh ripple, allowing a
// looser local deviation. Arcs tighter than the min radius collapse to a sharp
// (pointy) vertex at the intersection of their neighbours.
const ARC_LINE_FEATURE_TIGHT_MM = 0.1;
const ARC_LINE_FEATURE_LOOSE_MM = 0.7;
const ARC_LINE_MIN_RADIUS_MM = 1.0;
// Smallest allowed line/arc edge on the finished contour. Anything shorter is
// collapsed into a sharp vertex (same outward-only guards as simplify).
const ARC_LINE_MIN_EDGE_MM = 0.25;
// Line-line stubs below this are always stripped (spike/cross guards only).
const ARC_LINE_MICRO_STUB_MM = 0.15;
// Save-gate ceiling for the arc/line (feature) method. Clean parts are fit tight
// (TIGHT_MM); broken/noisy regions are reconstructed logically and may drift up
// to ~1mm rather than fragmenting to chase mesh noise. Only reject beyond this.
const ARC_LINE_ACCEPT_MM = 1.0;
const geometryWorker = createWorkerTaskClient(new URL("./geometry-worker.mjs", import.meta.url), {
  name: "excelsis-dxf-geometry",
  defaultTimeoutMs: 10 * 60 * 1000,
});
let entityByIdMap = new Map();
let featureByIdMap = new Map();
let entityBoundsMap = new Map();
let entitySpatialGrid = new Map();
let spatialOverflowEntities = [];
let entitySpatialCellSize = 1;
let geometryRevision = 0;
let selectionUiSignature = "";
let measureUiSignature = "";
let featureUiSignature = "";
let renderFramePending = false;
let hoverFramePending = false;
let pendingHoverPoint = null;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  render();
}

function screenSize() {
  const rect = canvas.getBoundingClientRect();
  return { w: rect.width, h: rect.height };
}

function worldToScreen(pt) {
  return {
    x: pt.x * state.view.scale + state.view.ox,
    y: -pt.y * state.view.scale + state.view.oy,
  };
}

function screenToWorld(pt) {
  return {
    x: (pt.x - state.view.ox) / state.view.scale,
    y: -(pt.y - state.view.oy) / state.view.scale,
  };
}

function parseDxf(text) {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rawLines = normalized.split("\n");
  const pairs = [];

  for (let i = 0; i < rawLines.length; i += 2) {
    pairs.push({
      code: (rawLines[i] ?? "").trim(),
      value: rawLines[i + 1] ?? "",
      rawCode: rawLines[i] ?? "",
      rawValue: rawLines[i + 1] ?? "",
    });
  }

  const entities = [];
  const blocksByName = new Map();
  const idGen = { next: 1 };

  let i = 0;
  while (i < pairs.length) {
    const p = pairs[i];
    if (p.code !== "0") { i++; continue; }
    const value = p.value.trim().toUpperCase();
    if (value === "EOF") break;
    if (value !== "SECTION") { i++; continue; }

    // Find the next code-2 (section name) before any code-0
    let nameI = i + 1;
    while (nameI < pairs.length && pairs[nameI].code !== "0" && pairs[nameI].code !== "2") nameI++;
    const sectionName = (nameI < pairs.length && pairs[nameI].code === "2")
      ? pairs[nameI].value.trim().toUpperCase()
      : "";

    // Scan to ENDSEC
    let endSec = (nameI < pairs.length && pairs[nameI].code === "2") ? nameI + 1 : i + 1;
    while (endSec < pairs.length) {
      if (pairs[endSec].code === "0" && pairs[endSec].value.trim().toUpperCase() === "ENDSEC") break;
      endSec++;
    }

    if (sectionName === "BLOCKS") {
      parseBlocksSection(pairs, (nameI < pairs.length && pairs[nameI].code === "2") ? nameI + 1 : i + 1, endSec, blocksByName, idGen);
    } else if (sectionName === "ENTITIES") {
      parseEntitiesSection(pairs, (nameI < pairs.length && pairs[nameI].code === "2") ? nameI + 1 : i + 1, endSec, entities, blocksByName, idGen);
    }

    i = endSec + 1;
  }

  return { pairs, entities, text };
}

function parseBlocksSection(pairs, startI, endI, blocksByName, idGen) {
  let i = startI;
  while (i < endI) {
    if (pairs[i].code !== "0") { i++; continue; }
    const type = pairs[i].value.trim().toUpperCase();
    if (type !== "BLOCK") { i++; continue; }

    // BLOCK header — read until next code-0
    let h = i + 1;
    while (h < endI && pairs[h].code !== "0") h++;
    const headerPairs = pairs.slice(i, h);
    const blockName = (readFirst(headerPairs, "2") || "").trim();

    // Walk forward parsing block entities until ENDBLK
    const blockEntities = [];
    let entI = h;
    while (entI < endI) {
      if (pairs[entI].code !== "0") { entI++; continue; }
      const entType = pairs[entI].value.trim().toUpperCase();
      if (entType === "ENDBLK") {
        let after = entI + 1;
        while (after < endI && pairs[after].code !== "0") after++;
        i = after;
        break;
      }
      if (entType === "INSERT") {
        // Nested INSERTs inside blocks: parse as opaque, do not recursively expand.
        const result = parseInsertEntity(pairs, entI, idGen, blocksByName);
        // Only keep the children (expanded), drop the placeholder since this is
        // inside a block definition (no in-place serialize needed for nested).
        for (const child of result.children) blockEntities.push(child);
        entI = result.nextIndex;
        continue;
      }
      const result = parseSingleEntity(pairs, entI, entType, idGen);
      if (result.entity && result.entity.supported) blockEntities.push(result.entity);
      entI = result.nextIndex;
    }

    if (blockName) blocksByName.set(blockName.toUpperCase(), blockEntities);
    if (i <= h) i = h + 1;  // safety: avoid infinite loop if ENDBLK not found
  }
}

function parseEntitiesSection(pairs, startI, endI, entities, blocksByName, idGen) {
  let i = startI;
  while (i < endI) {
    if (pairs[i].code !== "0") { i++; continue; }
    const type = pairs[i].value.trim().toUpperCase();
    if (type === "ENDSEC") break;

    if (type === "INSERT") {
      const result = parseInsertEntity(pairs, i, idGen, blocksByName);
      if (result.placeholder) entities.push(result.placeholder);
      for (const child of result.children) entities.push(child);
      i = result.nextIndex;
      continue;
    }

    const result = parseSingleEntity(pairs, i, type, idGen);
    if (result.entity) entities.push(result.entity);
    i = result.nextIndex;
  }
}

function parseSingleEntity(pairs, startI, type, idGen) {
  if (type === "POLYLINE") return parsePolylineGroup(pairs, startI, idGen);
  let j = startI + 1;
  while (j < pairs.length && pairs[j].code !== "0") j++;
  const entityPairs = pairs.slice(startI, j);
  const entity = parseEntity(type, entityPairs, startI, j - 1, idGen.next++);
  return { entity, nextIndex: j };
}

function parsePolylineGroup(pairs, startI, idGen) {
  // POLYLINE header until next code-0
  let j = startI + 1;
  while (j < pairs.length && pairs[j].code !== "0") j++;
  const headerPairs = pairs.slice(startI, j);
  const flag = readNumber(headerPairs, "70") || 0;
  const layer = readFirst(headerPairs, "8") || "0";

  // Walk forward through VERTEX entries until SEQEND
  const polyPoints = [];
  let endIndex = j - 1;
  let nextIndex = j;

  while (nextIndex < pairs.length && pairs[nextIndex].code === "0") {
    const subType = pairs[nextIndex].value.trim().toUpperCase();
    if (subType === "SEQEND") {
      let k = nextIndex + 1;
      while (k < pairs.length && pairs[k].code !== "0") k++;
      endIndex = k - 1;
      nextIndex = k;
      break;
    }
    if (subType !== "VERTEX") break;
    let k = nextIndex + 1;
    while (k < pairs.length && pairs[k].code !== "0") k++;
    const vertexPairs = pairs.slice(nextIndex, k);
    const x = readNumber(vertexPairs, "10");
    const y = readNumber(vertexPairs, "20");
    const bulge = readNumber(vertexPairs, "42") || 0;
    if (Number.isFinite(x) && Number.isFinite(y)) {
      polyPoints.push({ x, y, bulge });
    }
    endIndex = k - 1;
    nextIndex = k;
  }

  const baseEntity = {
    id: idGen.next++,
    start: startI,
    end: endIndex,
    pairs: pairs.slice(startI, endIndex + 1),
    layer,
    deleted: false,
    modified: false,
    featureId: null,
  };
  if (polyPoints.length < 2) {
    return { entity: { ...baseEntity, type: "POLYLINE", supported: false }, nextIndex };
  }
  return {
    entity: {
      ...baseEntity,
      type: "LWPOLYLINE",
      originalType: "POLYLINE",
      points: polyPoints,
      closed: (flag & 1) !== 0,
      supported: true,
    },
    nextIndex,
  };
}

function parseInsertEntity(pairs, startI, idGen, blocksByName) {
  let j = startI + 1;
  while (j < pairs.length && pairs[j].code !== "0") j++;
  const insertPairs = pairs.slice(startI, j);
  const blockName = (readFirst(insertPairs, "2") || "").trim().toUpperCase();
  const tx = readNumber(insertPairs, "10");
  const ty = readNumber(insertPairs, "20");
  const sxRaw = readNumber(insertPairs, "41");
  const syRaw = readNumber(insertPairs, "42");
  const rotDeg = readNumber(insertPairs, "50");
  const transform = {
    tx: Number.isFinite(tx) ? tx : 0,
    ty: Number.isFinite(ty) ? ty : 0,
    sx: Number.isFinite(sxRaw) ? sxRaw : 1,
    sy: Number.isFinite(syRaw) ? syRaw : 1,
    rotRad: (Number.isFinite(rotDeg) ? rotDeg : 0) * Math.PI / 180,
  };

  const placeholder = {
    id: idGen.next++,
    type: "INSERT",
    originalType: "INSERT",
    start: startI,
    end: j - 1,
    pairs: insertPairs,
    layer: readFirst(insertPairs, "8") || "0",
    deleted: false,
    modified: false,
    featureId: null,
    supported: false,
    blockName,
    insertTransform: transform,
  };

  const blockEntities = blocksByName.get(blockName) || [];
  const children = [];
  for (const src of blockEntities) {
    const transformed = transformEntityForInsert(src, placeholder, transform, idGen);
    if (transformed) children.push(transformed);
  }
  return { placeholder, children, nextIndex: j };
}

function transformPointForInsert(p, t) {
  const sx = (t.sx || 1) * p.x;
  const sy = (t.sy || 1) * p.y;
  const cosR = Math.cos(t.rotRad || 0);
  const sinR = Math.sin(t.rotRad || 0);
  return {
    x: t.tx + sx * cosR - sy * sinR,
    y: t.ty + sx * sinR + sy * cosR,
  };
}

function transformEntityForInsert(src, placeholder, t, idGen) {
  const uniformScale = (Math.abs(t.sx || 1) + Math.abs(t.sy || 1)) / 2;
  const base = {
    id: idGen.next++,
    start: placeholder.start,
    end: placeholder.end,
    pairs: placeholder.pairs,
    layer: src.layer,
    deleted: false,
    modified: false,
    featureId: null,
    supported: true,
    virtual: true,
    originalType: src.originalType || src.type,
    parentInsertId: placeholder.id,
  };
  if (src.type === "LINE") {
    const a = transformPointForInsert({ x: src.x1, y: src.y1 }, t);
    const b = transformPointForInsert({ x: src.x2, y: src.y2 }, t);
    return { ...base, type: "LINE", x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  }
  if (src.type === "CIRCLE") {
    const c = transformPointForInsert({ x: src.cx, y: src.cy }, t);
    return { ...base, type: "CIRCLE", cx: c.x, cy: c.y, r: src.r * uniformScale };
  }
  if (src.type === "ARC") {
    const c = transformPointForInsert({ x: src.cx, y: src.cy }, t);
    const rotDeg = (t.rotRad || 0) * 180 / Math.PI;
    return {
      ...base,
      type: "ARC",
      cx: c.x, cy: c.y, r: src.r * uniformScale,
      a1: src.a1 + rotDeg,
      a2: src.a2 + rotDeg,
    };
  }
  if (src.type === "LWPOLYLINE") {
    return {
      ...base,
      type: "LWPOLYLINE",
      points: src.points.map((p) => ({ ...transformPointForInsert(p, t), bulge: p.bulge || 0 })),
      closed: !!src.closed,
    };
  }
  return null;
}

function evaluateBSpline(t, degree, controlPoints, knots) {
  const n = controlPoints.length - 1;
  let k;
  if (t <= knots[degree]) {
    k = degree;
  } else if (t >= knots[n + 1]) {
    k = n;
  } else {
    k = degree;
    while (k < n && knots[k + 1] <= t) k++;
  }
  const d = [];
  for (let i = 0; i <= degree; i++) {
    const src = controlPoints[k - degree + i];
    d.push({ x: src.x, y: src.y });
  }
  for (let r = 1; r <= degree; r++) {
    for (let j = degree; j >= r; j--) {
      const left = knots[j + k - degree];
      const right = knots[j + 1 + k - r];
      const denom = right - left;
      const alpha = denom > 1e-12 ? (t - left) / denom : 0;
      d[j] = {
        x: (1 - alpha) * d[j - 1].x + alpha * d[j].x,
        y: (1 - alpha) * d[j - 1].y + alpha * d[j].y,
      };
    }
  }
  return d[degree];
}

function sampleBSpline(degree, controlPoints, knots, sampleCount) {
  if (degree < 1 || controlPoints.length <= degree) return [];
  if (knots.length !== controlPoints.length + degree + 1) return [];
  const tMin = knots[degree];
  const tMax = knots[controlPoints.length];
  if (!(tMax > tMin)) return [];
  const samples = Math.max(2, sampleCount | 0);
  const points = [];
  for (let i = 0; i <= samples; i++) {
    const t = tMin + (tMax - tMin) * (i / samples);
    points.push(evaluateBSpline(t, degree, controlPoints, knots));
  }
  // De-dup any consecutive coincident points (numerical noise at boundaries).
  const out = [];
  for (const p of points) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
    const last = out[out.length - 1];
    if (last && Math.abs(last.x - p.x) < 1e-9 && Math.abs(last.y - p.y) < 1e-9) continue;
    out.push(p);
  }
  return out;
}

function sampleEllipsePoints(center, majorAxis, ratio, startParam, endParam, sampleCount) {
  // DXF ELLIPSE parametric form:
  //   P(t) = center + cos(t) * majorAxis + sin(t) * minorAxis
  // where minorAxis is perpendicular to majorAxis (rotated +90 in plane)
  // and |minorAxis| = ratio * |majorAxis|.
  const majorLen = Math.hypot(majorAxis.x, majorAxis.y);
  if (!(majorLen > 0)) return [];
  const samples = Math.max(2, sampleCount | 0);
  const cosA = majorAxis.x / majorLen;
  const sinA = majorAxis.y / majorLen;
  const minorLen = majorLen * Math.abs(ratio || 1);
  let tStart = Number.isFinite(startParam) ? startParam : 0;
  let tEnd = Number.isFinite(endParam) ? endParam : Math.PI * 2;
  // Some exporters write end < start for closed full ellipses; normalize.
  if (tEnd <= tStart) tEnd = tStart + Math.PI * 2;
  const points = [];
  for (let i = 0; i <= samples; i++) {
    const t = tStart + (tEnd - tStart) * (i / samples);
    const lx = majorLen * Math.cos(t);
    const ly = minorLen * Math.sin(t);
    points.push({
      x: center.x + lx * cosA - ly * sinA,
      y: center.y + lx * sinA + ly * cosA,
    });
  }
  // Dedup consecutive coincident points
  const out = [];
  for (const p of points) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
    const last = out[out.length - 1];
    if (last && Math.abs(last.x - p.x) < 1e-9 && Math.abs(last.y - p.y) < 1e-9) continue;
    out.push(p);
  }
  return out;
}

function parseSplinePoints(pairs) {
  const fitPoints = [];
  const controlPoints = [];
  const knots = [];
  let curCtl = null;
  let curFit = null;
  const flushCtl = () => {
    if (curCtl && Number.isFinite(curCtl.x) && Number.isFinite(curCtl.y)) controlPoints.push(curCtl);
    curCtl = null;
  };
  const flushFit = () => {
    if (curFit && Number.isFinite(curFit.x) && Number.isFinite(curFit.y)) fitPoints.push(curFit);
    curFit = null;
  };
  for (const p of pairs) {
    if (p.code === "10") {
      flushCtl();
      curCtl = { x: parseFloat(p.value), y: NaN };
    } else if (p.code === "20" && curCtl) {
      curCtl.y = parseFloat(p.value);
    } else if (p.code === "11") {
      flushFit();
      curFit = { x: parseFloat(p.value), y: NaN };
    } else if (p.code === "21" && curFit) {
      curFit.y = parseFloat(p.value);
    } else if (p.code === "40") {
      const knot = parseFloat(p.value);
      if (Number.isFinite(knot)) knots.push(knot);
    }
  }
  flushCtl();
  flushFit();
  return { fitPoints, controlPoints, knots };
}

function parseEntity(type, pairs, start, end, id) {
  const entity = {
    id,
    type,
    start,
    end,
    pairs,
    layer: readFirst(pairs, "8") || "0",
    deleted: false,
    modified: false,
    featureId: null,
  };

  if (type === "LINE") {
    entity.x1 = readNumber(pairs, "10");
    entity.y1 = readNumber(pairs, "20");
    entity.x2 = readNumber(pairs, "11");
    entity.y2 = readNumber(pairs, "21");
    if ([entity.x1, entity.y1, entity.x2, entity.y2].some(Number.isNaN)) return entity;
    entity.supported = true;
  } else if (type === "CIRCLE") {
    entity.cx = readNumber(pairs, "10");
    entity.cy = readNumber(pairs, "20");
    entity.r = readNumber(pairs, "40");
    if ([entity.cx, entity.cy, entity.r].some(Number.isNaN)) return entity;
    entity.supported = true;
  } else if (type === "ARC") {
    entity.cx = readNumber(pairs, "10");
    entity.cy = readNumber(pairs, "20");
    entity.r = readNumber(pairs, "40");
    entity.a1 = readNumber(pairs, "50");
    entity.a2 = readNumber(pairs, "51");
    if ([entity.cx, entity.cy, entity.r, entity.a1, entity.a2].some(Number.isNaN)) return entity;
    entity.supported = true;
  } else if (type === "LWPOLYLINE") {
    entity.points = [];
    entity.closed = ((readNumber(pairs, "70") || 0) & 1) !== 0;
    let point = null;
    const flushPoint = () => {
      if (point && Number.isFinite(point.x) && Number.isFinite(point.y)) {
        entity.points.push(point);
      }
    };
    for (const p of pairs) {
      if (p.code === "10") {
        flushPoint();
        point = { x: parseFloat(p.value), y: NaN, bulge: 0 };
      } else if (p.code === "20" && point) {
        point.y = parseFloat(p.value);
      } else if (p.code === "42" && point) {
        point.bulge = parseFloat(p.value) || 0;
      }
    }
    flushPoint();
    entity.supported = entity.points.length >= 2;
  } else if (type === "ELLIPSE") {
    // DXF ELLIPSE: center (10/20), major axis endpoint relative to center
    // (11/21), ratio of minor to major (40), start param rad (41), end
    // param rad (42). Closure is implicit from the parameter range; group
    // code 70 isn't standard here. Sample to a polyline so the rest of the
    // pipeline treats it like any other contour segment.
    const cx = readNumber(pairs, "10");
    const cy = readNumber(pairs, "20");
    const mxValues = pairs.filter((p) => p.code === "11").map((p) => parseFloat(p.value));
    const myValues = pairs.filter((p) => p.code === "21").map((p) => parseFloat(p.value));
    const mx = Number.isFinite(mxValues[0]) ? mxValues[0] : NaN;
    const my = Number.isFinite(myValues[0]) ? myValues[0] : NaN;
    const ratio = readNumber(pairs, "40");
    const startParam = readNumber(pairs, "41");
    const endParam = readNumber(pairs, "42");
    if ([cx, cy, mx, my, ratio].some(Number.isNaN)) {
      entity.supported = false;
      return entity;
    }
    const center = { x: cx, y: cy };
    const majorAxis = { x: mx, y: my };
    const tStart = Number.isFinite(startParam) ? startParam : 0;
    const tEnd = Number.isFinite(endParam) ? endParam : Math.PI * 2;
    const sweep = Math.abs(tEnd - tStart);
    const fullCircle = Math.abs(sweep - Math.PI * 2) < 1e-6 || sweep <= 0;
    const sampleCount = Math.max(32, Math.ceil(sweep * 32 / Math.PI));
    const polyPoints = sampleEllipsePoints(center, majorAxis, ratio, tStart, fullCircle ? tStart + Math.PI * 2 : tEnd, sampleCount);
    if (polyPoints.length < 2) {
      entity.supported = false;
      return entity;
    }
    entity.originalType = "ELLIPSE";
    entity.type = "LWPOLYLINE";
    entity.points = polyPoints.map((p) => ({ x: p.x, y: p.y, bulge: 0 }));
    entity.closed = fullCircle;
    entity.supported = true;
  } else if (type === "SPLINE") {
    // SPLINE entities are converted to a sampled polyline so the downstream
    // pipeline (rendering, endpoint stitching, length, selection) treats them
    // uniformly. We keep `originalType: "SPLINE"` for diagnostics. Endpoint
    // accuracy is critical for chain closure — we use B-spline evaluation
    // (De Boor's) when control points + knots are present, otherwise fall
    // back to fit points.
    const flag = readNumber(pairs, "70") || 0;
    const degree = Math.max(1, readNumber(pairs, "71") || 3);
    const closed = (flag & 1) !== 0;
    const { fitPoints, controlPoints, knots } = parseSplinePoints(pairs);
    let polyPoints = [];
    if (controlPoints.length > degree && knots.length === controlPoints.length + degree + 1) {
      const sampleCount = Math.max(32, controlPoints.length * 2);
      polyPoints = sampleBSpline(degree, controlPoints, knots, sampleCount);
    }
    if (polyPoints.length < 2 && fitPoints.length >= 2) {
      polyPoints = fitPoints;
    }
    if (polyPoints.length < 2 && controlPoints.length >= 2) {
      polyPoints = controlPoints;
    }
    if (polyPoints.length < 2) {
      entity.supported = false;
      return entity;
    }
    entity.originalType = "SPLINE";
    entity.type = "LWPOLYLINE";
    entity.points = polyPoints.map((p) => ({ x: p.x, y: p.y, bulge: 0 }));
    entity.closed = closed;
    entity.supported = true;
  } else if (type === "TEXT") {
    // Single-line text annotation. We render but don't include in features
    // or geometry editing. Insertion point is (10,20); alignment point (11,21)
    // is used when 72 or 73 are non-zero, but for simple display the insertion
    // point is fine for most engineering drawings.
    const x = readNumber(pairs, "10");
    const y = readNumber(pairs, "20");
    const height = readNumber(pairs, "40");
    const rotation = readNumber(pairs, "50");
    const alignmentX = readNumber(pairs, "11");
    const alignmentY = readNumber(pairs, "21");
    const text = decodeDxfUnicodeEscapes(readFirst(pairs, "1"));
    if ([x, y].some(Number.isNaN) || !text) {
      entity.supported = false;
      return entity;
    }
    entity.originalType = "TEXT";
    entity.text = text;
    entity.x = x;
    entity.y = y;
    entity.height = Number.isFinite(height) && height > 0 ? height : 2.5;
    entity.rotation = Number.isFinite(rotation) ? rotation : 0;
    entity.hasExplicitRotation = Number.isFinite(rotation);
    if (Number.isFinite(alignmentX) && Number.isFinite(alignmentY)) {
      entity.alignmentPoint = { x: alignmentX, y: alignmentY };
    }
    entity.isAnnotation = true;
    entity.supported = true;
  } else if (type === "MTEXT") {
    // Multi-line text. Group code 1 carries the final 250-char chunk; group
    // code 3 holds the earlier 250-char continuations. We concatenate in DXF
    // order. The string contains MTEXT control codes — \P for newline plus
    // \X...; formatting we strip.
    const x = readNumber(pairs, "10");
    const y = readNumber(pairs, "20");
    const height = readNumber(pairs, "40");
    const rotation = readNumber(pairs, "50");
    const directionX = readNumber(pairs, "11");
    const directionY = readNumber(pairs, "21");
    let raw = "";
    for (const p of pairs) {
      if (p.code === "3") raw += p.value;
      else if (p.code === "1") raw += p.value;
    }
    if ([x, y].some(Number.isNaN) || !raw) {
      entity.supported = false;
      return entity;
    }
    entity.originalType = "MTEXT";
    entity.text = decodeMTextString(raw);
    entity.x = x;
    entity.y = y;
    entity.height = Number.isFinite(height) && height > 0 ? height : 2.5;
    entity.rotation = Number.isFinite(rotation) ? rotation : 0;
    entity.hasExplicitRotation = Number.isFinite(rotation);
    if (Number.isFinite(directionX) && Number.isFinite(directionY)) {
      entity.directionVector = { x: directionX, y: directionY };
    }
    entity.isAnnotation = true;
    entity.supported = true;
  } else {
    entity.supported = false;
  }

  return entity;
}

// Strip MTEXT inline formatting codes and convert backslash-P paragraph
// breaks to real newlines so the text renders sensibly. The protection
// step for literal "\\" (backslash-backslash) is omitted because real DXF
// drawings rarely use it and the simpler form is easier to maintain.
function decodeMTextString(raw) {
  let s = decodeDxfUnicodeEscapes(raw);
  // Drop {...} grouping markers (formatting context).
  s = s.replace(/[{}]/g, '');
  // \P -> newline (paragraph break)
  s = s.replace(/\\P/g, '\n');
  // \~ -> non-breaking space
  s = s.replace(/\\~/g, ' ');
  // \fName|stuff; - font specifier, strip
  s = s.replace(/\\f[^;]*;/gi, '');
  // \Hheight; \Wwidth; \Qoblique; \Aalign; \Ccolor; \Tspace; \pTABS;
  s = s.replace(/\\[HWQACTp][^;]*;/g, '');
  // \L \l \O \o \K \k formatting toggles
  s = s.replace(/\\[LlOoKk]/g, '');
  return s;
}

function decodeDxfUnicodeEscapes(raw) {
  return String(raw).replace(/\\U\+([0-9a-f]{4})/gi, (_match, hex) => (
    String.fromCharCode(Number.parseInt(hex, 16))
  ));
}

function readFirst(pairs, code) {
  const p = pairs.find((item) => item.code === code);
  return p ? p.value.trim() : "";
}

function readNumber(pairs, code) {
  const value = readFirst(pairs, code);
  return value === "" ? NaN : parseFloat(value);
}

function setNthValue(pairs, code, nth, value) {
  let seen = 0;
  for (const pair of pairs) {
    if (pair.code === code) {
      seen++;
      if (seen === nth) {
        pair.value = formatNumber(value);
        pair.rawValue = pair.value;
        return;
      }
    }
  }
}

function setOrAppendValue(pairs, code, value) {
  if (pairs.some((pair) => pair.code === code)) {
    setNthValue(pairs, code, 1, value);
    return;
  }
  const formatted = formatNumber(value);
  pairs.push({ code, value: formatted, rawCode: code, rawValue: formatted });
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "0";
  let s = value.toFixed(6);
  s = s.replace(/\.?0+$/, "");
  return s === "-0" ? "0" : s;
}

function pointGridKey(x, y, cellSize) {
  return `${Math.floor(x / cellSize)}:${Math.floor(y / cellSize)}`;
}

function nearbyPointItems(grid, point, cellSize) {
  const cellX = Math.floor(point.x / cellSize);
  const cellY = Math.floor(point.y / cellSize);
  const items = [];
  for (let x = cellX - 1; x <= cellX + 1; x += 1) {
    for (let y = cellY - 1; y <= cellY + 1; y += 1) {
      const bucket = grid.get(`${x}:${y}`);
      if (bucket) items.push(...bucket);
    }
  }
  return items;
}

function connectEntityEndpoints(entities, parent) {
  const grid = new Map();
  for (const entity of entities) {
    for (const point of entityEndpoints(entity)) {
      for (const prior of nearbyPointItems(grid, point, CONNECT_TOL)) {
        if (pointsNear(prior.point, point, CONNECT_TOL)) {
          union(parent, prior.entity.id, entity.id);
        }
      }
      const key = pointGridKey(point.x, point.y, CONNECT_TOL);
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key).push({ entity, point });
    }
  }
}

function createPointClusterer(tolerance) {
  const points = [];
  const grid = new Map();
  const nodeForPoint = (point) => {
    let match = Infinity;
    for (const index of nearbyPointItems(grid, point, tolerance)) {
      if (index < match && pointsNear(points[index], point, tolerance)) match = index;
    }
    if (Number.isFinite(match)) return match;
    const index = points.length;
    points.push(point);
    const key = pointGridKey(point.x, point.y, tolerance);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(index);
    return index;
  };
  return { nodeForPoint, points };
}

function buildFeatures() {
  geometryRevision += 1;
  selectionUiSignature = "";
  measureUiSignature = "";
  featureUiSignature = "";
  if (!state.doc) {
    state.features = [];
    entityByIdMap = new Map();
    featureByIdMap = new Map();
    entityBoundsMap = new Map();
    entitySpatialGrid = new Map();
    spatialOverflowEntities = [];
    return;
  }

  entityByIdMap = new Map(state.doc.entities.map((entity) => [entity.id, entity]));
  const entities = state.doc.entities.filter((e) => e.supported && !e.deleted && !e.isAnnotation);
  for (const e of state.doc.entities) e.featureId = null;

  const parent = new Map();
  for (const e of entities) parent.set(e.id, e.id);

  connectEntityEndpoints(entities, parent);

  const buckets = new Map();
  for (const e of entities) {
    const root = find(parent, e.id);
    if (!buckets.has(root)) buckets.set(root, []);
    buckets.get(root).push(e);
  }

  const featureBuckets = [];
  for (const bucket of buckets.values()) {
    featureBuckets.push(...splitFeatureBucket(bucket));
  }

  const features = [];
  let featureId = 1;
  for (const bucket of featureBuckets) {
    if (!bucket.length) continue;
    features.push(createFeature(featureId++, bucket));
  }

  let outer = null;
  for (const f of features) {
    if (!f.closed) continue;
    if (!outer || bboxArea(f.bbox) > bboxArea(outer.bbox)) outer = f;
  }
  if (!outer) {
    for (const f of features) {
      if (!outer || bboxArea(f.bbox) > bboxArea(outer.bbox)) outer = f;
    }
  }

  for (const f of features) {
    if (outer && f.id === outer.id) {
      f.kind = "outer";
      f.name = "External outline";
    } else if (f.closed) {
      f.kind = "internal";
      f.name = guessInternalName(f);
    } else {
      f.kind = "open";
      f.name = guessOpenName(f);
    }
  }

  state.features = features.sort((a, b) => {
    const order = { outer: 0, internal: 1, open: 2 };
    return order[a.kind] - order[b.kind] || b.entities.length - a.entities.length;
  });
  featureByIdMap = new Map(state.features.map((feature) => [feature.id, feature]));
  rebuildEntitySpatialIndex(entities);
}

function createFeature(id, bucket) {
  const bbox = bboxForEntities(bucket);
  const closed = isClosedFeature(bucket);
  const center = bboxCenter(bbox);
  const feature = {
    id,
    entities: bucket.map((e) => e.id),
    bbox,
    center,
    closed,
    kind: closed ? "internal" : "open",
    name: "",
  };
  for (const e of bucket) e.featureId = feature.id;
  return feature;
}

function splitFeatureBucket(bucket) {
  if (bucket.length <= 1 || isClosedFeature(bucket)) return [bucket];

  const endpointByEntity = new Map();
  const { nodeForPoint } = createPointClusterer(CONNECT_TOL);

  for (const e of bucket) {
    const endpoints = entityEndpoints(e).map(nodeForPoint);
    if (endpoints.length) endpointByEntity.set(e.id, endpoints);
  }

  const coreIds = new Set(bucket.map((e) => e.id));
  const openIds = new Set();
  let changed = true;
  while (changed) {
    changed = false;
    const degree = new Map();
    for (const id of coreIds) {
      for (const node of endpointByEntity.get(id) || []) degree.set(node, (degree.get(node) || 0) + 1);
    }

    for (const id of [...coreIds]) {
      const endpoints = endpointByEntity.get(id) || [];
      if (endpoints.length && endpoints.some((node) => (degree.get(node) || 0) <= 1)) {
        coreIds.delete(id);
        openIds.add(id);
        changed = true;
      }
    }
  }

  const byId = new Map(bucket.map((e) => [e.id, e]));
  const core = [...coreIds].map((id) => byId.get(id)).filter(Boolean);
  if (!openIds.size || !core.length || !isClosedFeature(core)) return [bucket];

  const result = [core];
  for (const openBucket of connectedBuckets([...openIds].map((id) => byId.get(id)).filter(Boolean))) {
    if (openBucket.length) result.push(openBucket);
  }
  return result;
}

function connectedBuckets(entities) {
  if (entities.length <= 1) return entities.length ? [entities] : [];
  const parent = new Map();
  for (const e of entities) parent.set(e.id, e.id);
  connectEntityEndpoints(entities, parent);
  const buckets = new Map();
  for (const e of entities) {
    const root = find(parent, e.id);
    if (!buckets.has(root)) buckets.set(root, []);
    buckets.get(root).push(e);
  }
  return [...buckets.values()];
}

function guessInternalName(feature) {
  const ents = feature.entities.map(entityById).filter(Boolean);
  if (ents.length === 1 && ents[0].type === "CIRCLE") return "Hole";
  if (isRacetrackFeature(feature, ents)) return "Racetrack";
  return "Internal outline";
}

function guessOpenName(feature) {
  const ents = feature.entities.map(entityById).filter(Boolean);
  if (ents.length === 1) return `Raw ${ents[0].type.toLowerCase()}`;
  return "Open contour";
}

function isRacetrackFeature(feature, ents = feature.entities.map(entityById).filter(Boolean)) {
  if (!feature.closed) return false;
  if (ents.length === 1 && isPolylineRacetrack(ents[0])) return true;

  const arcs = ents.filter((e) => e.type === "ARC" && nearlyEqual(arcSweep(e.a1, e.a2), 180, 3));
  const lines = ents.filter((e) => e.type === "LINE");
  if (arcs.length !== 2 || lines.length !== 2 || ents.length !== 4) return false;

  const maxRadius = Math.max(arcs[0].r, arcs[1].r);
  const sameRadius = Math.abs(arcs[0].r - arcs[1].r) <= Math.max(0.25, maxRadius * 0.04);
  const parallel = linesParallel(lines[0], lines[1]);
  const sameLength = nearlyEqual(lineLength(lines[0]), lineLength(lines[1]), Math.max(0.25, lineLength(lines[0]) * 0.04));
  return sameRadius && parallel && sameLength;
}

function isPolylineRacetrack(e) {
  if (e.type !== "LWPOLYLINE" || !e.closed) return false;
  const segments = polylineSegments(e);
  const arcs = segments.filter((segment) => Math.abs(segment.bulge) >= BULGE_TOL);
  const lines = segments.filter((segment) => Math.abs(segment.bulge) < BULGE_TOL);
  if (arcs.length !== 2 || lines.length !== 2 || segments.length !== 4) return false;
  const arcSweeps = arcs.map((segment) => Math.abs((4 * Math.atan(segment.bulge) * 180) / Math.PI));
  return arcSweeps.every((sweep) => nearlyEqual(sweep, 180, 3)) && segmentsParallel(lines[0], lines[1]);
}

function isRectangleFeature(feature) {
  const ents = featureEntities(feature);
  const lines = ents.filter((e) => e.type === "LINE");
  return feature.closed && ents.length === 4 && lines.length === 4 && linesParallel(lines[0], lines[2]) && linesParallel(lines[1], lines[3]);
}

function isRoundedRectangleFeature(feature) {
  const ents = featureEntities(feature);
  return feature.closed && ents.filter((e) => e.type === "LINE").length === 4 && ents.filter((e) => e.type === "ARC").length === 4;
}

function featureArcs(feature) {
  return featureEntities(feature).filter((e) => e.type === "ARC");
}

function averageArcRadius(feature) {
  const arcs = featureArcs(feature);
  if (!arcs.length) return NaN;
  return arcs.reduce((sum, arc) => sum + arc.r, 0) / arcs.length;
}

function featureShape(feature) {
  const ents = featureEntities(feature);
  if (ents.length === 1 && ents[0].type === "CIRCLE") return "hole";
  if (isRacetrackFeature(feature, ents)) return "racetrack";
  if (isRoundedRectangleFeature(feature)) return "rounded-rectangle";
  if (isRectangleFeature(feature)) return "rectangle";
  return feature.closed ? "contour" : "open";
}

function featureDisplayName(feature) {
  const shape = featureShape(feature);
  if (shape === "rectangle") return feature.kind === "outer" ? "External rectangle" : "Rectangle";
  if (shape === "rounded-rectangle") return feature.kind === "outer" ? "External rounded rectangle" : "Rounded rectangle";
  if (shape === "racetrack") return "Racetrack";
  if (shape === "open") return feature.entities.length > 1 ? "Open contour" : feature.name;
  return feature.name;
}

function racetrackMetrics(feature) {
  const ents = featureEntities(feature);
  const arcs = ents.filter((e) => e.type === "ARC");
  if (arcs.length === 2) {
    const r = (arcs[0].r + arcs[1].r) / 2;
    const centerDistance = distance({ x: arcs[0].cx, y: arcs[0].cy }, { x: arcs[1].cx, y: arcs[1].cy });
    return { length: centerDistance + 2 * r, radius: r, arcBased: true };
  }
  const w = feature.bbox.maxX - feature.bbox.minX;
  const h = feature.bbox.maxY - feature.bbox.minY;
  return { length: Math.max(w, h), radius: Math.min(w, h) / 2, arcBased: false };
}

function lineLength(e) {
  return Math.hypot(e.x2 - e.x1, e.y2 - e.y1);
}

function linesParallel(a, b) {
  return segmentsParallel(
    { a: { x: a.x1, y: a.y1 }, b: { x: a.x2, y: a.y2 } },
    { a: { x: b.x1, y: b.y1 }, b: { x: b.x2, y: b.y2 } },
  );
}

function segmentsParallel(a, b) {
  const adx = a.b.x - a.a.x;
  const ady = a.b.y - a.a.y;
  const bdx = b.b.x - b.a.x;
  const bdy = b.b.y - b.a.y;
  const al = Math.hypot(adx, ady);
  const bl = Math.hypot(bdx, bdy);
  if (al <= 0 || bl <= 0) return false;
  return Math.abs((adx * bdy - ady * bdx) / (al * bl)) < 0.04;
}

function nearlyEqual(a, b, tolerance) {
  return Math.abs(a - b) <= tolerance;
}

function find(parent, id) {
  let p = parent.get(id);
  while (p !== parent.get(p)) p = parent.get(p);
  let cur = id;
  while (cur !== p) {
    const next = parent.get(cur);
    parent.set(cur, p);
    cur = next;
  }
  return p;
}

function union(parent, a, b) {
  const ra = find(parent, a);
  const rb = find(parent, b);
  if (ra !== rb) parent.set(rb, ra);
}

function entityEndpoints(e) {
  if (e.type === "LINE") return [{ x: e.x1, y: e.y1 }, { x: e.x2, y: e.y2 }];
  if (e.type === "ARC") return [arcPoint(e, e.a1), arcPoint(e, e.a2)];
  if (e.type === "LWPOLYLINE") {
    if (e.closed) return [];
    return [e.points[0], e.points[e.points.length - 1]];
  }
  return [];
}

function isClosedFeature(entities) {
  if (entities.length === 1 && entities[0].type === "CIRCLE") return true;
  if (entities.length === 1 && entities[0].type === "LWPOLYLINE" && entities[0].closed) return true;

  const { nodeForPoint, points } = createPointClusterer(CONNECT_TOL);
  const counts = [];
  for (const e of entities) {
    for (const point of entityEndpoints(e)) {
      const node = nodeForPoint(point);
      counts[node] = (counts[node] || 0) + 1;
    }
  }
  if (points.length < 1 || counts.reduce((sum, count) => sum + (count || 0), 0) < 2) return false;
  for (const count of counts) {
    if (count < 2 || count % 2 !== 0) return false;
  }
  return true;
}

function bboxForEntities(entities) {
  const box = emptyBox();
  for (const e of entities) expandBoxByEntity(box, e);
  return box;
}

function emptyBox() {
  return { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
}

function expandBox(box, p) {
  box.minX = Math.min(box.minX, p.x);
  box.minY = Math.min(box.minY, p.y);
  box.maxX = Math.max(box.maxX, p.x);
  box.maxY = Math.max(box.maxY, p.y);
}

function expandBoxByEntity(box, e) {
  if (e.type === "LINE") {
    expandBox(box, { x: e.x1, y: e.y1 });
    expandBox(box, { x: e.x2, y: e.y2 });
  } else if (e.type === "CIRCLE") {
    expandBox(box, { x: e.cx - e.r, y: e.cy - e.r });
    expandBox(box, { x: e.cx + e.r, y: e.cy + e.r });
  } else if (e.type === "ARC") {
    for (const p of arcExtremaPoints(e)) expandBox(box, p);
  } else if (e.type === "LWPOLYLINE") {
    for (const segment of polylineSegments(e)) {
      for (const p of bulgeArcExtremaPoints(segment.a, segment.b, segment.bulge)) expandBox(box, p);
    }
  }
}

function bboxArea(box) {
  return Math.max(0, box.maxX - box.minX) * Math.max(0, box.maxY - box.minY);
}

function bboxCenter(box) {
  return { x: (box.minX + box.maxX) / 2, y: (box.minY + box.maxY) / 2 };
}

function rebuildEntitySpatialIndex(entities) {
  entityBoundsMap = new Map();
  entitySpatialGrid = new Map();
  spatialOverflowEntities = [];
  if (!entities.length) return;
  const drawingBox = bboxForEntities(entities);
  const diagonal = Math.hypot(
    drawingBox.maxX - drawingBox.minX,
    drawingBox.maxY - drawingBox.minY,
  );
  entitySpatialCellSize = Math.max(CONNECT_TOL * 4, diagonal / 64, 1e-4);
  for (const entity of entities) {
    const box = bboxForEntities([entity]);
    if (![box.minX, box.minY, box.maxX, box.maxY].every(Number.isFinite)) continue;
    entityBoundsMap.set(entity.id, box);
    const minX = Math.floor(box.minX / entitySpatialCellSize);
    const maxX = Math.floor(box.maxX / entitySpatialCellSize);
    const minY = Math.floor(box.minY / entitySpatialCellSize);
    const maxY = Math.floor(box.maxY / entitySpatialCellSize);
    const cellCount = (maxX - minX + 1) * (maxY - minY + 1);
    if (cellCount > 4096) {
      spatialOverflowEntities.push(entity);
      continue;
    }
    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        const key = `${x}:${y}`;
        if (!entitySpatialGrid.has(key)) entitySpatialGrid.set(key, []);
        entitySpatialGrid.get(key).push(entity);
      }
    }
  }
}

function nearbyEntities(screenPoint, radiusPx = 12) {
  if (!state.doc) return [];
  const world = screenToWorld(screenPoint);
  const radius = radiusPx / Math.max(Math.abs(state.view.scale), 1e-9);
  const query = {
    minX: world.x - radius,
    minY: world.y - radius,
    maxX: world.x + radius,
    maxY: world.y + radius,
  };
  const minX = Math.floor(query.minX / entitySpatialCellSize);
  const maxX = Math.floor(query.maxX / entitySpatialCellSize);
  const minY = Math.floor(query.minY / entitySpatialCellSize);
  const maxY = Math.floor(query.maxY / entitySpatialCellSize);
  const cellCount = (maxX - minX + 1) * (maxY - minY + 1);
  const candidates = new Map();
  if (cellCount > 1024 || !entitySpatialGrid.size) {
    for (const entity of entityByIdMap.values()) candidates.set(entity.id, entity);
  } else {
    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        for (const entity of entitySpatialGrid.get(`${x}:${y}`) || []) {
          candidates.set(entity.id, entity);
        }
      }
    }
    for (const entity of spatialOverflowEntities) candidates.set(entity.id, entity);
  }
  return [...candidates.values()].filter((entity) => {
    if (!entity.supported || entity.deleted) return false;
    const box = entityBoundsMap.get(entity.id);
    return !box || (
      box.minX <= query.maxX
      && box.maxX >= query.minX
      && box.minY <= query.maxY
      && box.maxY >= query.minY
    );
  });
}

function pointsNear(a, b, tol) {
  return Math.hypot(a.x - b.x, a.y - b.y) <= tol;
}

function arcPoint(e, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: e.cx + e.r * Math.cos(rad), y: e.cy + e.r * Math.sin(rad) };
}

function arcSweep(a1, a2) {
  let sweep = a2 - a1;
  while (sweep < 0) sweep += 360;
  while (sweep > 360) sweep -= 360;
  return sweep;
}

function normalizeDegrees(deg) {
  let out = Number(deg) || 0;
  out %= 360;
  if (out < 0) out += 360;
  return out;
}

function sampleArc(e, steps = 24) {
  const sweep = arcSweep(e.a1, e.a2);
  const count = Math.max(4, Math.ceil((sweep / 360) * steps));
  const pts = [];
  for (let i = 0; i <= count; i++) pts.push(arcPoint(e, e.a1 + (sweep * i) / count));
  return pts;
}

function polylineSegments(e) {
  const points = e.points || [];
  const segments = [];
  const limit = e.closed ? points.length : points.length - 1;
  for (let i = 0; i < limit; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    if (a && b) segments.push({ a, b, bulge: Number.isFinite(a.bulge) ? a.bulge : 0 });
  }
  return segments;
}

function samplePolyline(e, steps = 24) {
  const pts = [];
  for (const segment of polylineSegments(e)) {
    const sampled = sampleBulgeSegment(segment.a, segment.b, segment.bulge, steps);
    if (pts.length && sampled.length) sampled.shift();
    pts.push(...sampled);
  }
  return pts;
}

function sampleBulgeSegment(a, b, bulge, steps = 24) {
  if (Math.abs(bulge) < BULGE_TOL) return [a, b];
  const arc = bulgeToArc(a, b, bulge);
  if (!arc) return [a, b];
  const count = Math.max(4, Math.ceil((Math.abs(arc.sweep) / (Math.PI * 2)) * steps));
  const pts = [];
  for (let i = 0; i <= count; i++) {
    const angle = arc.start + (arc.sweep * i) / count;
    pts.push({ x: arc.cx + arc.r * Math.cos(angle), y: arc.cy + arc.r * Math.sin(angle) });
  }
  return pts;
}

function bulgeToArc(a, b, bulge) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const chord = Math.hypot(dx, dy);
  if (chord <= 0) return null;
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const h = (chord * (1 - bulge * bulge)) / (4 * bulge);
  const nx = -dy / chord;
  const ny = dx / chord;
  const cx = mx + nx * h;
  const cy = my + ny * h;
  const r = Math.hypot(a.x - cx, a.y - cy);
  return {
    cx,
    cy,
    r,
    start: Math.atan2(a.y - cy, a.x - cx),
    sweep: 4 * Math.atan(bulge),
  };
}

function entityById(id) {
  return entityByIdMap.get(id);
}

function featureById(id) {
  return featureByIdMap.get(id);
}

function featureByEntity(e) {
  return e?.featureId ? featureById(e.featureId) : null;
}

function isContourFeature(feature) {
  return !!feature?.closed;
}

function isOpenContourFeature(feature) {
  return !!feature && !feature.closed && feature.entities.length > 1;
}

function isGroupedFeature(feature) {
  return isContourFeature(feature) || isOpenContourFeature(feature);
}

function canOffsetFeature(feature) {
  // Virtual entities (expanded from INSERT block references) don't have their
  // own bytes in the DXF — they share the parent INSERT's pair span. An
  // offset applied to them would update the in-memory geometry but the save
  // path skips virtual entities, so the offset would be silently lost. Block
  // offset for features that contain any virtual entity. The user can still
  // measure them.
  if (feature?.entities?.some((id) => entityById(id)?.virtual)) return false;
  return isContourFeature(feature) || isOpenContourFeature(feature);
}

function canAxisOffsetFeature(feature) {
  if (!canOffsetFeature(feature)) return false;
  const shape = featureShape(feature);
  if (shape === "rectangle" || shape === "rounded-rectangle") {
    return featureHasAxisAlignedLines(feature);
  }
  if (shape === "racetrack") {
    const metrics = racetrackMetrics(feature);
    return metrics.arcBased && racetrackAxis(feature) !== null;
  }
  return featureHasOnlyStraightGeometry(feature);
}

function featureHasAxisAlignedLines(feature) {
  const lines = featureEntities(feature).filter((entity) => entity.type === "LINE");
  return lines.length > 0 && lines.every((line) => {
    const dx = Math.abs(line.x2 - line.x1);
    const dy = Math.abs(line.y2 - line.y1);
    const tolerance = Math.max(1e-7, Math.hypot(dx, dy) * 1e-7);
    return dx <= tolerance || dy <= tolerance;
  });
}

function featureHasOnlyStraightGeometry(feature) {
  const entities = featureEntities(feature);
  return entities.length > 0 && entities.every((entity) => {
    if (entity.type === "LINE") return true;
    if (entity.type !== "LWPOLYLINE") return false;
    return polylineSegments(entity).every((segment) => Math.abs(segment.bulge) < BULGE_TOL);
  });
}

function racetrackAxis(feature) {
  const arcs = featureEntities(feature).filter((entity) => entity.type === "ARC");
  if (arcs.length !== 2) return null;
  const dx = Math.abs(arcs[1].cx - arcs[0].cx);
  const dy = Math.abs(arcs[1].cy - arcs[0].cy);
  const tolerance = Math.max(1e-7, Math.max(dx, dy) * 1e-7);
  if (dy <= tolerance && dx > tolerance) return "x";
  if (dx <= tolerance && dy > tolerance) return "y";
  return null;
}

function featureIsDissolved(feature) {
  return !!feature?.entities.length && feature.entities.every((id) => state.dissolvedEntityIds.has(id));
}

function shouldSelectFeatureForEntity(e) {
  const feature = featureByEntity(e);
  return isGroupedFeature(feature) && !featureIsDissolved(feature);
}

function fitView() {
  if (!state.doc) return;
  const entities = state.doc.entities.filter((e) => e.supported && !e.deleted && !e.isAnnotation);
  const box = fitBoxForEntities(entities);
  if (!Number.isFinite(box.minX)) return;
  const { w, h } = screenSize();
  const bw = Math.max(1, box.maxX - box.minX);
  const bh = Math.max(1, box.maxY - box.minY);
  const scale = Math.min((w * 0.88) / bw, (h * 0.88) / bh);
  state.view.scale = scale;
  state.view.fitScale = scale;
  state.view.ox = w / 2 - ((box.minX + box.maxX) / 2) * scale;
  state.view.oy = h / 2 + ((box.minY + box.maxY) / 2) * scale;
  render();
}

function fitPointsForEntity(entity) {
  if (entity.type === "LINE") {
    return [{ x: entity.x1, y: entity.y1 }, { x: entity.x2, y: entity.y2 }];
  }
  if (entity.type === "CIRCLE") {
    return [
      { x: entity.cx - entity.r, y: entity.cy },
      { x: entity.cx + entity.r, y: entity.cy },
      { x: entity.cx, y: entity.cy - entity.r },
      { x: entity.cx, y: entity.cy + entity.r },
    ];
  }
  if (entity.type === "ARC") return sampleArc(entity, 12);
  if (entity.type === "LWPOLYLINE") {
    const points = entity.points || [];
    const stride = Math.max(1, Math.ceil(points.length / 128));
    return points.filter((_point, index) => index % stride === 0 || index === points.length - 1);
  }
  return [];
}

function fitBoxForEntities(entities) {
  const full = bboxForEntities(entities);
  if (!Number.isFinite(full.minX)) return full;
  const points = entities.flatMap(fitPointsForEntity)
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (points.length < 16) return full;

  const xs = points.map((point) => point.x).sort((a, b) => a - b);
  const ys = points.map((point) => point.y).sort((a, b) => a - b);
  const trim = Math.max(1, Math.min(
    Math.floor(points.length * 0.02),
    Math.floor((points.length - 4) / 2),
  ));
  const trimmed = {
    minX: xs[trim],
    maxX: xs[xs.length - trim - 1],
    minY: ys[trim],
    maxY: ys[ys.length - trim - 1],
  };
  const fullWidth = Math.max(0, full.maxX - full.minX);
  const fullHeight = Math.max(0, full.maxY - full.minY);
  const trimmedWidth = Math.max(0, trimmed.maxX - trimmed.minX);
  const trimmedHeight = Math.max(0, trimmed.maxY - trimmed.minY);
  const useTrimmedX = trimmedWidth > 0 && fullWidth > trimmedWidth * 3.5;
  const useTrimmedY = trimmedHeight > 0 && fullHeight > trimmedHeight * 3.5;
  if (!useTrimmedX && !useTrimmedY) return full;

  const paddingX = trimmedWidth * 0.08;
  const paddingY = trimmedHeight * 0.08;
  return {
    minX: useTrimmedX ? Math.max(full.minX, trimmed.minX - paddingX) : full.minX,
    maxX: useTrimmedX ? Math.min(full.maxX, trimmed.maxX + paddingX) : full.maxX,
    minY: useTrimmedY ? Math.max(full.minY, trimmed.minY - paddingY) : full.minY,
    maxY: useTrimmedY ? Math.min(full.maxY, trimmed.maxY + paddingY) : full.maxY,
  };
}

function renderCanvasNow() {
  const { w, h } = screenSize();
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#050607";
  ctx.fillRect(0, 0, w, h);

  if (!state.doc) {
    drawGrid(w, h);
    return;
  }

  drawGrid(w, h);

  for (const e of state.doc.entities) {
    if (!e.supported || e.deleted) continue;
    const feature = featureById(e.featureId);
    const selected = isEntitySelected(e.id) || (feature && isFeatureSelected(feature.id));
    const measured = state.mode === "measure" && state.measureEntityIds.includes(e.id);
    const color = selected ? SELECTION_COLOR : measured ? "#6f4cff" : colorForFeature(feature);
    drawEntity(e, color, selected || measured ? 2.4 : 1.4);
  }

  for (const p of state.measure) drawPointMarker(p, "#ffcc66", 5);
  if (state.measure.length === 2) drawMeasureLine(state.measure[0], state.measure[1]);
  if (state.hoverSnap) drawPointMarker(state.hoverSnap.point, SNAP_COLOR, 4);
  if (state.selectionBox) drawSelectionBox();
  if (state.pickingLine && state.pickHoverEntity) drawEntity(state.pickHoverEntity, "#39ff88", 3.2);
  drawRepairCompareOverlay();
  drawDxfOriginMarker(ctx, worldToScreen({ x: 0, y: 0 }), {
    width: w,
    height: h,
    viewScale: state.view.scale,
    fitScale: state.view.fitScale,
  });
  drawDxfCoordinateSystem(ctx, w, h);
}

function render() {
  if (renderFramePending) return;
  renderFramePending = true;
  requestAnimationFrame(() => {
    renderFramePending = false;
    renderCanvasNow();
  });
}

function drawRepairCompareOverlay() {
  if (!state.repairCompareVisible || !state.repairCompareOriginal?.length) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const path of state.repairCompareOriginal) {
    if (!path || path.length < 2) continue;
    ctx.beginPath();
    const start = worldToScreen(path[0]);
    ctx.moveTo(start.x, start.y);
    for (let i = 1; i < path.length; i++) {
      const pt = worldToScreen(path[i]);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.strokeStyle = "rgba(240, 169, 29, 0.55)";
    ctx.lineWidth = Math.max(0.08 * state.view.scale, 0.6);
    ctx.stroke();
  }
  const fixed = state.repairCompareFixed;
  if (fixed?.length >= 2) {
    ctx.beginPath();
    const first = worldToScreen(fixed[0]);
    ctx.moveTo(first.x, first.y);
    for (let i = 0; i < fixed.length; i++) {
      const a = fixed[i];
      const b = fixed[(i + 1) % fixed.length];
      const seg = bulgeToArc(a, b, a.bulge || 0);
      if (seg && Math.abs(a.bulge || 0) > BULGE_TOL) {
        const steps = clamp(Math.ceil(Math.abs(seg.sweep * seg.r) / Math.max(0.05, 0.5 / state.view.scale)), 4, 48);
        for (let k = 1; k <= steps; k++) {
          const t = k / steps;
          const ang = seg.start + seg.sweep * t;
          const pt = worldToScreen({ x: seg.cx + seg.r * Math.cos(ang), y: seg.cy + seg.r * Math.sin(ang) });
          ctx.lineTo(pt.x, pt.y);
        }
      } else {
        const pt = worldToScreen(b);
        ctx.lineTo(pt.x, pt.y);
      }
    }
    ctx.closePath();
    ctx.strokeStyle = "rgba(92, 200, 255, 0.95)";
    ctx.lineWidth = Math.max(0.12 * state.view.scale, 0.9);
    ctx.stroke();
  }
  ctx.restore();
}

function drawGrid(w, h) {
  const stepWorld = niceGridStep(70 / state.view.scale);
  if (!Number.isFinite(stepWorld) || stepWorld <= 0) return;
  const topLeft = screenToWorld({ x: 0, y: 0 });
  const bottomRight = screenToWorld({ x: w, y: h });
  const minX = Math.floor(topLeft.x / stepWorld) * stepWorld;
  const maxX = Math.ceil(bottomRight.x / stepWorld) * stepWorld;
  const minY = Math.floor(bottomRight.y / stepWorld) * stepWorld;
  const maxY = Math.ceil(topLeft.y / stepWorld) * stepWorld;

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.055)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = minX; x <= maxX; x += stepWorld) {
    const sx = worldToScreen({ x, y: 0 }).x;
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, h);
  }
  for (let y = minY; y <= maxY; y += stepWorld) {
    const sy = worldToScreen({ x: 0, y }).y;
    ctx.moveTo(0, sy);
    ctx.lineTo(w, sy);
  }
  ctx.stroke();
  ctx.restore();
}

function niceGridStep(raw) {
  const pow = 10 ** Math.floor(Math.log10(raw || 1));
  const n = raw / pow;
  if (n < 2) return pow;
  if (n < 5) return 2 * pow;
  return 5 * pow;
}

function colorForFeature(feature) {
  if (!feature) return "#d7dde4";
  if (feature.kind === "outer") return "#e8edf2";
  if (feature.kind === "internal") return "#5cc8ff";
  return "#ffcc66";
}

function drawEntity(e, color, width) {
  if (e.isAnnotation) {
    drawAnnotation(e, color);
    return;
  }

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  if (e.type === "LINE") {
    moveToWorld({ x: e.x1, y: e.y1 });
    lineToWorld({ x: e.x2, y: e.y2 });
  } else if (e.type === "CIRCLE") {
    const c = worldToScreen({ x: e.cx, y: e.cy });
    ctx.moveTo(c.x + e.r * state.view.scale, c.y);
    ctx.arc(c.x, c.y, Math.abs(e.r * state.view.scale), 0, Math.PI * 2);
  } else if (e.type === "ARC") {
    const c = worldToScreen({ x: e.cx, y: e.cy });
    const start = (-e.a1 * Math.PI) / 180;
    const end = (-e.a2 * Math.PI) / 180;
    const ccw = arcSweep(e.a1, e.a2) > 0;
    ctx.arc(c.x, c.y, Math.abs(e.r * state.view.scale), start, end, ccw);
  } else if (e.type === "LWPOLYLINE") {
    samplePolyline(e, 48).forEach((p, i) => (i === 0 ? moveToWorld(p) : lineToWorld(p)));
    if (e.closed) ctx.closePath();
  }

  ctx.stroke();
  ctx.restore();
}

// Annotations (TEXT / MTEXT) get their own draw path. We use canvas fillText
// with size scaled from world units, anchored at the DXF insertion point.
// DXF text grows upward (positive Y); screen Y is inverted so we use
// textBaseline = "alphabetic" and translate-then-rotate around the anchor.
function drawAnnotation(e, color) {
  const pos = worldToScreen({ x: e.x, y: e.y });
  const pxHeight = Math.max(8, Math.min(220, e.height * state.view.scale));
  const lines = String(e.text || "").split(/\r?\n|\\n/);
  if (!lines.length) return;
  ctx.save();
  ctx.translate(pos.x, pos.y);
  if (e.rotation) {
    // DXF rotation is CCW positive; canvas Y is inverted relative to DXF Y,
    // so a positive DXF rotation maps to a negative canvas rotation.
    ctx.rotate((-e.rotation * Math.PI) / 180);
  }
  ctx.fillStyle = color === "#5cc8ff" || color === undefined ? "#e6c477" : color;
  ctx.font = `${pxHeight}px "Segoe UI", sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  // DXF anchors single-line TEXT at the baseline of the insertion point.
  // Multi-line MTEXT anchors at the top of the first line — we use top
  // alignment for MTEXT and stack lines downward.
  if (e.originalType === "MTEXT") {
    ctx.textBaseline = "top";
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 0, i * pxHeight * 1.2);
    }
  } else {
    ctx.fillText(lines[0], 0, 0);
  }
  ctx.restore();
}

function moveToWorld(p) {
  const s = worldToScreen(p);
  ctx.moveTo(s.x, s.y);
}

function lineToWorld(p) {
  const s = worldToScreen(p);
  ctx.lineTo(s.x, s.y);
}

function drawPointMarker(p, color, size) {
  const s = worldToScreen(p);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(s.x - size, s.y);
  ctx.lineTo(s.x + size, s.y);
  ctx.moveTo(s.x, s.y - size);
  ctx.lineTo(s.x, s.y + size);
  ctx.stroke();
  ctx.restore();
}

function drawMeasureLine(a, b) {
  ctx.save();
  ctx.strokeStyle = "#ffcc66";
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  moveToWorld(a);
  lineToWorld(b);
  ctx.stroke();
  ctx.restore();
}

function drawSelectionBox() {
  const box = normalizedScreenRect(state.selectionBox.start, state.selectionBox.current);
  ctx.save();
  ctx.fillStyle = "rgba(92, 200, 255, 0.12)";
  ctx.strokeStyle = "#5cc8ff";
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1;
  ctx.fillRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
  ctx.strokeRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
  ctx.restore();
}

function selectEntity(id, additive = false) {
  if (!additive) clearSelection({ renderNow: false });
  state.selectedEntityIds.add(id);
  syncUi();
  render();
}

function toggleEntitySelection(id) {
  state.selectedFeatureIds.clear();
  if (state.selectedEntityIds.has(id)) state.selectedEntityIds.delete(id);
  else state.selectedEntityIds.add(id);
  syncUi();
  render();
}

function selectFeature(id, additive = false) {
  const feature = featureById(id);
  if (!feature) return;
  if (!additive) clearSelection({ renderNow: false });
  state.selectedFeatureIds.add(id);
  syncUi();
  render();
}

function toggleFeatureSelection(id) {
  state.selectedEntityIds.clear();
  if (state.selectedFeatureIds.has(id)) state.selectedFeatureIds.delete(id);
  else state.selectedFeatureIds.add(id);
  syncUi();
  render();
}

function isEntitySelected(id) {
  return state.selectedEntityIds.has(id);
}

function isFeatureSelected(id) {
  return state.selectedFeatureIds.has(id);
}

function clearSelection({ renderNow = true } = {}) {
  state.selectedEntityIds.clear();
  state.selectedFeatureIds.clear();
  state.selectionBox = null;
  syncUi();
  if (renderNow) render();
}

function clearMeasure() {
  state.measure = [];
  state.measureDetails = [];
  state.measureEntityIds = [];
}

function deleteSelection() {
  if ((!state.selectedEntityIds.size && !state.selectedFeatureIds.size) || !state.doc || state.readOnly) return;
  pushUndoSnapshot();
  const ids = new Set(state.selectedEntityIds);
  for (const feature of selectedFeatures()) {
    for (const id of feature.entities) ids.add(id);
  }
  for (const id of ids) {
    const e = entityById(id);
    if (!e) continue;
    // Virtual entities are expansions of an INSERT block reference; they
    // don't have their own bytes in the file. Deleting one would silently
    // do nothing on save (confusing). If the user wants to remove an
    // INSERT instance, they can select the placeholder via the feature list
    // or remove it manually in their CAD tool. Skip virtual entities here.
    if (e.virtual) continue;
    e.deleted = true;
  }
  // A redraw must not silently regroup the surviving pieces of a contour the
  // user explicitly dissolved. Only remove IDs that no longer exist; the
  // Rebuild button is the sole action that clears the remaining dissolve state.
  for (const id of ids) state.dissolvedEntityIds.delete(id);
  clearSelection({ renderNow: false });
  rebuild();
  updateDirty();
}

function cleanupRecordForEntity(entity) {
  let points = [];
  let closed = false;
  if (entity.type === "LINE") {
    points = [
      { x: entity.x1, y: entity.y1 },
      { x: entity.x2, y: entity.y2 },
    ];
  } else if (entity.type === "ARC") {
    points = sampleArc(entity, 96);
  } else if (entity.type === "CIRCLE") {
    points = [];
    for (let index = 0; index <= 96; index += 1) {
      const angle = (index / 96) * Math.PI * 2;
      points.push({
        x: entity.cx + entity.r * Math.cos(angle),
        y: entity.cy + entity.r * Math.sin(angle),
      });
    }
    closed = true;
  } else if (entity.type === "LWPOLYLINE") {
    points = samplePolyline(entity, 96);
    closed = !!entity.closed;
    if (closed && points.length && !pointsNear(points[0], points.at(-1), CONNECT_TOL)) {
      points.push({ ...points[0] });
    }
  }
  return {
    id: entity.id,
    type: entity.type,
    closed,
    points,
  };
}

const preventCleanupCloseDuringAnalysis = (event) => event.preventDefault();

function showCleanupProgress(relaxed) {
  ui.cleanupStatus.textContent = "Analyzing contours...";
  ui.cleanupSummary.textContent = relaxed
    ? "Looking for unambiguous nested offsets and strongly proven branched outer networks. The drawing remains responsive while this runs."
    : "Looking for bridge-proven narrow offset strips. The drawing remains responsive while this runs.";
  ui.cleanupProgress.removeAttribute("value");
  ui.cleanupApplyBtn.hidden = false;
  ui.cleanupApplyBtn.disabled = true;
  ui.cleanupCancelBtn.textContent = "Cancel";
  ui.cleanupCancelBtn.disabled = true;
  if (ui.cleanupRelaxedToggle) ui.cleanupRelaxedToggle.disabled = true;
  ui.cleanupDialog.addEventListener("cancel", preventCleanupCloseDuringAnalysis);
  if (!ui.cleanupDialog.open) ui.cleanupDialog.showModal();
}

function waitForCleanupDecision({ canApply }) {
  ui.cleanupDialog.removeEventListener("cancel", preventCleanupCloseDuringAnalysis);
  ui.cleanupApplyBtn.hidden = !canApply;
  ui.cleanupApplyBtn.disabled = !canApply;
  ui.cleanupCancelBtn.disabled = false;
  ui.cleanupCancelBtn.textContent = canApply ? "Cancel" : "Close";
  if (ui.cleanupRelaxedToggle) ui.cleanupRelaxedToggle.disabled = false;
  return new Promise((resolve) => {
    const finish = (decision) => {
      ui.cleanupApplyBtn.removeEventListener("click", onApply);
      ui.cleanupCancelBtn.removeEventListener("click", onCancelClick);
      ui.cleanupDialog.removeEventListener("cancel", onCancel);
      ui.cleanupRelaxedToggle?.removeEventListener("change", onModeChange);
      resolve(decision);
    };
    const onApply = () => finish("apply");
    const onCancelClick = () => finish("cancel");
    const onCancel = (event) => {
      event.preventDefault();
      finish("cancel");
    };
    const onModeChange = () => finish("reanalyze");
    ui.cleanupApplyBtn.addEventListener("click", onApply);
    ui.cleanupCancelBtn.addEventListener("click", onCancelClick);
    ui.cleanupDialog.addEventListener("cancel", onCancel);
    ui.cleanupRelaxedToggle?.addEventListener("change", onModeChange);
  });
}

async function removeChamfersAndFillets() {
  if (!state.doc || state.readOnly || state.cleanupBusy) return;
  const editableEntities = state.doc.entities.filter((entity) => (
    entity.supported
    && !entity.deleted
    && !entity.isAnnotation
    && !entity.virtual
    && GEOM_TYPES.has(entity.type)
  ));
  state.cleanupBusy = true;
  syncUi();
  if (ui.cleanupRelaxedToggle) ui.cleanupRelaxedToggle.checked = false;
  try {
    while (true) {
      const relaxed = !!ui.cleanupRelaxedToggle?.checked;
      showCleanupProgress(relaxed);
      await nextPaint();
      const plan = await geometryWorker.run("chamfer-fillet-plan", {
        records: editableEntities.map(cleanupRecordForEntity),
        options: {
          connectTolerance: CONNECT_TOL,
          maxOffsetWidth: 2,
          relaxed,
        },
      });
      const deleteIds = plan.deleteIds instanceof Set ? plan.deleteIds : new Set(plan.deleteIds || []);
      ui.cleanupProgress.max = 1;
      ui.cleanupProgress.value = 1;
      if (!plan.strips.length || !deleteIds.size) {
        ui.cleanupStatus.textContent = relaxed
          ? "No strongly proven relaxed cleanup found"
          : "No bridge-proven strips found";
        ui.cleanupSummary.textContent = relaxed
          ? "Nothing was changed. Less-safe mode still requires either an unambiguous close contour pair or at least four coherent short bridges isolating one unique global outer contour."
          : "Nothing was changed. Tick less-safe mode to also test unambiguous close contour pairs and complex bridged outer networks.";
        const decision = await waitForCleanupDecision({ canApply: false });
        if (decision === "reanalyze") continue;
        return;
      }
      const widths = plan.strips.map((strip) => strip.offset);
      const minimumWidth = Math.min(...widths);
      const maximumWidth = Math.max(...widths);
      const widthText = Math.abs(maximumWidth - minimumWidth) < 0.01
        ? `${fmt(maximumWidth)} mm`
        : `${fmt(minimumWidth)}-${fmt(maximumWidth)} mm`;
      const relaxedCount = plan.strips.filter((strip) => (
        String(strip.proof || "").startsWith("relaxed-")
      )).length;
      ui.cleanupStatus.textContent = relaxedCount
        ? `${plan.strips.length} strip(s) detected (${relaxedCount} relaxed)`
        : `${plan.strips.length} bridge-proven strip(s) detected`;
      const relaxedWarning = relaxedCount
        ? " Relaxed matches are opt-in; inspect the result before saving."
        : "";
      ui.cleanupSummary.textContent = `${deleteIds.size} of ${editableEntities.length} entities will be removed (detected offset ${widthText}). The outermost exterior edge and innermost hole edges will be kept.${relaxedWarning} You can undo with Ctrl+Z before saving.`;
      const decision = await waitForCleanupDecision({ canApply: true });
      if (decision === "reanalyze") continue;
      if (decision !== "apply") return;
      pushUndoSnapshot();
      for (const id of deleteIds) {
        const entity = entityById(id);
        if (entity && !entity.virtual) entity.deleted = true;
        state.dissolvedEntityIds.delete(id);
      }
      clearSelection({ renderNow: false });
      rebuild();
      updateDirty();
      return;
    }
  } catch (error) {
    console.error(error);
    ui.cleanupProgress.max = 1;
    ui.cleanupProgress.value = 1;
    ui.cleanupStatus.textContent = "Analysis failed";
    ui.cleanupSummary.textContent = error?.message || String(error);
    await waitForCleanupDecision({ canApply: false });
  } finally {
    ui.cleanupDialog.removeEventListener("cancel", preventCleanupCloseDuringAnalysis);
    if (ui.cleanupDialog.open) ui.cleanupDialog.close();
    state.cleanupBusy = false;
    syncUi();
    render();
  }
}

function dissolveSelection() {
  const features = new Map();
  for (const feature of selectedFeatures()) {
    if (isGroupedFeature(feature)) features.set(feature.id, feature);
  }
  for (const entity of selectedRawEntities()) {
    const feature = featureByEntity(entity);
    if (isGroupedFeature(feature)) features.set(feature.id, feature);
  }
  if (!features.size) return;
  for (const feature of features.values()) {
    for (const id of feature.entities) state.dissolvedEntityIds.add(id);
  }
  clearSelection();
}

function selectionHasDissolvableContours() {
  return selectedFeatures().some(isGroupedFeature) || selectedRawEntities().some((e) => isGroupedFeature(featureByEntity(e)));
}

function rebuildRecognizedFeatures() {
  if (!state.dissolvedEntityIds.size) return;
  state.dissolvedEntityIds.clear();
  clearSelection({ renderNow: false });
  rebuild();
}

function mirrorPoint(point, direction, center) {
  if (direction === "left-right") return { x: center.x * 2 - point.x, y: point.y };
  return { x: point.x, y: center.y * 2 - point.y };
}

function mirrorAngle(deg, direction) {
  return normalizeDegrees(direction === "left-right" ? 180 - deg : -deg);
}

function mirrorEntity(entity, direction, center) {
  if (entity.type === "LINE") {
    const a = mirrorPoint({ x: entity.x1, y: entity.y1 }, direction, center);
    const b = mirrorPoint({ x: entity.x2, y: entity.y2 }, direction, center);
    entity.x1 = a.x;
    entity.y1 = a.y;
    entity.x2 = b.x;
    entity.y2 = b.y;
  } else if (entity.type === "CIRCLE") {
    const c = mirrorPoint({ x: entity.cx, y: entity.cy }, direction, center);
    entity.cx = c.x;
    entity.cy = c.y;
  } else if (entity.type === "ARC") {
    const c = mirrorPoint({ x: entity.cx, y: entity.cy }, direction, center);
    const oldA1 = entity.a1;
    const oldA2 = entity.a2;
    entity.cx = c.x;
    entity.cy = c.y;
    entity.a1 = mirrorAngle(oldA2, direction);
    entity.a2 = mirrorAngle(oldA1, direction);
  } else if (entity.type === "LWPOLYLINE") {
    entity.points = (entity.points || []).map((point) => {
      const p = mirrorPoint(point, direction, center);
      return { ...p, bulge: -(Number(point.bulge) || 0) };
    });
    entity.forceRebuildPairs = true;
  } else {
    return false;
  }
  entity.modified = true;
  return true;
}

function mirrorSupportedGeometry(direction) {
  const entities = state.doc?.entities
    ?.filter((e) => e.supported && !e.deleted && !e.virtual && GEOM_TYPES.has(e.type)) || [];
  if (!entities.length) return { ok: false, error: "No supported geometry found to mirror." };
  const box = bboxForEntities(entities);
  if (!Number.isFinite(box.minX) || !Number.isFinite(box.minY) || !Number.isFinite(box.maxX) || !Number.isFinite(box.maxY)) {
    return { ok: false, error: "Could not calculate a valid drawing bounding box." };
  }
  const center = bboxCenter(box);
  let mirrored = 0;
  for (const entity of entities) {
    if (mirrorEntity(entity, direction, center)) mirrored++;
  }
  return { ok: mirrored > 0, mirrored, center };
}

function askMirrorDirection() {
  if (!ui.mirrorDialog?.showModal) {
    return Promise.resolve(window.confirm("Mirror left/right? Cancel mirrors top/bottom.") ? "left-right" : "top-bottom");
  }

  return new Promise((resolve) => {
    const finish = (direction) => {
      cleanup();
      if (ui.mirrorDialog.open) ui.mirrorDialog.close();
      resolve(direction);
    };
    const onLeftRight = () => finish("left-right");
    const onTopBottom = () => finish("top-bottom");
    const onCancelClick = () => finish("");
    const onCancel = (event) => {
      event.preventDefault();
      finish("");
    };
    const cleanup = () => {
      ui.mirrorLeftRightBtn?.removeEventListener("click", onLeftRight);
      ui.mirrorTopBottomBtn?.removeEventListener("click", onTopBottom);
      ui.mirrorCancelBtn?.removeEventListener("click", onCancelClick);
      ui.mirrorDialog?.removeEventListener("cancel", onCancel);
    };

    ui.mirrorLeftRightBtn?.addEventListener("click", onLeftRight);
    ui.mirrorTopBottomBtn?.addEventListener("click", onTopBottom);
    ui.mirrorCancelBtn?.addEventListener("click", onCancelClick);
    ui.mirrorDialog?.addEventListener("cancel", onCancel);
    ui.mirrorDialog.showModal();
  });
}

function mirrorPathFor(filePath) {
  const source = String(filePath || "");
  const slash = Math.max(source.lastIndexOf("\\"), source.lastIndexOf("/"));
  const dir = slash >= 0 ? source.slice(0, slash + 1) : "";
  const base = slash >= 0 ? source.slice(slash + 1) : source;
  const match = /^(.*?)(\.[dD][xX][fF])?$/.exec(base);
  const name = match?.[1] || "drawing";
  const ext = match?.[2] || ".dxf";
  return `${dir}${name}_mirror${ext}`;
}

function basenameOfPath(filePath) {
  const source = String(filePath || "");
  const slash = Math.max(source.lastIndexOf("\\"), source.lastIndexOf("/"));
  return slash >= 0 ? source.slice(slash + 1) : source;
}

async function writeMirrorCopy(currentPath, text) {
  if (desktopApi?.writeMirrorCopy) return desktopApi.writeMirrorCopy(currentPath, text);
  if (!desktopApi?.writeFile || !desktopApi?.claimFile) throw new Error("Desktop file writer is unavailable.");
  const mirrorPath = mirrorPathFor(currentPath);
  await desktopApi.claimFile(mirrorPath);
  await desktopApi.writeFile(mirrorPath, text);
  if (desktopApi.listDxfFolder) {
    const listed = await desktopApi.listDxfFolder(mirrorPath);
    return { path: mirrorPath, name: basenameOfPath(mirrorPath), files: listed.files || [], index: listed.index ?? 0 };
  }
  return { path: mirrorPath, name: basenameOfPath(mirrorPath), files: [], index: 0 };
}

async function mirrorCurrentDxf() {
  if (!state.doc || state.mirrorBusy || state.readOnly) return;
  const direction = await askMirrorDirection();
  if (!direction) return;

  const current = currentFile();
  const originalText = serializeDxf();
  const originalDirty = state.dirty;
  const originalSavedText = state.savedText;
  const originalUndo = state.undoStack.slice();
  const restoreOriginal = () => {
    loadDxfText(originalText, { preserveView: true });
    state.dirty = originalDirty;
    state.savedText = originalSavedText;
    state.undoStack = originalUndo;
    syncUi();
  };

  state.mirrorBusy = true;
  syncUi();
  try {
    const result = mirrorSupportedGeometry(direction);
    if (!result.ok) throw new Error(result.error || "Mirror failed.");
    const mirrorText = serializeDxf();

    if (current?.path && desktopApi) {
      let mirror;
      try {
        mirror = await writeMirrorCopy(current.path, mirrorText);
      } catch (error) {
        if (desktopApi?.claimFile && current.path) {
          try { await desktopApi.claimFile(current.path); } catch {}
        }
        restoreOriginal();
        throw error;
      }
      if (mirror?.files?.length) {
        state.files = mirror.files;
        state.fileIndex = Math.max(0, mirror.index ?? state.fileIndex);
      }
      if (mirror?.path && desktopApi?.claimFile) {
        const lockState = await desktopApi.claimFile(mirror.path);
        state.readOnly = !!lockState?.readOnly;
        state.readOnlyReason = lockState?.reason || null;
      }
      loadDxfText(mirrorText);
      state.savedText = serializeDxf();
      state.dirty = false;
      state.undoStack = [];
      state.selectedEntityIds.clear();
      state.selectedFeatureIds.clear();
      state.dissolvedEntityIds.clear();
      if (!mirror?.path) {
        state.readOnly = false;
        state.readOnlyReason = null;
      }
      rebuild();
      fitView();
      ui.hud.textContent = `Mirrored DXF saved${mirror?.name ? `: ${mirror.name}` : ""}. ${result.mirrored} entit${result.mirrored === 1 ? "y" : "ies"} mirrored.`;
      return;
    }

    const baseName = current?.name ? current.name.replace(/\.dxf$/i, "") : "drawing";
    await downloadText(mirrorText, `${baseName}_mirror.dxf`);
    restoreOriginal();
  } catch (error) {
    restoreOriginal();
    alert(`Mirror failed: ${error.message || error}`);
  } finally {
    state.mirrorBusy = false;
    syncUi();
  }
}

function canRotateCurrentDrawing() {
  return !state.readOnly || state.readOnlyReason === "dwg-conversion";
}

function drawingBodyBoxForRotation() {
  const bodyEntities = state.doc?.entities?.filter((entity) => (
    entity.supported
    && !entity.deleted
    && !entity.isAnnotation
    && GEOM_TYPES.has(entity.type)
  )) || [];
  const bodyBox = fitBoxForEntities(bodyEntities);
  if ([bodyBox.minX, bodyBox.minY, bodyBox.maxX, bodyBox.maxY].every(Number.isFinite)) {
    return bodyBox;
  }

  // Annotation-only drawings are uncommon, but rotating around their own
  // anchors is still safer than falling back to the DXF coordinate origin.
  const anchorBox = emptyBox();
  for (const entity of state.doc?.entities || []) {
    if (entity.deleted || entity.virtual) continue;
    if (entity.isAnnotation && Number.isFinite(entity.x) && Number.isFinite(entity.y)) {
      expandBox(anchorBox, { x: entity.x, y: entity.y });
    } else if (entity.type === "INSERT" && entity.insertTransform) {
      expandBox(anchorBox, {
        x: entity.insertTransform.tx,
        y: entity.insertTransform.ty,
      });
    }
  }
  return anchorBox;
}

function clearStaleOriginalComparison() {
  state.repairCompareVisible = false;
  state.repairCompareOriginal = null;
  state.repairCompareFixed = null;
  state.repairCompareDeviation = null;
  state.originalOverlaySourcePath = null;
}

function rotateCurrentDrawing() {
  if (!state.doc || state.rotateBusy || !canRotateCurrentDrawing()) return;
  const box = drawingBodyBoxForRotation();
  if (![box.minX, box.minY, box.maxX, box.maxY].every(Number.isFinite)) {
    alert("Rotate failed: no supported drawing geometry was found.");
    return;
  }

  const candidates = state.doc.entities.filter((entity) => (
    !entity.deleted
    && !entity.virtual
    && (GEOM_TYPES.has(entity.type) || entity.isAnnotation || entity.type === "INSERT")
  ));
  if (!candidates.length) {
    alert("Rotate failed: no supported drawing geometry was found.");
    return;
  }

  const center = bboxCenter(box);
  pushUndoSnapshot();
  state.rotateBusy = true;
  syncUi();
  let rotated = 0;
  for (const entity of candidates) {
    if (rotateEntityInPlace(entity, center, CLOCKWISE_QUARTER_TURN_DEGREES)) rotated++;
  }

  if (!rotated) {
    state.undoStack.pop();
    state.rotateBusy = false;
    syncUi();
    return;
  }

  // Reparse so modified INSERT parents regenerate their virtual children at
  // the saved transform, then refit around the body instead of the origin.
  const rotatedText = serializeDxf();
  loadDxfText(rotatedText, { preserveView: true });
  clearStaleOriginalComparison();
  updateDirty();
  state.rotateBusy = false;
  syncUi();
  fitView();
  const outputHint = state.readOnlyReason === "dwg-conversion"
    ? " Use Save As to write the rotated drawing as DXF."
    : " Use Save to keep this rotation.";
  ui.hud.textContent = `Rotated 90 degrees clockwise around the drawing center.${outputHint}`;
}

// --- Scale ---------------------------------------------------------------
// Independent-axis version of scalePoint/scaleEntities (app.js:2200/2185).
// Kept separate from those so the existing feature-size-editing callers
// (setEntitiesSize, offsetEntitiesAroundCenter) are untouched. CIRCLE/ARC
// can't represent a true ellipse, so under non-uniform scale their radius
// is scaled by the geometric mean of scaleX/scaleY (exact when scaleX===scaleY).
function scalePointXY(p, center, scaleX, scaleY) {
  return {
    x: center.x + (p.x - center.x) * scaleX,
    y: center.y + (p.y - center.y) * scaleY,
  };
}

function scaleEntitiesXY(entities, center, scaleX, scaleY) {
  const radiusScale = Math.sqrt(Math.abs(scaleX) * Math.abs(scaleY));
  for (const e of entities) {
    if (e.type === "LINE") {
      const p1 = scalePointXY({ x: e.x1, y: e.y1 }, center, scaleX, scaleY);
      const p2 = scalePointXY({ x: e.x2, y: e.y2 }, center, scaleX, scaleY);
      e.x1 = p1.x; e.y1 = p1.y; e.x2 = p2.x; e.y2 = p2.y;
    } else if (e.type === "CIRCLE" || e.type === "ARC") {
      const c = scalePointXY({ x: e.cx, y: e.cy }, center, scaleX, scaleY);
      e.cx = c.x; e.cy = c.y; e.r *= radiusScale;
    } else if (e.type === "LWPOLYLINE") {
      e.points = e.points.map((p) => ({ ...scalePointXY(p, center, scaleX, scaleY), bulge: p.bulge || 0 }));
    } else {
      continue;
    }
    e.modified = true;
  }
}

function scaleSupportedGeometry(scaleX, scaleY) {
  const entities = state.doc?.entities
    ?.filter((e) => e.supported && !e.deleted && !e.virtual && GEOM_TYPES.has(e.type)) || [];
  if (!entities.length) return { ok: false, error: "No supported geometry found to scale." };
  if (!(Number.isFinite(scaleX) && scaleX > 0) || !(Number.isFinite(scaleY) && scaleY > 0)) {
    return { ok: false, error: "Scale factors must be positive numbers." };
  }
  scaleEntitiesXY(entities, { x: 0, y: 0 }, scaleX, scaleY);
  return { ok: true, scaled: entities.length };
}

function setScaleStep(step) {
  ui.scaleModeChooser.hidden = step !== "chooser";
  ui.scaleXYFieldset.hidden = step !== "xy";
  ui.scaleLineFieldset.hidden = step !== "line";
  ui.scaleUniformFieldset.hidden = step !== "uniform";
  ui.scaleBackBtn.hidden = step === "chooser";
  ui.scaleApplyBtn.hidden = step === "chooser";
}

function resetScaleLinePick() {
  ui.scaleLinePickedInfo.hidden = true;
  ui.scaleLinePickedInfo.textContent = "";
  ui.scaleLineLengthInput.value = "";
  ui.scaleLineLengthInput.disabled = true;
  ui.scaleLineHint.textContent = 'Click "Pick line", then click a straight line in the drawing.';
}

// Temporarily takes over canvas clicks to let the user pick a raw LINE entity,
// bypassing the normal contour/feature grouping (Selection Edit mode can only
// select whole contours). Resolves the picked entity, or null if cancelled.
function pickLineForScale() {
  return new Promise((resolve) => {
    state.pickingLine = true;
    state.pickHoverEntity = null;
    canvas.classList.add("picking-line");
    ui.hud.textContent = "Click a line to use as the scale reference. Press Esc to cancel.";
    const wasOpen = ui.scaleDialog.open;
    if (wasOpen) ui.scaleDialog.close();
    render();

    const finish = (entity) => {
      cleanup();
      state.pickingLine = false;
      state.pickHoverEntity = null;
      canvas.classList.remove("picking-line");
      if (wasOpen) ui.scaleDialog.showModal();
      syncUi();
      render();
      resolve(entity || null);
    };
    const onMove = (event) => {
      const p = pointerPos(event);
      const hit = hitTest(p);
      state.pickHoverEntity = hit?.entity?.type === "LINE" ? hit.entity : null;
      render();
    };
    const onClick = (event) => {
      if (event.button !== 0) return;
      const p = pointerPos(event);
      const hit = hitTest(p);
      if (hit?.entity?.type === "LINE") finish(hit.entity);
    };
    const onKey = (event) => {
      if (event.key === "Escape") finish(null);
    };
    const cleanup = () => {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey, true);
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey, true);
  });
}

// Promise-based dialog flow: returns { scaleX, scaleY } or null if cancelled.
function askScaleOptions() {
  return new Promise((resolve) => {
    setScaleStep("chooser");
    resetScaleLinePick();
    ui.scaleXInput.value = "100";
    ui.scaleYInput.value = "100";
    ui.scaleUniformInput.value = "100";
    let pickedLine = null;
    let step = "chooser";

    const finish = (result) => {
      cleanup();
      if (ui.scaleDialog.open) ui.scaleDialog.close();
      resolve(result);
    };
    const goStep = (next) => {
      step = next;
      setScaleStep(next);
    };
    const onXY = () => goStep("xy");
    const onLine = () => goStep("line");
    const onUniform = () => goStep("uniform");
    const onBack = () => {
      pickedLine = null;
      resetScaleLinePick();
      goStep("chooser");
    };
    const onCancel = () => finish(null);
    const onDialogCancel = (event) => {
      event.preventDefault();
      finish(null);
    };
    const onPickLine = async () => {
      const entity = await pickLineForScale();
      if (!entity) return;
      pickedLine = entity;
      const length = Math.hypot(entity.x2 - entity.x1, entity.y2 - entity.y1);
      pickedLine.__pickedLength = length;
      ui.scaleLinePickedInfo.hidden = false;
      ui.scaleLinePickedInfo.textContent = `Picked line length: ${fmt(length)} mm`;
      ui.scaleLineHint.textContent = "Enter the new length this line should have.";
      ui.scaleLineLengthInput.disabled = false;
      ui.scaleLineLengthInput.value = fmt(length);
    };
    const onApply = () => {
      if (step === "xy") {
        const x = Number(ui.scaleXInput.value) / 100;
        const y = Number(ui.scaleYInput.value) / 100;
        if (!(x > 0) || !(y > 0)) { alert("Enter positive scale factors."); return; }
        finish({ scaleX: x, scaleY: y });
      } else if (step === "uniform") {
        const s = Number(ui.scaleUniformInput.value) / 100;
        if (!(s > 0)) { alert("Enter a positive scale factor."); return; }
        finish({ scaleX: s, scaleY: s });
      } else if (step === "line") {
        if (!pickedLine) { alert("Pick a line first."); return; }
        const newLength = Number(ui.scaleLineLengthInput.value);
        if (!(newLength > 0)) { alert("Enter a positive target length."); return; }
        const s = newLength / pickedLine.__pickedLength;
        if (!Number.isFinite(s) || s <= 0) { alert("Could not compute a scale factor from this line."); return; }
        finish({ scaleX: s, scaleY: s });
      }
    };
    const cleanup = () => {
      ui.scaleModeXYBtn.removeEventListener("click", onXY);
      ui.scaleModeLineBtn.removeEventListener("click", onLine);
      ui.scaleModeUniformBtn.removeEventListener("click", onUniform);
      ui.scaleBackBtn.removeEventListener("click", onBack);
      ui.scaleApplyBtn.removeEventListener("click", onApply);
      ui.scalePickLineBtn.removeEventListener("click", onPickLine);
      ui.scaleCancelBtn.removeEventListener("click", onCancel);
      ui.scaleDialog.removeEventListener("cancel", onDialogCancel);
    };

    ui.scaleModeXYBtn.addEventListener("click", onXY);
    ui.scaleModeLineBtn.addEventListener("click", onLine);
    ui.scaleModeUniformBtn.addEventListener("click", onUniform);
    ui.scaleBackBtn.addEventListener("click", onBack);
    ui.scaleApplyBtn.addEventListener("click", onApply);
    ui.scalePickLineBtn.addEventListener("click", onPickLine);
    ui.scaleCancelBtn.addEventListener("click", onCancel);
    ui.scaleDialog.addEventListener("cancel", onDialogCancel);
    ui.scaleDialog.showModal();
  });
}

function scalePathFor(filePath) {
  const source = String(filePath || "");
  const slash = Math.max(source.lastIndexOf("\\"), source.lastIndexOf("/"));
  const dir = slash >= 0 ? source.slice(0, slash + 1) : "";
  const base = slash >= 0 ? source.slice(slash + 1) : source;
  const match = /^(.*?)(\.[dD][xX][fF])?$/.exec(base);
  const name = match?.[1] || "drawing";
  const ext = match?.[2] || ".dxf";
  return `${dir}${name}_scaled${ext}`;
}

async function writeScaleCopy(currentPath, text) {
  if (desktopApi?.writeScaleCopy) return desktopApi.writeScaleCopy(currentPath, text);
  if (!desktopApi?.writeFile || !desktopApi?.claimFile) throw new Error("Desktop file writer is unavailable.");
  const scalePath = scalePathFor(currentPath);
  await desktopApi.claimFile(scalePath);
  await desktopApi.writeFile(scalePath, text);
  if (desktopApi.listDxfFolder) {
    const listed = await desktopApi.listDxfFolder(scalePath);
    return { path: scalePath, name: basenameOfPath(scalePath), files: listed.files || [], index: listed.index ?? 0 };
  }
  return { path: scalePath, name: basenameOfPath(scalePath), files: [], index: 0 };
}

async function scaleCurrentDxf() {
  if (!state.doc || state.scaleBusy || state.readOnly) return;
  const options = await askScaleOptions();
  if (!options) return;

  const current = currentFile();
  const originalText = serializeDxf();
  const originalDirty = state.dirty;
  const originalSavedText = state.savedText;
  const originalUndo = state.undoStack.slice();
  const restoreOriginal = () => {
    loadDxfText(originalText, { preserveView: true });
    state.dirty = originalDirty;
    state.savedText = originalSavedText;
    state.undoStack = originalUndo;
    syncUi();
  };

  state.scaleBusy = true;
  syncUi();
  try {
    const result = scaleSupportedGeometry(options.scaleX, options.scaleY);
    if (!result.ok) throw new Error(result.error || "Scale failed.");
    const scaleText = serializeDxf();

    if (current?.path && desktopApi) {
      let scaled;
      try {
        scaled = await writeScaleCopy(current.path, scaleText);
      } catch (error) {
        if (desktopApi?.claimFile && current.path) {
          try { await desktopApi.claimFile(current.path); } catch {}
        }
        restoreOriginal();
        throw error;
      }
      if (scaled?.files?.length) {
        state.files = scaled.files;
        state.fileIndex = Math.max(0, scaled.index ?? state.fileIndex);
      }
      if (scaled?.path && desktopApi?.claimFile) {
        const lockState = await desktopApi.claimFile(scaled.path);
        state.readOnly = !!lockState?.readOnly;
        state.readOnlyReason = lockState?.reason || null;
      }
      loadDxfText(scaleText);
      state.savedText = serializeDxf();
      state.dirty = false;
      state.undoStack = [];
      state.selectedEntityIds.clear();
      state.selectedFeatureIds.clear();
      state.dissolvedEntityIds.clear();
      if (!scaled?.path) {
        state.readOnly = false;
        state.readOnlyReason = null;
      }
      rebuild();
      fitView();
      ui.hud.textContent = `Scaled DXF saved${scaled?.name ? `: ${scaled.name}` : ""}. ${result.scaled} entit${result.scaled === 1 ? "y" : "ies"} scaled.`;
      return;
    }

    const baseName = current?.name ? current.name.replace(/\.dxf$/i, "") : "drawing";
    await downloadText(scaleText, `${baseName}_scaled.dxf`);
    restoreOriginal();
  } catch (error) {
    restoreOriginal();
    alert(`Scale failed: ${error.message || error}`);
  } finally {
    state.scaleBusy = false;
    syncUi();
  }
}

function applySelectionOffset(delta) {
  if (!Number.isFinite(delta) || state.readOnly) return;
  if (Math.abs(delta) <= Number.EPSILON) return;
  const features = selectedFeatures().filter(canOffsetFeature);
  if (!features.length) return;
  const plans = features.map((feature) => planUniformOffset(feature, delta));
  const invalid = plans.find((plan) => !plan.ok);
  if (invalid) {
    alert(invalid.message);
    return;
  }
  transformSelectedFeatures(() => {
    for (const plan of plans) plan.apply();
  });
}

function applySelectionAxisOffset(deltaX, deltaY) {
  if (!Number.isFinite(deltaX) || !Number.isFinite(deltaY) || state.readOnly) return;
  if (Math.abs(deltaX) <= Number.EPSILON && Math.abs(deltaY) <= Number.EPSILON) return;
  const features = selectedFeatures().filter(canAxisOffsetFeature);
  if (!features.length) return;
  const plans = features.map((feature) => planAxisOffset(feature, deltaX, deltaY));
  const invalid = plans.find((plan) => !plan.ok);
  if (invalid) {
    alert(invalid.message);
    return;
  }
  transformSelectedFeatures(() => {
    for (const plan of plans) plan.apply();
  }, canAxisOffsetFeature);
}

function planAxisOffset(feature, deltaX, deltaY) {
  const shape = featureShape(feature);
  const width = feature.bbox.maxX - feature.bbox.minX;
  const height = feature.bbox.maxY - feature.bbox.minY;
  const dimensions = axisOffsetDimensions(width, height, deltaX, deltaY);
  const targetWidth = dimensions?.targetWidth;
  const targetHeight = dimensions?.targetHeight;
  const name = featureDisplayName(feature);
  if (!dimensions || targetWidth <= 0.002 || targetHeight <= 0.002) {
    return { ok: false, message: `${name}: X/Y offset would collapse or invert the contour.` };
  }

  if (shape === "rectangle") {
    return {
      ok: true,
      apply: () => setRectangleGeometry(feature, targetWidth, targetHeight),
    };
  }

  if (shape === "rounded-rectangle") {
    const radius = averageArcRadius(feature);
    if (targetWidth <= 2 * radius + 0.002 || targetHeight <= 2 * radius + 0.002) {
      return { ok: false, message: `${name}: X/Y offset leaves too little room for the existing corner radius.` };
    }
    return {
      ok: true,
      apply: () => setRoundedRectangleGeometry(feature, targetWidth, targetHeight, radius),
    };
  }

  if (shape === "racetrack") {
    const axis = racetrackAxis(feature);
    const metrics = racetrackMetrics(feature);
    const length = metrics.length + 2 * (axis === "x" ? deltaX : deltaY);
    const radius = metrics.radius + (axis === "x" ? deltaY : deltaX);
    if (!axis || radius <= 0.001 || length <= 2 * radius + 0.002) {
      return { ok: false, message: `${name}: X/Y offset would collapse its straight or rounded section.` };
    }
    return {
      ok: true,
      apply: () => setRacetrackGeometry(feature, length, radius),
    };
  }

  if (!featureHasOnlyStraightGeometry(feature)) {
    return { ok: false, message: `${name}: independent X/Y offset is unavailable because it would turn circular arcs into broken ellipses.` };
  }
  if ((width <= 1e-9 && Math.abs(deltaX) > 1e-9) || (height <= 1e-9 && Math.abs(deltaY) > 1e-9)) {
    return { ok: false, message: `${name}: a zero-width or zero-height contour cannot be offset on that axis.` };
  }
  return {
    ok: true,
    apply: () => scaleStraightFeatureAxes(feature, dimensions.scaleX, dimensions.scaleY),
  };
}

function planUniformOffset(feature, delta) {
  const shape = featureShape(feature);
  if (
    (shape === "contour" || shape === "open")
    && featureHasOnlyStraightGeometry(feature)
  ) {
    // The old radial fallback used the farthest vertex as its scale reference.
    // On a non-square contour that made a 1 mm request change X and Y by
    // unrelated amounts. Equal directional offsets are the exact same operation
    // the user requested, so reuse that proven bbox-based transform.
    return planAxisOffset(feature, delta, delta);
  }
  return {
    ok: true,
    apply: () => offsetFeature(feature, delta),
  };
}

function scaleStraightFeatureAxes(feature, scaleX, scaleY) {
  const center = feature.center;
  const transform = (point) => scalePointByAxes(point, center, scaleX, scaleY);
  for (const entity of featureEntities(feature)) {
    if (entity.type === "LINE") {
      const start = transform({ x: entity.x1, y: entity.y1 });
      const end = transform({ x: entity.x2, y: entity.y2 });
      entity.x1 = start.x;
      entity.y1 = start.y;
      entity.x2 = end.x;
      entity.y2 = end.y;
    } else if (entity.type === "LWPOLYLINE") {
      for (const point of entity.points) {
        const next = transform(point);
        point.x = next.x;
        point.y = next.y;
      }
    }
  }
}

function applySelectedFeatureSize(size) {
  if (!Number.isFinite(size) || size <= 0 || state.readOnly) return;
  transformSelectedContours((features) => {
    for (const feature of features) setFeatureMaxSize(feature, size);
  });
}

function applySelectedFeatureWidth(width) {
  if (!Number.isFinite(width) || width <= 0 || state.readOnly) return;
  transformSelectedContours((features) => {
    for (const feature of features) setFeatureWidth(feature, width);
  });
}

function applySelectedFeatureHeight(height) {
  if (!Number.isFinite(height) || height <= 0 || state.readOnly) return;
  transformSelectedContours((features) => {
    for (const feature of features) setFeatureHeight(feature, height);
  });
}

function applySelectedFeatureLength(length) {
  if (!Number.isFinite(length) || length <= 0 || state.readOnly) return;
  transformSelectedContours((features) => {
    for (const feature of features) setRacetrackLength(feature, length);
  });
}

function applySelectedFeatureRadius(radius) {
  if (!Number.isFinite(radius) || radius <= 0 || state.readOnly) return;
  transformSelectedContours((features) => {
    for (const feature of features) setFeatureRadius(feature, radius);
  });
}

function transformSelectedFeatures(fn, predicate = canOffsetFeature) {
  const features = selectedFeatures().filter(predicate);
  if (!features.length || state.readOnly) return;
  pushUndoSnapshot();
  fn(features);
  for (const feature of features) {
    for (const e of featureEntities(feature)) e.modified = true;
  }
  rebuild();
  updateDirty();
}

function transformSelectedContours(fn) {
  transformSelectedFeatures(fn, isContourFeature);
}

function selectedEntities() {
  if (!state.doc) return [];
  const ids = new Set(state.selectedEntityIds);
  for (const feature of selectedFeatures()) {
    for (const id of feature.entities) ids.add(id);
  }
  return [...ids].map(entityById).filter((e) => e && !e.deleted);
}

function selectedFeatures() {
  return [...state.selectedFeatureIds].map(featureById).filter(Boolean);
}

function selectedRawEntities() {
  return [...state.selectedEntityIds].map(entityById).filter((e) => e && !e.deleted);
}

function featureEntities(feature) {
  return feature.entities.map(entityById).filter((e) => e && !e.deleted);
}

function editRawEntity(e, mutator) {
  if (!e || state.readOnly) return;
  pushUndoSnapshot();
  mutator(e);
  e.modified = true;
  rebuild();
  state.selectedEntityIds.add(e.id);
  updateDirty();
}

function applyRawLineLength(e, length) {
  if (!Number.isFinite(length) || length <= 0) return;
  editRawEntity(e, (line) => setLineLength(line, length));
}

function applyRawPointValue(e, pointName, axis, value) {
  if (!Number.isFinite(value)) return;
  editRawEntity(e, (entity) => {
    const key = `${pointName}${axis}`;
    entity[key] = value;
  });
}

function applyRawCenterValue(e, axis, value) {
  if (!Number.isFinite(value)) return;
  editRawEntity(e, (entity) => {
    entity[axis === "x" ? "cx" : "cy"] = value;
  });
}

function applyRawRadius(e, radius) {
  if (!Number.isFinite(radius) || radius <= 0) return;
  editRawEntity(e, (entity) => {
    entity.r = radius;
  });
}

function applyRawAngle(e, key, angle) {
  if (!Number.isFinite(angle)) return;
  editRawEntity(e, (entity) => {
    entity[key] = angle;
  });
}

function offsetEntitiesAroundCenter(entities, center, delta) {
  if (entities.length === 1 && entities[0].type === "CIRCLE") {
    entities[0].r = Math.max(0.001, entities[0].r + delta);
    return;
  }

  const points = [];
  for (const e of entities) points.push(...entityReferencePoints(e));
  const maxR = Math.max(...points.map((p) => Math.hypot(p.x - center.x, p.y - center.y)));
  if (!Number.isFinite(maxR) || maxR <= 0) return;
  const scale = Math.max(0.001, (maxR + delta) / maxR);
  scaleEntities(entities, center, scale);
}

function offsetFeature(feature, delta) {
  const shape = featureShape(feature);
  const w = feature.bbox.maxX - feature.bbox.minX;
  const h = feature.bbox.maxY - feature.bbox.minY;
  if (shape === "hole") {
    setFeatureRadius(feature, averageFeatureRadius(feature) + delta);
  } else if (shape === "rectangle") {
    setFeatureDimensions(feature, w + 2 * delta, h + 2 * delta);
  } else if (shape === "rounded-rectangle") {
    setRoundedRectangleGeometry(feature, w + 2 * delta, h + 2 * delta, averageArcRadius(feature) + delta);
  } else if (shape === "racetrack") {
    const metrics = racetrackMetrics(feature);
    setRacetrackGeometry(feature, metrics.length + 2 * delta, metrics.radius + delta);
  } else {
    offsetEntitiesAroundCenter(featureEntities(feature), feature.center, delta);
  }
}

function setEntitiesSize(entities, center, bbox, size) {
  if (entities.length === 1 && entities[0].type === "CIRCLE") {
    entities[0].r = size / 2;
    return;
  }
  if (entities.length === 1 && entities[0].type === "LINE") {
    setLineLength(entities[0], size);
    return;
  }
  const current = Math.max(bbox.maxX - bbox.minX, bbox.maxY - bbox.minY);
  if (current <= 0) return;
  scaleEntities(entities, center, size / current);
}

function setFeatureMaxSize(feature, size) {
  const shape = featureShape(feature);
  if (!["hole", "rectangle", "rounded-rectangle", "racetrack"].includes(shape)) return;
  const entities = featureEntities(feature);
  if (shape === "rectangle" || shape === "rounded-rectangle") {
    const w = feature.bbox.maxX - feature.bbox.minX;
    const h = feature.bbox.maxY - feature.bbox.minY;
    const current = Math.max(w, h);
    if (current > 0) setFeatureDimensions(feature, (w * size) / current, (h * size) / current);
  } else if (shape === "racetrack") {
    setRacetrackLength(feature, size);
  } else {
    setEntitiesSize(entities, feature.center, feature.bbox, size);
  }
}

function setFeatureWidth(feature, width) {
  const h = feature.bbox.maxY - feature.bbox.minY;
  setFeatureDimensions(feature, width, h);
}

function setFeatureHeight(feature, height) {
  const w = feature.bbox.maxX - feature.bbox.minX;
  setFeatureDimensions(feature, w, height);
}

function setFeatureDimensions(feature, width, height) {
  const shape = featureShape(feature);
  width = Math.max(0.001, width);
  height = Math.max(0.001, height);
  if (shape === "rounded-rectangle") {
    setRoundedRectangleGeometry(feature, width, height, averageArcRadius(feature));
  } else if (shape === "rectangle") {
    setRectangleGeometry(feature, width, height);
  }
}

function setFeatureRadius(feature, radius) {
  const entities = featureEntities(feature);
  const shape = featureShape(feature);
  if (shape === "rounded-rectangle") {
    setRoundedRectangleGeometry(feature, feature.bbox.maxX - feature.bbox.minX, feature.bbox.maxY - feature.bbox.minY, radius);
    return;
  }
  if (shape === "racetrack") {
    setRacetrackGeometry(feature, racetrackMetrics(feature).length, radius);
    return;
  }
  if (entities.length === 1 && entities[0].type === "CIRCLE") {
    entities[0].r = Math.max(0.001, radius);
    return;
  }

  const arcs = entities.filter((e) => e.type === "ARC");
  if (!arcs.length) return;
  const endpointMap = mapArcEndpoints(arcs);
  for (const arc of arcs) arc.r = radius;
  retargetLinesToArcEndpoints(entities, endpointMap);
}

function setRacetrackLength(feature, length) {
  if (featureShape(feature) !== "racetrack") return;
  setRacetrackGeometry(feature, length, racetrackMetrics(feature).radius);
}

function setRacetrackGeometry(feature, length, radius) {
  const entities = featureEntities(feature);
  const arcs = entities.filter((e) => e.type === "ARC");
  if (arcs.length !== 2) {
    setFeatureMaxSize(feature, length);
    return;
  }

  const endpointMap = mapArcEndpoints(arcs);
  radius = Math.max(0.001, Math.min(radius, length / 2 - 0.001));
  const dx = arcs[1].cx - arcs[0].cx;
  const dy = arcs[1].cy - arcs[0].cy;
  const currentCenterDistance = Math.hypot(dx, dy);
  if (currentCenterDistance <= 0) return;
  const ux = dx / currentCenterDistance;
  const uy = dy / currentCenterDistance;
  const center = {
    x: (arcs[0].cx + arcs[1].cx) / 2,
    y: (arcs[0].cy + arcs[1].cy) / 2,
  };
  const halfDistance = Math.max(0, length / 2 - radius);
  arcs[0].r = radius;
  arcs[1].r = radius;
  arcs[0].cx = center.x - ux * halfDistance;
  arcs[0].cy = center.y - uy * halfDistance;
  arcs[1].cx = center.x + ux * halfDistance;
  arcs[1].cy = center.y + uy * halfDistance;
  retargetLinesToArcEndpoints(entities, endpointMap);
}

function setRoundedRectangleGeometry(feature, width, height, radius) {
  const arcs = featureArcs(feature);
  if (arcs.length !== 4) return;
  radius = Math.max(0.001, Math.min(radius, width / 2 - 0.001, height / 2 - 0.001));
  const endpointMap = mapArcEndpoints(arcs);
  for (const arc of arcs) {
    const sx = arc.cx >= feature.center.x ? 1 : -1;
    const sy = arc.cy >= feature.center.y ? 1 : -1;
    arc.cx = feature.center.x + sx * (width / 2 - radius);
    arc.cy = feature.center.y + sy * (height / 2 - radius);
    arc.r = radius;
  }
  retargetLinesToArcEndpoints(featureEntities(feature), endpointMap);
}

function setRectangleGeometry(feature, width, height) {
  const entities = featureEntities(feature);
  for (const line of entities.filter((e) => e.type === "LINE")) {
    const p1 = resizeRectPoint({ x: line.x1, y: line.y1 }, feature.center, width, height);
    const p2 = resizeRectPoint({ x: line.x2, y: line.y2 }, feature.center, width, height);
    line.x1 = p1.x;
    line.y1 = p1.y;
    line.x2 = p2.x;
    line.y2 = p2.y;
  }
}

function resizeRectPoint(point, center, width, height) {
  return {
    x: center.x + (point.x >= center.x ? width / 2 : -width / 2),
    y: center.y + (point.y >= center.y ? height / 2 : -height / 2),
  };
}

function averageFeatureRadius(feature) {
  const entities = featureEntities(feature);
  if (entities.length === 1 && entities[0].type === "CIRCLE") return entities[0].r;
  return averageArcRadius(feature);
}

function mapArcEndpoints(arcs) {
  const endpoints = [];
  for (const arc of arcs) {
    endpoints.push({ key: `${arc.id}:start`, before: arcPoint(arc, arc.a1), arc, angle: "a1" });
    endpoints.push({ key: `${arc.id}:end`, before: arcPoint(arc, arc.a2), arc, angle: "a2" });
  }
  return endpoints;
}

function retargetLinesToArcEndpoints(entities, endpointMap) {
  const used = new Set();
  for (const line of entities.filter((e) => e.type === "LINE")) {
    const p1 = nearestArcEndpoint({ x: line.x1, y: line.y1 }, endpointMap, used);
    if (p1) {
      used.add(p1.key);
      const next = arcPoint(p1.arc, p1.arc[p1.angle]);
      line.x1 = next.x;
      line.y1 = next.y;
    }
    const p2 = nearestArcEndpoint({ x: line.x2, y: line.y2 }, endpointMap, used);
    if (p2) {
      used.add(p2.key);
      const next = arcPoint(p2.arc, p2.arc[p2.angle]);
      line.x2 = next.x;
      line.y2 = next.y;
    }
  }
}

function nearestArcEndpoint(point, endpoints, used) {
  let best = null;
  for (const endpoint of endpoints) {
    if (used.has(endpoint.key)) continue;
    const d = distance(point, endpoint.before);
    if (!best || d < best.distance) best = { ...endpoint, distance: d };
  }
  return best;
}

function setLineLength(e, length) {
  const mid = { x: (e.x1 + e.x2) / 2, y: (e.y1 + e.y2) / 2 };
  const dx = e.x2 - e.x1;
  const dy = e.y2 - e.y1;
  const len = Math.hypot(dx, dy);
  if (len <= 0) return;
  const ux = dx / len;
  const uy = dy / len;
  e.x1 = mid.x - (ux * length) / 2;
  e.y1 = mid.y - (uy * length) / 2;
  e.x2 = mid.x + (ux * length) / 2;
  e.y2 = mid.y + (uy * length) / 2;
}

function scaleEntities(entities, center, scale) {
  for (const e of entities) {
    if (e.type === "LINE") {
      const p1 = scalePoint({ x: e.x1, y: e.y1 }, center, scale);
      const p2 = scalePoint({ x: e.x2, y: e.y2 }, center, scale);
      e.x1 = p1.x; e.y1 = p1.y; e.x2 = p2.x; e.y2 = p2.y;
    } else if (e.type === "CIRCLE" || e.type === "ARC") {
      const c = scalePoint({ x: e.cx, y: e.cy }, center, scale);
      e.cx = c.x; e.cy = c.y; e.r *= Math.abs(scale);
    } else if (e.type === "LWPOLYLINE") {
      e.points = e.points.map((p) => ({ ...scalePoint(p, center, scale), bulge: p.bulge || 0 }));
    }
  }
}

function scalePoint(p, center, scale) {
  return {
    x: center.x + (p.x - center.x) * scale,
    y: center.y + (p.y - center.y) * scale,
  };
}

function entityReferencePoints(e) {
  if (e.type === "LINE") return [{ x: e.x1, y: e.y1 }, { x: e.x2, y: e.y2 }];
  if (e.type === "CIRCLE") return [
    { x: e.cx + e.r, y: e.cy },
    { x: e.cx - e.r, y: e.cy },
    { x: e.cx, y: e.cy + e.r },
    { x: e.cx, y: e.cy - e.r },
  ];
  if (e.type === "ARC") return sampleArc(e, 16);
  if (e.type === "LWPOLYLINE") return samplePolyline(e, 16);
  return [];
}

function hitTest(screenPoint) {
  if (!state.doc) return null;
  let best = null;
  for (const e of nearbyEntities(screenPoint, HIT_PX + 2)) {
    const d = distanceToEntityScreen(e, screenPoint);
    if (d <= HIT_PX && (!best || d < best.distance)) best = { entity: e, distance: d };
  }
  return best;
}

function distanceToEntityScreen(e, sp) {
  if (e.type === "LINE") {
    return distPointSegment(sp, worldToScreen({ x: e.x1, y: e.y1 }), worldToScreen({ x: e.x2, y: e.y2 }));
  }
  if (e.type === "CIRCLE") {
    const c = worldToScreen({ x: e.cx, y: e.cy });
    return Math.abs(Math.hypot(sp.x - c.x, sp.y - c.y) - Math.abs(e.r * state.view.scale));
  }
  if (e.type === "ARC") {
    let best = Infinity;
    const pts = sampleArc(e, 48).map(worldToScreen);
    for (let i = 0; i < pts.length - 1; i++) best = Math.min(best, distPointSegment(sp, pts[i], pts[i + 1]));
    return best;
  }
  if (e.type === "LWPOLYLINE") {
    let best = Infinity;
    const pts = samplePolyline(e, 48).map(worldToScreen);
    for (let i = 0; i < pts.length - 1; i++) best = Math.min(best, distPointSegment(sp, pts[i], pts[i + 1]));
    return best;
  }
  return Infinity;
}

function distPointSegment(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 <= 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function nearestSnap(screenPoint) {
  if (!state.doc) return null;
  const candidates = [];
  const tangentReference = state.measure.length === 1 ? state.measure[0] : null;
  for (const e of nearbyEntities(screenPoint, 15)) {
    addEntitySnapCandidates(candidates, e, screenPoint, tangentReference);
  }
  for (const f of state.features) {
    candidates.push({ point: f.center, label: `${f.name} center`, priority: 3 });
  }
  let best = null;
  for (const c of candidates) {
    const s = worldToScreen(c.point);
    const d = Math.hypot(s.x - screenPoint.x, s.y - screenPoint.y) - (c.priority || 0);
    if (d <= 12 && (!best || d < best.distance)) best = { ...c, distance: d };
  }
  return best;
}

function addEntitySnapCandidates(candidates, e, screenPoint, tangentReference = null) {
  if (e.type === "LINE") {
    const a = { x: e.x1, y: e.y1 };
    const b = { x: e.x2, y: e.y2 };
    candidates.push({ point: a, label: "line endpoint", priority: 3, entity: e });
    candidates.push({ point: b, label: "line endpoint", priority: 3, entity: e });
    candidates.push({ point: projectScreenToWorldSegment(screenPoint, a, b), label: "line", priority: 0, entity: e });
  } else if (e.type === "CIRCLE") {
    candidates.push({ point: { x: e.cx, y: e.cy }, label: "circle center", priority: 5, entity: e });
    for (const point of circleQuadrantPoints(e)) {
      candidates.push({ point, label: "circle quadrant", priority: 4, entity: e });
    }
    if (tangentReference) {
      for (const point of tangentPointsToCircle(tangentReference, e)) {
        candidates.push({ point, label: "circle tangent", priority: 5, entity: e });
      }
    }
    candidates.push({ point: nearestPointOnCircle(screenPoint, e), label: "circle", priority: 0, entity: e });
  } else if (e.type === "ARC") {
    candidates.push({ point: { x: e.cx, y: e.cy }, label: "arc center", priority: 5, entity: e });
    candidates.push({ point: arcPoint(e, e.a1), label: "arc endpoint", priority: 3, entity: e });
    candidates.push({ point: arcPoint(e, e.a2), label: "arc endpoint", priority: 3, entity: e });
    for (const point of arcQuadrantPoints(e)) {
      candidates.push({ point, label: "arc quadrant", priority: 4, entity: e });
    }
    if (tangentReference) {
      for (const point of tangentPointsToCircle(tangentReference, e)) {
        const angle = pointAngleDegrees(e, point);
        if (angleOnCounterClockwiseArcDegrees(angle, e.a1, e.a2)) {
          candidates.push({ point, label: "arc tangent", priority: 5, entity: e });
        }
      }
    }
    candidates.push({ point: nearestPointOnArc(screenPoint, e), label: "arc", priority: 0, entity: e });
  } else if (e.type === "LWPOLYLINE") {
    for (const p of e.points) candidates.push({ point: p, label: "polyline vertex", priority: 3, entity: e });
    for (const segment of polylineSegments(e)) {
      if (Math.abs(segment.bulge) < BULGE_TOL) {
        candidates.push({
          point: projectScreenToWorldSegment(screenPoint, segment.a, segment.b),
          label: "polyline",
          priority: 0,
          entity: e,
        });
        continue;
      }
      const arc = bulgeToArc(segment.a, segment.b, segment.bulge);
      if (!arc) continue;
      candidates.push({ point: { x: arc.cx, y: arc.cy }, label: "polyline arc center", priority: 5, entity: e });
      for (const point of signedArcQuadrantPoints(arc)) {
        candidates.push({ point, label: "polyline arc quadrant", priority: 4, entity: e });
      }
      if (tangentReference) {
        for (const point of tangentPointsToCircle(tangentReference, arc)) {
          const angle = pointAngleRadians(arc, point);
          if (angleOnSignedSweepRadians(angle, arc.start, arc.sweep)) {
            candidates.push({ point, label: "polyline arc tangent", priority: 5, entity: e });
          }
        }
      }
      candidates.push({
        point: nearestPointOnSignedArc(screenPoint, arc, segment.a, segment.b),
        label: "polyline arc",
        priority: 0,
        entity: e,
      });
    }
  }
}

function projectScreenToWorldSegment(sp, aWorld, bWorld) {
  const a = worldToScreen(aWorld);
  const b = worldToScreen(bWorld);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 <= 0) return aWorld;
  const t = Math.max(0, Math.min(1, ((sp.x - a.x) * dx + (sp.y - a.y) * dy) / len2));
  return {
    x: aWorld.x + (bWorld.x - aWorld.x) * t,
    y: aWorld.y + (bWorld.y - aWorld.y) * t,
  };
}

function nearestPointOnCircle(sp, e) {
  const p = screenToWorld(sp);
  const dx = p.x - e.cx;
  const dy = p.y - e.cy;
  const len = Math.hypot(dx, dy) || 1;
  return { x: e.cx + (dx / len) * e.r, y: e.cy + (dy / len) * e.r };
}

function nearestPointOnArc(screenPoint, arc) {
  const point = nearestPointOnCircle(screenPoint, arc);
  const angle = pointAngleDegrees(arc, point);
  if (angleOnCounterClockwiseArcDegrees(angle, arc.a1, arc.a2)) return point;
  return nearestScreenPoint(screenPoint, [arcPoint(arc, arc.a1), arcPoint(arc, arc.a2)]);
}

function nearestPointOnSignedArc(screenPoint, arc, startPoint, endPoint) {
  const point = nearestPointOnCircle(screenPoint, arc);
  const angle = pointAngleRadians(arc, point);
  if (angleOnSignedSweepRadians(angle, arc.start, arc.sweep)) return point;
  return nearestScreenPoint(screenPoint, [startPoint, endPoint]);
}

function nearestScreenPoint(screenPoint, worldPoints) {
  let best = worldPoints[0];
  let bestDistance = Infinity;
  for (const point of worldPoints) {
    const screen = worldToScreen(point);
    const candidateDistance = Math.hypot(screen.x - screenPoint.x, screen.y - screenPoint.y);
    if (candidateDistance < bestDistance) {
      best = point;
      bestDistance = candidateDistance;
    }
  }
  return best;
}

function rebuild() {
  buildFeatures();
  syncUi();
  render();
}

function sortedIdSignature(values) {
  return [...values].sort((a, b) => Number(a) - Number(b)).join(",");
}

function currentSelectionUiSignature() {
  return [
    geometryRevision,
    Number(state.readOnly),
    state.readOnlyReason || "",
    sortedIdSignature(state.selectedFeatureIds),
    sortedIdSignature(state.selectedEntityIds),
    sortedIdSignature(state.dissolvedEntityIds),
  ].join("|");
}

function currentMeasureUiSignature() {
  return [
    geometryRevision,
    state.mode,
    state.measure.map((point) => `${point.x}:${point.y}`).join(";"),
    JSON.stringify(state.measureDetails),
  ].join("|");
}

function currentFeatureUiSignature() {
  return `${geometryRevision}|${sortedIdSignature(state.selectedFeatureIds)}`;
}

function syncUi() {
  const current = currentFile();
  const isConvertedDwg = state.readOnlyReason === "dwg-conversion";
  ui.fileName.textContent = current ? current.name : "No file open";
  ui.dirtyState.textContent = state.dirty ? "Unsaved changes" : "Clean";
  ui.dirtyState.classList.toggle("dirty", state.dirty);
  ui.lockState.textContent = state.readOnly
    ? (isConvertedDwg ? "Read-only: converted DWG view" : "Read-only: open in another window")
    : "Writable";
  ui.lockState.classList.toggle("read-only", state.readOnly);
  ui.fileCounter.textContent = state.files.length ? `${state.fileIndex + 1} / ${state.files.length}` : "0 / 0";
  ui.prevBtn.disabled = state.fileIndex <= 0;
  ui.nextBtn.disabled = state.fileIndex < 0 || state.fileIndex >= state.files.length - 1;
  ui.saveBtn.disabled = !state.doc || !state.dirty || state.readOnly;
  if (ui.saveMenuBtn) ui.saveMenuBtn.disabled = !state.doc;
  if (ui.saveAsBtn) ui.saveAsBtn.disabled = !state.doc;
  if (!state.doc) setSaveMenuOpen(false);
  ui.discardBtn.disabled = !state.doc || !state.dirty;
  if (ui.mirrorBtn) ui.mirrorBtn.disabled = !state.doc || state.mirrorBusy || state.readOnly;
  if (ui.scaleBtn) ui.scaleBtn.disabled = !state.doc || state.scaleBusy || state.readOnly;
  if (ui.rotateBtn) ui.rotateBtn.disabled = !state.doc || state.rotateBusy || !canRotateCurrentDrawing();
  ui.dissolveBtn.disabled = !selectionHasDissolvableContours();
  ui.rebuildBtn.disabled = !state.dissolvedEntityIds.size;
  if (ui.fixOuterContourBtn) ui.fixOuterContourBtn.disabled = !state.doc || state.repairBusy || state.readOnly;
  if (ui.removeChamferFilletBtn) {
    ui.removeChamferFilletBtn.disabled = !state.doc || state.cleanupBusy || state.readOnly;
  }
  if (ui.showOriginalBtn) {
    const fixedOpen = !!state.doc && isFixedDxfOpen();
    const showing = fixedOpen && state.repairCompareVisible && !!state.repairCompareOriginal?.length;
    ui.showOriginalBtn.disabled = !fixedOpen || state.originalOverlayBusy;
    ui.showOriginalBtn.classList.toggle("active", showing);
    ui.showOriginalBtn.textContent = showing ? "Hide Original" : "Show Original";
  }
  ui.modeState.textContent = state.mode === "measure" ? "Measure Mode" : "Selection Edit Mode";
  ui.modeState.className = `mode-state ${state.mode === "measure" ? "measure" : "selection"}`;
  ui.panel.classList.toggle("mode-measure", state.mode === "measure");
  ui.panel.classList.toggle("mode-selection", state.mode !== "measure");
  document.querySelectorAll(".mode").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.mode);
  });
  ui.hud.textContent = state.doc
    ? `${current?.name || "DXF"} - ${state.doc.entities.filter((e) => e.supported && !e.deleted).length} entities${isConvertedDwg ? " - converted DWG, read-only" : (state.readOnly ? " - read-only" : "")}`
    : "Open a DXF or DWG from Windows Explorer.";
  const nextSelectionSignature = currentSelectionUiSignature();
  if (nextSelectionSignature !== selectionUiSignature) {
    selectionUiSignature = nextSelectionSignature;
    syncSelectionInfo();
  }
  const nextMeasureSignature = currentMeasureUiSignature();
  if (nextMeasureSignature !== measureUiSignature) {
    measureUiSignature = nextMeasureSignature;
    syncMeasureInfo();
  }
  const nextFeatureSignature = currentFeatureUiSignature();
  if (nextFeatureSignature !== featureUiSignature) {
    featureUiSignature = nextFeatureSignature;
    syncFeatureList();
  }
}

function syncSelectionInfo() {
  const features = selectedFeatures();
  const rawEntities = selectedRawEntities();
  ui.selectionInfo.innerHTML = "";
  if (!features.length && !rawEntities.length) {
    ui.selectionInfo.textContent = "Nothing selected.";
    return;
  }
  if (state.readOnly) {
    const note = document.createElement("div");
    note.className = "read-only-note";
    note.textContent = state.readOnlyReason === "dwg-conversion"
      ? "DWG files open through offline DXF conversion. Rotate is available; use Save As to write the result as DXF. The original DWG stays unchanged."
      : "Read-only while this DXF is open in another window.";
    ui.selectionInfo.appendChild(note);
  }
  if (features.length === 1 && rawEntities.length === 0 && isGroupedFeature(features[0])) renderSingleContourSelection(features[0]);
  else if (features.length === 0 && rawEntities.length === 1) renderRawEntitySelection(rawEntities[0]);
  else renderMultipleSelection(features, rawEntities);
}

function featureInfo(f) {
  const w = f.bbox.maxX - f.bbox.minX;
  const h = f.bbox.maxY - f.bbox.minY;
  return [
    `${f.name}`,
    `Kind: ${f.kind}`,
    `Entities: ${f.entities.length}`,
    `Size: ${fmt(w)} x ${fmt(h)} mm`,
    `Center: ${fmt(f.center.x)}, ${fmt(f.center.y)}`,
  ].join("\n");
}

function renderSingleContourSelection(feature) {
  const wrap = document.createElement("div");
  wrap.className = "selection-editor";
  const entities = featureEntities(feature);
  const shape = featureShape(feature);
  const box = feature.bbox;
  const width = box.maxX - box.minX;
  const height = box.maxY - box.minY;
  wrap.appendChild(selectionText("Selection (single)", "selection-heading"));
  wrap.appendChild(selectionText(`${featureDisplayName(feature)} (${feature.entities.length} entities)`));
  if (canOffsetFeature(feature)) wrap.appendChild(selectionOffsetEditor([feature]));

  if (shape === "hole") {
    const e = entities[0];
    wrap.appendChild(selectionNumberRow("Diameter", e.r * 2, "Set", (value) => applySelectedFeatureSize(value), { unit: "mm" }));
    wrap.appendChild(selectionNumberRow("Radius", e.r, "Set", (value) => applySelectedFeatureRadius(value), { unit: "mm" }));
  } else if (shape === "racetrack") {
    const metrics = racetrackMetrics(feature);
    wrap.appendChild(selectionNumberRow("Length", metrics.length, "Set", (value) => applySelectedFeatureLength(value), { unit: "mm" }));
    wrap.appendChild(selectionNumberRow("Radius", metrics.radius, "Set", (value) => applySelectedFeatureRadius(value), { unit: "mm" }));
  } else if (shape === "rectangle") {
    wrap.appendChild(selectionNumberRow("Width", width, "Set", (value) => applySelectedFeatureWidth(value), { unit: "mm" }));
    wrap.appendChild(selectionNumberRow("Height", height, "Set", (value) => applySelectedFeatureHeight(value), { unit: "mm" }));
  } else if (shape === "rounded-rectangle") {
    wrap.appendChild(selectionNumberRow("Width", width, "Set", (value) => applySelectedFeatureWidth(value), { unit: "mm" }));
    wrap.appendChild(selectionNumberRow("Height", height, "Set", (value) => applySelectedFeatureHeight(value), { unit: "mm" }));
    wrap.appendChild(selectionNumberRow("Corner R", averageArcRadius(feature), "Set", (value) => applySelectedFeatureRadius(value), { unit: "mm" }));
  } else if (shape === "open") {
    wrap.appendChild(selectionText("Open contour: offset around its center.", "selection-muted"));
  } else {
    wrap.appendChild(selectionText("Complex closed contour: offset only.", "selection-muted"));
  }

  wrap.appendChild(selectionText(`Size: ${fmt(width)} x ${fmt(height)} mm`, "selection-muted"));
  wrap.appendChild(selectionText(`Center: ${fmt(feature.center.x)}, ${fmt(feature.center.y)}`, "selection-muted"));
  wrap.appendChild(selectionText(`Layer: ${entities[0]?.layer || "-"}`));
  ui.selectionInfo.appendChild(wrap);
}

function renderRawEntitySelection(e) {
  const wrap = document.createElement("div");
  wrap.className = "selection-editor";
  wrap.appendChild(selectionText("Selection (raw entity)", "selection-heading"));
  wrap.appendChild(selectionText(`Entity ${e.id}: ${e.type}`));
  wrap.appendChild(selectionText(entityDetail(e), "selection-muted"));
  if (e.type === "LINE") {
    wrap.appendChild(selectionNumberRow("Length", lineLength(e), "Set", (value) => applyRawLineLength(e, value), { unit: "mm" }));
    wrap.appendChild(selectionNumberRow("Start X", e.x1, "Set", (value) => applyRawPointValue(e, "x", "1", value), { unit: "mm" }));
    wrap.appendChild(selectionNumberRow("Start Y", e.y1, "Set", (value) => applyRawPointValue(e, "y", "1", value), { unit: "mm" }));
    wrap.appendChild(selectionNumberRow("End X", e.x2, "Set", (value) => applyRawPointValue(e, "x", "2", value), { unit: "mm" }));
    wrap.appendChild(selectionNumberRow("End Y", e.y2, "Set", (value) => applyRawPointValue(e, "y", "2", value), { unit: "mm" }));
  } else if (e.type === "ARC") {
    wrap.appendChild(selectionNumberRow("Center X", e.cx, "Set", (value) => applyRawCenterValue(e, "x", value), { unit: "mm" }));
    wrap.appendChild(selectionNumberRow("Center Y", e.cy, "Set", (value) => applyRawCenterValue(e, "y", value), { unit: "mm" }));
    wrap.appendChild(selectionNumberRow("Radius", e.r, "Set", (value) => applyRawRadius(e, value), { unit: "mm" }));
    wrap.appendChild(selectionNumberRow("Start A", e.a1, "Set", (value) => applyRawAngle(e, "a1", value), { unit: "deg" }));
    wrap.appendChild(selectionNumberRow("End A", e.a2, "Set", (value) => applyRawAngle(e, "a2", value), { unit: "deg" }));
  } else if (e.type === "CIRCLE") {
    wrap.appendChild(selectionNumberRow("Center X", e.cx, "Set", (value) => applyRawCenterValue(e, "x", value), { unit: "mm" }));
    wrap.appendChild(selectionNumberRow("Center Y", e.cy, "Set", (value) => applyRawCenterValue(e, "y", value), { unit: "mm" }));
    wrap.appendChild(selectionNumberRow("Diameter", e.r * 2, "Set", (value) => applyRawRadius(e, value / 2), { unit: "mm" }));
    wrap.appendChild(selectionNumberRow("Radius", e.r, "Set", (value) => applyRawRadius(e, value), { unit: "mm" }));
  } else {
    wrap.appendChild(selectionText("Raw polyline entities can be selected and deleted.", "selection-muted"));
  }
  wrap.appendChild(selectionText(`Layer: ${e.layer}`));
  ui.selectionInfo.appendChild(wrap);
}

function renderMultipleSelection(features, rawEntities) {
  const wrap = document.createElement("div");
  wrap.className = "selection-editor";
  const total = features.length + rawEntities.length;
  wrap.appendChild(selectionText(`Selection (${total})`, "selection-heading"));
  if (features.some(canOffsetFeature)) {
    wrap.appendChild(selectionOffsetEditor(features.filter(canOffsetFeature)));
  }

  const list = document.createElement("ul");
  list.className = "selection-list";
  for (const feature of features) {
    const item = document.createElement("li");
    const title = document.createElement("div");
    title.textContent = featureDisplayName(feature);
    const detail = document.createElement("div");
    detail.className = "selection-muted";
    detail.textContent = featureDetail(feature);
    item.append(title, detail);
    list.appendChild(item);
  }
  for (const e of rawEntities) {
    const item = document.createElement("li");
    const title = document.createElement("div");
    title.textContent = `Entity ${e.id}: ${e.type}`;
    const detail = document.createElement("div");
    detail.className = "selection-muted";
    detail.textContent = entityDetail(e);
    item.append(title, detail);
    list.appendChild(item);
  }
  wrap.appendChild(list);
  ui.selectionInfo.appendChild(wrap);
}

function selectionText(text, className = "") {
  const div = document.createElement("div");
  div.textContent = text;
  if (className) div.className = className;
  return div;
}

function featureDetail(feature) {
  const shape = featureShape(feature);
  const w = feature.bbox.maxX - feature.bbox.minX;
  const h = feature.bbox.maxY - feature.bbox.minY;
  const ents = featureEntities(feature);
  if (shape === "hole") {
    const circle = ents[0];
    return `diameter ${fmt(circle.r * 2)} mm, radius ${fmt(circle.r)} mm`;
  }
  if (shape === "racetrack") {
    const metrics = racetrackMetrics(feature);
    return `length ${fmt(metrics.length)} mm, radius ${fmt(metrics.radius)} mm, size ${fmt(w)} x ${fmt(h)} mm`;
  }
  if (shape === "rounded-rectangle") {
    return `size ${fmt(w)} x ${fmt(h)} mm, corner radius ${fmt(averageArcRadius(feature))} mm`;
  }
  if (shape === "rectangle") {
    return `size ${fmt(w)} x ${fmt(h)} mm`;
  }
  if (shape === "open") {
    return `${feature.entities.length} entities, length ${fmt(featureLength(feature))} mm, size ${fmt(w)} x ${fmt(h)} mm`;
  }
  return `size ${fmt(w)} x ${fmt(h)} mm, ${feature.entities.length} entities`;
}

function featureLength(feature) {
  return featureEntities(feature).reduce((sum, e) => sum + entityLength(e), 0);
}

function entityLength(e) {
  if (e.type === "LINE") return lineLength(e);
  if (e.type === "ARC") return arcLength(e);
  if (e.type === "CIRCLE") return Math.PI * 2 * e.r;
  if (e.type === "LWPOLYLINE") return polylineLength(e);
  return 0;
}

function entityDetail(e) {
  if (e.type === "LINE") return `start ${fmt(e.x1)}, ${fmt(e.y1)}; end ${fmt(e.x2)}, ${fmt(e.y2)}; length ${fmt(lineLength(e))} mm`;
  if (e.type === "CIRCLE") return `center ${fmt(e.cx)}, ${fmt(e.cy)}; diameter ${fmt(e.r * 2)} mm; radius ${fmt(e.r)} mm`;
  if (e.type === "ARC") {
    const start = arcPoint(e, e.a1);
    const end = arcPoint(e, e.a2);
    return `center ${fmt(e.cx)}, ${fmt(e.cy)}; start ${fmt(start.x)}, ${fmt(start.y)}; end ${fmt(end.x)}, ${fmt(end.y)}; radius ${fmt(e.r)} mm; length ${fmt(arcLength(e))} mm`;
  }
  if (e.type === "LWPOLYLINE") {
    const box = bboxForEntities([e]);
    return `${e.closed ? "closed" : "open"}, ${e.points.length} vertices, length ${fmt(polylineLength(e))} mm, size ${fmt(box.maxX - box.minX)} x ${fmt(box.maxY - box.minY)} mm`;
  }
  return `layer ${e.layer}`;
}

function arcLength(e) {
  return Math.abs((arcSweep(e.a1, e.a2) * Math.PI * e.r) / 180);
}

function polylineLength(e) {
  let total = 0;
  for (const segment of polylineSegments(e)) {
    if (Math.abs(segment.bulge) < BULGE_TOL) total += distance(segment.a, segment.b);
    else {
      const arc = bulgeToArc(segment.a, segment.b, segment.bulge);
      total += arc ? Math.abs(arc.sweep * arc.r) : distance(segment.a, segment.b);
    }
  }
  return total;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function polygonSignedArea(points) {
  let area = 0;
  const n = points.length;
  if (n < 3) return 0;
  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    area += a.x * b.y - b.x * a.y;
  }
  return area / 2;
}

function repairedPointKey(p, tol = 1e-6) {
  return `${Math.round(p.x / tol)}:${Math.round(p.y / tol)}`;
}

function dedupeConsecutivePoints(points, tol = 1e-6) {
  const out = [];
  for (const p of points) {
    if (!Number.isFinite(p?.x) || !Number.isFinite(p?.y)) continue;
    const last = out[out.length - 1];
    if (last && distance(last, p) <= tol) continue;
    out.push({ x: p.x, y: p.y, bulge: p.bulge || 0 });
  }
  if (out.length > 1 && distance(out[0], out[out.length - 1]) <= tol) out.pop();
  return out;
}

function bboxForPoints(points) {
  const box = emptyBox();
  for (const p of points) {
    if (Number.isFinite(p?.x) && Number.isFinite(p?.y)) expandBox(box, p);
  }
  return Number.isFinite(box.minX) ? box : null;
}

function percentile(values, q) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return NaN;
  const pos = clamp(q, 0, 1) * (sorted.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] * (hi - pos) + sorted[hi] * (pos - lo);
}

function radialStatsForPoints(points, center) {
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let count = 0;
  for (const p of points) {
    if (!Number.isFinite(p?.x) || !Number.isFinite(p?.y)) continue;
    const r = distance(center, p);
    min = Math.min(min, r);
    max = Math.max(max, r);
    sum += r;
    count++;
  }
  return count ? { min, max, mean: sum / count, count } : { min: 0, max: 0, mean: 0, count: 0 };
}

function sampleLineForRepair(a, b, step) {
  const len = distance(a, b);
  const count = Math.max(1, Math.ceil(len / Math.max(step, 0.001)));
  const pts = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    pts.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  return pts;
}

function sampleEntityForRepair(e, step) {
  if (e.type === "LINE") {
    return sampleLineForRepair({ x: e.x1, y: e.y1 }, { x: e.x2, y: e.y2 }, step);
  }
  if (e.type === "CIRCLE") {
    const count = clamp(Math.ceil((Math.PI * 2 * Math.abs(e.r)) / Math.max(step, 0.001)), 48, 720);
    const pts = [];
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count;
      pts.push({ x: e.cx + e.r * Math.cos(a), y: e.cy + e.r * Math.sin(a) });
    }
    return pts;
  }
  if (e.type === "ARC") {
    const sweep = arcSweep(e.a1, e.a2);
    const len = Math.abs((sweep * Math.PI * e.r) / 180);
    const count = clamp(Math.ceil(len / Math.max(step, 0.001)), 8, 360);
    const pts = [];
    for (let i = 0; i <= count; i++) pts.push(arcPoint(e, e.a1 + (sweep * i) / count));
    return pts;
  }
  if (e.type === "LWPOLYLINE") {
    const pts = [];
    for (const segment of polylineSegments(e)) {
      let sampled;
      if (Math.abs(segment.bulge) < BULGE_TOL) {
        sampled = sampleLineForRepair(segment.a, segment.b, step);
      } else {
        const arc = bulgeToArc(segment.a, segment.b, segment.bulge);
        const len = arc ? Math.abs(arc.sweep * arc.r) : distance(segment.a, segment.b);
        sampled = sampleBulgeSegment(segment.a, segment.b, segment.bulge, Math.max(8, Math.ceil(len / Math.max(step, 0.001))));
      }
      if (pts.length && sampled.length) sampled.shift();
      pts.push(...sampled);
    }
    return pts;
  }
  return [];
}

function repairFeatureScore(info) {
  const boxArea = bboxArea(info.feature.bbox);
  const width = info.feature.bbox.maxX - info.feature.bbox.minX;
  const height = info.feature.bbox.maxY - info.feature.bbox.minY;
  const extent = Math.hypot(width, height);
  const length = info.entities.reduce((sum, e) => sum + entityLength(e), 0);
  return boxArea * 1.8 + extent * length * 0.08 + length;
}

function analyseOuterContourRepair() {
  if (!state.doc) return null;
  const entities = state.doc.entities.filter((e) => e.supported && !e.deleted && !e.isAnnotation && !e.virtual);
  if (!entities.length) return null;
  const bbox = bboxForEntities(entities);
  const width = bbox.maxX - bbox.minX;
  const height = bbox.maxY - bbox.minY;
  const diag = Math.hypot(width, height);
  if (!(diag > 0)) return null;

  const center = bboxCenter(bbox);
  const baseStep = Math.max(diag / 360, 0.05);
  const entityByFeatureId = new Map();
  for (const e of entities) {
    if (!e.featureId) continue;
    if (!entityByFeatureId.has(e.featureId)) entityByFeatureId.set(e.featureId, []);
    entityByFeatureId.get(e.featureId).push(e);
  }
  const featureInfos = state.features.map((feature) => {
    const ents = (entityByFeatureId.get(feature.id) || featureEntities(feature)).filter((e) => e && !e.virtual && !e.isAnnotation);
    const points = dedupeConsecutivePoints(ents.flatMap((e) => sampleEntityForRepair(e, baseStep)));
    const area = feature.closed ? Math.abs(polygonSignedArea(points)) : bboxArea(feature.bbox);
    return { feature, entities: ents, points, area, radial: radialStatsForPoints(points, center) };
  }).filter((info) => info.entities.length && info.points.length);

  const outerInfo = featureInfos.slice().sort((a, b) => repairFeatureScore(b) - repairFeatureScore(a))[0];
  const bboxAreaValue = Math.max(0, width * height);
  const defaultSmallFilter = clamp(Math.max(bboxAreaValue * 0.0008, baseStep * baseStep * 10), 0, bboxAreaValue * 0.08);
  const defaultSmoothing = clamp(diag * 0.0025, Math.max(baseStep * 0.45, 0.02), Math.max(diag * 0.018, 0.1));
  const allSamplePoints = featureInfos.flatMap((info) => info.points);
  const allRadii = allSamplePoints.map((p) => distance(center, p));
  const shellRadius = Number.isFinite(percentile(allRadii, 0.82)) ? percentile(allRadii, 0.82) : 0;
  const outerBoxTol = Math.max(diag * 0.015, defaultSmoothing * 2);
  const exteriorCandidates = featureInfos.filter((info) => {
    if (info.feature.id === outerInfo?.feature.id) return true;
    if (!info.feature.closed) return true;
    if (info.area < defaultSmallFilter) return false;
    return featureTouchesOuterBox(info.feature, bbox, outerBoxTol)
      || info.radial.max >= shellRadius
      || bboxArea(info.feature.bbox) >= bboxAreaValue * 0.18;
  });
  const suggestedMode = outerInfo?.feature.closed && exteriorCandidates.length <= 1 ? "continuous" : "fragmented";
  return {
    entities,
    featureInfos,
    outerInfo,
    bbox,
    bboxAreaValue,
    center,
    diag,
    baseStep,
    shellRadius,
    exteriorCandidates,
    suggestedMode,
    defaultSmallFilter,
    defaultSmoothing,
    maxSmallFilter: Math.max(defaultSmallFilter * 6, bboxAreaValue * 0.04, 1),
    maxSmoothing: Math.max(defaultSmoothing * 5, diag * 0.05, 0.5),
  };
}

function featureTouchesOuterBox(feature, box, tol) {
  const b = feature.bbox;
  return Math.abs(b.minX - box.minX) <= tol || Math.abs(b.maxX - box.maxX) <= tol
    || Math.abs(b.minY - box.minY) <= tol || Math.abs(b.maxY - box.maxY) <= tol;
}

function buildOuterContourFromPoints(points, center, smoothingMm, diag, options = {}) {
  const clean = points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  if (clean.length < 8) return [];
  let maxR = 0;
  for (const p of clean) maxR = Math.max(maxR, distance(center, p));
  if (!(maxR > 0)) return [];
  const mode = options.mode === "continuous" ? "continuous" : "fragmented";
  const binStep = Math.max(smoothingMm * 0.85, diag / 360, 0.05);
  const binCount = clamp(Math.round((Math.PI * 2 * maxR) / binStep), 96, 720);
  const bins = Array.from({ length: binCount }, () => []);
  for (const p of clean) {
    const a = (Math.atan2(p.y - center.y, p.x - center.x) + Math.PI * 2) % (Math.PI * 2);
    const r = distance(center, p);
    bins[Math.min(binCount - 1, Math.floor((a / (Math.PI * 2)) * binCount))].push({ p, r });
  }

  const anchors = bins.map((items, i) => {
    const a = ((i + 0.5) / binCount) * Math.PI * 2;
    if (!items.length) return null;
    items.sort((x, y) => x.r - y.r);
    const start = Math.max(0, Math.floor(items.length * (mode === "continuous" ? 0.74 : 0.82)));
    const shell = items.slice(start);
    const r = shell.reduce((sum, item) => sum + item.r, 0) / shell.length;
    return { x: center.x + Math.cos(a) * r, y: center.y + Math.sin(a) * r, r, a };
  });

  for (let i = 0; i < anchors.length; i++) {
    if (anchors[i]) continue;
    let prev = i - 1;
    while (prev >= i - binCount && !anchors[(prev + binCount) % binCount]) prev--;
    let next = i + 1;
    while (next <= i + binCount && !anchors[next % binCount]) next++;
    const a = ((i + 0.5) / binCount) * Math.PI * 2;
    const pa = anchors[(prev + binCount) % binCount];
    const na = anchors[next % binCount];
    let r = (pa || na)?.r || maxR;
    if (pa && na) {
      const span = next - prev;
      const t = span > 0 ? (i - prev) / span : 0.5;
      r = pa.r * (1 - t) + na.r * t;
    }
    anchors[i] = { x: center.x + Math.cos(a) * r, y: center.y + Math.sin(a) * r, r, a };
  }

  const windowBins = clamp(Math.round(smoothingMm / binStep), 1, 10);
  let smoothed = anchors.map((p) => ({ ...p }));
  const passes = mode === "continuous" ? 2 : 3;
  for (let pass = 0; pass < passes; pass++) {
    const next = [];
    for (let i = 0; i < smoothed.length; i++) {
      let weightSum = 0;
      let radiusSum = 0;
      for (let k = -windowBins; k <= windowBins; k++) {
        const idx = (i + k + smoothed.length) % smoothed.length;
        const w = (windowBins + 1 - Math.abs(k));
        weightSum += w;
        radiusSum += smoothed[idx].r * w;
      }
      const rAvg = radiusSum / weightSum;
      const a = anchors[i].a;
      const smoothPoint = { x: center.x + Math.cos(a) * rAvg, y: center.y + Math.sin(a) * rAvg, r: rAvg, a };
      // Blend back toward the original radial shell. This is the "stay close
      // to the source" pass: smoothing removes jaggedness, the anchor blend
      // prevents the contour from drifting away from the mesh silhouette.
      const keep = mode === "continuous" ? 0.42 : 0.32;
      next.push({
        x: smoothPoint.x * (1 - keep) + anchors[i].x * keep,
        y: smoothPoint.y * (1 - keep) + anchors[i].y * keep,
        r: rAvg * (1 - keep) + anchors[i].r * keep,
        a,
      });
    }
    smoothed = next;
  }

  let contour = dedupeConsecutivePoints(smoothed, Math.max(0.001, smoothingMm * 0.05));
  contour = rdpSimplifyClosed(contour, Math.max(0.001, smoothingMm * 0.38));
  contour = dedupeConsecutivePoints(contour, Math.max(0.001, smoothingMm * 0.08));
  if (options.sourceBox) contour = fitContourToBox(contour, options.sourceBox);
  if (polygonSignedArea(contour) < 0) contour.reverse();
  return contour.map((p) => ({ x: p.x, y: p.y, bulge: 0 }));
}

function fitContourToBox(points, targetBox) {
  const current = bboxForPoints(points);
  if (!current || !targetBox) return points;
  const curW = current.maxX - current.minX;
  const curH = current.maxY - current.minY;
  const targetW = targetBox.maxX - targetBox.minX;
  const targetH = targetBox.maxY - targetBox.minY;
  if (!(curW > 1e-9) || !(curH > 1e-9) || !(targetW > 1e-9) || !(targetH > 1e-9)) return points;
  return points.map((p) => ({
    ...p,
    x: targetBox.minX + ((p.x - current.minX) / curW) * targetW,
    y: targetBox.minY + ((p.y - current.minY) / curH) * targetH,
  }));
}

function pointAtIndex(points, index) {
  return points[wrappedIndex(index, points.length)];
}

function wrappedIndex(index, length) {
  return ((index % length) + length) % length;
}

function pathLengthPoints(points, closed = false) {
  if (points.length < 2) return 0;
  let total = 0;
  const limit = closed ? points.length : points.length - 1;
  for (let i = 0; i < limit; i++) total += distance(points[i], points[(i + 1) % points.length]);
  return total;
}

function entityPathForRepair(e, step) {
  return dedupeConsecutivePoints(sampleEntityForRepair(e, step), Math.max(step * 0.04, 1e-6));
}

function orderedFeatureRepairPaths(info, step, connectTol) {
  const fragments = info.entities
    .map((entity) => entityPathForRepair(entity, step))
    .filter((points) => points.length >= 2)
    .map((points) => ({ points, length: pathLengthPoints(points, false) }))
    .sort((a, b) => b.length - a.length);
  if (fragments.length <= 1) return fragments.map((f) => f.points);

  const remaining = fragments.map((f) => f.points);
  const paths = [];
  while (remaining.length) {
    let current = remaining.shift();
    let changed = true;
    while (changed && remaining.length) {
      changed = false;
      let best = null;
      for (let i = 0; i < remaining.length; i++) {
        const path = remaining[i];
        const curStart = current[0];
        const curEnd = current[current.length - 1];
        const start = path[0];
        const end = path[path.length - 1];
        const options = [
          { i, d: distance(curEnd, start), action: "append" },
          { i, d: distance(curEnd, end), action: "append-reverse" },
          { i, d: distance(curStart, end), action: "prepend" },
          { i, d: distance(curStart, start), action: "prepend-reverse" },
        ];
        for (const option of options) {
          if (!best || option.d < best.d) best = option;
        }
      }
      if (!best || best.d > connectTol) break;
      const [nextPath] = remaining.splice(best.i, 1);
      if (best.action === "append") current = current.concat(nextPath.slice(best.d <= connectTol ? 1 : 0));
      else if (best.action === "append-reverse") current = current.concat(nextPath.slice().reverse().slice(best.d <= connectTol ? 1 : 0));
      else if (best.action === "prepend") current = nextPath.concat(current.slice(best.d <= connectTol ? 1 : 0));
      else current = nextPath.slice().reverse().concat(current.slice(best.d <= connectTol ? 1 : 0));
      current = dedupeConsecutivePoints(current, Math.max(step * 0.04, 1e-6));
      changed = true;
    }
    paths.push(current);
  }
  return paths;
}

function joinRepairPaths(paths, mode, diag) {
  const remaining = paths
    .map((points) => dedupeConsecutivePoints(points, Math.max(diag * 1e-8, 1e-6)))
    .filter((points) => points.length >= 2)
    .map((points) => ({ points, length: pathLengthPoints(points, false) }))
    .sort((a, b) => b.length - a.length);
  if (!remaining.length) return [];
  let current = remaining.shift().points;
  const maxContinuousGap = Math.max(diag * 0.035, CONNECT_TOL * 8);

  while (remaining.length) {
    let best = null;
    for (let i = 0; i < remaining.length; i++) {
      const path = remaining[i].points;
      const curStart = current[0];
      const curEnd = current[current.length - 1];
      const start = path[0];
      const end = path[path.length - 1];
      const options = [
        { i, d: distance(curEnd, start), action: "append" },
        { i, d: distance(curEnd, end), action: "append-reverse" },
        { i, d: distance(curStart, end), action: "prepend" },
        { i, d: distance(curStart, start), action: "prepend-reverse" },
      ];
      for (const option of options) {
        if (!best || option.d < best.d) best = option;
      }
    }
    if (!best) break;
    if (mode === "continuous" && best.d > maxContinuousGap) break;
    const [nextItem] = remaining.splice(best.i, 1);
    const nextPath = nextItem.points;
    if (best.action === "append") current = current.concat(nextPath);
    else if (best.action === "append-reverse") current = current.concat(nextPath.slice().reverse());
    else if (best.action === "prepend") current = nextPath.concat(current);
    else current = nextPath.slice().reverse().concat(current);
    current = dedupeConsecutivePoints(current, Math.max(diag * 1e-8, 1e-6));
  }
  return current;
}

function resampleClosedPath(points, spacing, maxCount = 12000) {
  const clean = dedupeConsecutivePoints(points, Math.max(spacing * 0.02, 1e-6));
  if (clean.length < 3) return clean;
  const lengths = [];
  let total = 0;
  for (let i = 0; i < clean.length; i++) {
    const len = distance(clean[i], clean[(i + 1) % clean.length]);
    lengths.push(len);
    total += len;
  }
  if (!(total > 0)) return clean;
  const count = clamp(Math.ceil(total / Math.max(spacing, 0.001)), 32, maxCount);
  const resampled = [];
  let segmentIndex = 0;
  let segmentStart = 0;
  for (let i = 0; i < count; i++) {
    const target = (i / count) * total;
    while (segmentIndex < lengths.length - 1 && segmentStart + lengths[segmentIndex] < target) {
      segmentStart += lengths[segmentIndex];
      segmentIndex++;
    }
    const a = clean[segmentIndex];
    const b = clean[(segmentIndex + 1) % clean.length];
    const t = lengths[segmentIndex] > 0 ? (target - segmentStart) / lengths[segmentIndex] : 0;
    resampled.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, bulge: 0 });
  }
  return resampled;
}

function removeShortSpikes(points, tolerance) {
  let current = points.slice();
  for (let pass = 0; pass < 3 && current.length >= 4; pass++) {
    const next = [];
    let removed = 0;
    for (let i = 0; i < current.length; i++) {
      const a = pointAtIndex(current, i - 1);
      const b = current[i];
      const c = pointAtIndex(current, i + 1);
      const ab = distance(a, b);
      const bc = distance(b, c);
      const ac = distance(a, c);
      const hairpin = ac < Math.min(ab, bc) * 0.42 && Math.min(ab, bc) <= tolerance;
      const tiny = ab <= Math.max(tolerance * 0.004, 1e-6) && bc <= Math.max(tolerance * 0.004, 1e-6);
      if ((hairpin || tiny) && current.length - removed > 4) {
        removed++;
        continue;
      }
      next.push(b);
    }
    current = next;
    if (!removed) break;
  }
  return current;
}

function removeLongChordHairpins(points, diag) {
  let current = points.slice();
  const longThreshold = Math.max(diag * 0.035, 1);
  const closeThreshold = Math.max(diag * 0.01, 0.5);
  for (let pass = 0; pass < 8 && current.length >= 4; pass++) {
    const next = [];
    let removed = 0;
    for (let i = 0; i < current.length; i++) {
      const a = pointAtIndex(current, i - 1);
      const b = current[i];
      const c = pointAtIndex(current, i + 1);
      const ab = distance(a, b);
      const bc = distance(b, c);
      const ac = distance(a, c);
      const longOutAndBack = Math.min(ab, bc) > longThreshold
        && ac < Math.max(closeThreshold, Math.min(ab, bc) * 0.18);
      if (longOutAndBack && current.length - removed > 4) {
        removed++;
        continue;
      }
      next.push(b);
    }
    current = next;
    if (!removed) break;
  }
  return current;
}

function segmentIntersection(a, b, c, d) {
  const rx = b.x - a.x;
  const ry = b.y - a.y;
  const sx = d.x - c.x;
  const sy = d.y - c.y;
  const denom = rx * sy - ry * sx;
  if (Math.abs(denom) < 1e-10) return null;
  const qpx = c.x - a.x;
  const qpy = c.y - a.y;
  const t = (qpx * sy - qpy * sx) / denom;
  const u = (qpx * ry - qpy * rx) / denom;
  if (t <= 1e-6 || t >= 1 - 1e-6 || u <= 1e-6 || u >= 1 - 1e-6) return null;
  return { x: a.x + t * rx, y: a.y + t * ry, t, u };
}

function segmentBoxesOverlap(a, b, c, d, tol = 1e-9) {
  return Math.max(Math.min(a.x, b.x), Math.min(c.x, d.x)) <= Math.min(Math.max(a.x, b.x), Math.max(c.x, d.x)) + tol
    && Math.max(Math.min(a.y, b.y), Math.min(c.y, d.y)) <= Math.min(Math.max(a.y, b.y), Math.max(c.y, d.y)) + tol;
}

function reducePathForUntangle(points, maxPoints = 1400) {
  let current = dedupeConsecutivePoints(points, 1e-7);
  if (current.length <= maxPoints) return current;
  const box = bboxForPoints(current);
  const diag = box ? Math.hypot(box.maxX - box.minX, box.maxY - box.minY) : pathLengthPoints(current, true);
  let epsilon = Math.max(diag / 12000, 0.002);
  for (let pass = 0; pass < 10 && current.length > maxPoints; pass++) {
    const simplified = rdpSimplifyClosed(current, epsilon);
    if (simplified.length < current.length) current = simplified;
    epsilon *= 1.7;
  }
  return current;
}

function untangleClosedPath2Opt(points, maxPasses = 28) {
  let current = dedupeConsecutivePoints(points, 1e-7);
  if (current.length < 4) return current;
  current = reducePathForUntangle(current);
  const passLimit = Math.max(1, Math.min(maxPasses, current.length * 2));

  for (let pass = 0; pass < passLimit; pass++) {
    let changed = false;
    const n = current.length;
    for (let i = 0; i < n && !changed; i++) {
      const a = current[i];
      const b = current[(i + 1) % n];
      for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) continue; // adjacent through closure
        const c = current[j];
        const d = current[(j + 1) % n];
        if (!segmentBoxesOverlap(a, b, c, d)) continue;
        if (!segmentIntersection(a, b, c, d)) continue;

        const middle = current.slice(i + 1, j + 1).reverse();
        current = current.slice(0, i + 1).concat(middle, current.slice(j + 1));
        current = dedupeConsecutivePoints(current, 1e-7);
        changed = true;
        break;
      }
    }
    if (!changed) break;
  }
  return current;
}

function closedSliceWithIntersection(points, fromSegment, toSegment, intersection) {
  const out = [{ x: intersection.x, y: intersection.y, bulge: 0 }];
  for (let i = fromSegment + 1; i <= toSegment; i++) out.push({ ...points[i % points.length], bulge: 0 });
  out.push({ x: intersection.x, y: intersection.y, bulge: 0 });
  return out;
}

function removeSmallSelfLoopsClosed(points, maxLoopLength) {
  let current = points.slice();
  for (let pass = 0; pass < 12 && current.length >= 6; pass++) {
    let best = null;
    const n = current.length;
    const segLengths = new Array(n);
    const prefix = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) {
      segLengths[i] = distance(current[i], current[(i + 1) % n]);
      prefix[i + 1] = prefix[i] + segLengths[i];
    }
    const total = prefix[n];
    const avgSeg = total > 0 ? total / n : maxLoopLength;
    const maxSpan = clamp(Math.ceil(maxLoopLength / Math.max(avgSeg, 1e-6) * 5), 12, Math.min(420, Math.floor(n / 3)));
    for (let i = 0; i < n; i++) {
      const a = current[i];
      const b = current[(i + 1) % n];
      const minAx = Math.min(a.x, b.x);
      const maxAx = Math.max(a.x, b.x);
      const minAy = Math.min(a.y, b.y);
      const maxAy = Math.max(a.y, b.y);
      const jLimit = Math.min(n, i + maxSpan);
      for (let j = i + 2; j < jLimit; j++) {
        if (i === 0 && j === n - 1) continue;
        const c = current[j];
        const d = current[(j + 1) % n];
        if (Math.max(minAx, Math.min(c.x, d.x)) > Math.min(maxAx, Math.max(c.x, d.x))) continue;
        if (Math.max(minAy, Math.min(c.y, d.y)) > Math.min(maxAy, Math.max(c.y, d.y))) continue;
        const hit = segmentIntersection(a, b, c, d);
        if (!hit) continue;
        const lenA = (1 - hit.t) * segLengths[i] + (prefix[j] - prefix[i + 1]) + hit.u * segLengths[j];
        const lenB = total - lenA;
        const loopLen = Math.min(lenA, lenB);
        if (loopLen <= maxLoopLength || loopLen <= total * 0.025) {
          if (!best || loopLen < best.loopLen) best = { i, j, hit, lenA, lenB, loopLen };
        }
      }
    }
    if (!best) break;
    const pathA = closedSliceWithIntersection(current, best.i, best.j, best.hit).slice(0, -1);
    const pathB = closedSliceWithIntersection(current, best.j, best.i + current.length, best.hit).slice(0, -1);
    current = best.lenA < best.lenB ? pathB : pathA;
    current = dedupeConsecutivePoints(current, Math.max(maxLoopLength * 0.001, 1e-6));
  }
  return current;
}

function preferOuterDuplicateStrands(points, center, tolerance) {
  let current = points.slice();
  for (let pass = 0; pass < 4 && current.length >= 8; pass++) {
    let best = null;
    const n = current.length;
    const total = pathLengthPoints(current, true);
    const minGap = 3;
    const maxGap = Math.max(minGap + 2, Math.min(Math.floor(n * 0.055), 120));
    const segPrefix = new Array(n + maxGap + 2).fill(0);
    const radiusPrefix = new Array(n + maxGap + 2).fill(0);
    for (let i = 0; i < n + maxGap + 1; i++) {
      const p = current[i % n];
      const q = current[(i + 1) % n];
      segPrefix[i + 1] = segPrefix[i] + distance(p, q);
      radiusPrefix[i + 1] = radiusPrefix[i] + distance(center, p);
    }
    const totalRadius = radiusPrefix[n] || current.reduce((sum, p) => sum + distance(center, p), 0);
    for (let i = 0; i < n; i++) {
      for (let gap = minGap; gap <= maxGap; gap++) {
        const j = (i + gap) % n;
        if (i === 0 && j >= n - 2) continue;
        const d = distance(current[i], current[j]);
        if (d > tolerance) continue;
        const lenA = segPrefix[i + gap] - segPrefix[i];
        const lenB = total - lenA;
        const longerLen = Math.max(lenA, lenB);
        const shorterLen = Math.min(lenA, lenB);
        if (shorterLen > total * 0.08 || shorterLen > tolerance * 12) continue;
        const shorterCount = lenA <= lenB ? gap + 1 : n - gap + 1;
        if (shorterCount < 4 || shorterLen > longerLen * 0.42) continue;
        const chord = d;
        if (chord > tolerance * 2.2 || shorterLen <= chord * 1.7) continue;
        let meanR;
        if (lenA <= lenB) {
          meanR = (radiusPrefix[i + gap + 1] - radiusPrefix[i]) / shorterCount;
        } else {
          const forwardRadius = radiusPrefix[i + gap + 1] - radiusPrefix[i];
          meanR = (totalRadius - forwardRadius + distance(center, current[i]) + distance(center, current[j])) / shorterCount;
        }
        const chordR = (distance(center, current[i]) + distance(center, current[j])) / 2;
        const inwardLoop = meanR < chordR - tolerance * 0.18;
        if (!inwardLoop) continue;
        if (!best || shorterLen < best.shorterLen) best = { i, gap, shorterLen, removeForward: lenA <= lenB };
      }
    }
    if (!best) break;
    const next = [];
    const remove = new Set();
    if (best.removeForward) {
      for (let k = 1; k < best.gap; k++) remove.add((best.i + k) % current.length);
    } else {
      for (let k = best.gap + 1; k < current.length; k++) remove.add((best.i + k) % current.length);
    }
    for (let i = 0; i < current.length; i++) {
      if (!remove.has(i)) next.push(current[i]);
    }
    current = dedupeConsecutivePoints(next, Math.max(tolerance * 0.02, 1e-6));
  }
  return current;
}

function detectCornerLocks(points, spacing, smoothingMm, diag) {
  const n = points.length;
  const locks = new Array(n).fill(0);
  if (n < 8) return locks;
  const look = clamp(Math.round(Math.max(smoothingMm * 2.5, diag * 0.006) / Math.max(spacing, 0.001)), 3, Math.max(3, Math.floor(n / 14)));
  const raw = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    const prev = pointAtIndex(points, i - look);
    const p = points[i];
    const next = pointAtIndex(points, i + look);
    const ax = p.x - prev.x;
    const ay = p.y - prev.y;
    const bx = next.x - p.x;
    const by = next.y - p.y;
    const al = Math.hypot(ax, ay);
    const bl = Math.hypot(bx, by);
    if (al <= 1e-9 || bl <= 1e-9) continue;
    const turn = Math.acos(clamp((ax * bx + ay * by) / (al * bl), -1, 1));
    raw[i] = clamp((turn - 0.45) / 0.85, 0, 1);
  }
  const suppress = Math.max(2, Math.floor(look / 3));
  const expand = Math.max(2, Math.floor(look / 2));
  for (let i = 0; i < n; i++) {
    if (raw[i] <= 0.05) continue;
    let localMax = true;
    for (let k = -suppress; k <= suppress; k++) {
      if (k && raw[(i + k + n) % n] > raw[i]) {
        localMax = false;
        break;
      }
    }
    if (!localMax) continue;
    for (let k = -expand; k <= expand; k++) {
      const idx = (i + k + n) % n;
      const weight = raw[i] * (1 - Math.abs(k) / (expand + 1));
      locks[idx] = Math.max(locks[idx], weight);
    }
  }
  return locks;
}

function locallySmoothClosedPath(points, smoothingMm, diag, sourceBox) {
  let contour = dedupeConsecutivePoints(points, Math.max(smoothingMm * 0.01, 1e-6));
  if (contour.length < 4) return [];
  contour = removeShortSpikes(contour, Math.max(smoothingMm * 2.5, diag * 0.003));
  contour = removeLongChordHairpins(contour, diag);
  contour = rdpSimplifyClosed(contour, Math.max(0.001, smoothingMm * 0.02));
  contour = removeSmallSelfLoopsClosed(contour, Math.max(smoothingMm * 10, diag * 0.035));
  contour = preferOuterDuplicateStrands(contour, bboxCenter(sourceBox || bboxForPoints(contour)), Math.max(smoothingMm * 5, diag * 0.018));
  const total = pathLengthPoints(contour, true);
  if (!(total > 0)) return [];
  const spacing = clamp(smoothingMm * 0.35, Math.max(diag / 5000, 0.01), Math.max(diag / 900, 0.05));
  const original = resampleClosedPath(contour, spacing, 3200);
  if (original.length < 4) return [];
  const locks = detectCornerLocks(original, total / original.length, smoothingMm, diag);
  const window = clamp(Math.round(smoothingMm / Math.max(total / original.length, 0.001)), 2, 80);
  let current = original.map((p) => ({ ...p }));

  for (let pass = 0; pass < 3; pass++) {
    const next = [];
    for (let i = 0; i < current.length; i++) {
      if (locks[i] >= 0.82) {
        next.push({ ...original[i], bulge: 0 });
        continue;
      }
      let wx = 0;
      let wy = 0;
      let weightSum = 0;
      for (let k = -window; k <= window; k++) {
        const idx = wrappedIndex(i + k, current.length);
        const t = Math.abs(k) / (window + 1);
        const gaussian = Math.exp(-3.2 * t * t);
        const cornerPenalty = Math.max(locks[i], locks[idx]) * 0.82;
        const w = gaussian * (1 - cornerPenalty);
        wx += current[idx].x * w;
        wy += current[idx].y * w;
        weightSum += w;
      }
      const avg = weightSum > 0 ? { x: wx / weightSum, y: wy / weightSum } : current[i];
      const keepOriginal = 0.44 + locks[i] * 0.46;
      next.push({
        x: avg.x * (1 - keepOriginal) + original[i].x * keepOriginal,
        y: avg.y * (1 - keepOriginal) + original[i].y * keepOriginal,
        bulge: 0,
      });
    }
    current = next;
  }

  current = removeSmallSelfLoopsClosed(current, Math.max(smoothingMm * 7, diag * 0.025));
  current = rdpSimplifyClosed(current, Math.max(0.001, smoothingMm * 0.035));
  current = dedupeConsecutivePoints(current, Math.max(0.001, smoothingMm * 0.02));
  current = resampleClosedPath(current, spacing, 3200);
  if (polygonSignedArea(current) < 0) current.reverse();
  return current.map((p) => ({ x: p.x, y: p.y, bulge: 0 }));
}

function prepareDenseRepairPath(points, smoothingMm, diag) {
  let current = dedupeConsecutivePoints(points, Math.max(smoothingMm * 0.01, 1e-6));
  if (current.length <= 6500) return current;
  const spacing = clamp(
    Math.max(smoothingMm * 0.42, diag / 5200, 0.02),
    0.015,
    Math.max(smoothingMm * 0.9, 0.08),
  );
  current = resampleClosedPath(current, spacing, 6500);
  if (current.length > 6500) {
    current = rdpSimplifyClosed(current, Math.max(0.001, smoothingMm * 0.03));
  }
  return current;
}

function concaveHullLibrary() {
  const lib = window.Concaveman;
  if (typeof lib === "function") return lib;
  if (typeof lib?.default === "function") return lib.default;
  return null;
}

function dedupePointCloudForHull(points, grid) {
  const seen = new Set();
  const out = [];
  for (const p of points) {
    if (!Number.isFinite(p?.x) || !Number.isFinite(p?.y)) continue;
    const key = `${Math.round(p.x / grid)}:${Math.round(p.y / grid)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push([p.x, p.y]);
  }
  return out;
}

function polishOuterHullContour(points, smoothingMm, diag, sourceBox) {
  let contour = dedupeConsecutivePoints(points, Math.max(smoothingMm * 0.01, 1e-6));
  if (contour.length < 4) return [];
  contour = removeShortSpikes(contour, Math.max(smoothingMm * 1.2, diag * 0.001));
  contour = removeLongChordHairpins(contour, diag);
  const total = pathLengthPoints(contour, true);
  if (!(total > 0)) return [];

  const spacing = clamp(
    Math.max(smoothingMm * 0.12, diag / 14000, 0.006),
    0.006,
    Math.max(smoothingMm * 0.35, 0.04),
  );
  const original = resampleClosedPath(contour, spacing, 14000);
  if (original.length < 4) return [];

  const locks = detectCornerLocks(original, total / original.length, smoothingMm, diag);
  const window = clamp(Math.round((smoothingMm * 0.75) / Math.max(spacing, 0.001)), 2, 28);
  let current = original.map((p) => ({ ...p, bulge: 0 }));

  for (let pass = 0; pass < 2; pass++) {
    const next = [];
    for (let i = 0; i < current.length; i++) {
      if (locks[i] >= 0.9) {
        next.push({ ...original[i], bulge: 0 });
        continue;
      }
      let wx = 0;
      let wy = 0;
      let weightSum = 0;
      for (let k = -window; k <= window; k++) {
        const idx = wrappedIndex(i + k, current.length);
        const t = Math.abs(k) / (window + 1);
        const gaussian = Math.exp(-4.4 * t * t);
        const cornerPenalty = Math.max(locks[i], locks[idx]) * 0.92;
        const w = gaussian * (1 - cornerPenalty);
        wx += current[idx].x * w;
        wy += current[idx].y * w;
        weightSum += w;
      }
      const avg = weightSum > 0 ? { x: wx / weightSum, y: wy / weightSum } : current[i];
      const keepOriginal = 0.74 + locks[i] * 0.24;
      next.push({
        x: avg.x * (1 - keepOriginal) + original[i].x * keepOriginal,
        y: avg.y * (1 - keepOriginal) + original[i].y * keepOriginal,
        bulge: 0,
      });
    }
    current = next;
  }

  current = removeShortSpikes(current, Math.max(smoothingMm * 0.75, diag * 0.0008));
  current = removeSmallSelfLoopsClosed(current, Math.max(smoothingMm * 2.6, diag * 0.006));
  current = dedupeConsecutivePoints(current, Math.max(spacing * 0.02, 1e-6));
  if (sourceBox) current = fitContourToBox(current, sourceBox);
  if (polygonSignedArea(current) < 0) current.reverse();
  return current.map((p) => ({ x: p.x, y: p.y, bulge: 0 }));
}

function buildConcaveOuterContour(sourceInfos, analysis, smoothingMm) {
  const hullFn = concaveHullLibrary();
  if (!hullFn) return [];

  const cloud = sourceInfos
    .flatMap((info) => info.points || [])
    .filter((p) => Number.isFinite(p?.x) && Number.isFinite(p?.y));
  if (cloud.length < 80) return [];

  const sourceBox = bboxForPoints(cloud);
  if (!sourceBox) return [];
  const grid = Math.max(smoothingMm * 0.2, analysis.diag / 15000, 0.01);
  const points = dedupePointCloudForHull(cloud, grid);
  if (points.length < 24) return [];

  try {
    const concavity = analysis.suggestedMode === "continuous" ? 1.15 : 1;
    const lengthThreshold = Math.max(smoothingMm * 0.15, analysis.diag / 50000, 0.008);
    const hull = hullFn(points, concavity, lengthThreshold);
    let contour = hull
      .slice(0, hull.length > 1 && hull[0][0] === hull[hull.length - 1][0] && hull[0][1] === hull[hull.length - 1][1] ? -1 : undefined)
      .map(([x, y]) => ({ x, y, bulge: 0 }));
    contour = dedupeConsecutivePoints(contour, Math.max(grid * 0.02, 1e-6));
    const contourBox = bboxForPoints(contour);
    if (!contourBox || contour.length < 4) return [];
    if (Math.abs(polygonSignedArea(contour)) < bboxArea(contourBox) * 0.03) return [];
    return polishOuterHullContour(contour, smoothingMm, analysis.diag, sourceBox);
  } catch (error) {
    console.warn("Concave outer contour failed, falling back to scanline repair.", error);
    return [];
  }
}

function buildLiteralOuterHullContour(sourceInfos, analysis, smoothingMm) {
  const hullFn = concaveHullLibrary();
  if (!hullFn) return [];

  const paths = sourceRepairPaths(sourceInfos, analysis, smoothingMm);
  const cloud = paths
    .flatMap((path) => path)
    .filter((p) => Number.isFinite(p?.x) && Number.isFinite(p?.y));
  if (cloud.length < 80) return [];

  const sourceBox = bboxForPoints(cloud);
  if (!sourceBox) return [];
  const grid = clamp(Math.max(smoothingMm * 0.01, analysis.diag / 40000, 0.008), 0.006, 0.02);
  const points = dedupePointCloudForHull(cloud, grid);
  if (points.length < 24) return [];

  try {
    const hull = hullFn(points, 0.25, Math.max(grid * 0.12, 0.001));
    let contour = hull
      .slice(0, hull.length > 1 && hull[0][0] === hull[hull.length - 1][0] && hull[0][1] === hull[hull.length - 1][1] ? -1 : undefined)
      .map(([x, y]) => ({ x, y, bulge: 0 }));
    contour = dedupeConsecutivePoints(contour, Math.max(grid * 0.05, 1e-7));
    if (contour.length < 4) return [];
    contour = removeShortSpikes(contour, Math.max(grid * 2, 0.02));
    contour = removeSmallSelfLoopsClosed(contour, Math.max(smoothingMm * 0.65, analysis.diag * 0.0015, 0.08));
    contour = dedupeConsecutivePoints(contour, Math.max(grid * 0.05, 1e-7));
    const contourBox = bboxForPoints(contour);
    if (!contourBox || Math.abs(polygonSignedArea(contour)) < bboxArea(contourBox) * 0.04) return [];
    if (polygonSignedArea(contour) < 0) contour.reverse();
    return contour.map((p) => ({ x: p.x, y: p.y, bulge: 0 }));
  } catch (error) {
    console.warn("Literal outer hull failed, falling back to scanline repair.", error);
    return [];
  }
}

function cumulativeClosedPath(points) {
  const cum = [0];
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    total += distance(points[i], points[(i + 1) % points.length]);
    cum.push(total);
  }
  return { cum, total };
}

function pointOnClosedPath(points, cumulative, total, distanceAlongPath) {
  if (!points.length || !(total > 0)) return null;
  const target = ((distanceAlongPath % total) + total) % total;
  let low = 0;
  let high = points.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (cumulative[mid + 1] < target) low = mid + 1;
    else high = mid - 1;
  }
  const index = clamp(low, 0, points.length - 1);
  const a = points[index];
  const b = points[(index + 1) % points.length];
  const segmentLength = cumulative[index + 1] - cumulative[index];
  const t = segmentLength > 1e-12 ? (target - cumulative[index]) / segmentLength : 0;
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    bulge: 0,
  };
}

function projectPointToClosedPath(point, path, cumulative) {
  let best = null;
  for (let i = 0; i < path.length; i++) {
    const a = path[i];
    const b = path[(i + 1) % path.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    if (len2 <= 1e-12) continue;
    const u = clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / len2, 0, 1);
    const base = { x: a.x + dx * u, y: a.y + dy * u };
    const d2 = (point.x - base.x) ** 2 + (point.y - base.y) ** 2;
    if (!best || d2 < best.d2) {
      const len = Math.sqrt(len2);
      best = {
        index: i,
        u,
        s: cumulative[i] + len * u,
        base,
        d2,
        // For a CCW closed path this points away from the filled area.
        normal: { x: dy / len, y: -dx / len },
      };
    }
  }
  return best;
}

function buildSourceGuideContour(cloud, analysis, smoothingMm) {
  const hullFn = concaveHullLibrary();
  if (!hullFn || cloud.length < 80) return [];

  const grid = Math.max(smoothingMm * 0.15, analysis.diag / 22000, 0.006);
  const points = dedupePointCloudForHull(cloud, grid);
  if (points.length < 24) return [];

  try {
    const hull = hullFn(
      points,
      analysis.suggestedMode === "continuous" ? 1.1 : 1.05,
      Math.max(smoothingMm * 0.03, analysis.diag / 70000, 0.004),
    );
    let guide = hull
      .slice(0, hull.length > 1 && hull[0][0] === hull[hull.length - 1][0] && hull[0][1] === hull[hull.length - 1][1] ? -1 : undefined)
      .map(([x, y]) => ({ x, y, bulge: 0 }));
    guide = dedupeConsecutivePoints(guide, Math.max(grid * 0.05, 1e-6));
    if (guide.length < 4) return [];
    guide = rdpSimplifyClosed(guide, Math.max(smoothingMm * 0.015, analysis.diag / 75000, 0.003));
    if (polygonSignedArea(guide) < 0) guide.reverse();
    return resampleClosedPath(
      guide,
      Math.max(smoothingMm * 0.1, analysis.diag / 16000, 0.01),
      16000,
    );
  } catch (error) {
    console.warn("Source guide contour failed, falling back to scanline repair.", error);
    return [];
  }
}

function sourceRepairPaths(sourceInfos, analysis, smoothingMm) {
  const step = clamp(
    Math.max(smoothingMm * 0.08, analysis.diag / 14000, 0.006),
    0.006,
    Math.max(smoothingMm * 0.26, 0.08),
  );
  return sourceInfos
    .flatMap((info) => info.entities || [])
    .map((entity) => entityPathForRepair(entity, step))
    .filter((points) => points.length >= 2);
}

function finalizeTightGuidedContour(points, smoothingMm, diag) {
  let contour = dedupeConsecutivePoints(points, Math.max(smoothingMm * 0.004, 1e-6));
  if (contour.length < 4) return [];
  contour = removeShortSpikes(contour, Math.max(smoothingMm * 0.28, diag * 0.00028, 0.01));
  contour = removeLongChordHairpins(contour, diag);
  const spacing = clamp(Math.max(smoothingMm * 0.028, diag / 20000, 0.008), 0.007, 0.024);
  contour = resampleClosedPath(contour, spacing, 12000);
  contour = dedupeConsecutivePoints(contour, Math.max(spacing * 0.02, 1e-6));
  if (polygonSignedArea(contour) < 0) contour.reverse();
  return contour.map((p) => ({ x: p.x, y: p.y, bulge: 0 }));
}

function smoothSourceGuidedContour(points, smoothingMm, diag) {
  let original = dedupeConsecutivePoints(points, Math.max(smoothingMm * 0.003, 1e-7));
  if (original.length < 4) return [];
  original = removeShortSpikes(original, Math.max(smoothingMm * 0.6, diag * 0.0008));
  original = removeSmallSelfLoopsClosed(original, Math.max(smoothingMm * 2.2, diag * 0.004));
  const spacing = clamp(
    Math.max(smoothingMm * 0.045, diag / 16000, 0.02),
    0.018,
    Math.max(smoothingMm * 0.08, 0.09),
  );
  original = resampleClosedPath(original, spacing, 10000);
  if (original.length < 4) return [];

  const locks = detectCornerLocks(original, spacing, smoothingMm, diag);
  const window = clamp(Math.round(Math.max(smoothingMm * 0.24, 0.12) / spacing), 2, 80);
  let current = original.map((p) => ({ ...p, bulge: 0 }));
  for (let pass = 0; pass < 1; pass++) {
    const next = [];
    for (let i = 0; i < current.length; i++) {
      if (locks[i] >= 0.9) {
        next.push({ ...original[i], bulge: 0 });
        continue;
      }
      let wx = 0;
      let wy = 0;
      let weightSum = 0;
      for (let k = -window; k <= window; k++) {
        const idx = wrappedIndex(i + k, current.length);
        const t = Math.abs(k) / (window + 1);
        const cornerPenalty = Math.max(locks[i], locks[idx]) * 0.94;
        const weight = Math.exp(-4.0 * t * t) * (1 - cornerPenalty);
        wx += current[idx].x * weight;
        wy += current[idx].y * weight;
        weightSum += weight;
      }
      const avg = weightSum > 0 ? { x: wx / weightSum, y: wy / weightSum } : current[i];
      const keepOriginal = 0.94 + locks[i] * 0.05;
      next.push({
        x: avg.x * (1 - keepOriginal) + original[i].x * keepOriginal,
        y: avg.y * (1 - keepOriginal) + original[i].y * keepOriginal,
        bulge: 0,
      });
    }
    current = next;
  }

  current = rdpSimplifyClosed(current, Math.max(smoothingMm * 0.008, diag / 70000, 0.004));
  current = resampleClosedPath(current, spacing, 10000);
  current = dedupeConsecutivePoints(current, Math.max(spacing * 0.02, 1e-6));
  if (polygonSignedArea(current) < 0) current.reverse();
  return current.map((p) => ({ x: p.x, y: p.y, bulge: 0 }));
}

function smoothContourForLineArcRebuild(points, smoothingMm, diag) {
  let original = dedupeConsecutivePoints(points, Math.max(smoothingMm * 0.003, 1e-7));
  if (original.length < 4 || smoothingMm <= 0.001) return original;
  const spacing = clamp(
    Math.max(smoothingMm * 0.35, diag / 12000, 0.035),
    0.025,
    Math.max(smoothingMm * 0.7, 0.12),
  );
  original = resampleClosedPath(original, spacing, 14000);
  if (original.length < 4) return [];

  const locks = detectCornerLocks(original, spacing, smoothingMm, diag);
  const window = clamp(Math.round(smoothingMm / Math.max(spacing, 0.001)), 2, 24);
  let current = original.map((p) => ({ ...p, bulge: 0 }));
  for (let pass = 0; pass < 2; pass++) {
    const next = [];
    for (let i = 0; i < current.length; i++) {
      if (locks[i] >= 0.9) {
        next.push({ ...original[i], bulge: 0 });
        continue;
      }
      let wx = 0;
      let wy = 0;
      let weightSum = 0;
      for (let k = -window; k <= window; k++) {
        const idx = wrappedIndex(i + k, current.length);
        const t = Math.abs(k) / (window + 1);
        const cornerPenalty = Math.max(locks[i], locks[idx]) * 0.92;
        const weight = Math.exp(-4.2 * t * t) * (1 - cornerPenalty);
        wx += current[idx].x * weight;
        wy += current[idx].y * weight;
        weightSum += weight;
      }
      const avg = weightSum > 0 ? { x: wx / weightSum, y: wy / weightSum } : current[i];
      const keepOriginal = 0.66 + locks[i] * 0.32;
      next.push({
        x: avg.x * (1 - keepOriginal) + original[i].x * keepOriginal,
        y: avg.y * (1 - keepOriginal) + original[i].y * keepOriginal,
        bulge: 0,
      });
    }
    current = next;
  }
  current = rdpSimplifyClosed(current, Math.max(smoothingMm * 0.025, diag / 90000, 0.004));
  current = dedupeConsecutivePoints(current, Math.max(spacing * 0.02, 1e-6));
  if (polygonSignedArea(current) < 0) current.reverse();
  return current.map((p) => ({ x: p.x, y: p.y, bulge: 0 }));
}

function buildSourceGuidedOuterContour(sourceInfos, analysis, smoothingMm) {
  const entityCount = sourceInfos.reduce((sum, info) => sum + (info.entities?.length || 0), 0);
  const paths = sourceRepairPaths(sourceInfos, analysis, smoothingMm);
  const cloud = paths
    .flatMap((path) => path)
    .filter((p) => Number.isFinite(p?.x) && Number.isFinite(p?.y));
  if (cloud.length < 80) return [];

  const guide = buildSourceGuideContour(cloud, analysis, smoothingMm);
  if (guide.length < 4) return [];
  const guideMeta = cumulativeClosedPath(guide);
  if (!(guideMeta.total > 0)) return [];

  const binSpacing = clamp(
    Math.max(smoothingMm * 0.028, analysis.diag / 20000, 0.024),
    0.018,
    Math.max(smoothingMm * 0.065, 0.075),
  );
  const binCount = clamp(Math.round(guideMeta.total / binSpacing), 300, 24000);
  const bins = Array.from({ length: binCount }, () => []);
  const nearTol = Math.max(smoothingMm * 12, analysis.diag * 0.025, 1.5);
  const nearTol2 = nearTol * nearTol;

  for (const point of cloud) {
    const projected = projectPointToClosedPath(point, guide, guideMeta.cum);
    if (!projected || projected.d2 > nearTol2) continue;
    const offset = (point.x - projected.base.x) * projected.normal.x
      + (point.y - projected.base.y) * projected.normal.y;
    const bin = clamp(Math.floor((projected.s / guideMeta.total) * binCount), 0, binCount - 1);
    bins[bin].push({ point, offset, distance: Math.sqrt(projected.d2) });
  }

  const picks = Array(binCount).fill(null);
  for (let i = 0; i < bins.length; i++) {
    const items = bins[i];
    if (!items.length) continue;
    items.sort((a, b) => b.offset - a.offset || a.distance - b.distance);
    const pick = items[0];
    picks[i] = { x: pick.point.x, y: pick.point.y, bulge: 0 };
  }

  const maxInterpolateBins = entityCount > 350 ? 28 : 84;
  for (let i = 0; i < picks.length; i++) {
    if (picks[i]) continue;
    let prev = i - 1;
    while (prev >= i - picks.length && !picks[wrappedIndex(prev, picks.length)]) prev--;
    let next = i + 1;
    while (next <= i + picks.length && !picks[next % picks.length]) next++;
    const pa = picks[wrappedIndex(prev, picks.length)];
    const na = picks[next % picks.length];
    const gap = next - prev;
    if (pa && na && gap <= maxInterpolateBins) {
      const t = (i - prev) / gap;
      picks[i] = {
        x: pa.x * (1 - t) + na.x * t,
        y: pa.y * (1 - t) + na.y * t,
        bulge: 0,
      };
    } else {
      picks[i] = pointOnClosedPath(guide, guideMeta.cum, guideMeta.total, ((i + 0.5) / binCount) * guideMeta.total);
    }
  }

  let contour = finalizeTightGuidedContour(picks.filter(Boolean), smoothingMm, analysis.diag);
  const contourBox = bboxForPoints(contour);
  if (!contourBox || contour.length < 4) return [];
  if (Math.abs(polygonSignedArea(contour)) < bboxArea(contourBox) * 0.015) return [];
  if (entityCount > 350) {
    const snapSegments = subsampleSegments(
      segmentsFromPaths(sourceRepairPaths(sourceInfos, analysis, smoothingMm)),
      16000,
    );
    contour = snapClosedContourToSegments(contour, snapSegments, Math.max(smoothingMm * 0.22, 0.11));
    contour = dedupeConsecutivePoints(contour, Math.max(smoothingMm * 0.003, 1e-6));
  } else if (contour.length >= 4) {
    const snapSegments = subsampleSegments(
      segmentsFromPaths(sourceRepairPaths(sourceInfos, analysis, smoothingMm)),
      12000,
    );
    contour = snapClosedContourToSegments(contour, snapSegments, Math.max(smoothingMm * 0.18, 0.09));
    contour = dedupeConsecutivePoints(contour, Math.max(smoothingMm * 0.003, 1e-6));
  }
  return contour;
}

function solve3x3(matrix, vector) {
  const a = matrix.map((row, i) => row.concat(vector[i]));
  for (let col = 0; col < 3; col++) {
    let pivot = col;
    for (let row = col + 1; row < 3; row++) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    }
    if (Math.abs(a[pivot][col]) < 1e-12) return null;
    if (pivot !== col) [a[pivot], a[col]] = [a[col], a[pivot]];
    const div = a[col][col];
    for (let k = col; k < 4; k++) a[col][k] /= div;
    for (let row = 0; row < 3; row++) {
      if (row === col) continue;
      const factor = a[row][col];
      for (let k = col; k < 4; k++) a[row][k] -= factor * a[col][k];
    }
  }
  return [a[0][3], a[1][3], a[2][3]];
}

function fitCircleLeastSquares(points, start, end) {
  const count = end - start + 1;
  if (count < 3) return null;
  let sx = 0;
  let sy = 0;
  let sx2 = 0;
  let sy2 = 0;
  let sxy = 0;
  let sxz = 0;
  let syz = 0;
  let sz = 0;
  for (let i = start; i <= end; i++) {
    const p = points[i];
    const z = p.x * p.x + p.y * p.y;
    sx += p.x;
    sy += p.y;
    sx2 += p.x * p.x;
    sy2 += p.y * p.y;
    sxy += p.x * p.y;
    sxz += p.x * z;
    syz += p.y * z;
    sz += z;
  }
  const solution = solve3x3(
    [
      [sx2, sxy, sx],
      [sxy, sy2, sy],
      [sx, sy, count],
    ],
    [-sxz, -syz, -sz],
  );
  if (!solution) return null;
  const [a, b, c] = solution;
  const cx = -a / 2;
  const cy = -b / 2;
  const r2 = cx * cx + cy * cy - c;
  if (!(r2 > 1e-12)) return null;
  const r = Math.sqrt(r2);
  if (!Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(r)) return null;
  return { cx, cy, r };
}

function unwrapArcAngles(points, start, end, circle) {
  const angles = [];
  let prev = Math.atan2(points[start].y - circle.cy, points[start].x - circle.cx);
  angles.push(prev);
  for (let i = start + 1; i <= end; i++) {
    let angle = Math.atan2(points[i].y - circle.cy, points[i].x - circle.cx);
    while (angle - prev > Math.PI) angle -= Math.PI * 2;
    while (angle - prev < -Math.PI) angle += Math.PI * 2;
    angles.push(angle);
    prev = angle;
  }
  return angles;
}

function lineFitError(points, start, end) {
  const a = points[start];
  const b = points[end];
  if (!a || !b) return { maxError: Infinity, split: Math.floor((start + end) / 2), bulge: 0 };
  let maxError = 0;
  let split = Math.floor((start + end) / 2);
  for (let i = start + 1; i < end; i++) {
    const pt = points[i];
    if (!pt) continue;
    const error = perpendicularDistanceToSegment(pt, a, b);
    if (error > maxError) {
      maxError = error;
      split = i;
    }
  }
  return { maxError, split, bulge: 0 };
}

function arcFitError(points, start, end, minRadius = 0) {
  const circle = fitCircleLeastSquares(points, start, end);
  if (!circle) return null;
  if (minRadius > 0 && circle.r < minRadius) return null;
  const angles = unwrapArcAngles(points, start, end, circle);
  const sweep = angles[angles.length - 1] - angles[0];
  // Reject near-full-circle / looping arcs. A single outline segment between two
  // corners should not sweep much past a semicircle; allowing huge sweeps lets
  // the circle fit "loop" out through nearby noisy points.
  if (!Number.isFinite(sweep) || Math.abs(sweep) < 1e-5 || Math.abs(sweep) > Math.PI * 1.05) return null;

  const direction = Math.sign(sweep);
  let backwards = 0;
  for (let i = 1; i < angles.length; i++) {
    if ((angles[i] - angles[i - 1]) * direction < -0.04) backwards++;
  }
  if (backwards > Math.max(2, Math.floor(angles.length * 0.04))) return null;

  let maxError = 0;
  let split = Math.floor((start + end) / 2);
  for (let i = start + 1; i < end; i++) {
    const p = points[i];
    const error = Math.abs(Math.hypot(p.x - circle.cx, p.y - circle.cy) - circle.r);
    if (error > maxError) {
      maxError = error;
      split = i;
    }
  }
  const bulge = Math.tan(sweep / 4);
  if (!Number.isFinite(bulge) || Math.abs(bulge) > 25) return null;
  return { maxError, split, bulge, circle };
}

function strongestClosedCornerIndex(points) {
  const n = points.length;
  if (n < 4) return 0;
  const total = pathLengthPoints(points, true);
  const spacing = total > 0 ? total / n : 0.05;
  const look = clamp(Math.round(1 / Math.max(spacing, 0.001)), 3, Math.min(44, Math.floor(n / 6)));
  let best = 0;
  let bestScore = -1;
  for (let i = 0; i < n; i++) {
    const a = points[wrappedIndex(i - look, n)];
    const b = points[i];
    const c = points[wrappedIndex(i + look, n)];
    const ax = a.x - b.x;
    const ay = a.y - b.y;
    const bx = c.x - b.x;
    const by = c.y - b.y;
    const al = Math.hypot(ax, ay);
    const bl = Math.hypot(bx, by);
    if (al <= 1e-9 || bl <= 1e-9) continue;
    const turn = Math.acos(clamp((ax * bx + ay * by) / (al * bl), -1, 1));
    if (turn > bestScore) {
      bestScore = turn;
      best = i;
    }
  }
  return best;
}

function sampleSegmentForDeviation(a, b, bulge, sampleStep) {
  const step = Math.max(sampleStep || 0.03, 0.01);
  if (Math.abs(bulge || 0) <= BULGE_TOL) {
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const count = clamp(Math.ceil(len / step), 3, 240);
    const pts = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      pts.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
    return pts;
  }
  const arc = bulgeToArc(a, b, bulge);
  const len = arc ? Math.abs(arc.r * arc.sweep) : Math.hypot(b.x - a.x, b.y - a.y);
  const steps = clamp(Math.ceil(len / step), 6, 240);
  return sampleBulgeSegment(a, b, bulge, steps);
}

function sampleClosedBulgedPath(points, step, maxCount = 12000) {
  if (points.length < 2) return points.slice();
  const sampleStep = Math.max(step || 0.04, 0.01);
  const out = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const seg = sampleSegmentForDeviation(a, b, a.bulge || 0, sampleStep);
    for (let k = 0; k < seg.length; k++) {
      if (k === 0 && out.length) continue;
      out.push(seg[k]);
      if (out.length >= maxCount) return out;
    }
  }
  return out;
}

function measureSegmentReverseDeviation(a, b, bulge, validation) {
  const samples = sampleSegmentForDeviation(a, b, bulge, validation?.sampleStep);
  if (validation?.originalPath?.length >= 2) {
    return maxDeviationToClosedPolylinePath(samples, validation.originalPath);
  }
  if (validation?.segments?.length) {
    return maxDeviationPointsToSegments(samples, validation.segments);
  }
  return 0;
}

function arcLineSegmentWithinTolerance(chain, start, end, bulge, tolerance, validation) {
  const a = chain[start];
  const b = chain[end];
  for (let i = start; i <= end; i++) {
    if (distanceToBulgeSegment(chain[i], a, b, bulge) > tolerance) return false;
  }
  // Reverse check for arcs: every point along the fitted arc must stay within
  // tolerance of the LOCAL reference polyline (the chain points this segment
  // spans). This catches arcs that bulge/loop out into empty space. We check
  // locally instead of projecting onto the whole closed path, which would
  // falsely match the opposite edge on thin parts.
  if (Math.abs(bulge || 0) > BULGE_TOL) {
    const samples = sampleSegmentForDeviation(a, b, bulge, Math.min(Math.max(tolerance, 0.01), 0.04));
    for (const s of samples) {
      let best = Infinity;
      for (let i = start; i < end; i++) {
        const d = perpendicularDistanceToSegment(s, chain[i], chain[i + 1]);
        if (d < best) best = d;
        if (best <= tolerance) break;
      }
      if (best > tolerance) return false;
    }
  }
  if (validation?.segments?.length) {
    if (measureSegmentReverseDeviation(a, b, bulge, validation) > tolerance) return false;
  }
  return true;
}

function fitLineArcRange(points, start, end, tolerance, validation = null) {
  const count = end - start + 1;
  const line = lineFitError(points, start, end);
  if (count <= 2 || line.maxError <= tolerance) {
    if (arcLineSegmentWithinTolerance(points, start, end, 0, tolerance, validation)) {
      return { ok: true, type: "line", bulge: 0, split: line.split, error: line.maxError };
    }
    if (count <= 2) return { ok: false, split: line.split, error: line.maxError, fallbackBulge: 0 };
  }
  const arc = count >= 3 ? arcFitError(points, start, end) : null;
  if (arc && arc.maxError <= tolerance) {
    if (arcLineSegmentWithinTolerance(points, start, end, arc.bulge, tolerance, validation)) {
      return { ok: true, type: "arc", bulge: arc.bulge, split: arc.split, error: arc.maxError };
    }
  }
  if (arc && arc.maxError < line.maxError) return { ok: false, split: arc.split, error: arc.maxError, fallbackBulge: arc.bulge };
  return { ok: false, split: line.split, error: line.maxError, fallbackBulge: 0 };
}

function angleWithinSweep(angle, start, sweep) {
  let rel = angle - start;
  if (sweep >= 0) {
    while (rel < 0) rel += Math.PI * 2;
    while (rel > Math.PI * 2) rel -= Math.PI * 2;
    return rel <= sweep + 1e-9;
  }
  while (rel > 0) rel -= Math.PI * 2;
  while (rel < -Math.PI * 2) rel += Math.PI * 2;
  return rel >= sweep - 1e-9;
}

function distanceToBulgeSegment(point, a, b, bulge) {
  if (Math.abs(bulge || 0) < BULGE_TOL) return perpendicularDistanceToSegment(point, a, b);
  const arc = bulgeToArc(a, b, bulge);
  if (!arc) return perpendicularDistanceToSegment(point, a, b);
  const angle = Math.atan2(point.y - arc.cy, point.x - arc.cx);
  if (angleWithinSweep(angle, arc.start, arc.sweep)) {
    return Math.abs(Math.hypot(point.x - arc.cx, point.y - arc.cy) - arc.r);
  }
  return Math.min(distance(point, a), distance(point, b));
}

function maxDeviationToBulgedPolyline(sourcePoints, polylinePoints) {
  if (sourcePoints.length < 2 || polylinePoints.length < 2) return Infinity;
  let maxError = 0;
  const segments = polylinePoints.map((p, i) => ({
    a: p,
    b: polylinePoints[(i + 1) % polylinePoints.length],
    bulge: p.bulge || 0,
  }));
  for (const point of sourcePoints) {
    let best = Infinity;
    for (const segment of segments) {
      const d = distanceToBulgeSegment(point, segment.a, segment.b, segment.bulge);
      if (d < best) best = d;
      if (best <= maxError) break;
    }
    if (best > maxError) maxError = best;
  }
  return maxError;
}

function segmentsFromPaths(paths) {
  const segments = [];
  for (const path of paths || []) {
    if (!path || path.length < 2) continue;
    for (let i = 0; i < path.length - 1; i++) segments.push({ a: path[i], b: path[i + 1] });
  }
  return segments;
}

function maxDeviationPointsToSegments(points, segments) {
  if (!points.length || !segments.length) return Infinity;
  let maxError = 0;
  for (const point of points) {
    let best = Infinity;
    for (const segment of segments) {
      const d = perpendicularDistanceToSegment(point, segment.a, segment.b);
      if (d < best) best = d;
      if (best <= maxError) break;
    }
    if (best > maxError) maxError = best;
  }
  return maxError;
}

function collectSourceOutlinePaths(sourceInfos, analysis, contourSmoothingMm) {
  const step = Math.max(Math.min(contourSmoothingMm * 0.3, analysis.diag / 1200), 0.015);
  const connectTol = Math.max(CONNECT_TOL * 8, step * 4, contourSmoothingMm * 0.8);
  return sourceInfos
    .flatMap((info) => orderedFeatureRepairPaths(info, step, connectTol))
    .filter((path) => path.length >= 2);
}

function collectRadialShellOutlineSamples(points, center, diag, step) {
  const clean = dedupeConsecutivePoints(points, Math.max(step * 0.04, 1e-6));
  if (clean.length < 8) return clean;
  let maxR = 0;
  for (const p of clean) maxR = Math.max(maxR, distance(center, p));
  if (!(maxR > 0)) return clean;
  const binStep = Math.max(step * 2, diag / 2400, 0.04);
  const binCount = clamp(Math.round((Math.PI * 2 * maxR) / binStep), 96, 4800);
  const bins = Array.from({ length: binCount }, () => []);
  for (const p of clean) {
    const a = (Math.atan2(p.y - center.y, p.x - center.x) + Math.PI * 2) % (Math.PI * 2);
    const r = distance(center, p);
    bins[Math.min(binCount - 1, Math.floor((a / (Math.PI * 2)) * binCount))].push({ p, r });
  }
  const shell = [];
  for (const items of bins) {
    if (!items.length) continue;
    items.sort((a, b) => b.r - a.r);
    const keep = Math.max(1, Math.ceil(items.length * 0.14));
    for (const item of items.slice(0, keep)) shell.push(item.p);
  }
  return shell.length >= 8 ? dedupeConsecutivePoints(shell, Math.max(step * 0.04, 1e-6)) : clean;
}

function collectOuterShellOutlineSamples(sourceInfos, analysis, contourSmoothingMm) {
  const step = Math.max(analysis.baseStep * 0.25, 0.02);
  const points = [];
  for (const info of sourceInfos) {
    for (const entity of info.entities) points.push(...sampleEntityForRepair(entity, step));
  }
  const clean = dedupeConsecutivePoints(points, Math.max(step * 0.04, 1e-6));
  if (clean.length < 80) return clean;

  const guideSmoothing = Math.max(contourSmoothingMm * 0.65, analysis.baseStep * 1.5, 0.06);
  const guide = buildSourceGuideContour(clean, analysis, guideSmoothing);
  if (guide.length < 4) return collectRadialShellOutlineSamples(clean, analysis.center, analysis.diag, step);

  const guideMeta = cumulativeClosedPath(guide);
  if (!(guideMeta.total > 0)) return collectRadialShellOutlineSamples(clean, analysis.center, analysis.diag, step);

  const binSpacing = clamp(Math.max(analysis.baseStep * 0.35, 0.022), 0.018, 0.06);
  const binCount = clamp(Math.round(guideMeta.total / binSpacing), 240, 10000);
  const bins = Array.from({ length: binCount }, () => []);
  const nearTol = Math.max(analysis.diag * 0.022, contourSmoothingMm * 8, 1.2);
  const nearTol2 = nearTol * nearTol;

  for (const point of clean) {
    const projected = projectPointToClosedPath(point, guide, guideMeta.cum);
    if (!projected || projected.d2 > nearTol2) continue;
    const offset = (point.x - projected.base.x) * projected.normal.x
      + (point.y - projected.base.y) * projected.normal.y;
    const bin = clamp(Math.floor((projected.s / guideMeta.total) * binCount), 0, binCount - 1);
    bins[bin].push({ point, offset, distance: Math.sqrt(projected.d2) });
  }

  const shell = [];
  for (const items of bins) {
    if (!items.length) continue;
    items.sort((a, b) => b.offset - a.offset || a.distance - b.distance);
    const shellCount = Math.max(1, Math.min(items.length, Math.ceil(items.length * 0.42)));
    const pickCount = Math.max(1, Math.ceil(shellCount * 0.45));
    for (const item of items.slice(0, pickCount)) shell.push(item.point);
  }
  if (shell.length >= 24) return dedupeConsecutivePoints(shell, Math.max(step * 0.04, 1e-6));
  return collectRadialShellOutlineSamples(clean, analysis.center, analysis.diag, step);
}

function collectOuterBoundarySegments(sourceInfos, analysis, contourSmoothingMm) {
  const step = Math.max(analysis.baseStep * 0.25, 0.02);
  const cloud = [];
  const segments = [];
  for (const info of sourceInfos) {
    for (const entity of info.entities) {
      const path = sampleEntityForRepair(entity, step);
      for (let i = 0; i < path.length - 1; i++) {
        segments.push({ a: path[i], b: path[i + 1] });
        cloud.push(path[i]);
      }
      if (path.length) cloud.push(path[path.length - 1]);
    }
  }
  if (segments.length < 4) {
    return segmentsFromPaths(collectSourceOutlinePaths(sourceInfos, analysis, contourSmoothingMm));
  }

  const guideSmoothing = Math.max(contourSmoothingMm * 0.65, analysis.baseStep * 1.5, 0.06);
  const guide = buildSourceGuideContour(cloud, analysis, guideSmoothing);
  if (guide.length < 4) return segments;

  const guideMeta = cumulativeClosedPath(guide);
  if (!(guideMeta.total > 0)) return segments;

  const nearTol = Math.max(analysis.diag * 0.015, contourSmoothingMm * 6, 0.8);
  const nearTol2 = nearTol * nearTol;
  const filtered = [];
  for (const segment of segments) {
    const mid = { x: (segment.a.x + segment.b.x) / 2, y: (segment.a.y + segment.b.y) / 2 };
    const projected = projectPointToClosedPath(mid, guide, guideMeta.cum);
    if (!projected || projected.d2 > nearTol2) continue;
    const offset = (mid.x - projected.base.x) * projected.normal.x
      + (mid.y - projected.base.y) * projected.normal.y;
    if (offset >= -Math.max(contourSmoothingMm * 0.35, 0.02)) filtered.push(segment);
  }
  return filtered.length >= 8
    ? filtered
    : segmentsFromPaths(collectSourceOutlinePaths(sourceInfos, analysis, contourSmoothingMm));
}

function collectOuterBoundaryPaths(sourceInfos, analysis, contourSmoothingMm) {
  return collectOuterBoundarySegments(sourceInfos, analysis, contourSmoothingMm)
    .map((segment) => [segment.a, segment.b]);
}

function subsamplePoints(points, maxCount) {
  if (points.length <= maxCount) return points;
  const out = [];
  for (let i = 0; i < maxCount; i++) {
    const idx = Math.min(points.length - 1, Math.floor((i / maxCount) * points.length));
    out.push(points[idx]);
  }
  return out;
}

function collectOuterBoundarySamplePoints(sourceInfos, analysis, contourSmoothingMm) {
  const entityCount = sourceInfos.reduce((sum, info) => sum + (info.entities?.length || 0), 0);
  const step = Math.max(analysis.baseStep * 0.25, 0.02);
  const minSegLen = entityCount > 350 ? Math.max(step * 0.95, contourSmoothingMm * 0.08, 0.022) : 0;
  const segments = collectOuterBoundarySegments(sourceInfos, analysis, contourSmoothingMm);
  const sampleFromSegments = (filterShort) => {
    const points = [];
    for (const segment of segments) {
      if (filterShort && minSegLen > 0 && distance(segment.a, segment.b) < minSegLen) continue;
      const segLen = distance(segment.a, segment.b);
      const steps = Math.max(1, Math.min(Math.ceil(segLen / Math.max(step * 0.5, 0.01)), 24));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        points.push({
          x: segment.a.x * (1 - t) + segment.b.x * t,
          y: segment.a.y * (1 - t) + segment.b.y * t,
          bulge: 0,
        });
      }
    }
    return dedupeConsecutivePoints(points, Math.max(step * 0.02, 1e-6));
  };
  const minSamples = entityCount > 350 ? 1200 : 400;
  let points = sampleFromSegments(true);
  if (points.length < minSamples && minSegLen > 0) points = sampleFromSegments(false);
  if (entityCount > 350 && points.length < minSamples) {
    const path = collectOrderedOriginalOutlinePath(sourceInfos, analysis, contourSmoothingMm);
    if (path.length >= 8) points = path;
  }
  return points;
}

function collectOrderedOriginalOutlinePath(sourceInfos, analysis, contourSmoothingMm) {
  const entityCount = sourceInfos.reduce((sum, info) => sum + (info.entities?.length || 0), 0);
  const sampleStep = clamp(Math.max(analysis.baseStep * 0.45, 0.03), 0.03, 0.08);
  let path = entityCount > 350
    ? buildSourceGuidedOuterContour(sourceInfos, analysis, contourSmoothingMm)
    : buildEndpointWalkOuterContour(sourceInfos, analysis, contourSmoothingMm);
  if (path.length < 4) {
    path = buildSourceGuidedOuterContour(sourceInfos, analysis, contourSmoothingMm);
  }
  if (path.length < 4) {
    const step = Math.max(analysis.baseStep * 0.25, 0.02);
    const connectTol = Math.max(CONNECT_TOL * 8, step * 4, contourSmoothingMm * 0.8);
    const paths = sourceInfos.flatMap((info) => orderedFeatureRepairPaths(info, step, connectTol));
    path = prepareDenseRepairPath(joinRepairPaths(paths, "continuous", analysis.diag), contourSmoothingMm * 0.12, analysis.diag);
  }
  if (path.length < 4) return [];
  return resampleClosedPath(dedupeConsecutivePoints(path, Math.max(sampleStep * 0.02, 1e-6)), sampleStep, 12000);
}

function maxDeviationToClosedPolylinePath(points, path) {
  if (!points.length || path.length < 2) return Infinity;
  const meta = cumulativeClosedPath(path);
  let maxError = 0;
  for (const point of points) {
    const projected = projectPointToClosedPath(point, path, meta.cum);
    const d = projected ? Math.sqrt(projected.d2) : Infinity;
    if (d > maxError) maxError = d;
  }
  return maxError;
}

function createOutlineDeviationContext(sourceInfos, analysis, contourSmoothingMm) {
  const entityCount = sourceInfos.reduce((sum, info) => sum + (info.entities?.length || 0), 0);
  const sampleStep = clamp(Math.max(analysis.baseStep * 0.45, 0.03), 0.03, 0.08);
  const originalPath = collectOrderedOriginalOutlinePath(sourceInfos, analysis, contourSmoothingMm);
  const pathSamples = originalPath.length >= 8
    ? resampleClosedPath(originalPath, sampleStep, 12000)
    : [];
  const segmentSamples = collectOuterBoundarySamplePoints(sourceInfos, analysis, contourSmoothingMm);
  const originalSamples = subsamplePoints(
    entityCount > 350 && pathSamples.length >= 8 ? pathSamples : segmentSamples,
    12000,
  );
  const segments = subsampleSegments(
    segmentsFromPaths(collectSourceOutlinePaths(sourceInfos, analysis, contourSmoothingMm)),
    24000,
  );
  return { originalSamples, segments, originalPath, sampleStep };
}

function subsampleSegments(segments, maxCount) {
  if (segments.length <= maxCount) return segments;
  const out = [];
  for (let i = 0; i < maxCount; i++) {
    const idx = Math.min(segments.length - 1, Math.floor((i / maxCount) * segments.length));
    out.push(segments[idx]);
  }
  return out;
}

function measureOutlineDeviationWithContext(ctx, repairedPoints) {
  // Bidirectional (Hausdorff-style) deviation:
  //  - forwardMm: every point of the ORIGINAL outline is covered by the repaired
  //    contour (catches the repaired contour cutting/missing features).
  //  - reverseMm: every point of the REPAIRED contour lies on the original
  //    outline (catches the repaired contour wiggling/bulging out into space,
  //    i.e. jaggedness and overshoot).
  const forwardMm = maxDeviationToBulgedPolyline(ctx.originalSamples, repairedPoints);
  const repairedSample = sampleClosedBulgedPath(repairedPoints, ctx.sampleStep, 12000);
  const reverseMm = ctx.originalPath?.length >= 2
    ? maxDeviationToClosedPolylinePath(repairedSample, ctx.originalPath)
    : maxDeviationPointsToSegments(repairedSample, ctx.segments);
  const maxMm = Math.max(forwardMm, reverseMm);
  return {
    maxMm,
    forwardMm,
    reverseMm,
    originalSampleCount: ctx.originalSamples.length,
    repairedSampleCount: repairedSample.length,
  };
}

function measureOutlineDeviation(sourceInfos, analysis, repairedPoints, contourSmoothingMm) {
  const ctx = createOutlineDeviationContext(sourceInfos, analysis, contourSmoothingMm);
  return measureOutlineDeviationWithContext(ctx, repairedPoints);
}

function computeOuterContourRepairResult(options) {
  const analysis = analyseOuterContourRepair();
  if (!analysis?.outerInfo) return null;
  const filterArea = Math.max(0, Number(options.smallFilterAreaMm2) || 0);
  let contourSmoothingMm = Math.max(0.001, Number(options.contourSmoothingMm) || automaticContourSmoothing(analysis));
  const lineArcSmoothingMm = Math.max(0.001, Number(options.smoothingMm) || automaticLineArcSmoothing(analysis, contourSmoothingMm));
  const mode = options.mode === "continuous" ? "continuous" : "fragmented";
  let rebuildLinesAndArcs = !!options.rebuildLinesAndArcs;
  let best = null;
  const entityCount = analysis.entities.length;
  const maxAttempts = entityCount > 350 ? 3 : 5;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const plan = planOuterContourRepair(analysis, filterArea, contourSmoothingMm, mode);
    const sourceInfos = plan.sourceInfos.length ? plan.sourceInfos : [analysis.outerInfo];
    const contour = buildLocalOuterContour(sourceInfos, analysis, contourSmoothingMm, mode, attempt);
    if (contour.length < 4) {
      contourSmoothingMm = Math.max(contourSmoothingMm * 0.65, analysis.baseStep * 0.35);
      continue;
    }
    let outputContour = contour;
    let lineArcResult = null;
    const deviationCtx = createOutlineDeviationContext(sourceInfos, analysis, contourSmoothingMm);
    if (rebuildLinesAndArcs) {
      const tolerance = Math.max(0.001, Number(options.lineArcToleranceMm) || automaticLineArcTolerance(analysis));
      const lineArcSource = smoothContourForLineArcRebuild(contour, lineArcSmoothingMm, analysis.diag);
      lineArcResult = rebuildContourAsLinesAndArcs(
        lineArcSource.length >= 4 ? lineArcSource : contour,
        tolerance,
        deviationCtx,
      );
      if (lineArcResult?.accepted) {
        const lineArcOutlineDev = measureOutlineDeviationWithContext(deviationCtx, lineArcResult.points);
        if (lineArcOutlineDev.maxMm <= OUTLINE_ACCEPTANCE_MM) {
          outputContour = lineArcResult.points;
        }
      }
    }
    outputContour = snapOutputContourToSource(outputContour, sourceInfos, analysis, contourSmoothingMm);
    const deviation = measureOutlineDeviationWithContext(deviationCtx, outputContour);
    const candidate = {
      analysis,
      plan,
      sourceInfos,
      contour,
      outputContour,
      lineArcResult,
      deviation,
      contourSmoothingMm,
      lineArcSmoothingMm,
      filterArea,
      mode,
      rebuildLinesAndArcs,
      accepted: deviation.maxMm <= OUTLINE_ACCEPTANCE_MM,
    };
    if (!best || deviation.maxMm < best.deviation.maxMm) best = candidate;
    if (candidate.accepted) return candidate;
    contourSmoothingMm = Math.max(contourSmoothingMm * 0.65, analysis.baseStep * 0.35);
    if (lineArcResult && !lineArcResult.accepted) rebuildLinesAndArcs = false;
  }
  return best;
}

function rebuildContourAsLinesAndArcs(points, toleranceMm, validation = null) {
  const tolerance = Math.max(0.001, Number(toleranceMm) || 0.05);
  const clean = dedupeConsecutivePoints(points, Math.max(tolerance * 0.02, 1e-7));
  if (clean.length < 8) return null;
  const start = strongestClosedCornerIndex(clean);
  const rotated = clean.slice(start).concat(clean.slice(0, start));
  const chain = rotated.concat([{ ...rotated[0], bulge: 0 }]);
  const ranges = [{ start: 0, end: chain.length - 1, depth: 0 }];
  const fitted = [];
  let maxError = 0;

  while (ranges.length) {
    const range = ranges.pop();
    const fit = fitLineArcRange(chain, range.start, range.end, tolerance, validation);
    const count = range.end - range.start + 1;
    if (fit.ok) {
      maxError = Math.max(maxError, fit.error);
      fitted.push({
        start: range.start,
        end: range.end,
        bulge: fit.bulge,
        error: fit.error,
      });
      continue;
    }
    if (count <= 2) {
      const error = lineFitError(chain, range.start, range.end).maxError;
      maxError = Math.max(maxError, error);
      fitted.push({
        start: range.start,
        end: range.end,
        bulge: 0,
        error,
      });
      continue;
    }
    let split = clamp(fit.split, range.start + 1, range.end - 1);
    const minSide = Math.max(2, Math.floor(count * 0.08));
    if (
      split <= range.start
      || split >= range.end
      || (count > 18 && (split - range.start < minSide || range.end - split < minSide))
    ) {
      split = Math.floor((range.start + range.end) / 2);
    }
    ranges.push({ start: split, end: range.end, depth: range.depth + 1 });
    ranges.push({ start: range.start, end: split, depth: range.depth + 1 });
  }

  fitted.sort((a, b) => a.start - b.start);
  const rebuilt = fitted
    .filter((segment) => segment.end > segment.start)
    .map((segment) => ({
      x: chain[segment.start].x,
      y: chain[segment.start].y,
      bulge: Math.abs(segment.bulge || 0) > BULGE_TOL ? segment.bulge : 0,
    }));
  const deduped = dedupeConsecutivePoints(rebuilt, Math.max(tolerance * 0.02, 1e-7));
  if (deduped.length < 4) return null;
  if (polygonSignedArea(deduped) < 0) deduped.reverse();
  let accepted = maxError <= tolerance;
  let outlineDeviation = null;
  if (validation) {
    outlineDeviation = measureOutlineDeviationWithContext(validation, deduped);
    maxError = outlineDeviation.maxMm;
    accepted = outlineDeviation.maxMm <= tolerance;
  }
  return {
    points: deduped,
    maxDeviation: maxError,
    segments: deduped.length,
    densePoints: clean.length,
    outlineDeviation,
    accepted,
  };
}

function collectArcLineCornerIndices(points, analysis) {
  const n = points.length;
  if (n < 8) return [0];
  const total = pathLengthPoints(points, true);
  const spacing = total > 0 ? total / n : analysis.baseStep;
  const locks = detectCornerLocks(points, spacing, Math.max(analysis.baseStep * 1.4, 0.05), analysis.diag);
  const minSep = clamp(Math.round(Math.max(analysis.baseStep * 2.5, spacing * 10) / Math.max(spacing, 0.001)), 4, Math.max(4, Math.floor(n / 10)));
  const corners = [];
  for (let i = 0; i < n; i++) {
    if (locks[i] < 0.78) continue;
    let localMax = true;
    for (let k = -2; k <= 2; k++) {
      if (k && locks[wrappedIndex(i + k, n)] > locks[i]) {
        localMax = false;
        break;
      }
    }
    if (!localMax) continue;
    if (corners.length) {
      const last = corners[corners.length - 1];
      if (i - last < minSep) {
        if (locks[i] > locks[last]) corners[corners.length - 1] = i;
        continue;
      }
    }
    corners.push(i);
  }
  return corners.length ? corners : [strongestClosedCornerIndex(points)];
}

function ensureMinimumArcLineCorners(points, cornerIdx, minCorners = 8) {
  const n = points.length;
  if (cornerIdx.length >= minCorners || n < minCorners * 2) return cornerIdx;
  const step = Math.max(1, Math.floor(n / minCorners));
  const extra = [];
  for (let i = 0; i < n; i += step) extra.push(i);
  return [...new Set([...cornerIdx, ...extra])].sort((a, b) => a - b);
}

function mergeColinearArcLineSegments(points, tolerance, validation = null) {
  if (points.length < 3) return points;
  // Only merge two adjacent line segments into one when the dropped vertex is
  // very close to the new chord AND (when a validation context is available) the
  // merged segment still covers the original outline within tolerance. This
  // prevents the merge from cutting real corners and inflating deviation.
  const forwardTol = tolerance * 0.5;
  let current = points.slice();
  for (let pass = 0; pass < 8 && current.length >= 3; pass++) {
    let changed = false;
    const next = [];
    for (let i = 0; i < current.length; i++) {
      const a = current[i];
      const b = current[(i + 1) % current.length];
      const c = current[(i + 2) % current.length];
      const mergeAb = Math.abs(a.bulge || 0) <= BULGE_TOL && Math.abs(b.bulge || 0) <= BULGE_TOL;
      if (mergeAb) {
        const lineErr = lineFitError([a, b, c], 0, 2).maxError;
        let ok = lineErr <= forwardTol;
        if (ok && validation) {
          ok = measureSegmentReverseDeviation(a, c, 0, validation) <= tolerance;
        }
        if (ok) {
          if (!next.length || next[next.length - 1] !== a) next.push(a);
          changed = true;
          i++;
          continue;
        }
      }
      next.push(a);
    }
    if (!changed) break;
    current = next.length >= 3 ? next : current;
  }
  return dedupeConsecutivePoints(current, Math.max(tolerance * 0.02, 1e-7));
}

function fitArcLineRanges(chain, ranges, tolerance, validation = null) {
  const fitted = [];
  let maxError = 0;
  const pending = ranges.slice();
  const maxDepth = validation ? 56 : 40;
  let guard = 0;
  while (pending.length && guard++ < 8000) {
    const range = pending.pop();
    const fit = fitLineArcRange(chain, range.start, range.end, tolerance, validation);
    const count = range.end - range.start + 1;
    if (fit.ok) {
      maxError = Math.max(maxError, fit.error);
      fitted.push({
        start: range.start,
        end: range.end,
        bulge: fit.bulge,
        error: fit.error,
      });
      continue;
    }
    if (count <= 2) {
      const error = lineFitError(chain, range.start, range.end).maxError;
      maxError = Math.max(maxError, error);
      fitted.push({
        start: range.start,
        end: range.end,
        bulge: 0,
        error,
      });
      continue;
    }
    let split = clamp(fit.split, range.start + 1, range.end - 1);
    const minSide = Math.max(2, Math.floor(count * 0.1));
    if (
      split <= range.start
      || split >= range.end
      || (count > 16 && (split - range.start < minSide || range.end - split < minSide))
    ) {
      split = Math.floor((range.start + range.end) / 2);
    }
    if (count > 240 && range.depth < 8) {
      const mid = Math.floor((range.start + range.end) / 2);
      pending.push({ start: mid, end: range.end, depth: range.depth + 1 });
      pending.push({ start: range.start, end: mid, depth: range.depth + 1 });
      continue;
    }
    pending.push({ start: split, end: range.end, depth: range.depth + 1 });
    pending.push({ start: range.start, end: split, depth: range.depth + 1 });
  }
  fitted.sort((a, b) => a.start - b.start);
  const rebuilt = fitted
    .filter((segment) => segment.end > segment.start)
    .map((segment) => ({
      x: chain[segment.start].x,
      y: chain[segment.start].y,
      bulge: Math.abs(segment.bulge || 0) > BULGE_TOL ? segment.bulge : 0,
    }));
  return { rebuilt, maxError };
}

function rebuildArcLineOuterContour(points, toleranceMm, analysis, validation = null) {
  const tolerance = Math.min(OUTLINE_ACCEPTANCE_MM, Math.max(0.001, Number(toleranceMm) || 0.05));
  let clean = dedupeConsecutivePoints(points, Math.max(tolerance * 0.02, 1e-7));
  if (clean.length < 8) return null;
  const large = clean.length > 6000;
  const spacing = large
    ? clamp(Math.max(analysis.baseStep * 0.2, 0.012), 0.012, 0.03)
    : clamp(Math.max(analysis.baseStep * 0.35, 0.025), 0.02, 0.06);
  const resampleLimit = large ? 9000 : 2400;
  const pathTotal = pathLengthPoints(clean, true);
  const avgSpacing = pathTotal > 0 ? pathTotal / clean.length : spacing;
  if (avgSpacing > spacing * 1.5 || clean.length > resampleLimit) {
    clean = resampleClosedPath(clean, spacing, resampleLimit);
  }
  if (clean.length < 8) return null;

  const start = strongestClosedCornerIndex(clean);
  const rotated = clean.slice(start).concat(clean.slice(0, start));
  const n = rotated.length;
  const chain = rotated.concat(rotated).concat([{ ...rotated[0], bulge: 0 }]);
  const minCorners = large ? clamp(Math.floor(n / 80), 12, 40) : 8;
  const cornerIdx = ensureMinimumArcLineCorners(rotated, collectArcLineCornerIndices(rotated, analysis), minCorners);
  const ranges = [];
  const sortedCorners = [...new Set(cornerIdx)].sort((a, b) => a - b);
  for (let i = 0; i < sortedCorners.length; i++) {
    const s = sortedCorners[i];
    const next = sortedCorners[(i + 1) % sortedCorners.length];
    const e = next > s ? next : next + n;
    if (e - s >= 2) ranges.push({ start: s, end: e, depth: 0 });
  }
  if (!ranges.length) ranges.push({ start: 0, end: n, depth: 0 });

  let { rebuilt, maxError } = fitArcLineRanges(chain, ranges, tolerance, validation);
  let deduped = mergeColinearArcLineSegments(rebuilt, tolerance, validation);
  if (deduped.length < 4) return null;
  if (polygonSignedArea(deduped) < 0) deduped.reverse();
  let accepted = maxError <= tolerance;
  let outlineDeviation = null;
  if (validation) {
    outlineDeviation = measureOutlineDeviationWithContext(validation, deduped);
    maxError = outlineDeviation.maxMm;
    accepted = outlineDeviation.maxMm <= tolerance;
  }
  return {
    points: deduped,
    maxDeviation: maxError,
    segments: deduped.length,
    densePoints: clean.length,
    cornerCount: sortedCorners.length,
    outlineDeviation,
    accepted,
  };
}

function buildArcLineReferenceContour(sourceInfos, analysis, contourSmoothingMm, mode) {
  const entityCount = sourceInfos.reduce((sum, info) => sum + (info.entities?.length || 0), 0);
  // Use the high-definition contour builder (the same one the HD method uses,
  // which tracks the original outline within ~0.02-0.05mm) and snap it onto the
  // source. This gives the arc/line fitter an accurate, low-noise reference so a
  // clean fit can stay within tolerance instead of chasing the coarse
  // source-guided contour (which can sit >0.1mm off the original).
  let reference = buildLocalOuterContour(sourceInfos, analysis, contourSmoothingMm, mode, 0);
  if (reference.length >= 4) {
    const snapped = snapOutputContourToSource(reference, sourceInfos, analysis, contourSmoothingMm);
    if (snapped.length >= 4) reference = snapped;
  }
  if (reference.length < 4) {
    reference = entityCount > 350
      ? buildSourceGuidedOuterContour(sourceInfos, analysis, contourSmoothingMm)
      : buildEndpointWalkOuterContour(sourceInfos, analysis, contourSmoothingMm);
  }
  if (reference.length < 4) {
    reference = entityCount > 350
      ? buildEndpointWalkOuterContour(sourceInfos, analysis, contourSmoothingMm)
      : buildSourceGuidedOuterContour(sourceInfos, analysis, contourSmoothingMm);
  }
  return reference;
}

// ---------------------------------------------------------------------------
// Feature-scale arc & line reconstruction.
//
// Instead of chasing the dense reference with a fixed global tolerance (which
// over-fragments long edges and traces mesh ripple), segment the outline at
// strong feature corners and fit ONE line or arc per feature run. Clean runs
// must match the source tightly; broken/noisy runs are reconstructed logically
// at a looser tolerance rather than subdivided into noise. Finally, joints are
// snapped to the true intersection of neighbouring primitives (sharp vertices)
// and any arc tighter than the minimum radius collapses into a pointy corner.
// ---------------------------------------------------------------------------

function lineLineIntersectInfinite(a1, a2, b1, b2) {
  const r = { x: a2.x - a1.x, y: a2.y - a1.y };
  const s = { x: b2.x - b1.x, y: b2.y - b1.y };
  const denom = r.x * s.y - r.y * s.x;
  if (Math.abs(denom) < 1e-12) return null;
  const t = ((b1.x - a1.x) * s.y - (b1.y - a1.y) * s.x) / denom;
  return { x: a1.x + t * r.x, y: a1.y + t * r.y };
}

function lineCircleIntersections(p, q, circle) {
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-18) return [];
  const fx = p.x - circle.cx;
  const fy = p.y - circle.cy;
  const a = len2;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - circle.r * circle.r;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return [];
  const sq = Math.sqrt(disc);
  const t1 = (-b + sq) / (2 * a);
  const t2 = (-b - sq) / (2 * a);
  const out = [{ x: p.x + t1 * dx, y: p.y + t1 * dy }];
  if (Math.abs(t1 - t2) > 1e-9) out.push({ x: p.x + t2 * dx, y: p.y + t2 * dy });
  return out;
}

function circleCircleIntersections(c1, c2) {
  const dx = c2.cx - c1.cx;
  const dy = c2.cy - c1.cy;
  const d = Math.hypot(dx, dy);
  if (d < 1e-12 || d > c1.r + c2.r || d < Math.abs(c1.r - c2.r)) return [];
  const a = (c1.r * c1.r - c2.r * c2.r + d * d) / (2 * d);
  const h2 = c1.r * c1.r - a * a;
  if (h2 < 0) return [];
  const h = Math.sqrt(h2);
  const xm = c1.cx + (a * dx) / d;
  const ym = c1.cy + (a * dy) / d;
  const rx = -(dy * h) / d;
  const ry = (dx * h) / d;
  return [{ x: xm + rx, y: ym + ry }, { x: xm - rx, y: ym - ry }];
}

function nearestPoint(points, ref) {
  let best = null;
  let bestD = Infinity;
  for (const p of points) {
    const d = (p.x - ref.x) ** 2 + (p.y - ref.y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

function farthestPoint(points, ref) {
  let best = null;
  let bestD = -1;
  for (const p of points) {
    const d = (p.x - ref.x) ** 2 + (p.y - ref.y) ** 2;
    if (d > bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

// Re-derive the bulge so an arc on `circle` runs from start->end in its direction.
function bulgeFromCircleArc(start, end, circle) {
  let a0 = Math.atan2(start.y - circle.cy, start.x - circle.cx);
  let a1 = Math.atan2(end.y - circle.cy, end.x - circle.cx);
  let sweep = a1 - a0;
  const dir = circle.dir || 1;
  if (dir > 0) {
    while (sweep <= 0) sweep += Math.PI * 2;
    while (sweep > Math.PI * 2) sweep -= Math.PI * 2;
  } else {
    while (sweep >= 0) sweep -= Math.PI * 2;
    while (sweep < -Math.PI * 2) sweep += Math.PI * 2;
  }
  const bulge = Math.tan(sweep / 4);
  return Number.isFinite(bulge) ? bulge : 0;
}

// Best single line/arc for a contiguous run: returns the lower-error primitive,
// its max deviation, the worst-point split index, and whether it passes tightTol
// (including the reverse/overshoot validation).
function bestSinglePrimitive(chain, s, e, tol, validation, minRadius = 0) {
  const line = lineFitError(chain, s, e);
  const arc = (e - s) >= 3 ? arcFitError(chain, s, e, minRadius) : null;
  const lineValid = arcLineSegmentWithinTolerance(chain, s, e, 0, tol, validation);
  const arcValid = arc ? arcLineSegmentWithinTolerance(chain, s, e, arc.bulge, tol, validation) : false;
  const lineOk = line.maxError <= tol && lineValid;
  const arcOk = arc && arc.maxError <= tol && arcValid;
  if (lineOk && (!arcOk || line.maxError <= arc.maxError)) {
    return { bulge: 0, error: line.maxError, split: line.split, ok: true };
  }
  if (arcOk) return { bulge: arc.bulge, error: arc.maxError, split: arc.split, ok: true };
  // Neither passes tightTol: report the lower-error primitive for the loose
  // fallback, preferring an arc only when it is clearly better.
  if (arc && arc.maxError + 1e-6 < line.maxError && Math.abs(arc.bulge) > BULGE_TOL) {
    return { bulge: arc.bulge, error: arc.maxError, split: arc.split, ok: false };
  }
  return { bulge: 0, error: line.maxError, split: line.split, ok: false };
}

// Fit a contiguous run [s,e] as the fewest line/arc primitives needed.
// Clean runs (and clean sub-features) keep splitting until each piece matches
// the source within tightTol. We stop subdividing a broken run only when
// splitting stops meaningfully reducing the error (diminishing returns => the
// residual is mesh noise, not a real feature), accepting one logical primitive
// up to the loose tolerance rather than fragmenting to chase that noise. A
// shared split budget bounds the total segment count for the whole contour.
function fitFeatureRun(chain, s, e, tightTol, looseTol, validation, ctx, minRadius = 0) {
  if (e - s < 1) return [];
  const fit = bestSinglePrimitive(chain, s, e, tightTol, validation, minRadius);
  const single = () => [{ start: s, end: e, bulge: fit.bulge }];
  if (fit.ok) return single();

  const count = e - s + 1;
  if (ctx.remaining <= 0 || count <= 4) return single();

  let split = clamp(fit.split, s + 1, e - 1);
  if (split <= s + 1 || split >= e - 1) split = Math.floor((s + e) / 2);

  // Does splitting actually help? Compare the worst child single-fit error to
  // the parent's. A genuine feature boundary drops the error sharply; noise
  // barely moves it. If the run is already inside the loose band and splitting
  // doesn't help, keep it as one logical feature.
  const leftFit = bestSinglePrimitive(chain, s, split, tightTol, validation, minRadius);
  const rightFit = bestSinglePrimitive(chain, split, e, tightTol, validation, minRadius);
  const childMax = Math.max(leftFit.error, rightFit.error);
  const helps = childMax <= fit.error * 0.85 || leftFit.ok || rightFit.ok;
  if (!helps && fit.error <= looseTol) return single();

  ctx.remaining -= 1;
  const left = fitFeatureRun(chain, s, split, tightTol, looseTol, validation, ctx, minRadius);
  const right = fitFeatureRun(chain, split, e, tightTol, looseTol, validation, ctx, minRadius);
  const merged = left.concat(right);
  return merged.length ? merged : single();
}

// Merge adjacent geometries that describe the same line or the same circle,
// refitting over the combined point range. Each item carries its chain range.
function mergeFeatureGeometries(geoms, chain, prims, tightTol) {
  let items = geoms.map((geom, i) => ({ geom, start: prims[i].start, end: prims[i].end }));
  for (let pass = 0; pass < 6 && items.length >= 3; pass++) {
    let changed = false;
    const next = [];
    let i = 0;
    while (i < items.length) {
      const cur = items[i];
      const nxt = items[(i + 1) % items.length];
      let merged = false;
      if (i + 1 < items.length && sameGeometry(cur.geom, nxt.geom, tightTol)) {
        const combined = { start: cur.start, end: nxt.end, bulge: cur.geom.type === "arc" ? cur.geom.dir : 0 };
        const geom = buildFeatureGeometry(chain, combined);
        next.push({ geom, start: cur.start, end: nxt.end });
        i += 2;
        changed = true;
        merged = true;
      }
      if (!merged) {
        next.push(cur);
        i += 1;
      }
    }
    if (!changed) break;
    items = next.length >= 2 ? next : items;
  }
  return items.map((it) => it.geom);
}

function sameGeometry(g1, g2, tol) {
  if (g1.type !== g2.type) return false;
  if (g1.type === "line") {
    const cross = Math.abs(g1.dx * g2.dy - g1.dy * g2.dx);
    if (cross > 0.03) return false;
    // Perp distance of g2's base point from g1's line.
    const perp = Math.abs((g2.px - g1.px) * (-g1.dy) + (g2.py - g1.py) * g1.dx);
    return perp <= tol * 0.8;
  }
  return g1.dir === g2.dir
    && Math.hypot(g1.cx - g2.cx, g1.cy - g2.cy) <= tol * 1.0
    && Math.abs(g1.r - g2.r) <= tol * 1.0;
}

// Remove arcs tighter than the minimum radius; their neighbours will intersect
// directly into a sharp (pointy) vertex during assembly.
function dropTinyArcGeometries(geoms, minRadius) {
  if (minRadius <= 0) return geoms;
  return geoms.filter((g) => !(g.type === "arc" && g.r < minRadius));
}

// True if the closed polyline (straight chords between vertices) crosses itself.
// Used to reject any simplification that would fold the contour over itself.
function closedPolylineSelfIntersects(verts) {
  const n = verts.length;
  if (n < 4) return false;
  for (let i = 0; i < n; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % n];
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue; // these two share the closing vertex
      const c = verts[j];
      const d = verts[(j + 1) % n];
      if (!segmentBoxesOverlap(a, b, c, d)) continue;
      if (segmentIntersection(a, b, c, d)) return true;
    }
  }
  return false;
}

// Largest turn angle (degrees) over the closed polyline. A value near 180 means
// the path almost reverses at a vertex, i.e. a needle/spike artifact.
function maxClosedTurnDeg(verts) {
  const n = verts.length;
  let worst = 0;
  for (let i = 0; i < n; i++) {
    const p0 = verts[(i - 1 + n) % n];
    const p1 = verts[i];
    const p2 = verts[(i + 1) % n];
    const v1x = p1.x - p0.x;
    const v1y = p1.y - p0.y;
    const v2x = p2.x - p1.x;
    const v2y = p2.y - p1.y;
    const l1 = Math.hypot(v1x, v1y);
    const l2 = Math.hypot(v2x, v2y);
    if (l1 < 1e-9 || l2 < 1e-9) continue;
    let c = (v1x * v2x + v1y * v2y) / (l1 * l2);
    c = Math.max(-1, Math.min(1, c));
    const turn = (Math.acos(c) * 180) / Math.PI;
    if (turn > worst) worst = turn;
  }
  return worst;
}

// User-driven simplification: collapse feature edges shorter than `minLen` into a
// single vertex where the neighbours intersect. Removal is guarded against
// self-intersection and needle spikes. The area guard prevents simplify from
// chewing into convex outer peaks; it does NOT preserve sub-minRadius fillets
// (those are always stripped separately).
const SIMPLIFY_SPIKE_DEG = 165;

function contourCleanupGuardsOk(trial, baseArea, sign, baseSpike, opts = {}) {
  if (!trial || trial.length < 4) return false;
  if (!opts.skipArea) {
    const trialArea = polygonSignedArea(trial) * sign;
    if (trialArea < baseArea - Math.max(1e-6, baseArea * 1e-5)) return false;
  }
  const spikeLimit = opts.spikeLimit ?? Math.max(SIMPLIFY_SPIKE_DEG, baseSpike + 1e-6);
  if (maxClosedTurnDeg(trial) > spikeLimit) return false;
  if (closedPolylineSelfIntersects(trial)) return false;
  return true;
}

function dropShortFeatureGeometries(geoms, minLen, snapMax) {
  if (!(minLen > 0) || geoms.length <= 4) return geoms;
  let cur = geoms.slice();
  let guard = 0;
  while (cur.length > 4 && guard++ < geoms.length + 32) {
    const verts = assembleFeatureVertices(cur, snapMax);
    if (verts.length !== cur.length) break;
    const signedArea = polygonSignedArea(verts);
    const sign = signedArea >= 0 ? 1 : -1;
    const baseArea = signedArea * sign;
    const baseSpike = maxClosedTurnDeg(verts);

    const candidates = [];
    for (let k = 0; k < cur.length; k++) {
      const a = verts[k];
      const b = verts[(k + 1) % cur.length];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      if (len < minLen) candidates.push({ k, len });
    }
    if (!candidates.length) break;
    candidates.sort((p, q) => p.len - q.len);

    let removed = false;
    for (const { k } of candidates) {
      const trial = cur.slice();
      trial.splice(k, 1);
      if (trial.length < 4) continue;
      const tv = assembleFeatureVertices(trial, snapMax);
      if (tv.length !== trial.length) continue;
      if (!contourCleanupGuardsOk(tv, baseArea, sign, baseSpike)) continue;
      cur = trial;
      removed = true;
      break;
    }
    if (!removed) break;
  }
  return cur;
}

function bulgedEdgeLen(a, b) {
  const bulge = a.bulge || 0;
  const chord = Math.hypot(b.x - a.x, b.y - a.y);
  if (Math.abs(bulge) <= BULGE_TOL) return chord;
  const theta = 4 * Math.atan(bulge);
  if (Math.abs(theta) < 1e-9) return chord;
  const r = chord / (2 * Math.sin(theta / 2));
  return Math.abs(r * theta);
}

// Final pass on the assembled bulged polyline: collapse residual chord edges
// shorter than minLen (intersection rounding can leave sub-mm stubs even when
// every geometry edge is longer). Line-line corners are re-intersected; arc
// edges are left alone unless both neighbours are lines.
function tryCollapseBulgedVertex(verts, removeK) {
  const n = verts.length;
  if (n <= 4) return null;
  const kPrev = (removeK - 1 + n) % n;
  const kNext = (removeK + 1) % n;
  const kPrev2 = (removeK - 2 + n) % n;
  const kNext2 = (removeK + 2) % n;
  const bIn = verts[kPrev].bulge || 0;
  const bOut = verts[removeK].bulge || 0;
  if (Math.abs(bIn) > BULGE_TOL || Math.abs(bOut) > BULGE_TOL) return null;

  const A = verts[kPrev2];
  const B = verts[kPrev];
  const C = verts[removeK];
  const D = verts[kNext];
  const E = verts[kNext2];
  let corner = lineLineIntersectInfinite(A, B, D, E)
    || lineLineIntersectInfinite(B, C, C, D);
  if (!corner) corner = { x: (B.x + D.x) * 0.5, y: (B.y + D.y) * 0.5 };

  const out = [];
  for (let i = 0; i < n; i++) {
    if (i === removeK) continue;
    out.push({ ...verts[i] });
  }
  const newPrev = kPrev < removeK ? kPrev : kPrev - 1;
  out[newPrev] = { x: corner.x, y: corner.y, bulge: 0 };
  return out.length >= 4 ? out : null;
}

function dropMicroEdgesFromBulgedContour(verts, minLen) {
  if (!(minLen > 0) || verts.length <= 4) return verts;
  let cur = verts.map((v) => ({ ...v }));
  let guard = 0;
  while (cur.length > 4 && guard++ < cur.length + 48) {
    const n = cur.length;
    const signedArea = polygonSignedArea(cur);
    const sign = signedArea >= 0 ? 1 : -1;
    const baseArea = signedArea * sign;
    const baseSpike = maxClosedTurnDeg(cur);

    const candidates = [];
    for (let i = 0; i < n; i++) {
      const a = cur[i];
      const b = cur[(i + 1) % n];
      const len = bulgedEdgeLen(a, b);
      if (len < minLen) candidates.push({ i, len });
    }
    if (!candidates.length) break;
    candidates.sort((p, q) => p.len - q.len);

    let changed = false;
    for (const { i, len } of candidates) {
      const forceMicro = len < ARC_LINE_MICRO_STUB_MM;
      for (const removeK of [(i + 1) % n, i]) {
        const trial = tryCollapseBulgedVertex(cur, removeK);
        if (!contourCleanupGuardsOk(trial, baseArea, sign, baseSpike, {
          skipArea: forceMicro,
          spikeLimit: forceMicro ? 178 : undefined,
        })) continue;
        cur = trial;
        changed = true;
        break;
      }
      if (changed) break;
    }
    if (!changed) break;
  }
  return cur;
}

function applyGuardedShortEdgeCleanup(geoms, minLen, snapMax, validation) {
  if (!(minLen > 0) || geoms.length < 4) return geoms;
  const baseVerts = assembleFeatureVertices(geoms, snapMax);
  if (baseVerts.length !== geoms.length) return geoms;
  const sign = polygonSignedArea(baseVerts) >= 0 ? 1 : -1;
  const baseArea = polygonSignedArea(baseVerts) * sign;
  const baseSpike = maxClosedTurnDeg(baseVerts);

  const cleaned = dropShortFeatureGeometries(geoms, minLen, snapMax);
  if (cleaned.length < 4) return geoms;
  const sv = assembleFeatureVertices(cleaned, snapMax);
  if (!contourCleanupGuardsOk(sv, baseArea, sign, baseSpike)) return geoms;
  if (validation) {
    const baseDev = measureOutlineDeviationWithContext(validation, baseVerts);
    const trialDev = measureOutlineDeviationWithContext(validation, sv);
    if (trialDev.maxMm > baseDev.maxMm + Math.max(minLen * 2, 0.35)) return geoms;
  }
  return cleaned;
}

function dedupeBulgedContour(verts, tol) {
  if (!(tol > 0) || verts.length < 3) return verts;
  const out = [];
  for (const p of verts) {
    const last = out[out.length - 1];
    if (last && Math.hypot(last.x - p.x, last.y - p.y) <= tol) {
      if (Math.abs(p.bulge || 0) > Math.abs(last.bulge || 0)) last.bulge = p.bulge || 0;
      continue;
    }
    out.push({ x: p.x, y: p.y, bulge: p.bulge || 0 });
  }
  if (out.length > 1 && Math.hypot(out[0].x - out[out.length - 1].x, out[0].y - out[out.length - 1].y) <= tol) {
    if (Math.abs(out[0].bulge || 0) > Math.abs(out[out.length - 1].bulge || 0)) {
      out[out.length - 1].bulge = out[0].bulge || 0;
    }
    out.pop();
  }
  return out.length >= 3 ? out : verts;
}

// Zero output bulges whose effective radius is below minRadius. Neighbouring
// line segments meet at the existing vertices; geometry-level dropTinyArcGeometries
// handles the pointy-corner rebuild for dropped arc primitives.
function stripSubMinRadiusBulges(verts, minRadius) {
  if (!(minRadius > 0) || verts.length < 3) return verts;
  return verts.map((v, i) => {
    const b = verts[(i + 1) % verts.length];
    if (Math.abs(v.bulge || 0) > BULGE_TOL && bulgeEdgeRadius(v, b) < minRadius) {
      return { ...v, bulge: 0 };
    }
    return { ...v };
  });
}

function bulgeEdgeRadius(a, b) {
  const bulge = a.bulge || 0;
  if (Math.abs(bulge) <= BULGE_TOL) return Infinity;
  const chord = Math.hypot(b.x - a.x, b.y - a.y);
  if (chord < 1e-9) return 0;
  const theta = Math.abs(4 * Math.atan(bulge));
  if (theta < 1e-9) return Infinity;
  return chord / (2 * Math.sin(theta / 2));
}

// Place vertices where consecutive geometries meet, then emit a closed bulged
// polyline (bulge derived per arc edge from its bounding vertices).
function assembleFeatureVertices(geoms, snapMax, minRadius = 0) {
  const m = geoms.length;
  const pts = new Array(m);
  for (let k = 0; k < m; k++) {
    const g = geoms[k];
    const gPrev = geoms[(k - 1 + m) % m];
    const cornerRef = {
      x: (gPrev.refEnd.x + g.refStart.x) * 0.5,
      y: (gPrev.refEnd.y + g.refStart.y) * 0.5,
    };
    let v = geometryIntersection(gPrev, g, cornerRef, snapMax);
    if (!v) v = cornerRef;
    pts[k] = v;
  }
  const out = [];
  for (let k = 0; k < m; k++) {
    const g = geoms[k];
    const a = pts[k];
    const b = pts[(k + 1) % m];
    let bulge = 0;
    if (g.type === "arc") {
      bulge = bulgeFromCircleArc(a, b, { cx: g.cx, cy: g.cy, dir: g.dir });
      if (!Number.isFinite(bulge) || Math.abs(bulge) > 1.05) bulge = 0;
      else if (minRadius > 0 && bulgeEdgeRadius({ x: a.x, y: a.y, bulge }, b) < minRadius) bulge = 0;
    }
    out.push({ x: a.x, y: a.y, bulge });
  }
  return out;
}

// Least-squares line through a run of points: returns a base point (centroid)
// and a unit direction. Far more stable than the endpoint chord when the run's
// ends sit on a rounded/noisy corner.
function fitLineLS(pts, s, e) {
  let sx = 0;
  let sy = 0;
  let count = 0;
  for (let i = s; i <= e; i++) {
    sx += pts[i].x;
    sy += pts[i].y;
    count++;
  }
  if (count < 2) return null;
  const mx = sx / count;
  const my = sy / count;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (let i = s; i <= e; i++) {
    const dx = pts[i].x - mx;
    const dy = pts[i].y - my;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  // Principal axis = eigenvector of the covariance matrix for the larger eigenvalue.
  const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  return { px: mx, py: my, dx: Math.cos(theta), dy: Math.sin(theta) };
}

// Build the analytic geometry (LS line or LS circle) for one fitted run.
// The fit uses the CONFIDENT MIDDLE of the run, trimming a margin off each end:
// the reference rounds real corners, so the points nearest a run boundary are
// the rounded ones. Fitting the straight/arc middle and extrapolating to the
// neighbour intersection reconstructs the true sharp vertex instead of cutting
// the feature short.
function buildFeatureGeometry(chain, prim, minRadius = 0) {
  const { start, end, bulge } = prim;
  const refStart = { x: chain[start].x, y: chain[start].y };
  const refEnd = { x: chain[end].x, y: chain[end].y };
  const refMid = { x: chain[Math.floor((start + end) / 2)].x, y: chain[Math.floor((start + end) / 2)].y };
  const span = end - start;
  const margin = clamp(Math.floor(span * 0.18), 0, Math.max(0, Math.floor((span - 2) / 2)));
  const fs = start + margin;
  const fe = end - margin;
  if (Math.abs(bulge || 0) > BULGE_TOL) {
    const circle = fitCircleLeastSquares(chain, fs, fe) || fitCircleLeastSquares(chain, start, end);
    if (circle && !(minRadius > 0 && circle.r < minRadius)) {
      return { type: "arc", cx: circle.cx, cy: circle.cy, r: circle.r, dir: Math.sign(bulge) || 1, refStart, refEnd, refMid };
    }
  }
  const line = fitLineLS(chain, fs, fe) || fitLineLS(chain, start, end);
  if (line) return { type: "line", ...line, refStart, refEnd, refMid };
  // Degenerate fallback: chord line.
  const dx = refEnd.x - refStart.x;
  const dy = refEnd.y - refStart.y;
  const len = Math.hypot(dx, dy) || 1;
  return { type: "line", px: refStart.x, py: refStart.y, dx: dx / len, dy: dy / len, refStart, refEnd, refMid };
}

function lineTwoPoints(geom) {
  return [
    { x: geom.px, y: geom.py },
    { x: geom.px + geom.dx, y: geom.py + geom.dy },
  ];
}

// Intersection of two consecutive primitive geometries. When several candidates
// exist within maxDist of the reference, pick the farthest — nearest picks the
// inward fillet branch and pulls the corner short. Candidates beyond maxDist are
// ignored; null means fall back to the reference corner.
function geometryIntersection(g1, g2, refPoint, maxDist = Infinity) {
  if (!g1 || !g2) return null;
  let candidates = [];
  if (g1.type === "line" && g2.type === "line") {
    const [a1, a2] = lineTwoPoints(g1);
    const [b1, b2] = lineTwoPoints(g2);
    const hit = lineLineIntersectInfinite(a1, a2, b1, b2);
    if (hit) {
      // Sharp corners sit outside the rounded reference; do not clamp a valid
      // line-line meet back to the midpoint (that pulls the corner inward).
      return hit;
    }
    return null;
  }
  if (g1.type === "line" && g2.type === "arc") {
    const [a1, a2] = lineTwoPoints(g1);
    candidates = lineCircleIntersections(a1, a2, g2);
  } else if (g1.type === "arc" && g2.type === "line") {
    const [b1, b2] = lineTwoPoints(g2);
    candidates = lineCircleIntersections(b1, b2, g1);
  } else {
    candidates = circleCircleIntersections(g1, g2);
  }
  const valid = candidates.filter((p) => p && Number.isFinite(p.x));
  if (!valid.length) return null;
  const inRange = Number.isFinite(maxDist) && maxDist > 0
    ? valid.filter((p) => Math.hypot(p.x - refPoint.x, p.y - refPoint.y) <= maxDist)
    : valid;
  const pool = inRange.length ? inRange : [];
  if (!pool.length) return null;
  if (pool.length === 1) return pool[0];
  return nearestPoint(pool, refPoint);
}

function rebuildContourAsFeatureLinesAndArcs(points, opts, validation, analysis) {
  const tightTol = Math.max(0.005, opts?.tightTol ?? ARC_LINE_FEATURE_TIGHT_MM);
  const looseTol = Math.max(tightTol, opts?.looseTol ?? ARC_LINE_FEATURE_LOOSE_MM);
  const minRadius = Math.max(0, opts?.minRadius ?? ARC_LINE_MIN_RADIUS_MM);
  const minFeatureLen = Math.max(0, opts?.minFeatureLen ?? 0);

  let clean = dedupeConsecutivePoints(points, Math.max(tightTol * 0.02, 1e-7));
  if (clean.length < 8) return null;
  const pathTotal = pathLengthPoints(clean, true);
  const spacing = clamp(Math.max((analysis?.baseStep || 0.05) * 0.3, 0.02), 0.015, 0.05);
  const avgSpacing = pathTotal > 0 ? pathTotal / clean.length : spacing;
  if (avgSpacing > spacing * 1.5 || clean.length > 6000) {
    clean = resampleClosedPath(clean, spacing, 9000);
  }
  if (clean.length < 8) return null;

  const startIdx = strongestClosedCornerIndex(clean);
  const rotated = clean.slice(startIdx).concat(clean.slice(0, startIdx));
  const n = rotated.length;
  const chain = rotated.concat([{ ...rotated[0], bulge: 0 }]);

  // Feature-scale segmentation seeds. Curvature corner detection fires on every
  // mesh ripple of a noisy reference (hundreds of false corners → thousands of
  // micro-segments). Instead, seed run boundaries from a Ramer-Douglas-Peucker
  // pass at a FEATURE-scale epsilon: RDP collapses sub-tolerance ripple while
  // preserving genuinely significant vertices (sharp corners + the points needed
  // to describe real curves). Each RDP vertex maps back to its index on the
  // full-resolution loop, and every run is still FIT on the full-resolution
  // reference so clean lines/arcs stay tight. fitFeatureRun further splits a run
  // only where a real line↔arc boundary lives (never to chase noise).
  const cornerEps = clamp((tightTol + looseTol) * 0.5, tightTol, Math.max(tightTol, looseTol * 0.9));
  const cornerSet = new Set([0, n]);
  const idxOf = new Map();
  for (let i = 0; i < rotated.length; i++) idxOf.set(rotated[i], i);
  for (const cp of rdpSimplifyClosed(rotated, cornerEps)) {
    const idx = idxOf.get(cp);
    if (idx !== undefined && idx > 0 && idx < n) cornerSet.add(idx);
  }
  const corners = [...cornerSet].sort((a, b) => a - b);

  const primitives = [];
  // Shared split budget caps total segments for the whole contour; diminishing
  // returns (not the budget) is what normally stops splitting on noise.
  const splitCtx = { remaining: clamp(Math.round(n / 12), 40, 400) };
  for (let i = 0; i < corners.length - 1; i++) {
    const s = corners[i];
    const e = corners[i + 1];
    if (e - s < 1) continue;
    for (const prim of fitFeatureRun(chain, s, e, tightTol, looseTol, validation, splitCtx, minRadius)) {
      primitives.push(prim);
    }
  }
  const usable = primitives.filter((p) => p.end > p.start);
  if (usable.length < 2) return null;

  // Each run becomes an analytic line/arc geometry. Vertices are placed where
  // consecutive geometries actually meet (extending/intersecting them), so
  // sharp corners and tips are reconstructed at the true intersection instead
  // of being cut short on the rounded reference. Tiny arcs (radius < minRadius)
  // are dropped so their neighbours intersect into a single pointy corner.
  let geoms = usable.map((p) => buildFeatureGeometry(chain, p, minRadius));
  geoms = mergeFeatureGeometries(geoms, chain, usable, tightTol);
  geoms = dropTinyArcGeometries(geoms, minRadius);
  if (geoms.length < 2) return null;

  // snapMax: how far a reconstructed vertex may sit from the reference corner.
  // Large enough for true sharp corners on big parts; still blocks runaway hits
  // from near-parallel geometry. When multiple intersections qualify, the
  // farthest (outward) one is chosen, not the nearest (inward fillet) one.
  const snapMax = Math.max(looseTol * 6, (analysis?.baseStep || 0.05) * 12, 1.5, minFeatureLen * 2);
  // User simplify (slider > 0) may collapse features up to that length. Regardless,
  // the finished contour always gets a micro-stub strip pass on the assembled polyline.
  if (minFeatureLen > 0) {
    const simplifyLen = Math.max(minFeatureLen, ARC_LINE_MIN_EDGE_MM);
    geoms = applyGuardedShortEdgeCleanup(geoms, simplifyLen, snapMax, validation);
  }
  let verts = assembleFeatureVertices(geoms, snapMax, minRadius);
  verts = stripSubMinRadiusBulges(verts, minRadius);
  const assembledVerts = verts.map((v) => ({ ...v }));
  const collapsed = dropMicroEdgesFromBulgedContour(verts, ARC_LINE_MICRO_STUB_MM);
  if (collapsed.length >= 4
    && !closedPolylineSelfIntersects(collapsed)
    && maxClosedTurnDeg(collapsed) <= 170) {
    let adopt = true;
    if (validation) {
      const baseDev = measureOutlineDeviationWithContext(validation, assembledVerts);
      const trialDev = measureOutlineDeviationWithContext(validation, collapsed);
      if (trialDev.maxMm > baseDev.maxMm + 0.3) adopt = false;
    }
    if (adopt) verts = collapsed;
  }
  // Always merge nearly-coincident consecutive vertices (sub-mm stubs).
  verts = dedupeBulgedContour(verts, ARC_LINE_MICRO_STUB_MM);
  // Guarded pass for remaining short line chords up to the min-edge floor.
  const lineTrimmed = dropMicroEdgesFromBulgedContour(verts, ARC_LINE_MIN_EDGE_MM);
  if (lineTrimmed.length >= 4
    && !closedPolylineSelfIntersects(lineTrimmed)
    && maxClosedTurnDeg(lineTrimmed) <= 170) {
    let adopt = true;
    if (validation) {
      const baseDev = measureOutlineDeviationWithContext(validation, verts);
      const trialDev = measureOutlineDeviationWithContext(validation, lineTrimmed);
      if (trialDev.maxMm > baseDev.maxMm + 0.35) adopt = false;
    }
    if (adopt) verts = lineTrimmed;
  }
  verts = dedupeConsecutivePoints(verts, Math.max(tightTol * 0.02, 1e-7));
  if (verts.length < 3) return null;
  if (polygonSignedArea(verts) < 0) verts.reverse();

  let outlineDeviation = null;
  let maxError = Infinity;
  let accepted = true;
  if (validation) {
    outlineDeviation = measureOutlineDeviationWithContext(validation, verts);
    maxError = outlineDeviation.maxMm;
    accepted = outlineDeviation.maxMm <= looseTol;
  }
  return {
    points: verts,
    maxDeviation: maxError,
    segments: verts.length,
    densePoints: clean.length,
    outlineDeviation,
    accepted,
  };
}

function computeArcLineOuterContourRepairResult(options) {
  const analysis = analyseOuterContourRepair();
  if (!analysis?.outerInfo) return null;
  const filterArea = Math.max(0, Number(options.smallFilterAreaMm2) || 0);
  const contourSmoothingMm = Math.max(0.001, Number(options.contourSmoothingMm) || automaticContourSmoothing(analysis));
  const mode = options.mode === "continuous" ? "continuous" : "fragmented";
  const plan = planOuterContourRepair(analysis, filterArea, contourSmoothingMm, mode);
  const sourceInfos = plan.sourceInfos.length ? plan.sourceInfos : [analysis.outerInfo];
  const reference = buildArcLineReferenceContour(sourceInfos, analysis, contourSmoothingMm, mode);
  if (reference.length < 4) return null;

  // Tight tolerance for clean features (follow the source closely); loose
  // tolerance for broken/noisy regions (reconstruct logically, don't chase
  // mesh ripple). The requested lineArc tolerance tunes the tight band.
  const tightTol = clamp(
    Math.max(0.02, Number(options.lineArcToleranceMm) || automaticLineArcTolerance(analysis)),
    0.02,
    ARC_LINE_FEATURE_TIGHT_MM,
  );
  const looseTol = clamp(
    Number(options.lineArcLooseToleranceMm) || ARC_LINE_FEATURE_LOOSE_MM,
    tightTol * 2,
    1.2,
  );
  const minRadius = Math.max(0, Number(options.minArcRadiusMm) || ARC_LINE_MIN_RADIUS_MM);
  // User-controlled simplification: collapse features shorter than this into a
  // sharp vertex (0 = keep all detail).
  const minFeatureLen = Math.max(0, Number(options.minFeatureLenMm) || 0);
  // Simplification intentionally trades local fidelity for a clean macro shape,
  // so the acceptance band grows with the requested simplification (otherwise a
  // deliberately collapsed notch would be rejected as "deviating too far").
  const selectBand = Math.max(looseTol, minFeatureLen * 2);
  const acceptCeil = Math.max(ARC_LINE_ACCEPT_MM, minFeatureLen * 3);
  const deviationCtx = createOutlineDeviationContext(sourceInfos, analysis, contourSmoothingMm);

  let lineArcResult = null;
  let outputContour = [];
  let deviation = { maxMm: Infinity, forwardMm: Infinity, reverseMm: Infinity, originalSampleCount: 0, repairedSampleCount: 0 };

  // A light denoise of the reference helps corner detection lock onto real
  // feature vertices instead of mesh ripple. Try the raw reference first
  // (sharpest), then progressively gentler denoise, and keep the candidate with
  // the fewest segments whose loose-band deviation is acceptable.
  const denoiseLevels = [0, tightTol * 0.5, tightTol];
  let best = null;
  for (const denoise of denoiseLevels) {
    let fitReference = reference;
    if (denoise > 0) {
      const simplified = rdpSimplifyClosed(reference, denoise);
      if (simplified && simplified.length >= 8) fitReference = simplified;
    }
    const candidate = rebuildContourAsFeatureLinesAndArcs(
      fitReference,
      { tightTol, looseTol, minRadius, minFeatureLen },
      deviationCtx,
      analysis,
    );
    if (!(candidate?.points?.length >= 4)) continue;
    const candDev = candidate.outlineDeviation
      || measureOutlineDeviationWithContext(deviationCtx, candidate.points);
    const passes = candDev.maxMm <= selectBand;
    if (!best
      || (passes && !best.passes)
      || (passes === best.passes && candidate.points.length < best.result.points.length)
      || (!passes && !best.passes && candDev.maxMm < best.dev.maxMm)) {
      best = { result: candidate, dev: candDev, passes };
    }
    if (best.passes && best.result.points.length <= 64) break;
  }

  if (best) {
    lineArcResult = best.result;
    outputContour = best.result.points;
    deviation = best.dev;
  }

  return {
    analysis,
    plan,
    sourceInfos,
    contour: reference,
    outputContour,
    lineArcResult,
    deviation,
    contourSmoothingMm,
    lineArcSmoothingMm: 0,
    filterArea,
    mode,
    rebuildLinesAndArcs: true,
    repairMethod: "arcLine",
    acceptanceMm: acceptCeil,
    accepted: deviation.maxMm <= acceptCeil && outputContour.length >= 4,
  };
}

function finishHighDefSilhouetteContour(points, smoothingMm, diag, sourceBox) {
  let contour = dedupeConsecutivePoints(points, Math.max(smoothingMm * 0.012, 1e-6));
  if (contour.length < 4) return [];
  contour = removeShortSpikes(contour, Math.max(smoothingMm * 1.15, diag * 0.0012));
  contour = removeLongChordHairpins(contour, diag);
  contour = removeSmallSelfLoopsClosed(contour, Math.max(smoothingMm * 3.5, diag * 0.009));
  contour = preferOuterDuplicateStrands(contour, bboxCenter(sourceBox || bboxForPoints(contour)), Math.max(smoothingMm * 2.2, diag * 0.007));
  const total = pathLengthPoints(contour, true);
  if (!(total > 0)) return [];
  const spacing = clamp(Math.max(smoothingMm * 0.16, diag / 12000, 0.006), 0.006, Math.max(smoothingMm * 0.45, 0.04));
  contour = resampleClosedPath(contour, spacing, 12000);
  contour = dedupeConsecutivePoints(contour, Math.max(spacing * 0.02, 1e-6));
  if (polygonSignedArea(contour) < 0) contour.reverse();
  return contour.map((p) => ({ x: p.x, y: p.y, bulge: 0 }));
}

function transformForSilhouette(box) {
  const width = box.maxX - box.minX;
  const height = box.maxY - box.minY;
  const majorY = height >= width;
  return {
    majorY,
    uMin: majorY ? box.minX : box.minY,
    uMax: majorY ? box.maxX : box.maxY,
    vMin: majorY ? box.minY : box.minX,
    vMax: majorY ? box.maxY : box.maxX,
    toUV(p) {
      return majorY ? { u: p.x, v: p.y } : { u: p.y, v: p.x };
    },
    fromUV(p) {
      return majorY ? { x: p.u, y: p.v, bulge: 0 } : { x: p.v, y: p.u, bulge: 0 };
    },
  };
}

function interpolateSilhouetteSamples(samples) {
  const known = samples.map((sample, i) => sample ? { ...sample, i } : null).filter(Boolean);
  if (known.length < 2) return known.map(({ i, ...sample }) => sample);
  const out = samples.slice();
  for (let k = 0; k < known.length - 1; k++) {
    const a = known[k];
    const b = known[k + 1];
    const gap = b.i - a.i;
    if (gap <= 1 || gap > 18) continue;
    for (let step = 1; step < gap; step++) {
      const t = step / gap;
      out[a.i + step] = {
        u: a.u * (1 - t) + b.u * t,
        v: a.v * (1 - t) + b.v * t,
      };
    }
  }
  return out.filter(Boolean);
}

function buildAxisSilhouetteContour(sourceInfos, analysis, smoothingMm) {
  const cloud = sourceInfos
    .flatMap((info) => info.points || [])
    .filter((p) => Number.isFinite(p?.x) && Number.isFinite(p?.y));
  if (cloud.length < 80) return [];

  const box = bboxForPoints(cloud);
  if (!box) return [];
  const tf = transformForSilhouette(box);
  const uRange = tf.uMax - tf.uMin;
  const vRange = tf.vMax - tf.vMin;
  if (!(uRange > 0) || !(vRange > 0)) return [];
  const aspect = Math.max(uRange, vRange) / Math.max(1e-9, Math.min(uRange, vRange));
  if (aspect < 1.28) return [];

  const capFraction = aspect >= 3 ? 0.14 : 0.075;
  const capBand = clamp(Math.max(vRange * capFraction, smoothingMm * 5), vRange * 0.018, vRange * 0.28);
  const sideMinV = tf.vMin + capBand;
  const sideMaxV = tf.vMax - capBand;
  if (sideMaxV <= sideMinV) return [];

  const sideSpacing = clamp(Math.max(smoothingMm * 0.22, vRange / 5200, 0.012), 0.008, Math.max(smoothingMm * 0.6, 0.07));
  const sideCount = clamp(Math.ceil((sideMaxV - sideMinV) / sideSpacing), 120, 9000);
  const capCount = clamp(Math.ceil(uRange / sideSpacing), 48, 2600);

  const sideBins = Array.from({ length: sideCount }, () => []);
  const left = Array.from({ length: sideCount }, () => null);
  const right = Array.from({ length: sideCount }, () => null);
  const top = Array.from({ length: capCount }, () => null);
  const bottom = Array.from({ length: capCount }, () => null);

  for (const p of cloud) {
    const uv = tf.toUV(p);
    if (uv.v >= sideMinV && uv.v <= sideMaxV) {
      const idx = clamp(Math.floor(((uv.v - sideMinV) / (sideMaxV - sideMinV)) * sideCount), 0, sideCount - 1);
      sideBins[idx].push(uv);
    }
    const uIdx = clamp(Math.floor(((uv.u - tf.uMin) / uRange) * capCount), 0, capCount - 1);
    if (uv.v >= tf.vMax - capBand) {
      if (!top[uIdx] || uv.v > top[uIdx].v) top[uIdx] = uv;
    }
    if (uv.v <= tf.vMin + capBand) {
      if (!bottom[uIdx] || uv.v < bottom[uIdx].v) bottom[uIdx] = uv;
    }
  }

  const minSideSpan = Math.max(uRange * 0.08, smoothingMm * 4);
  for (let i = 0; i < sideBins.length; i++) {
    const bin = sideBins[i];
    if (bin.length < 2) continue;
    bin.sort((a, b) => a.u - b.u);
    const lo = bin[0];
    const hi = bin[bin.length - 1];
    if (hi.u - lo.u < minSideSpan) continue;
    left[i] = lo;
    right[i] = hi;
  }

  const rightChain = interpolateSilhouetteSamples(right).sort((a, b) => a.v - b.v);
  const topChain = interpolateSilhouetteSamples(top).sort((a, b) => b.u - a.u);
  const leftChain = interpolateSilhouetteSamples(left).sort((a, b) => b.v - a.v);
  const bottomChain = interpolateSilhouetteSamples(bottom).sort((a, b) => a.u - b.u);

  let contour = rightChain.concat(topChain, leftChain, bottomChain).map((p) => tf.fromUV(p));
  contour = dedupeConsecutivePoints(contour, Math.max(smoothingMm * 0.05, 1e-5));
  contour = removeLongChordHairpins(contour, analysis.diag);
  const contourBox = bboxForPoints(contour);
  if (!contourBox || contour.length < 16) return [];
  const contourArea = Math.abs(polygonSignedArea(contour));
  if (contourArea < bboxArea(contourBox) * 0.08) return [];
  return finishHighDefSilhouetteContour(contour, smoothingMm, analysis.diag, contourBox);
}

function buildStitchedMinimalOuterContour(sourceInfos, analysis, smoothingMm, mode) {
  const entityCount = sourceInfos.reduce((sum, info) => sum + (info.entities?.length || 0), 0);
  const step = clamp(Math.max(Math.min(smoothingMm * 0.12, analysis.diag / 5000), 0.008), 0.006, 0.025);
  const connectTol = Math.max(CONNECT_TOL * 4, step * 2, 0.04);
  const paths = sourceInfos.flatMap((info) => orderedFeatureRepairPaths(info, step, connectTol));
  let joined = joinRepairPaths(paths, mode, analysis.diag);
  joined = dedupeConsecutivePoints(joined, Math.max(step * 0.02, 1e-6));
  if (joined.length < 4) return [];
  joined = removeShortSpikes(joined, Math.max(step * 1.5, 0.015));
  joined = removeLongChordHairpins(joined, analysis.diag);
  joined = removeSmallSelfLoopsClosed(joined, Math.max(step * 8, analysis.diag * 0.004));
  const spacing = entityCount > 350
    ? clamp(Math.max(step * 0.45, 0.008), 0.008, 0.014)
    : clamp(Math.max(step * 0.75, 0.012), 0.012, 0.035);
  joined = resampleClosedPath(joined, spacing, entityCount > 350 ? 12000 : 24000);
  joined = dedupeConsecutivePoints(joined, Math.max(spacing * 0.02, 1e-6));
  if (polygonSignedArea(joined) < 0) joined.reverse();
  return joined.map((p) => ({ x: p.x, y: p.y, bulge: 0 }));
}

function walkEntityChainsFromSeed(chains, seedIndex, connectTol) {
  const used = new Array(chains.length).fill(false);
  let ordered = chains[seedIndex].slice();
  used[seedIndex] = true;
  let changed = true;
  while (changed) {
    changed = false;
    const end = ordered[ordered.length - 1];
    const start = ordered[0];
    let best = null;
    for (let i = 0; i < chains.length; i++) {
      if (used[i]) continue;
      const chain = chains[i];
      const options = [
        { i, d: distance(end, chain[0]), append: true, reverse: false },
        { i, d: distance(end, chain[chain.length - 1]), append: true, reverse: true },
        { i, d: distance(start, chain[chain.length - 1]), append: false, reverse: false },
        { i, d: distance(start, chain[0]), append: false, reverse: true },
      ];
      for (const option of options) {
        if (!best || option.d < best.d) best = option;
      }
    }
    if (!best || best.d > connectTol) break;
    used[best.i] = true;
    let chain = chains[best.i].slice();
    if (best.reverse) chain.reverse();
    if (best.append) ordered = ordered.concat(chain.slice(1));
    else ordered = chain.slice(0, -1).concat(ordered);
    ordered = dedupeConsecutivePoints(ordered, 1e-6);
    changed = true;
  }
  const usedCount = used.filter(Boolean).length;
  return { ordered, usedCount, gap: ordered.length >= 2 ? distance(ordered[0], ordered[ordered.length - 1]) : Infinity };
}

function buildEndpointWalkOuterContour(sourceInfos, analysis, smoothingMm) {
  const entityCount = sourceInfos.reduce((sum, info) => sum + (info.entities?.length || 0), 0);
  const step = clamp(Math.max(analysis.baseStep * 0.18, 0.012), 0.01, 0.03);
  const connectTol = entityCount > 350
    ? Math.max(CONNECT_TOL * 5, step * 2.4, smoothingMm * 0.35, 0.055)
    : Math.max(CONNECT_TOL * 3, step * 1.6, smoothingMm * 0.45, 0.04);
  const chains = [];
  for (const info of sourceInfos) {
    for (const entity of info.entities) {
      const path = entityPathForRepair(entity, step);
      if (path.length >= 2) chains.push(path.slice());
    }
  }
  if (!chains.length) return [];

  const sortedSeeds = chains
    .map((chain, index) => ({ index, length: pathLengthPoints(chain, false) }))
    .sort((a, b) => b.length - a.length);
  const seedLimit = chains.length > 200 ? Math.min(entityCount > 350 ? 8 : 12, chains.length) : 1;
  const passLimit = entityCount > 350 ? 3 : 4;
  const seedOrder = chains.length > 200
    ? sortedSeeds.slice(0, seedLimit)
    : [{ index: 0, length: sortedSeeds[0]?.length || 0 }];

  let ordered = [];
  let bestRank = Infinity;
  for (const seed of seedOrder) {
    let tol = connectTol;
    for (let pass = 0; pass < passLimit; pass++) {
      const walk = walkEntityChainsFromSeed(chains, seed.index, tol);
      if (walk.ordered.length < 4) break;
      const coverage = walk.usedCount / chains.length;
      const rank = walk.gap / Math.max(coverage, 0.04);
      if (rank < bestRank) {
        bestRank = rank;
        ordered = walk.ordered;
      }
      if (coverage >= 0.93) break;
      tol *= 1.28;
    }
  }
  if (ordered.length < 4) return [];
  return finalizeEndpointWalkContour(ordered, smoothingMm, analysis, step, entityCount);
}

function finalizeEndpointWalkContour(ordered, smoothingMm, analysis, step, entityCount = 0) {
  let contour = dedupeConsecutivePoints(ordered, Math.max(step * 0.03, 1e-6));
  if (entityCount <= 350) {
    contour = removeShortSpikes(contour, Math.max(smoothingMm * 0.18, step * 1.0, 0.008));
    contour = removeLongChordHairpins(contour, analysis.diag);
  }
  const spacing = entityCount > 350
    ? clamp(Math.max(step * 0.35, 0.008), 0.008, 0.014)
    : clamp(Math.max(step * 0.5, 0.008), 0.008, 0.02);
  contour = resampleClosedPath(contour, spacing, 12000);
  if (contour.length < 4) return [];
  if (polygonSignedArea(contour) < 0) contour.reverse();
  return contour.map((p) => ({ x: p.x, y: p.y, bulge: 0 }));
}

function buildLocalOuterContour(sourceInfos, analysis, smoothingMm, mode, startIndex = 0) {
  const scanlineFallback = () => {
    const step = Math.max(Math.min(smoothingMm * 0.3, analysis.diag / 1200), 0.015);
    const connectTol = Math.max(CONNECT_TOL * 8, step * 4, smoothingMm * 0.8);
    const paths = sourceInfos.flatMap((info) => orderedFeatureRepairPaths(info, step, connectTol));
    const joined = prepareDenseRepairPath(joinRepairPaths(paths, mode, analysis.diag), smoothingMm, analysis.diag);
    const sourceBox = bboxForPoints(joined);
    if (!sourceBox || joined.length < 4) return [];
    return locallySmoothClosedPath(joined, smoothingMm, analysis.diag, sourceBox);
  };

  const entityCount = sourceInfos.reduce((sum, info) => sum + (info.entities?.length || 0), 0);
  const fullBuilders = entityCount > 350
    ? [
      () => buildSourceGuidedOuterContour(sourceInfos, analysis, smoothingMm),
      scanlineFallback,
    ]
    : [
      () => buildEndpointWalkOuterContour(sourceInfos, analysis, smoothingMm),
      () => buildSourceGuidedOuterContour(sourceInfos, analysis, smoothingMm),
      () => buildStitchedMinimalOuterContour(sourceInfos, analysis, smoothingMm, mode),
      scanlineFallback,
      () => buildAxisSilhouetteContour(sourceInfos, analysis, smoothingMm),
      () => buildConcaveOuterContour(sourceInfos, analysis, smoothingMm),
      () => buildLiteralOuterHullContour(sourceInfos, analysis, smoothingMm),
    ];
  const builders = entityCount > 350 ? fullBuilders : fullBuilders.slice(0, 5);

  let lazyDeviationCtx = null;
  const scoreContour = (contour) => {
    if (contour.length < 4) return Infinity;
    if (!lazyDeviationCtx) {
      lazyDeviationCtx = createOutlineDeviationContext(sourceInfos, analysis, smoothingMm);
    }
    return measureOutlineDeviationWithContext(lazyDeviationCtx, contour).maxMm;
  };

  const endpointWalk = entityCount > 350 ? [] : buildEndpointWalkOuterContour(sourceInfos, analysis, smoothingMm);
  if (endpointWalk.length >= 4) {
    const endpointScore = scoreContour(endpointWalk);
    if (endpointScore <= OUTLINE_ACCEPTANCE_MM) return endpointWalk;
  }

  let best = endpointWalk.length >= 4 ? endpointWalk : [];
  let bestScore = best.length >= 4 ? scoreContour(best) : Infinity;
  for (let offset = 0; offset < builders.length; offset++) {
    const builderIndex = (startIndex + offset) % builders.length;
    if (entityCount <= 350 && builderIndex === 0 && endpointWalk.length >= 4) continue;
    const build = builders[builderIndex];
    let contour = [];
    try {
      contour = build();
    } catch {
      contour = [];
    }
    if (contour.length < 4) continue;
    const score = scoreContour(contour);
    if (score < bestScore) {
      bestScore = score;
      best = contour;
    }
    if (score <= OUTLINE_ACCEPTANCE_MM) return contour;
  }
  return best.length >= 4 ? best : [];
}

function perpendicularDistanceToSegment(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 <= 1e-12) return distance(p, a);
  const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / len2, 0, 1);
  return distance(p, { x: a.x + dx * t, y: a.y + dy * t });
}

function closestPointOnSegment(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 <= 1e-12) return { x: a.x, y: a.y };
  const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / len2, 0, 1);
  return { x: a.x + dx * t, y: a.y + dy * t };
}

function snapClosedContourToSegments(points, segments, maxMoveMm) {
  const limit = Math.max(0, Number(maxMoveMm) || 0);
  if (limit <= 0 || !points.length || !segments.length) return points;
  return points.map((point) => {
    let best = null;
    let bestDist = Infinity;
    for (const segment of segments) {
      const proj = closestPointOnSegment(point, segment.a, segment.b);
      const d = distance(point, proj);
      if (d < bestDist) {
        bestDist = d;
        best = proj;
      }
    }
    if (!best || bestDist > limit) return point;
    return { x: best.x, y: best.y, bulge: point.bulge || 0 };
  });
}

function snapOutputContourToSource(outputContour, sourceInfos, analysis, contourSmoothingMm, options = {}) {
  if (outputContour.length < 4) return outputContour;
  const entityCount = sourceInfos.reduce((sum, info) => sum + (info.entities?.length || 0), 0);
  const snapSegments = subsampleSegments(
    segmentsFromPaths(sourceRepairPaths(sourceInfos, analysis, contourSmoothingMm)),
    entityCount > 350 ? 16000 : 12000,
  );
  if (!snapSegments.length) return outputContour;
  const snapLimit = options.maxSnapMm || (entityCount > 350
    ? Math.max(contourSmoothingMm * 0.22, 0.11)
    : Math.max(contourSmoothingMm * 0.18, 0.09));
  const snapped = snapClosedContourToSegments(outputContour, snapSegments, snapLimit);
  return dedupeConsecutivePoints(snapped, Math.max(contourSmoothingMm * 0.003, 1e-6));
}

function snapOutputContourToReference(outputContour, referencePath, maxMoveMm) {
  if (outputContour.length < 4 || referencePath.length < 4) return outputContour;
  const limit = Math.max(0, Number(maxMoveMm) || 0);
  if (limit <= 0) return outputContour;
  const meta = cumulativeClosedPath(referencePath);
  if (!(meta.total > 0)) return outputContour;
  const limit2 = limit * limit;
  return outputContour.map((point) => {
    const projected = projectPointToClosedPath(point, referencePath, meta.cum);
    if (!projected || projected.d2 > limit2) return point;
    return { x: projected.base.x, y: projected.base.y, bulge: point.bulge || 0 };
  });
}

function rdpSimplifyOpen(points, epsilon) {
  if (points.length <= 2) return points.slice();
  let maxDist = -1;
  let index = -1;
  const first = points[0];
  const last = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistanceToSegment(points[i], first, last);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }
  if (maxDist > epsilon && index > 0) {
    const left = rdpSimplifyOpen(points.slice(0, index + 1), epsilon);
    const right = rdpSimplifyOpen(points.slice(index), epsilon);
    return left.slice(0, -1).concat(right);
  }
  return [first, last];
}

function rdpSimplifyClosed(points, epsilon) {
  if (points.length <= 4) return points.slice();
  const box = emptyBox();
  for (const p of points) expandBox(box, p);
  const center = bboxCenter(box);
  let start = 0;
  let far = -1;
  for (let i = 0; i < points.length; i++) {
    const d = distance(center, points[i]);
    if (d > far) {
      far = d;
      start = i;
    }
  }
  const rotated = points.slice(start).concat(points.slice(0, start), [points[start]]);
  const simplified = rdpSimplifyOpen(rotated, epsilon).slice(0, -1);
  return simplified.length >= 4 ? simplified : points.slice();
}

function findEntitiesInsertIndex() {
  if (!state.doc?.pairs?.length) return 0;
  let inEntities = false;
  for (let i = 0; i < state.doc.pairs.length; i++) {
    const p = state.doc.pairs[i];
    if (p.code !== "0") continue;
    const value = String(p.value || "").trim().toUpperCase();
    if (value === "SECTION") {
      const sectionName = state.doc.pairs[i + 1]?.code === "2" ? String(state.doc.pairs[i + 1].value || "").trim().toUpperCase() : "";
      inEntities = sectionName === "ENTITIES";
    } else if (value === "ENDSEC" && inEntities) {
      return i;
    }
  }
  return Math.max(0, state.doc.pairs.length - 1);
}

function addRepairedOuterPolyline(points, layer) {
  const id = state.doc.entities.reduce((max, e) => Math.max(max, e.id || 0), 0) + 1;
  const insert = findEntitiesInsertIndex();
  const entity = {
    id,
    type: "LWPOLYLINE",
    originalType: "LWPOLYLINE",
    start: insert,
    end: insert - 1,
    pairs: [],
    layer: layer || "0",
    deleted: false,
    modified: true,
    featureId: null,
    supported: true,
    closed: true,
    points,
    repairedOuterContour: true,
  };
  entity.pairs = buildLwPolylinePairs(entity);
  state.doc.entities.push(entity);
  return entity;
}

function classifyOuterRepairFeature(info, analysis, filterArea, mode, outerBoxTol) {
  const isOuter = info.feature.id === analysis.outerInfo?.feature.id;
  const closed = !!info.feature.closed;
  const smallClosed = closed && info.area < filterArea;
  const touchesOuter = featureTouchesOuterBox(info.feature, analysis.bbox, outerBoxTol);
  const featureBoxArea = bboxArea(info.feature.bbox);
  const largeBox = featureBoxArea >= analysis.bboxAreaValue * 0.18;
  const highShellMax = info.radial.max >= analysis.shellRadius;
  const highShellMean = info.radial.mean >= analysis.shellRadius * 0.76;

  if (smallClosed) return { preserve: false, delete: true, source: false, reason: "small" };

  if (mode === "continuous") {
    const source = isOuter || (!closed && (touchesOuter || highShellMax));
    if (source) return { preserve: false, delete: true, source: true, reason: "outer" };
    if (closed) return { preserve: true, delete: false, source: false, reason: "inner" };
    return { preserve: false, delete: true, source: false, reason: "loose" };
  }

  const exterior = isOuter
    || !closed
    || touchesOuter
    || largeBox
    || (highShellMax && (highShellMean || featureBoxArea >= analysis.bboxAreaValue * 0.08));

  if (exterior) return { preserve: false, delete: true, source: true, reason: "outer-fragment" };
  if (closed) return { preserve: true, delete: false, source: false, reason: "inner" };
  return { preserve: false, delete: true, source: false, reason: "loose" };
}

function planOuterContourRepair(analysis, filterArea, smoothingMm, mode) {
  const outerBoxTol = Math.max(analysis.diag * 0.015, smoothingMm * 2);
  const preserveIds = new Set();
  const deleteIds = new Set();
  const sourceIds = new Set();
  const sourceInfos = [];
  const reasons = { small: 0, inner: 0, outer: 0, "outer-fragment": 0, loose: 0 };

  for (const info of analysis.featureInfos) {
    const choice = classifyOuterRepairFeature(info, analysis, filterArea, mode, outerBoxTol);
    reasons[choice.reason] = (reasons[choice.reason] || 0) + 1;
    if (choice.preserve) {
      for (const e of info.entities) preserveIds.add(e.id);
      continue;
    }
    if (choice.delete) {
      for (const e of info.entities) deleteIds.add(e.id);
    }
    if (choice.source) {
      sourceInfos.push(info);
      for (const e of info.entities) sourceIds.add(e.id);
    }
  }

  return { preserveIds, deleteIds, sourceIds, sourceInfos, reasons };
}

function performOuterContourRepair(options) {
  if (!state.doc) return null;
  const repairMethod = options.repairMethod === "arcLine" ? "arcLine" : "hd";
  const computed = repairMethod === "arcLine"
    ? computeArcLineOuterContourRepairResult(options)
    : computeOuterContourRepairResult({ ...options, rebuildLinesAndArcs: false });
  if (!computed?.outputContour?.length) return null;
  if (!computed.accepted) {
    return {
      failed: true,
      reason: "deviation",
      maxDeviationMm: computed.deviation.maxMm,
      forwardMm: computed.deviation.forwardMm,
      reverseMm: computed.deviation.reverseMm,
      acceptanceMm: computed.acceptanceMm ?? OUTLINE_ACCEPTANCE_MM,
    };
  }

  const {
    analysis,
    sourceInfos,
    contour,
    outputContour,
    lineArcResult,
    deviation,
    contourSmoothingMm,
    lineArcSmoothingMm,
    filterArea,
    mode,
    rebuildLinesAndArcs,
  } = computed;
  const candidateEntities = analysis.entities.filter((e) => computed.plan.sourceIds.has(e.id));
  const layer = candidateEntities[0]?.layer || analysis.outerInfo.entities[0]?.layer || "0";

  pushUndoSnapshot();
  for (const entity of analysis.entities) entity.deleted = true;
  const repaired = addRepairedOuterPolyline(outputContour, layer);
  state.selectedEntityIds.clear();
  state.selectedFeatureIds.clear();
  state.dissolvedEntityIds.clear();
  state.repairCompareOriginal = collectOuterBoundaryPaths(sourceInfos, analysis, contourSmoothingMm);
  state.repairCompareFixed = outputContour.map((p) => ({ ...p }));
  state.repairCompareDeviation = deviation;
  state.repairCompareVisible = ui.outerRepairCompareToggle?.checked !== false;
  rebuild();
  const newFeature = featureByEntity(repaired);
  if (newFeature) state.selectedFeatureIds.add(newFeature.id);
  markDirty();
  render();
  return {
    mode,
    points: outputContour.length,
    densePoints: contour.length,
    removed: analysis.entities.length,
    preserved: 0,
    sourceEntities: candidateEntities.length || analysis.entities.length,
    smoothingMm: lineArcSmoothingMm,
    contourSmoothingMm,
    filterArea,
    lineArcRequested: repairMethod === "arcLine" || !!rebuildLinesAndArcs,
    lineArcAccepted: repairMethod === "arcLine" ? !!lineArcResult?.points?.length && computed.accepted : !!lineArcResult?.accepted,
    lineArcSegments: lineArcResult?.segments || 0,
    lineArcMaxDeviationMm: lineArcResult?.maxDeviation,
    lineArcToleranceMm: options.lineArcToleranceMm,
    manualValues: !!options.manualValues,
    repairMethod,
    outputSuffix: repairMethod === "arcLine" ? "_fixedAL" : "_fixed",
    outlineMaxDeviationMm: deviation.maxMm,
    outlineForwardMm: deviation.forwardMm,
    outlineReverseMm: deviation.reverseMm,
    outlineAcceptanceMm: OUTLINE_ACCEPTANCE_MM,
  };
}

async function applyOuterContourRepair(options) {
  const current = currentFile();
  const originalText = serializeDxf();
  const originalDirty = state.dirty;
  const originalSavedText = state.savedText;
  const originalUndo = state.undoStack.slice();
  const restoreOriginal = () => {
    loadDxfText(originalText, { preserveView: true });
    state.dirty = originalDirty;
    state.savedText = originalSavedText;
    state.undoStack = originalUndo;
    state.selectedEntityIds.clear();
    state.selectedFeatureIds.clear();
    state.dissolvedEntityIds.clear();
    syncUi();
    render();
  };
  const result = performOuterContourRepair(options);
  if (!result) return null;
  if (result.failed) {
    restoreOriginal();
    throw new Error(
      `Repaired outline deviates ${formatInputMm(result.maxDeviationMm)} mm from the original `
      + `(limit ${formatInputMm(result.acceptanceMm)} mm; forward ${formatInputMm(result.forwardMm)} mm, `
      + `reverse ${formatInputMm(result.reverseMm)} mm).`,
    );
  }
  const fixedText = serializeDxf();
  const outputSuffix = result.outputSuffix || (options.repairMethod === "arcLine" ? "_fixedAL" : "_fixed");
  const writeCopy = outputSuffix === "_fixedAL" ? desktopApi?.writeFixedALCopy : desktopApi?.writeFixedCopy;

  if (current?.path && writeCopy) {
    let fixed;
    try {
      fixed = await writeCopy(current.path, fixedText);
    } catch (error) {
      restoreOriginal();
      throw error;
    }
    if (fixed?.files?.length) {
      state.files = fixed.files;
      state.fileIndex = Math.max(0, fixed.index ?? state.fileIndex);
    }
    if (fixed?.path && desktopApi?.claimFile) {
      const lockState = await desktopApi.claimFile(fixed.path);
      state.readOnly = !!lockState?.readOnly;
      state.readOnlyReason = lockState?.reason || null;
    }
    loadDxfText(fixedText);
    state.savedText = serializeDxf();
    state.dirty = false;
    state.undoStack = [];
    state.selectedEntityIds.clear();
    state.selectedFeatureIds.clear();
    state.dissolvedEntityIds.clear();
    if (!fixed?.path) {
      state.readOnly = false;
      state.readOnlyReason = null;
    }
    rebuild();
    fitView();
    result.fixedPath = fixed?.path || "";
    result.fixedName = fixed?.name || "";
    return result;
  }

  const baseName = current?.name ? current.name.replace(/\.dxf$/i, "") : "drawing";
  await downloadText(fixedText, `${baseName}${outputSuffix}.dxf`);
  restoreOriginal();
  result.fixedName = `${baseName}${outputSuffix}.dxf`;
  return result;
}

function nextPaint() {
  return new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
}

function setOuterRepairProgress(percent, status, detail = "") {
  const safePercent = clamp(Math.round(percent), 0, 100);
  if (ui.outerRepairProgress) ui.outerRepairProgress.value = safePercent;
  if (ui.outerRepairPercent) ui.outerRepairPercent.textContent = `${safePercent}%`;
  if (ui.outerRepairStatus) ui.outerRepairStatus.textContent = status;
  if (ui.outerRepairSummary) ui.outerRepairSummary.textContent = detail || status;
}

function showOuterRepairProgress() {
  setOuterRepairProgress(0, "Preparing...", "Reading current DXF geometry.");
  if (ui.outerRepairDialog?.showModal && !ui.outerRepairDialog.open) ui.outerRepairDialog.showModal();
}

function hideOuterRepairProgressSoon() {
  setTimeout(() => ui.outerRepairDialog?.close(), 700);
}

function automaticLineArcTolerance(analysis) {
  return clamp(Math.max(analysis.diag * 0.000125, 0.02), 0.02, OUTLINE_ACCEPTANCE_MM);
}

function automaticContourSmoothing(analysis) {
  return clamp(
    Math.max(analysis.diag * 0.00025, 0.035),
    0.03,
    Math.max(analysis.diag * 0.00065, 0.08),
  );
}

function automaticLineArcSmoothing(analysis, contourSmoothingMm = automaticContourSmoothing(analysis)) {
  return clamp(
    Math.max(contourSmoothingMm * 7.4, analysis.diag * 0.0052, 0.7),
    0.35,
    Math.max(analysis.diag * 0.009, 1.2),
  );
}

function automaticOuterRepairOptions(analysis) {
  const contourSmoothingMm = automaticContourSmoothing(analysis);
  const smoothingMm = automaticLineArcSmoothing(analysis, contourSmoothingMm);
  return {
    mode: analysis.suggestedMode,
    smoothingMm,
    contourSmoothingMm,
    smallFilterAreaMm2: analysis.defaultSmallFilter,
    lineArcToleranceMm: automaticLineArcTolerance(analysis),
  };
}

function formatInputMm(value) {
  if (!Number.isFinite(value)) return "";
  return value >= 1 ? value.toFixed(3) : value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

function readPositiveInput(input, fallback) {
  const value = Number(input?.value);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function readSimplifyValue() {
  return Math.max(0, Number(ui.lineArcSimplifySlider?.value) || 0);
}

function updateSimplifyOutput() {
  if (!ui.lineArcSimplifyOutput) return;
  const value = readSimplifyValue();
  ui.lineArcSimplifyOutput.textContent = value > 0 ? `${value} mm` : "off";
}

function askOuterRepairMethodOptions(defaults) {
  const fallbackHd = () => ({
    ...defaults,
    repairMethod: "hd",
    rebuildLinesAndArcs: false,
  });
  const fallbackArcLine = () => ({
    ...defaults,
    repairMethod: "arcLine",
    rebuildLinesAndArcs: true,
    minFeatureLenMm: 0,
  });

  if (!ui.outerRepairMethodDialog?.showModal) {
    const useArcLine = window.confirm(
      "Fix outer contour:\n\nOK = Arc & line (_fixedAL.dxf)\nCancel = High-definition (_fixed.dxf)",
    );
    return Promise.resolve(useArcLine ? fallbackArcLine() : fallbackHd());
  }

  if (ui.lineArcSimplifySlider) ui.lineArcSimplifySlider.value = "0";
  updateSimplifyOutput();

  return new Promise((resolve) => {
    const finish = (repairMethod) => {
      const minFeatureLenMm = repairMethod === "arcLine" ? readSimplifyValue() : 0;
      cleanup();
      if (ui.outerRepairMethodDialog.open) ui.outerRepairMethodDialog.close();
      resolve({
        ...defaults,
        repairMethod,
        rebuildLinesAndArcs: repairMethod === "arcLine",
        minFeatureLenMm,
      });
    };
    const onSlider = () => updateSimplifyOutput();
    const onCancel = (event) => {
      event.preventDefault();
      cleanup();
      if (ui.outerRepairMethodDialog.open) ui.outerRepairMethodDialog.close();
      resolve(null);
    };
    const cleanup = () => {
      ui.outerRepairHdBtn?.removeEventListener("click", onHd);
      ui.outerRepairArcLineBtn?.removeEventListener("click", onArcLine);
      ui.outerRepairMethodCancelBtn?.removeEventListener("click", onCancelBtn);
      ui.lineArcSimplifySlider?.removeEventListener("input", onSlider);
      ui.outerRepairMethodDialog?.removeEventListener("cancel", onCancel);
    };
    const onHd = () => finish("hd");
    const onArcLine = () => finish("arcLine");
    const onCancelBtn = () => {
      cleanup();
      if (ui.outerRepairMethodDialog.open) ui.outerRepairMethodDialog.close();
      resolve(null);
    };

    ui.outerRepairHdBtn?.addEventListener("click", onHd);
    ui.outerRepairArcLineBtn?.addEventListener("click", onArcLine);
    ui.outerRepairMethodCancelBtn?.addEventListener("click", onCancelBtn);
    ui.lineArcSimplifySlider?.addEventListener("input", onSlider);
    ui.outerRepairMethodDialog?.addEventListener("cancel", onCancel);
    ui.outerRepairMethodDialog.showModal();
  });
}

async function runAutomaticOuterContourRepair() {
  if (!state.doc || state.repairBusy) return;
  state.repairBusy = true;
  syncUi();
  try {
    const analysis = analyseOuterContourRepair();
    if (!analysis?.outerInfo) throw new Error("Could not find enough geometry to repair an outer contour.");
    const options = await askOuterRepairMethodOptions(automaticOuterRepairOptions(analysis));
    if (!options) return;
    const outputSuffix = options.repairMethod === "arcLine" ? "_fixedAL" : "_fixed";
    if (ui.outerRepairOutputNote) {
      ui.outerRepairOutputNote.innerHTML = `Creating a sibling <strong>${outputSuffix}.dxf</strong> file. The original DXF stays unchanged.`;
    }
    showOuterRepairProgress();
    await nextPaint();
    setOuterRepairProgress(8, "Analyzing contours...", "Finding the likely outside contour and small detached junk.");
    await nextPaint();
    const sourceCount = analysis.exteriorCandidates.length || 1;
    setOuterRepairProgress(
      22,
      options.repairMethod === "arcLine" ? "Tracing original outline..." : "Building dense point cloud...",
      options.repairMethod === "arcLine"
        ? `Detecting feature vertices and fitting clean lines/arcs (tight on clean edges, logical on broken ones).`
        : `Using ${sourceCount} outside evidence group(s). Target output: one contour.`,
    );
    await nextPaint();
    setOuterRepairProgress(
      38,
      options.repairMethod === "arcLine" ? "Fitting lines and arcs..." : "Repairing topology...",
      options.repairMethod === "arcLine"
        ? "Preferring longer line and arc segments over mesh noise."
        : "Removing tiny loops, doubled local strands, and separate trash contours.",
    );
    await nextPaint();
    const result = await applyOuterContourRepair(options);
    if (!result) throw new Error("Repair did not produce a valid contour.");
    setOuterRepairProgress(92, "Refreshing folder...", `Loading ${outputSuffix}.dxf beside the original.`);
    await refreshDxfFolderFiles();
    const lineArcDetail = result.repairMethod === "arcLine"
      ? result.lineArcAccepted
        ? ` ${result.lineArcSegments} line/arc segment(s), max deviation ${formatInputMm(result.lineArcMaxDeviationMm)} mm.`
        : " Arc/line fit did not pass the outline gate."
      : "";
    const outlineDetail = ` Outline deviation ${formatInputMm(result.outlineMaxDeviationMm)} mm (limit ${formatInputMm(result.outlineAcceptanceMm)} mm).`;
    setOuterRepairProgress(100, "Done", `Saved ${result.fixedName || `${outputSuffix}.dxf`} with ${result.points} contour point(s).${lineArcDetail}${outlineDetail}`);
    ui.hud.textContent = `Outer contour fixed copy saved${result.fixedName ? `: ${result.fixedName}` : ""}. ${result.points} contour point(s).${lineArcDetail}${outlineDetail} Compare overlay on.`;
    hideOuterRepairProgressSoon();
  } catch (error) {
    setOuterRepairProgress(100, "Failed", error.message || String(error));
    alert(`Outer contour repair failed: ${error.message || error}`);
    ui.outerRepairDialog?.close();
  } finally {
    state.repairBusy = false;
    syncUi();
  }
}

function selectionNumberRow(label, value, buttonText, onApply, { unit = "" } = {}) {
  const row = document.createElement("label");
  row.className = "selection-row";
  const labelSpan = document.createElement("span");
  labelSpan.textContent = `${label}:`;
  const input = document.createElement("input");
  input.type = "number";
  input.step = "0.1";
  input.value = fmtInput(value);
  input.disabled = state.readOnly;
  const unitSpan = document.createElement("span");
  unitSpan.className = "selection-muted";
  unitSpan.textContent = unit;
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = buttonText;
  button.disabled = state.readOnly;
  const apply = () => onApply(parseFloat(input.value));
  button.addEventListener("click", apply);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") apply();
  });
  row.append(labelSpan, input, unitSpan, button);
  return row;
}

function selectionOffsetEditor(features) {
  const editor = document.createElement("div");
  editor.className = "selection-offset-editor";
  const uniformRow = selectionNumberRow("Offset", 0, "Apply", (value) => applySelectionOffset(value), { unit: "mm" });
  const axisAvailable = features.length > 0 && features.every(canAxisOffsetFeature);

  const toggle = document.createElement("label");
  toggle.className = "axis-offset-toggle";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.disabled = state.readOnly || !axisAvailable;
  const toggleText = document.createElement("span");
  toggleText.textContent = "Per direction";
  toggle.append(checkbox, toggleText);
  if (!axisAvailable) {
    toggle.title = "Independent X/Y offset is limited to contours whose lines and circular arcs can remain exact.";
  }

  const axisRow = document.createElement("div");
  axisRow.className = "axis-offset-row";
  axisRow.hidden = true;
  const xLabel = document.createElement("span");
  xLabel.textContent = "X:";
  const xInput = document.createElement("input");
  xInput.type = "number";
  xInput.step = "0.1";
  xInput.value = "0";
  xInput.disabled = state.readOnly;
  const yLabel = document.createElement("span");
  yLabel.textContent = "Y:";
  const yInput = document.createElement("input");
  yInput.type = "number";
  yInput.step = "0.1";
  yInput.value = "0";
  yInput.disabled = state.readOnly;
  const unit = document.createElement("span");
  unit.className = "selection-muted";
  unit.textContent = "mm";
  const applyButton = document.createElement("button");
  applyButton.type = "button";
  applyButton.textContent = "Apply";
  applyButton.disabled = state.readOnly;
  const apply = () => applySelectionAxisOffset(parseFloat(xInput.value), parseFloat(yInput.value));
  applyButton.addEventListener("click", apply);
  for (const input of [xInput, yInput]) {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") apply();
    });
  }
  axisRow.append(xLabel, xInput, yLabel, yInput, unit, applyButton);

  checkbox.addEventListener("change", () => {
    uniformRow.hidden = checkbox.checked;
    axisRow.hidden = !checkbox.checked;
    if (checkbox.checked) xInput.focus();
  });
  editor.append(uniformRow, toggle, axisRow);
  if (!axisAvailable) {
    const note = selectionText("Per direction is disabled here to avoid breaking circular or rotated geometry.", "selection-muted axis-offset-note");
    editor.appendChild(note);
  }
  return editor;
}

function syncMeasureInfo() {
  ui.measureInfo.innerHTML = "";
  const addLine = (text, className = "") => {
    if (!text) return;
    const div = document.createElement("div");
    div.textContent = text;
    if (className) div.className = className;
    ui.measureInfo.appendChild(div);
  };
  const addDetails = () => {
    state.measureDetails.forEach((detail, index) => {
      if (!detail) return;
      if (typeof detail === "string") {
        addLine(`P${index + 1} raw segment:`, "measure-subhead");
        addLine(detail);
        return;
      }
      addLine(`P${index + 1} raw segment: ${detail.title}`, "measure-subhead");
      addLine(detail.primary, "measure-primary");
      for (const line of detail.lines || []) addLine(line);
    });
  };
  if (state.measure.length === 0) {
    addLine("Pick two snapped points.");
    addLine("Esc clears measure points.");
  } else if (state.measure.length === 1) {
    const a = state.measure[0];
    addLine(`P1: ${fmt(a.x)}, ${fmt(a.y)}`);
    addDetails();
    addLine("Pick P2.");
  } else {
    const [a, b] = state.measure;
    addLine(`P1: ${fmt(a.x)}, ${fmt(a.y)}`);
    addLine(`P2: ${fmt(b.x)}, ${fmt(b.y)}`);
    addLine(`Distance: ${fmt(distance(a, b))} mm`);
    addLine(`dX: ${fmt(b.x - a.x)} mm`);
    addLine(`dY: ${fmt(b.y - a.y)} mm`);
    addDetails();
  }
}

function measureEntityInfo(e, snap) {
  if (!e) return null;
  return {
    title: `Entity ${e.id}: ${e.type}`,
    primary: rawMeasurePrimaryLine(e),
    lines: rawMeasureDetailLines(e, snap),
  };
}

function rawMeasurePrimaryLine(e) {
  if (e.type === "LINE") return `Length: ${fmt(lineLength(e))} mm`;
  if (e.type === "ARC") return `Radius: ${fmt(e.r)} mm`;
  if (e.type === "CIRCLE") return `Radius: ${fmt(e.r)} mm`;
  if (e.type === "LWPOLYLINE") return `Length: ${fmt(polylineLength(e))} mm`;
  return "";
}

function rawMeasureDetailLines(e, snap) {
  const lines = [];
  if (snap?.label) lines.push(`Snap: ${snap.label}`);
  if (e.type === "LINE") {
    lines.push(`Start point: ${fmt(e.x1)}, ${fmt(e.y1)}`);
    lines.push(`End point: ${fmt(e.x2)}, ${fmt(e.y2)}`);
  } else if (e.type === "ARC") {
    const start = arcPoint(e, e.a1);
    const end = arcPoint(e, e.a2);
    lines.push(`Length: ${fmt(arcLength(e))} mm`);
    lines.push(`Center point: ${fmt(e.cx)}, ${fmt(e.cy)}`);
    lines.push(`Start point: ${fmt(start.x)}, ${fmt(start.y)}`);
    lines.push(`End point: ${fmt(end.x)}, ${fmt(end.y)}`);
    lines.push(`Angles: ${fmt(e.a1)} deg to ${fmt(e.a2)} deg`);
  } else if (e.type === "CIRCLE") {
    lines.push(`Diameter: ${fmt(e.r * 2)} mm`);
    lines.push(`Center point: ${fmt(e.cx)}, ${fmt(e.cy)}`);
  } else if (e.type === "LWPOLYLINE") {
    const box = bboxForEntities([e]);
    lines.push(`${e.closed ? "Closed" : "Open"} polyline`);
    lines.push(`Vertices: ${e.points.length}`);
    lines.push(`Size: ${fmt(box.maxX - box.minX)} x ${fmt(box.maxY - box.minY)} mm`);
  } else {
    lines.push(entityDetail(e));
  }
  lines.push(`Layer: ${e.layer}`);
  return lines;
}

function syncFeatureList() {
  ui.featureList.innerHTML = "";
  const fragment = document.createDocumentFragment();
  for (const f of state.features) {
    const item = document.createElement("div");
    item.className = `feature-item ${f.kind}`;
    if (isFeatureSelected(f.id)) item.classList.add("selected");
    item.innerHTML = `
      <div class="feature-title">${escapeHtml(featureDisplayName(f))}</div>
      <div class="feature-meta">${f.entities.length} ent - ${fmt(f.bbox.maxX - f.bbox.minX)} x ${fmt(f.bbox.maxY - f.bbox.minY)} mm</div>
    `;
    item.addEventListener("click", (event) => selectFeature(f.id, event.ctrlKey || event.metaKey));
    fragment.appendChild(item);
  }
  ui.featureList.appendChild(fragment);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function fmt(value) {
  return Number.isFinite(value) ? value.toFixed(3).replace(/\.?0+$/, "") : "-";
}

function fmtInput(value) {
  return Number.isFinite(value) ? value.toFixed(3).replace(/\.?0+$/, "") : "0";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function markDirty() {
  updateDirty();
}

function updateDirty() {
  state.dirty = !!state.doc && serializeDxf() !== state.savedText;
  syncUi();
}

function pushUndoSnapshot() {
  if (!state.doc) return;
  const snapshot = serializeDxf();
  if (state.undoStack[state.undoStack.length - 1] !== snapshot) {
    state.undoStack.push(snapshot);
    if (state.undoStack.length > 100) state.undoStack.shift();
  }
}

function undoLastChange() {
  if (!state.undoStack.length || (state.readOnly && state.readOnlyReason !== "dwg-conversion")) return;
  const snapshot = state.undoStack.pop();
  loadDxfText(snapshot, { preserveView: true });
  updateDirty();
}

function loadDxfText(text, { preserveView = false } = {}) {
  state.doc = parseDxf(text);
  state.selectedEntityIds.clear();
  state.selectedFeatureIds.clear();
  state.dissolvedEntityIds.clear();
  state.measure = [];
  state.measureDetails = [];
  state.measureEntityIds = [];
  state.hoverSnap = null;
  rebuild();
  if (!preserveView) fitView();
}

function serializeDxf() {
  if (!state.doc) return "";
  const out = [];
  // Virtual entities (INSERT-expanded children) don't have their own pair
  // span in the source file — they're synthesized for display/selection.
  // The parent INSERT entity already owns the original pair block, so its
  // slice path emits the INSERT verbatim. Skipping virtual entities here
  // avoids emitting the same span multiple times.
  const sorted = [...state.doc.entities]
    .filter((e) => !e.virtual)
    .sort((a, b) => a.start - b.start);
  let cursor = 0;
  for (const e of sorted) {
    for (let i = cursor; i < e.start; i++) pushPair(out, state.doc.pairs[i]);
    if (!e.deleted) {
      const pairs = (e.modified || e.start > e.end) ? updatedPairsForEntity(e) : state.doc.pairs.slice(e.start, e.end + 1);
      for (const p of pairs) pushPair(out, p);
    }
    cursor = e.end + 1;
  }
  for (let i = cursor; i < state.doc.pairs.length; i++) pushPair(out, state.doc.pairs[i]);
  return out.join("\r\n");
}

function pushPair(out, pair) {
  out.push(pair.rawCode ?? pair.code);
  out.push(pair.rawValue ?? pair.value);
}

function buildLwPolylinePairs(e) {
  const layer = e.layer || "0";
  const points = (e.points || []).filter((p) => Number.isFinite(p?.x) && Number.isFinite(p?.y));
  const pairs = [
    { code: "0",   value: "LWPOLYLINE" },
    { code: "100", value: "AcDbEntity" },
    { code: "8",   value: String(layer) },
    { code: "100", value: "AcDbPolyline" },
    { code: "90",  value: String(points.length) },
    { code: "70",  value: e.closed ? "1" : "0" },
  ];
  for (const p of points) {
    pairs.push({ code: "10", value: formatNumber(p.x) });
    pairs.push({ code: "20", value: formatNumber(p.y) });
    if (Math.abs(p.bulge || 0) > BULGE_TOL) {
      pairs.push({ code: "42", value: formatNumber(p.bulge) });
    }
  }
  return pairs;
}

function updatedPairsForEntity(e) {
  // SPLINE / POLYLINE / ELLIPSE entities were converted to a sampled
  // LWPOLYLINE at parse time. If the user edited them (e.g. offset / scale),
  // we persist the edit by replacing the original block with a fresh
  // LWPOLYLINE carrying the (possibly modified) points. Unmodified ones
  // never reach this function — the serializer slices the original pair
  // span when modified=false, so the on-disk source entity is preserved
  // verbatim for the open-then-save-without-edits path.
  if (e.originalType === "SPLINE" || e.originalType === "POLYLINE" || e.originalType === "ELLIPSE") {
    return buildLwPolylinePairs(e);
  }
  const pairs = e.pairs.map((p) => ({ ...p }));
  if (e.type === "LINE") {
    setNthValue(pairs, "10", 1, e.x1);
    setNthValue(pairs, "20", 1, e.y1);
    setNthValue(pairs, "11", 1, e.x2);
    setNthValue(pairs, "21", 1, e.y2);
  } else if (e.type === "CIRCLE") {
    setNthValue(pairs, "10", 1, e.cx);
    setNthValue(pairs, "20", 1, e.cy);
    setNthValue(pairs, "40", 1, e.r);
  } else if (e.type === "ARC") {
    setNthValue(pairs, "10", 1, e.cx);
    setNthValue(pairs, "20", 1, e.cy);
    setNthValue(pairs, "40", 1, e.r);
    setNthValue(pairs, "50", 1, e.a1);
    setNthValue(pairs, "51", 1, e.a2);
  } else if (e.type === "LWPOLYLINE") {
    const originalPointCount = Number(readFirst(pairs, "90"));
    if (e.forceRebuildPairs || e.repairedOuterContour || !pairs.length || !Number.isFinite(originalPointCount) || originalPointCount !== e.points.length) {
      return buildLwPolylinePairs(e);
    }
    for (let i = 0; i < e.points.length; i++) {
      setNthValue(pairs, "10", i + 1, e.points[i].x);
      setNthValue(pairs, "20", i + 1, e.points[i].y);
    }
  } else if (e.type === "TEXT" || e.type === "MTEXT") {
    setNthValue(pairs, "10", 1, e.x);
    setNthValue(pairs, "20", 1, e.y);
    if (e.type === "TEXT" && e.alignmentPoint) {
      setNthValue(pairs, "11", 1, e.alignmentPoint.x);
      setNthValue(pairs, "21", 1, e.alignmentPoint.y);
    }
    if (e.type === "MTEXT" && e.directionVector) {
      setNthValue(pairs, "11", 1, e.directionVector.x);
      setNthValue(pairs, "21", 1, e.directionVector.y);
    }
    if (e.hasExplicitRotation) setOrAppendValue(pairs, "50", e.rotation || 0);
  } else if (e.type === "INSERT" && e.insertTransform) {
    setNthValue(pairs, "10", 1, e.insertTransform.tx);
    setNthValue(pairs, "20", 1, e.insertTransform.ty);
    setOrAppendValue(
      pairs,
      "50",
      normalizeDegrees((e.insertTransform.rotRad || 0) * 180 / Math.PI),
    );
  }
  return pairs;
}

function currentFile() {
  return state.files[state.fileIndex] || null;
}

function setSaveMenuOpen(open) {
  if (!ui.saveMenu || !ui.saveMenuBtn) return;
  const nextOpen = !!open && !ui.saveMenuBtn.disabled;
  ui.saveMenu.hidden = !nextOpen;
  ui.saveMenuBtn.setAttribute("aria-expanded", String(nextOpen));
}

// A "_fixed.dxf" / "_fixedAL.dxf" sibling produced by Fix Outer Contour.
function isFixedDxfOpen() {
  const name = currentFile()?.name || "";
  return /_fixed(?:al)?\.dxf$/i.test(name);
}

// Map a fixed file path back to its original source (strip the _fixed/_fixedAL suffix).
function siblingOriginalPath() {
  const path = currentFile()?.path || "";
  if (!path) return "";
  return path.replace(/_fixed(?:al)?(\.dxf)$/i, "$1");
}

// Tessellate any supported entity into a flat polyline of world points for overlay drawing.
function entityToOverlayPath(e) {
  if (!e || e.deleted) return null;
  if (e.type === "LINE") {
    return [{ x: e.x1, y: e.y1 }, { x: e.x2, y: e.y2 }];
  }
  if (e.type === "ARC") {
    return sampleArc(e, 48);
  }
  if (e.type === "CIRCLE") {
    const pts = [];
    const steps = 64;
    for (let i = 0; i <= steps; i++) {
      const ang = (Math.PI * 2 * i) / steps;
      pts.push({ x: e.cx + e.r * Math.cos(ang), y: e.cy + e.r * Math.sin(ang) });
    }
    return pts;
  }
  if (e.type === "LWPOLYLINE") {
    return samplePolyline(e, 48);
  }
  return null;
}

// Read the original sibling DXF and store its geometry as the amber overlay paths.
async function loadOriginalOverlayFromSibling() {
  if (state.originalOverlaySourcePath && state.repairCompareOriginal?.length) return true;
  const originalPath = siblingOriginalPath();
  if (!desktopApi?.readFile || !originalPath || originalPath === currentFile()?.path) {
    return false;
  }
  state.originalOverlayBusy = true;
  syncUi();
  try {
    const text = await desktopApi.readFile(originalPath);
    const doc = parseDxf(text);
    const paths = [];
    for (const e of doc.entities) {
      const path = entityToOverlayPath(e);
      if (path && path.length >= 2) paths.push(path);
    }
    if (!paths.length) return false;
    state.repairCompareOriginal = paths;
    state.repairCompareFixed = null;
    state.repairCompareDeviation = null;
    state.originalOverlaySourcePath = originalPath;
    return true;
  } catch (error) {
    console.warn("Failed to load original outline overlay:", error);
    return false;
  } finally {
    state.originalOverlayBusy = false;
  }
}

async function toggleOriginalOverlay() {
  if (!state.doc || !isFixedDxfOpen() || state.originalOverlayBusy) return;
  if (state.repairCompareVisible && state.repairCompareOriginal?.length) {
    state.repairCompareVisible = false;
    syncUi();
    render();
    return;
  }
  if (!state.repairCompareOriginal?.length) {
    const ok = await loadOriginalOverlayFromSibling();
    if (!ok) {
      state.repairCompareVisible = false;
      syncUi();
      ui.showOriginalBtn?.setAttribute(
        "title",
        "No matching original DXF found beside this fixed file.",
      );
      return;
    }
  }
  state.repairCompareVisible = true;
  syncUi();
  render();
}

async function openDesktopFileSet(fileSet, confirmFirst = true) {
  if (!fileSet?.files?.length) return;
  if (confirmFirst && !(await maybeSaveBeforeNavigate())) return;
  state.files = fileSet.files;
  state.fileIndex = Math.max(0, Math.min(fileSet.index ?? 0, state.files.length - 1));
  await loadCurrentFile();
}

async function refreshDxfFolderFiles() {
  const current = currentFile();
  if (!current?.path || !desktopApi?.listDxfFolder || state.dirty) return;
  const currentPath = current.path;
  const fileSet = await desktopApi.listDxfFolder(currentPath);
  if (!fileSet?.files?.length) return;
  state.files = fileSet.files;
  state.fileIndex = Math.max(0, fileSet.files.findIndex((file) => String(file.path).toLowerCase() === String(currentPath).toLowerCase()));
  if (state.fileIndex < 0) state.fileIndex = Math.max(0, fileSet.index ?? 0);
  syncUi();
}

async function updateReadOnly(lockState) {
  const current = currentFile();
  if (!lockState || !current?.path || lockState.path !== current.path) return;
  const wasReadOnly = state.readOnly;
  state.readOnly = !!lockState.readOnly;
  state.readOnlyReason = lockState.reason || null;
  if (wasReadOnly && !state.readOnly && !state.dirty && desktopApi) {
    const text = await desktopApi.readFile(current.path);
    loadDxfText(text, { preserveView: true });
    state.savedText = serializeDxf();
  }
  if (state.readOnly && state.dirty) {
    ui.hud.textContent = `${current.name} - read-only; discard unsaved changes before navigating`;
  }
  syncUi();
}

async function refreshReadOnlyFile(savedState) {
  const current = currentFile();
  if (!state.readOnly || state.dirty || !current?.path || savedState?.path !== current.path || !desktopApi) return;
  const text = await desktopApi.readFile(current.path);
  loadDxfText(text, { preserveView: true });
  state.savedText = serializeDxf();
  state.dirty = false;
  syncUi();
}

async function loadCurrentFile() {
  const current = currentFile();
  state.selectedEntityIds.clear();
  state.measure = [];
  state.measureDetails = [];
  state.measureEntityIds = [];
  state.hoverSnap = null;
  state.dirty = false;
  state.readOnly = false;
  state.readOnlyReason = null;
  state.savedText = "";
  state.undoStack = [];
  state.repairCompareVisible = false;
  state.repairCompareOriginal = null;
  state.repairCompareFixed = null;
  state.repairCompareDeviation = null;
  state.originalOverlaySourcePath = null;
  if (!current) {
    state.doc = null;
    if (desktopApi?.releaseFile) await desktopApi.releaseFile();
    rebuild();
    return;
  }
  if (current.path && desktopApi?.claimFile) {
    const lockState = await desktopApi.claimFile(current.path);
    await updateReadOnly(lockState);
  }
  const text = current.path && desktopApi ? await desktopApi.readFile(current.path) : await current.file.text();
  loadDxfText(text);
  state.savedText = serializeDxf();
  state.dirty = false;
  syncUi();
}

async function saveFile() {
  if (!state.doc || state.readOnly) return false;
  const text = serializeDxf();
  const current = currentFile();
  try {
    if (current?.path && desktopApi) {
      await desktopApi.writeFile(current.path, text);
    } else if (current?.handle?.createWritable) {
      const writable = await current.handle.createWritable();
      await writable.write(text);
      await writable.close();
      current.file = await current.handle.getFile();
    } else {
      await downloadText(text, current?.name || "edited.dxf");
    }
  } catch (error) {
    alert(`Could not save DXF: ${error.message || error}`);
    return false;
  }
  markDocumentSaved(text);
  return true;
}

function markDocumentSaved(text) {
  state.dirty = false;
  state.savedText = text;
  state.undoStack = [];
  for (const e of state.doc.entities) e.modified = false;
  syncUi();
}

async function saveFileAs() {
  if (!state.doc) return false;
  setSaveMenuOpen(false);
  const text = serializeDxf();
  const current = currentFile();
  try {
    if (current?.path && desktopApi?.saveAs) {
      const saved = await desktopApi.saveAs(current.path, text);
      if (!saved?.ok) return false;
      if (saved.files?.length) {
        state.files = saved.files;
        state.fileIndex = Math.max(0, Math.min(saved.index ?? 0, saved.files.length - 1));
      } else {
        state.files = [{ path: saved.path, name: saved.name }];
        state.fileIndex = 0;
      }
      state.readOnly = false;
      state.readOnlyReason = null;
    } else {
      const currentName = current?.name || "edited.dxf";
      const suggestedName = currentName.replace(/\.(?:dxf|dwg)$/i, "") + ".dxf";
      await downloadText(text, suggestedName);
    }
  } catch (error) {
    alert(`Could not save DXF copy: ${error.message || error}`);
    return false;
  }
  markDocumentSaved(text);
  return true;
}

async function discardChanges() {
  if (!state.doc || !state.dirty) return;
  const current = currentFile();
  const text = current?.path && desktopApi ? await desktopApi.readFile(current.path) : state.savedText;
  loadDxfText(text, { preserveView: true });
  state.savedText = serializeDxf();
  state.dirty = false;
  state.undoStack = [];
  syncUi();
}

function downloadText(text, filename) {
  const blob = new Blob([text], { type: "application/dxf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function maybeSaveBeforeNavigate() {
  if (!state.dirty) return true;
  const ok = confirm("Save changes before changing file? OK saves and continues. Cancel stays here.");
  if (!ok) return false;
  await saveFile();
  return !state.dirty;
}

async function goFile(delta) {
  if (!state.files.length) return;
  let next = state.fileIndex + delta;
  // Skip over files that are already open (claimed) in another window,
  // rather than loading them here read-only.
  while (next >= 0 && next < state.files.length) {
    const candidate = state.files[next];
    if (!desktopApi?.isFileOpenElsewhere) break;
    if (!(await desktopApi.isFileOpenElsewhere(candidate.path))) break;
    next += delta;
  }
  if (next < 0 || next >= state.files.length) return;
  if (!(await maybeSaveBeforeNavigate())) return;
  state.fileIndex = next;
  await loadCurrentFile();
}

function selectFromPoint(screenPoint, toggle) {
  const hit = hitTest(screenPoint);
  if (!hit) {
    if (!toggle) clearSelection();
    return;
  }
  const feature = featureByEntity(hit.entity);
  if (shouldSelectFeatureForEntity(hit.entity)) {
    if (toggle) toggleFeatureSelection(feature.id);
    else selectFeature(feature.id);
  } else if (toggle) {
    toggleEntitySelection(hit.entity.id);
  } else {
    selectEntity(hit.entity.id);
  }
}

function selectEntitiesInRect(rect, additive = false) {
  if (!state.doc) return;
  if (!additive) clearSelection({ renderNow: false });
  const selectedFeatureIds = new Set();
  for (const e of state.doc.entities) {
    if (!e.supported || e.deleted) continue;
    if (!rectsIntersect(rect, entityScreenBounds(e))) continue;
    const feature = featureByEntity(e);
    if (shouldSelectFeatureForEntity(e)) {
      selectedFeatureIds.add(feature.id);
    } else {
      state.selectedEntityIds.add(e.id);
    }
  }
  for (const id of selectedFeatureIds) state.selectedFeatureIds.add(id);
  syncUi();
  render();
}

function entityScreenBounds(e) {
  const box = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
  for (const p of entityReferencePoints(e)) {
    const s = worldToScreen(p);
    box.x1 = Math.min(box.x1, s.x);
    box.y1 = Math.min(box.y1, s.y);
    box.x2 = Math.max(box.x2, s.x);
    box.y2 = Math.max(box.y2, s.y);
  }
  if (!Number.isFinite(box.x1)) return { x1: 0, y1: 0, x2: 0, y2: 0 };
  return box;
}

function normalizedScreenRect(a, b) {
  return {
    x1: Math.min(a.x, b.x),
    y1: Math.min(a.y, b.y),
    x2: Math.max(a.x, b.x),
    y2: Math.max(a.y, b.y),
  };
}

function rectsIntersect(a, b) {
  return a.x1 <= b.x2 && a.x2 >= b.x1 && a.y1 <= b.y2 && a.y2 >= b.y1;
}

function pointerPos(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function scheduleHoverSnap(point) {
  pendingHoverPoint = point;
  if (hoverFramePending) return;
  hoverFramePending = true;
  requestAnimationFrame(() => {
    hoverFramePending = false;
    const currentPoint = pendingHoverPoint;
    pendingHoverPoint = null;
    state.hoverSnap = currentPoint ? nearestSnap(currentPoint) : null;
    if (state.hoverSnap) {
      ui.snapBadge.style.display = "block";
      ui.snapBadge.textContent = `${state.hoverSnap.label}: ${fmt(state.hoverSnap.point.x)}, ${fmt(state.hoverSnap.point.y)}`;
    } else {
      ui.snapBadge.style.display = "none";
    }
    render();
  });
}

canvas.addEventListener("mousemove", (event) => {
  const p = pointerPos(event);
  state.mouse = p;
  if (state.panning && state.panLast) {
    state.view.ox += p.x - state.panLast.x;
    state.view.oy += p.y - state.panLast.y;
    state.panLast = p;
    render();
    return;
  }
  if (state.selectionBox) {
    state.selectionBox.current = p;
    render();
    return;
  }
  scheduleHoverSnap(p);
});

canvas.addEventListener("mousedown", (event) => {
  if (event.button === 1 || event.button === 2) {
    state.panning = true;
    state.panLast = pointerPos(event);
    event.preventDefault();
  } else if (event.button === 0 && state.mode === "select" && state.doc) {
    const p = pointerPos(event);
    state.selectionBox = {
      start: p,
      current: p,
      additive: event.shiftKey,
    };
  }
});

canvas.addEventListener("mouseup", (event) => {
  if (state.selectionBox && event.button === 0) {
    const start = state.selectionBox.start;
    const end = pointerPos(event);
    const moved = Math.hypot(end.x - start.x, end.y - start.y) > 4;
    const additive = state.selectionBox.additive;
    state.selectionBox = null;
    if (moved) {
      selectEntitiesInRect(normalizedScreenRect(start, end), additive);
    } else {
      selectFromPoint(end, event.ctrlKey || event.metaKey);
    }
    return;
  }
  state.panning = false;
  state.panLast = null;
});

canvas.addEventListener("mouseleave", () => {
  state.panning = false;
  state.panLast = null;
  state.selectionBox = null;
  render();
});

canvas.addEventListener("contextmenu", (event) => event.preventDefault());

canvas.addEventListener("click", (event) => {
  if (!state.doc || event.button !== 0) return;
  const p = pointerPos(event);
  if (state.mode === "measure") {
    const snap = nearestSnap(p);
    const world = snap ? snap.point : screenToWorld(p);
    if (state.measure.length >= 2) {
      state.measure = [];
      state.measureDetails = [];
      state.measureEntityIds = [];
    }
    const hit = hitTest(p);
    const rawEntity = snap?.entity || hit?.entity || null;
    state.measure.push(world);
    state.measureDetails.push(rawEntity ? measureEntityInfo(rawEntity, snap) : null);
    state.measureEntityIds.push(rawEntity?.id ?? null);
    syncUi();
    render();
    return;
  }
});

canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  const p = pointerPos(event);
  const before = screenToWorld(p);
  const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
  state.view.scale = Math.max(0.00001, Math.min(100000, state.view.scale * factor));
  const after = worldToScreen(before);
  state.view.ox += p.x - after.x;
  state.view.oy += p.y - after.y;
  render();
}, { passive: false });

ui.saveBtn.addEventListener("click", saveFile);
if (ui.saveMenuBtn) {
  ui.saveMenuBtn.addEventListener("click", () => {
    setSaveMenuOpen(ui.saveMenu?.hidden);
  });
}
if (ui.saveAsBtn) ui.saveAsBtn.addEventListener("click", saveFileAs);
if (ui.saveSplit) {
  document.addEventListener("pointerdown", (event) => {
    if (!ui.saveSplit.contains(event.target)) setSaveMenuOpen(false);
  });
}
ui.discardBtn.addEventListener("click", discardChanges);
if (ui.mirrorBtn) ui.mirrorBtn.addEventListener("click", mirrorCurrentDxf);
if (ui.scaleBtn) ui.scaleBtn.addEventListener("click", scaleCurrentDxf);
if (ui.rotateBtn) ui.rotateBtn.addEventListener("click", rotateCurrentDrawing);
ui.fitBtn.addEventListener("click", fitView);
ui.dissolveBtn.addEventListener("click", dissolveSelection);
ui.rebuildBtn.addEventListener("click", rebuildRecognizedFeatures);
if (ui.fixOuterContourBtn) ui.fixOuterContourBtn.addEventListener("click", runAutomaticOuterContourRepair);
if (ui.removeChamferFilletBtn) ui.removeChamferFilletBtn.addEventListener("click", removeChamfersAndFillets);
if (ui.showOriginalBtn) ui.showOriginalBtn.addEventListener("click", toggleOriginalOverlay);
ui.prevBtn.addEventListener("click", () => goFile(-1));
ui.nextBtn.addEventListener("click", () => goFile(1));

document.querySelectorAll(".mode").forEach((button) => {
  button.addEventListener("click", () => {
    if (state.mode === button.dataset.mode) return;
    state.mode = button.dataset.mode;
    state.selectedEntityIds.clear();
    state.selectedFeatureIds.clear();
    state.selectionBox = null;
    clearMeasure();
    syncUi();
    render();
  });
});

window.addEventListener("keydown", (event) => {
  const isEditingInput = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
  if (event.ctrlKey && event.key.toLowerCase() === "z" && !isEditingInput) {
    event.preventDefault();
    undoLastChange();
  }
  if (event.key === "Delete" && !isEditingInput) deleteSelection();
  if (event.key.toLowerCase() === "f") fitView();
  if (event.key === "Escape") {
    if (ui.saveMenu && !ui.saveMenu.hidden) {
      setSaveMenuOpen(false);
      ui.saveMenuBtn?.focus();
      return;
    }
    if (state.mode === "measure" && state.measure.length) {
      clearMeasure();
      syncUi();
      render();
    } else {
      clearSelection();
    }
  }
});

window.addEventListener("resize", resizeCanvas);
window.addEventListener("focus", () => {
  refreshDxfFolderFiles().catch(() => {});
});
window.addEventListener("beforeunload", () => geometryWorker.dispose(), { once: true });

function dirnameOf(filePath) {
  const source = String(filePath || "");
  const slash = Math.max(source.lastIndexOf("\\"), source.lastIndexOf("/"));
  return slash >= 0 ? source.slice(0, slash) : "";
}

// Dropping a .dxf or .dwg onto this window: if it's from the same folder this window
// already shows, just navigate here (each window's prev/next is scoped to one
// folder, so a same-folder file belongs in this window's list). Otherwise
// hand off to the main process, which focuses an existing window for that
// file if one's already open, or opens a new one for its (different) folder.
document.addEventListener("dragover", (event) => {
  event.preventDefault();
});
document.addEventListener("drop", async (event) => {
  event.preventDefault();
  if (!desktopApi?.getPathForFile) return;
  const droppedPaths = (await Promise.all([...(event.dataTransfer?.files || [])]
    .map(async (file) => { try { return await desktopApi.getPathForFile(file); } catch { return null; } })))
    .filter((p) => p && /\.(?:dxf|dwg)$/i.test(p));
  if (!droppedPaths.length) return;
  const target = droppedPaths[0];
  const currentPath = currentFile()?.path;
  const sameFolder = currentPath && dirnameOf(target).toLowerCase() === dirnameOf(currentPath).toLowerCase();
  if (sameFolder) {
    if (!(await maybeSaveBeforeNavigate())) return;
    const fileSet = await desktopApi.listDxfFolder(target);
    if (fileSet?.files?.length) {
      state.files = fileSet.files;
      state.fileIndex = Math.max(0, fileSet.index ?? 0);
      await loadCurrentFile();
    }
  } else if (desktopApi?.openFileInWindow) {
    await desktopApi.openFileInWindow(target);
  }
});

resizeCanvas();
syncUi();
initDesktopBridge();
renderAppVersion();

async function renderAppVersion() {
  if (!ui.appVersion || !desktopApi?.getAppVersion) return;
  try {
    const version = await desktopApi.getAppVersion();
    ui.appVersion.textContent = version ? `v${version}` : "";
  } catch {
    ui.appVersion.textContent = "";
  }
}

async function initDesktopBridge() {
  if (!desktopApi) return;
  const initialFileSet = await desktopApi.getInitialFileSet();
  if (initialFileSet?.files?.length) await openDesktopFileSet(initialFileSet, false);
  desktopApi.onFileState(updateReadOnly);
  desktopApi.onFileSaved(refreshReadOnlyFile);
}

function simplifyComparePaths(paths, maxPaths = 2500) {
  if (paths.length <= maxPaths) return paths;
  const step = Math.ceil(paths.length / maxPaths);
  return paths.filter((_, index) => index % step === 0);
}

function simplifyComparePoints(points, maxPoints = 4000) {
  if (points.length <= maxPoints) return points;
  const step = Math.ceil(points.length / maxPoints);
  return points.filter((_, index) => index % step === 0);
}

async function runOutlineRepairTest(dxfText, options = {}) {
  loadDxfText(dxfText, { preserveView: true });
  const analysis = analyseOuterContourRepair();
  if (!analysis?.outerInfo) throw new Error("Could not analyse outer contour.");
  const defaults = automaticOuterRepairOptions(analysis);
  const merged = {
    ...defaults,
    rebuildLinesAndArcs: options.rebuildLinesAndArcs ?? false,
    repairMethod: options.repairMethod || (options.rebuildLinesAndArcs ? "arcLine" : "hd"),
    ...options,
  };
  const computed = merged.repairMethod === "arcLine"
    ? computeArcLineOuterContourRepairResult(merged)
    : computeOuterContourRepairResult({ ...merged, rebuildLinesAndArcs: false });
  if (!computed) throw new Error("Repair did not produce a contour.");
  return {
    defaults: merged,
    accepted: computed.accepted,
    deviation: computed.deviation,
    mode: computed.mode,
    repairMethod: computed.repairMethod || merged.repairMethod || "hd",
    contourSmoothingMm: computed.contourSmoothingMm,
    smoothingMm: computed.lineArcSmoothingMm,
    lineArcAccepted: merged.repairMethod === "arcLine"
      ? !!computed.lineArcResult?.points?.length && computed.accepted
      : !!computed.lineArcResult?.accepted,
    lineArcSegments: computed.lineArcResult?.segments || 0,
    lineArcMaxDeviationMm: computed.lineArcResult?.maxDeviation,
    points: computed.outputContour.length,
    densePoints: computed.contour.length,
    originalPaths: simplifyComparePaths(
      collectOuterBoundaryPaths(computed.sourceInfos, computed.analysis, computed.contourSmoothingMm),
    ),
    repairedPoints: simplifyComparePoints(computed.outputContour),
    outlineAcceptanceMm: OUTLINE_ACCEPTANCE_MM,
  };
}

window.runOutlineRepairTest = runOutlineRepairTest;
window.OUTLINE_ACCEPTANCE_MM = OUTLINE_ACCEPTANCE_MM;

if (ui.outerRepairCompareToggle) {
  ui.outerRepairCompareToggle.addEventListener("change", () => {
    state.repairCompareVisible = !!ui.outerRepairCompareToggle.checked;
    render();
  });
}
