// Selection inputs deliberately use text: Chromium number fields can reject
// locale decimal separators while still accepting their spinner controls.
export function parseSelectionNumber(text) {
  const source = String(text ?? "").trim();
  if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][+-]?\d+)?$/.test(source)) return NaN;
  return Number(source.replace(",", "."));
}

export function stepSelectionNumber(value, direction, step = 0.1) {
  if (!Number.isFinite(value) || !Number.isFinite(step) || step <= 0) return NaN;
  return Math.round((value + Math.sign(direction) * step) * 1e9) / 1e9;
}

const SIZABLE_SHAPES = new Set(["hole", "racetrack", "rectangle", "rounded-rectangle"]);

// Shape and *all* dimensions must agree before a single target value can be
// shown for a group. Position, orientation and layer need not agree.
export function commonSelectionSizing(descriptors) {
  if (!Array.isArray(descriptors) || descriptors.length < 2) return null;
  const first = descriptors[0];
  if (!first || !SIZABLE_SHAPES.has(first.shape)) return null;
  const keys = Object.keys(first.values || {});
  if (!keys.length || keys.some(key => !Number.isFinite(first.values[key]))) return null;
  for (const descriptor of descriptors.slice(1)) {
    if (!descriptor || descriptor.shape !== first.shape) return null;
    if (keys.length !== Object.keys(descriptor.values || {}).length) return null;
    for (const key of keys) {
      const a = first.values[key];
      const b = descriptor.values[key];
      if (!Number.isFinite(b) || Math.abs(a - b) > Math.max(1e-6, Math.abs(a) * 1e-6, Math.abs(b) * 1e-6)) return null;
    }
  }
  return first;
}
