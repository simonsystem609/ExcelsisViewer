// Exact circular-arc slot construction. Picked points are end-cap centers;
// curveRadius is the radius of the curved slot's centerline, not its end caps.
export function planRacetrack(a, b, { kind = "straight", width, curveRadius, side = "left" } = {}) {
  if (![a?.x, a?.y, b?.x, b?.y].every(Number.isFinite)) throw new Error("Pick two finite points.");
  const distance = Math.hypot(b.x - a.x, b.y - a.y);
  const scale = Math.max(1, Math.abs(a.x), Math.abs(a.y), Math.abs(b.x), Math.abs(b.y));
  if (!Number.isFinite(distance) || distance <= scale * 1e-12) throw new Error("Pick two different points.");
  if (!Number.isFinite(width) || width <= scale * 1e-12) throw new Error("Track width must be a positive, usable number.");
  const endRadius = width / 2;
  const n = { x: -(b.y - a.y) / distance, y: (b.x - a.x) / distance };
  let points;
  let center = null;
  let sweep = 0;
  if (kind === "straight") {
    points = [
      { x: a.x - n.x * endRadius, y: a.y - n.y * endRadius, bulge: 0 },
      { x: b.x - n.x * endRadius, y: b.y - n.y * endRadius, bulge: 1 },
      { x: b.x + n.x * endRadius, y: b.y + n.y * endRadius, bulge: 0 },
      { x: a.x + n.x * endRadius, y: a.y + n.y * endRadius, bulge: 1 },
    ];
  } else if (kind === "curved") {
    if (!Number.isFinite(curveRadius) || curveRadius < distance / 2) {
      throw new Error(`Curve radius must be at least half the point spacing (${distance / 2}).`);
    }
    if (curveRadius <= endRadius) throw new Error("Curve radius must be larger than the end radius (half the width).");
    if (side !== "left" && side !== "right") throw new Error("Choose a left or right bend.");
    const sign = side === "left" ? -1 : 1;
    const ratio = distance / (2 * curveRadius);
    // Avoid R*R overflow. Extremely flat arcs are indistinguishable from a line.
    if (ratio < 1e-7) throw new Error("This curve radius is too large for the point spacing. Use Straight or a smaller radius.");
    const height = curveRadius * Math.sqrt(Math.max(0, 1 - ratio * ratio));
    center = { x: a.x / 2 + b.x / 2 + sign * n.x * height, y: a.y / 2 + b.y / 2 + sign * n.y * height };
    sweep = sign * 2 * Math.asin(ratio);
    const offset = (point, direction, bulge) => ({
      x: point.x + direction * endRadius * ((point.x - center.x) / curveRadius),
      y: point.y + direction * endRadius * ((point.y - center.y) / curveRadius),
      bulge,
    });
    const bulge = Math.tan(sweep / 4);
    points = [offset(a, 1, bulge), offset(b, 1, sign), offset(b, -1, -bulge), offset(a, -1, sign)];
  } else {
    throw new Error("Choose a straight or curved racetrack.");
  }
  if (points.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y))) throw new Error("The requested racetrack is too large.");
  return { kind, width, endRadius, curveRadius: kind === "curved" ? curveRadius : null, side, distance, center, sweep, points, closed: true };
}
