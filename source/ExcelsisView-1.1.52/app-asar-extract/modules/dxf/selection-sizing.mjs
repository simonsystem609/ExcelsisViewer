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

// Same shape and every dimension equal within the shared tolerance. Also used
// by "Change all same size holes", so its group always gets a shared target.
export function sizingMatches(first, descriptor) {
  if (!first || !descriptor || descriptor.shape !== first.shape) return false;
  const keys = Object.keys(first.values || {});
  if (!keys.length || keys.length !== Object.keys(descriptor.values || {}).length) return false;
  return keys.every(key => {
    const a = first.values[key];
    const b = descriptor.values[key];
    return Number.isFinite(a) && Number.isFinite(b)
      && Math.abs(a - b) <= Math.max(1e-6, Math.abs(a) * 1e-6, Math.abs(b) * 1e-6);
  });
}

// Shape and *all* dimensions must agree before a single target value can be
// shown for a group. Position, orientation and layer need not agree.
export function commonSelectionSizing(descriptors) {
  if (!Array.isArray(descriptors) || descriptors.length < 2) return null;
  const first = descriptors[0];
  if (!first || !SIZABLE_SHAPES.has(first.shape)) return null;
  const keys = Object.keys(first.values || {});
  if (!keys.length || keys.some(key => !Number.isFinite(first.values[key]))) return null;
  return descriptors.slice(1).every(descriptor => sizingMatches(first, descriptor)) ? first : null;
}
