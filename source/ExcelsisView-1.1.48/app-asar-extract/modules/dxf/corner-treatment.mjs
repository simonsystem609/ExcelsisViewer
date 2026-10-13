const DEFAULT_ENDPOINT_TOLERANCE = 0.05;
const GEOMETRY_EPSILON = 1e-10;
const MIN_CORNER_ANGLE_RADIANS = 1e-5;

function finitePoint(point, label) {
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
    throw new Error(`${label} is not a finite 2D point.`);
  }
  return { x: Number(point.x), y: Number(point.y) };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function cross(a, b) {
  return a.x * b.y - a.y * b.x;
}

function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

function addScaled(origin, direction, amount) {
  return {
    x: origin.x + direction.x * amount,
    y: origin.y + direction.y * amount,
  };
}

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

function normalizedDegrees(radians) {
  const degrees = radians * 180 / Math.PI;
  return ((degrees % 360) + 360) % 360;
}

function signedShortestSweep(startRadians, endRadians) {
  let sweep = (endRadians - startRadians) % (Math.PI * 2);
  if (sweep <= -Math.PI) sweep += Math.PI * 2;
  if (sweep > Math.PI) sweep -= Math.PI * 2;
  return sweep;
}

function lineEndpoints(line, label) {
  if (line?.type !== "LINE") throw new Error(`${label} must be a LINE entity.`);
  return [
    finitePoint({ x: line.x1, y: line.y1 }, `${label} start`),
    finitePoint({ x: line.x2, y: line.y2 }, `${label} end`),
  ];
}

function cornerProfile(corner, farA, farB) {
  const vectorA = subtract(farA, corner);
  const vectorB = subtract(farB, corner);
  const lengthA = Math.hypot(vectorA.x, vectorA.y);
  const lengthB = Math.hypot(vectorB.x, vectorB.y);
  if (!(lengthA > GEOMETRY_EPSILON) || !(lengthB > GEOMETRY_EPSILON)) {
    throw new Error("The selected corner has a zero-length adjacent edge.");
  }

  const directionA = { x: vectorA.x / lengthA, y: vectorA.y / lengthA };
  const directionB = { x: vectorB.x / lengthB, y: vectorB.y / lengthB };
  const cosine = clamp(directionA.x * directionB.x + directionA.y * directionB.y, -1, 1);
  const angleRadians = Math.acos(cosine);
  if (
    angleRadians <= MIN_CORNER_ANGLE_RADIANS
    || Math.PI - angleRadians <= MIN_CORNER_ANGLE_RADIANS
  ) {
    throw new Error("The adjacent edges are collinear or too close to a straight line.");
  }

  const minEdgeLength = Math.min(lengthA, lengthB);
  return {
    corner,
    farA,
    farB,
    directionA,
    directionB,
    lengthA,
    lengthB,
    minEdgeLength,
    angleRadians,
    maxChamferSize: minEdgeLength,
    maxFilletRadius: minEdgeLength * Math.tan(angleRadians / 2),
  };
}

