const TAU = Math.PI * 2;
const ANGLE_EPSILON = 1e-9;

export function normalizeDegreesExact(value) {
  let degrees = Number(value) || 0;
  degrees %= 360;
  if (degrees < 0) degrees += 360;
  return degrees;
}

export function counterClockwiseSweepDegrees(start, end) {
  let sweep = normalizeDegreesExact(end) - normalizeDegreesExact(start);
  while (sweep < 0) sweep += 360;
  while (sweep > 360) sweep -= 360;
  return sweep;
}

export function angleOnCounterClockwiseArcDegrees(angle, start, end, epsilon = ANGLE_EPSILON) {
  const sweep = counterClockwiseSweepDegrees(start, end);
  let relative = normalizeDegreesExact(angle) - normalizeDegreesExact(start);
  while (relative < 0) relative += 360;
  while (relative > 360) relative -= 360;
  return relative <= sweep + epsilon;
}

export function angleOnSignedSweepRadians(angle, start, sweep, epsilon = ANGLE_EPSILON) {
  let relative = angle - start;
  if (sweep >= 0) {
    while (relative < 0) relative += TAU;
    while (relative > TAU) relative -= TAU;
    return relative <= sweep + epsilon;
  }
  while (relative > 0) relative -= TAU;
  while (relative < -TAU) relative += TAU;
  return relative >= sweep - epsilon;
}

export function arcExtremaPoints(arc) {
  const points = [
    pointOnCircle(arc.cx, arc.cy, arc.r, degreesToRadians(arc.a1)),
    pointOnCircle(arc.cx, arc.cy, arc.r, degreesToRadians(arc.a2)),
  ];
  for (const angle of [0, 90, 180, 270]) {
    if (angleOnCounterClockwiseArcDegrees(angle, arc.a1, arc.a2)) {
      points.push(pointOnCircle(arc.cx, arc.cy, arc.r, degreesToRadians(angle)));
    }
  }
  return deduplicatePoints(points);
}

export function arcQuadrantPoints(arc) {
  const points = [];
  for (const angle of [0, 90, 180, 270]) {
    if (angleOnCounterClockwiseArcDegrees(angle, arc.a1, arc.a2)) {
      points.push(pointOnCircle(arc.cx, arc.cy, arc.r, degreesToRadians(angle)));
    }
  }
  return deduplicatePoints(points);
}

export function circleQuadrantPoints(circle) {
  return [0, 90, 180, 270].map((angle) => (
    pointOnCircle(circle.cx, circle.cy, circle.r, degreesToRadians(angle))
  ));
}

export function bulgeArcGeometry(a, b, bulge) {
  const numericBulge = Number(bulge) || 0;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const chord = Math.hypot(dx, dy);
  if (chord <= 0 || Math.abs(numericBulge) <= Number.EPSILON) return null;
  const midpointX = (a.x + b.x) / 2;
  const midpointY = (a.y + b.y) / 2;
  const centerOffset = (chord * (1 - numericBulge * numericBulge)) / (4 * numericBulge);
  const normalX = -dy / chord;
  const normalY = dx / chord;
  const cx = midpointX + normalX * centerOffset;
  const cy = midpointY + normalY * centerOffset;
  return {
    cx,
    cy,
    r: Math.hypot(a.x - cx, a.y - cy),
    start: Math.atan2(a.y - cy, a.x - cx),
    sweep: 4 * Math.atan(numericBulge),
  };
}

export function bulgeArcExtremaPoints(a, b, bulge) {
  const arc = bulgeArcGeometry(a, b, bulge);
  if (!arc) return [a, b];
  const points = [a, b];
  for (const angle of [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2]) {
    if (angleOnSignedSweepRadians(angle, arc.start, arc.sweep)) {
      points.push(pointOnCircle(arc.cx, arc.cy, arc.r, angle));
    }
  }
  return deduplicatePoints(points);
}

export function signedArcQuadrantPoints(arc) {
  const points = [];
  for (const angle of [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2]) {
    if (angleOnSignedSweepRadians(angle, arc.start, arc.sweep)) {
      points.push(pointOnCircle(arc.cx, arc.cy, arc.r, angle));
    }
  }
  return deduplicatePoints(points);
}

export function tangentPointsToCircle(reference, circle) {
  const dx = reference.x - circle.cx;
  const dy = reference.y - circle.cy;
  const distance = Math.hypot(dx, dy);
  const radius = Math.abs(Number(circle.r) || 0);
  if (radius <= 0 || distance <= radius + ANGLE_EPSILON) return [];
  const baseAngle = Math.atan2(dy, dx);
  const tangentOffset = Math.acos(Math.min(1, radius / distance));
  return deduplicatePoints([
    pointOnCircle(circle.cx, circle.cy, radius, baseAngle + tangentOffset),
    pointOnCircle(circle.cx, circle.cy, radius, baseAngle - tangentOffset),
  ]);
}

export function axisOffsetDimensions(width, height, deltaX, deltaY) {
  const numericWidth = Number(width);
  const numericHeight = Number(height);
  const numericDeltaX = Number(deltaX);
  const numericDeltaY = Number(deltaY);
  if (
    !Number.isFinite(numericWidth)
    || !Number.isFinite(numericHeight)
    || !Number.isFinite(numericDeltaX)
    || !Number.isFinite(numericDeltaY)
  ) {
    return null;
  }
  const targetWidth = numericWidth + 2 * numericDeltaX;
  const targetHeight = numericHeight + 2 * numericDeltaY;
  return {
    targetWidth,
    targetHeight,
    scaleX: numericWidth > 1e-9 ? targetWidth / numericWidth : 1,
    scaleY: numericHeight > 1e-9 ? targetHeight / numericHeight : 1,
  };
}

export function scalePointByAxes(point, center, scaleX, scaleY) {
  return {
    x: center.x + (point.x - center.x) * scaleX,
    y: center.y + (point.y - center.y) * scaleY,
  };
}

export function pointAngleDegrees(center, point) {
  return normalizeDegreesExact((Math.atan2(point.y - center.cy, point.x - center.cx) * 180) / Math.PI);
}

export function pointAngleRadians(center, point) {
  return Math.atan2(point.y - center.cy, point.x - center.cx);
}

function degreesToRadians(value) {
  return (Number(value) * Math.PI) / 180;
}

function pointOnCircle(cx, cy, radius, angle) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function deduplicatePoints(points) {
  const unique = [];
  for (const point of points) {
    if (!unique.some((candidate) => (
      Math.abs(candidate.x - point.x) <= 1e-9
      && Math.abs(candidate.y - point.y) <= 1e-9
    ))) {
      unique.push(point);
    }
  }
  return unique;
}
