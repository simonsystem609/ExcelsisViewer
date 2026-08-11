import assert from "node:assert/strict";
import {
  DXF_CANVAS_BACKGROUND,
  DXF_ORIGIN_COLOR,
  coordinateSystemLayout,
  drawDxfCoordinateSystem,
  drawDxfOriginMarker,
  originMarkerMetrics,
} from "../modules/dxf/coordinate-overlays.mjs";

const fitted = originMarkerMetrics(2, 2);
const zoomedIn = originMarkerMetrics(8, 2);
assert(zoomedIn.outerRadius < fitted.outerRadius, "origin marker must shrink when the user zooms in");
assert.equal(
  round(zoomedIn.dotRadius / zoomedIn.outerRadius),
  round(fitted.dotRadius / fitted.outerRadius),
  "origin dot and ring must retain their proportions",
);
assert.equal(
  round(zoomedIn.ringWidth / zoomedIn.outerRadius),
  round(fitted.ringWidth / fitted.outerRadius),
  "origin ring width must retain its proportion",
);

const layout = coordinateSystemLayout(904, 696);
assert.deepEqual(layout.anchor, { x: 32, y: 614 });
assert(
  layout.backing.y + layout.backing.height <= 628,
  "lower-left coordinate system must leave room above the bottom snap badge",
);

const originContext = mockCanvasContext();
assert.equal(
  drawDxfOriginMarker(originContext, { x: 450, y: 300 }, {
    width: 904,
    height: 696,
    viewScale: 2,
    fitScale: 2,
  }),
  true,
);
const originArcs = originContext.operations.filter((operation) => operation.name === "arc");
assert.equal(originArcs.length, 3, "origin marker must contain a black gap, outer ring, and center dot");
assert(originContext.operations.some((operation) => operation.name === "fill" && operation.fillStyle === DXF_CANVAS_BACKGROUND));
assert(originContext.operations.some((operation) => operation.name === "stroke" && operation.strokeStyle === DXF_ORIGIN_COLOR));
assert(originContext.operations.some((operation) => operation.name === "fill" && operation.fillStyle === DXF_ORIGIN_COLOR));

const offscreenContext = mockCanvasContext();
assert.equal(
  drawDxfOriginMarker(offscreenContext, { x: 1200, y: 300 }, {
    width: 904,
    height: 696,
    viewScale: 2,
    fitScale: 2,
  }),
  false,
);
assert.equal(offscreenContext.operations.length, 0);

const axisContext = mockCanvasContext();
drawDxfCoordinateSystem(axisContext, 904, 696);
assert.deepEqual(
  axisContext.operations.filter((operation) => operation.name === "fillText").map((operation) => operation.text),
  ["X", "Y"],
);

console.log("DXF origin marker and coordinate-system overlay tests passed.");

function mockCanvasContext() {
  const operations = [];
  const context = {
    operations,
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    lineCap: "butt",
    font: "",
    textAlign: "",
    textBaseline: "",
    save: () => operations.push({ name: "save" }),
    restore: () => operations.push({ name: "restore" }),
    beginPath: () => operations.push({ name: "beginPath" }),
    closePath: () => operations.push({ name: "closePath" }),
    moveTo: (x, y) => operations.push({ name: "moveTo", x, y }),
    lineTo: (x, y) => operations.push({ name: "lineTo", x, y }),
    quadraticCurveTo: (...values) => operations.push({ name: "quadraticCurveTo", values }),
    arc: (x, y, radius) => operations.push({ name: "arc", x, y, radius }),
    fill: () => operations.push({ name: "fill", fillStyle: context.fillStyle }),
    stroke: () => operations.push({
      name: "stroke",
      strokeStyle: context.strokeStyle,
      lineWidth: context.lineWidth,
    }),
    fillText: (text, x, y) => operations.push({ name: "fillText", text, x, y, fillStyle: context.fillStyle }),
  };
  return context;
}

function round(value) {
  return Math.round(value * 1e9) / 1e9;
}
