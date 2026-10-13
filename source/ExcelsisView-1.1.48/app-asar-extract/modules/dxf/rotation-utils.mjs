const STRAIGHT_BULGE_TOLERANCE = 1e-8;

export function normalizedAxisAngleDegrees(value) {
  const angle = Number(value);
  if (!Number.isFinite(angle)) return NaN;
  return ((angle + 90) % 180 + 180) % 180 - 90;
}

export function rotationDegreesToAlignXAxis(reference) {
  const dx = Number(reference?.end?.x) - Number(reference?.start?.x);
  const dy = Number(reference?.end?.y) - Number(reference?.start?.y);
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || Math.hypot(dx, dy) <= 1e-12) {
    return NaN;
  }
  const lineAngle = Math.atan2(dy, dx) * 180 / Math.PI;
  return -normalizedAxisAngleDegrees(lineAngle);
}

export function clockwiseInputToDxfDegrees(value) {
  const clockwise = Number(value);
  if (!Number.isFinite(clockwise)) return NaN;
  return -clockwise;
}

export function lineReferencesForEntity(entity) {
  if (!entity || entity.deleted) return [];
  if (entity.type === "LINE") {
    return [{
      entity,
      start: { x: entity.x1, y: entity.y1 },
      end: { x: entity.x2, y: entity.y2 },
      segmentIndex: 0,
    }];
  }
  if (entity.type !== "LWPOLYLINE" || !Array.isArray(entity.points) || entity.points.length < 2) {
    return [];
  }

  const references = [];
  const segmentCount = entity.closed ? entity.points.length : entity.points.length - 1;
  for (let index = 0; index < segmentCount; index += 1) {
    const start = entity.points[index];
    const end = entity.points[(index + 1) % entity.points.length];
    if (Math.abs(Number(start?.bulge) || 0) > STRAIGHT_BULGE_TOLERANCE) continue;
    if (![start?.x, start?.y, end?.x, end?.y].every(Number.isFinite)) continue;
    if (Math.hypot(end.x - start.x, end.y - start.y) <= 1e-12) continue;
    references.push({ entity, start, end, segmentIndex: index });
  }
  return references;
}
