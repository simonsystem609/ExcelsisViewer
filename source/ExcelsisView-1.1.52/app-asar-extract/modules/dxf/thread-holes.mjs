// ISO 261 coarse metric threads M3-M24 with their ISO 2306 tap-drill
// diameters (major diameter minus pitch): the hole size drawn for a tapped hole.
// M3.5/M7 are omitted: they are non-preferred and Ø6 is usually a plain hole.
export const THREAD_TAP_DRILLS = Object.freeze([
  ["M3", 2.5], ["M4", 3.3], ["M5", 4.2], ["M6", 5], ["M8", 6.8], ["M10", 8.5],
  ["M12", 10.2], ["M14", 12], ["M16", 14], ["M18", 15.5], ["M20", 17.5], ["M22", 19.5], ["M24", 21],
].map(([thread, diameter]) => Object.freeze({ thread, diameter })));

// Diameter tolerance in mm; exported CAD holes are normally exact.
export const THREAD_HOLE_TOLERANCE = 0.01;
// Thread holes are normally tightened for cutting, so the default shrinks them.
export const DEFAULT_THREAD_HOLE_OFFSET = -0.5;

export function threadForDiameter(diameter, tolerance = THREAD_HOLE_TOLERANCE) {
  if (!Number.isFinite(diameter) || diameter <= 0) return null;
  return THREAD_TAP_DRILLS.find(size => Math.abs(size.diameter - diameter) <= tolerance) || null;
}

// holes: [{ diameter, ... }]. Returns one group per detected thread, in size
// order, each listing its holes unchanged.
export function groupThreadHoles(holes) {
  const groups = new Map();
  for (const hole of holes || []) {
    const thread = threadForDiameter(hole?.diameter);
    if (!thread) continue;
    if (!groups.has(thread.thread)) groups.set(thread.thread, { ...thread, holes: [] });
    groups.get(thread.thread).holes.push(hole);
  }
  return THREAD_TAP_DRILLS.filter(size => groups.has(size.thread)).map(size => groups.get(size.thread));
}

// The offset is per side, like the selection Offset: the radius changes by it.
export function offsetHoleDiameter(diameter, offset) {
  return diameter + 2 * offset;
}
