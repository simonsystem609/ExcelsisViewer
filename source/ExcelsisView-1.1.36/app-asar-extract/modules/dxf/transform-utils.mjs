function normalizedDegrees(value) {
  const normalized = Number(value) % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

export function rotatePointAround(point, center, angleDegrees) {
  const radians = Number(angleDegrees) * Math.PI / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const dx = Number(point.x) - Number(center.x);
  const dy = Number(point.y) - Number(center.y);
  return {
    x: Number(center.x) + dx * cosine - dy * sine,
    y: Number(center.y) + dx * sine + dy * cosine,
  };
}

function rotateVector(vector, angleDegrees) {
  return rotatePointAround(vector, { x: 0, y: 0 }, angleDegrees);
}

// Mutates one top-level DXF entity. INSERT-expanded virtual children are not
// rotated here: changing the parent INSERT and reparsing regenerates them at
// the correct position without duplicating block geometry in the saved file.
export function rotateEntityInPlace(entity, center, angleDegrees) {
  if (!entity || entity.deleted || entity.virtual) return false;

  if (entity.type === "LINE") {
    const start = rotatePointAround({ x: entity.x1, y: entity.y1 }, center, angleDegrees);
    const end = rotatePointAround({ x: entity.x2, y: entity.y2 }, center, angleDegrees);
    entity.x1 = start.x;
    entity.y1 = start.y;
    entity.x2 = end.x;
    entity.y2 = end.y;
  } else if (entity.type === "CIRCLE") {
    const point = rotatePointAround({ x: entity.cx, y: entity.cy }, center, angleDegrees);
    entity.cx = point.x;
    entity.cy = point.y;
  } else if (entity.type === "ARC") {
    const point = rotatePointAround({ x: entity.cx, y: entity.cy }, center, angleDegrees);
    entity.cx = point.x;
    entity.cy = point.y;
    entity.a1 = normalizedDegrees(entity.a1 + angleDegrees);
    entity.a2 = normalizedDegrees(entity.a2 + angleDegrees);
  } else if (entity.type === "LWPOLYLINE") {
    entity.points = (entity.points || []).map((point) => ({
      ...point,
      ...rotatePointAround(point, center, angleDegrees),
    }));
  } else if (entity.type === "TEXT" || entity.type === "MTEXT") {
    const point = rotatePointAround({ x: entity.x, y: entity.y }, center, angleDegrees);
    entity.x = point.x;
    entity.y = point.y;
    if (entity.alignmentPoint) {
      entity.alignmentPoint = rotatePointAround(entity.alignmentPoint, center, angleDegrees);
    }
    if (entity.directionVector) {
      entity.directionVector = rotateVector(entity.directionVector, angleDegrees);
    }
    if (entity.hasExplicitRotation || !entity.directionVector) {
      entity.rotation = normalizedDegrees((entity.rotation || 0) + angleDegrees);
      entity.hasExplicitRotation = true;
    }
  } else if (entity.type === "INSERT" && entity.insertTransform) {
    const point = rotatePointAround(
      { x: entity.insertTransform.tx, y: entity.insertTransform.ty },
      center,
      angleDegrees,
    );
    entity.insertTransform.tx = point.x;
    entity.insertTransform.ty = point.y;
    entity.insertTransform.rotRad = (entity.insertTransform.rotRad || 0)
      + Number(angleDegrees) * Math.PI / 180;
  } else {
    return false;
  }

  entity.modified = true;
  return true;
}