function treatmentGeometry(target, kind, requestedSize) {
  const size = Number(requestedSize);
  if (kind !== "chamfer" && kind !== "fillet") {
    throw new Error("Corner treatment must be either chamfer or fillet.");
  }
  if (!(Number.isFinite(size) && size > 0)) {
    throw new Error(`${kind === "fillet" ? "Fillet radius" : "Chamfer size"} must be a positive number.`);
  }

  const setback = kind === "fillet" ? size / Math.tan(target.angleRadians / 2) : size;
  const remainingMargin = Math.max(1e-8, target.minEdgeLength * 1e-8);
  if (!(setback < target.minEdgeLength - remainingMargin)) {
    const maximum = kind === "fillet" ? target.maxFilletRadius : target.maxChamferSize;
    throw new Error(
      `${kind === "fillet" ? "Fillet radius" : "Chamfer size"} is too large for the adjacent edges. `
      + `Use a value below ${maximum.toFixed(6).replace(/\.?0+$/, "")} mm.`,
    );
  }

  const tangentA = addScaled(target.corner, target.directionA, setback);
  const tangentB = addScaled(target.corner, target.directionB, setback);
  if (kind === "chamfer") {
    return {
      kind,
      size,
      setback,
      tangentA,
      tangentB,
      connector: {
        type: "LINE",
        x1: tangentA.x,
        y1: tangentA.y,
        x2: tangentB.x,
        y2: tangentB.y,
      },
      pathBulge: 0,
    };
  }

  const halfAngle = target.angleRadians / 2;
  const bisectorRaw = {
    x: target.directionA.x + target.directionB.x,
    y: target.directionA.y + target.directionB.y,
  };
  const bisectorLength = Math.hypot(bisectorRaw.x, bisectorRaw.y);
  if (!(bisectorLength > GEOMETRY_EPSILON)) {
    throw new Error("A fillet cannot be constructed on a straight corner.");
  }
  const centerDistance = size / Math.sin(halfAngle);
  const center = addScaled(target.corner, {
    x: bisectorRaw.x / bisectorLength,
    y: bisectorRaw.y / bisectorLength,
  }, centerDistance);
  const startRadians = Math.atan2(tangentA.y - center.y, tangentA.x - center.x);
  const endRadians = Math.atan2(tangentB.y - center.y, tangentB.x - center.x);
  const pathSweep = signedShortestSweep(startRadians, endRadians);
  const angleA = normalizedDegrees(startRadians);
  const angleB = normalizedDegrees(endRadians);
  const ccwAtoB = ((angleB - angleA) % 360 + 360) % 360;
  const a1 = ccwAtoB <= 180 ? angleA : angleB;
  const a2 = ccwAtoB <= 180 ? angleB : angleA;

  return {
    kind,
    size,
    setback,
    tangentA,
    tangentB,
    center,
    pathSweep,
    pathBulge: Math.tan(pathSweep / 4),
    connector: {
      type: "ARC",
      cx: center.x,
      cy: center.y,
      r: size,
      a1,
      a2,
    },
  };
}

export function linePairCornerTarget(lineA, lineB, {
  endpointTolerance = DEFAULT_ENDPOINT_TOLERANCE,
} = {}) {
  if (lineA === lineB || (lineA?.id != null && lineA.id === lineB?.id)) {
    throw new Error("Select two different LINE entities.");
  }
  if (!(Number.isFinite(endpointTolerance) && endpointTolerance >= 0)) {
    throw new Error("Endpoint tolerance must be a non-negative number.");
  }

  const endpointsA = lineEndpoints(lineA, "First entity");
  const endpointsB = lineEndpoints(lineB, "Second entity");
  const vectorA = subtract(endpointsA[1], endpointsA[0]);
  const vectorB = subtract(endpointsB[1], endpointsB[0]);
  const lengthA = Math.hypot(vectorA.x, vectorA.y);
  const lengthB = Math.hypot(vectorB.x, vectorB.y);
  if (!(lengthA > GEOMETRY_EPSILON) || !(lengthB > GEOMETRY_EPSILON)) {
    throw new Error("Both selected lines must have a non-zero length.");
  }
  const denominator = cross(vectorA, vectorB);
  if (Math.abs(denominator) <= GEOMETRY_EPSILON * lengthA * lengthB) {
    throw new Error("The selected lines are parallel or collinear.");
  }

  const betweenStarts = subtract(endpointsB[0], endpointsA[0]);
  const t = cross(betweenStarts, vectorB) / denominator;
  const corner = addScaled(endpointsA[0], vectorA, t);
  const nearestAIndex = distance(corner, endpointsA[0]) <= distance(corner, endpointsA[1]) ? 0 : 1;
  const nearestBIndex = distance(corner, endpointsB[0]) <= distance(corner, endpointsB[1]) ? 0 : 1;
  const endpointDistanceA = distance(corner, endpointsA[nearestAIndex]);
  const endpointDistanceB = distance(corner, endpointsB[nearestBIndex]);
  if (endpointDistanceA > endpointTolerance || endpointDistanceB > endpointTolerance) {
    throw new Error(
      "The two selected lines must meet at, or very near, one endpoint each. "
      + "Pick the shared vertex if the intended corner is ambiguous.",
    );
  }

  const farA = endpointsA[1 - nearestAIndex];
  const farB = endpointsB[1 - nearestBIndex];
  return {
    type: "line-pair",
    ...cornerProfile(corner, farA, farB),
    lineAId: lineA.id,
    lineBId: lineB.id,
    lineAEndpoint: nearestAIndex === 0 ? "start" : "end",
    lineBEndpoint: nearestBIndex === 0 ? "start" : "end",
    endpointDistanceA,
    endpointDistanceB,
  };
}

function applyLineEndpoint(line, endpoint, point) {
  const update = {
    id: line.id,
    x1: Number(line.x1),
    y1: Number(line.y1),
    x2: Number(line.x2),
    y2: Number(line.y2),
  };
  if (endpoint === "start") {
    update.x1 = point.x;
    update.y1 = point.y;
  } else {
    update.x2 = point.x;
    update.y2 = point.y;
  }
  return update;
}

export function planLinePairTreatment(lineA, lineB, {
  kind,
  size,
  endpointTolerance = DEFAULT_ENDPOINT_TOLERANCE,
} = {}) {
  const target = linePairCornerTarget(lineA, lineB, { endpointTolerance });
  const geometry = treatmentGeometry(target, kind, size);
  return {
    ...target,
    ...geometry,
    lineUpdates: [
      applyLineEndpoint(lineA, target.lineAEndpoint, geometry.tangentA),
      applyLineEndpoint(lineB, target.lineBEndpoint, geometry.tangentB),
    ],
  };
}

export function polylineCornerTarget(polyline, requestedVertexIndex, {
  bulgeTolerance = 1e-8,
} = {}) {
  if (polyline?.type !== "LWPOLYLINE") {
    throw new Error("A single-vertex corner must belong to a LWPOLYLINE entity.");
  }
  const points = Array.isArray(polyline.points) ? polyline.points : [];
  const vertexIndex = Number(requestedVertexIndex);
  if (!Number.isInteger(vertexIndex) || vertexIndex < 0 || vertexIndex >= points.length) {
    throw new Error("The selected polyline vertex does not exist.");
  }
  if (points.length < 3) throw new Error("The polyline needs at least three vertices.");
  if (!polyline.closed && (vertexIndex === 0 || vertexIndex === points.length - 1)) {
    throw new Error("Choose an internal vertex with an edge on both sides.");
  }

  const previousIndex = (vertexIndex - 1 + points.length) % points.length;
  const nextIndex = (vertexIndex + 1) % points.length;
  const previous = finitePoint(points[previousIndex], "Previous polyline vertex");
  const corner = finitePoint(points[vertexIndex], "Selected polyline vertex");
  const next = finitePoint(points[nextIndex], "Next polyline vertex");
  const incomingBulge = Number(points[previousIndex]?.bulge) || 0;
  const outgoingBulge = Number(points[vertexIndex]?.bulge) || 0;
  if (Math.abs(incomingBulge) > bulgeTolerance || Math.abs(outgoingBulge) > bulgeTolerance) {
    throw new Error("The two edges beside the selected vertex must be straight; arc-adjacent vertices are not supported.");
  }

  return {
    type: "polyline-vertex",
    ...cornerProfile(corner, previous, next),
    entityId: polyline.id,
    vertexIndex,
    previousIndex,
    nextIndex,
    closed: !!polyline.closed,
  };
}

export function planPolylineCornerTreatment(polyline, vertexIndex, {
  kind,
  size,
  bulgeTolerance = 1e-8,
} = {}) {
  const target = polylineCornerTarget(polyline, vertexIndex, { bulgeTolerance });
  const geometry = treatmentGeometry(target, kind, size);
  const original = polyline.points[target.vertexIndex];
  const tangentA = { ...original, x: geometry.tangentA.x, y: geometry.tangentA.y };
  const tangentB = { ...original, x: geometry.tangentB.x, y: geometry.tangentB.y };
  tangentA.bulge = kind === "fillet" ? geometry.pathBulge : 0;
  tangentB.bulge = 0;
  const points = polyline.points.map((point) => ({ ...point }));
  points.splice(target.vertexIndex, 1, tangentA, tangentB);
  return {
    ...target,
    ...geometry,
    points,
  };
}

export function cornerTreatmentLimit(target, kind) {
  if (!target) return NaN;
  return kind === "fillet" ? target.maxFilletRadius : target.maxChamferSize;
}

