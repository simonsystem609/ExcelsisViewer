// Rendering-only helpers. Document coordinates, snapping and saved data do
// not depend on the temporary navigation bitmap's resolution.
export const NAVIGATION_SETTLE_MS = 180;
export const DRAWING_LAYER_PIXEL_LIMIT = 16 * 1024 * 1024;

export function drawingViewportBounds(view, width, height, padding = 0) {
  const scale = Math.max(Math.abs(view.scale), 1e-9);
  return {
    minX: (-padding - view.ox) / scale,
    maxX: (width + padding - view.ox) / scale,
    minY: (view.oy - height - padding) / scale,
    maxY: (view.oy + padding) / scale,
  };
}

export function drawingBoundsIntersect(a, b) {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}

export function drawingLayerTransform(layer, view) {
  const ratio = view.scale / layer.view.scale;
  return {
    x: view.ox - ratio * (layer.view.ox + layer.padding),
    y: view.oy - ratio * (layer.view.oy + layer.padding),
    width: layer.width * ratio,
    height: layer.height * ratio,
  };
}

export function drawingLayerCovers(layer, view, width, height) {
  const rect = drawingLayerTransform(layer, view);
  return rect.x <= 0.25 && rect.y <= 0.25 && rect.x + rect.width >= width - 0.25 && rect.y + rect.height >= height - 0.25;
}

export function drawingLayerSize(width, height, dpr, preview = false) {
  let resolution = preview ? Math.min(dpr, 1) * 0.65 : dpr;
  let padding = Math.min(256, Math.ceil(Math.min(width, height) * 0.25));
  const pixels = () => Math.ceil((width + 2 * padding) * resolution) * Math.ceil((height + 2 * padding) * resolution);
  if (!preview && pixels() > DRAWING_LAYER_PIXEL_LIMIT) padding = 0;
  if (!preview && pixels() > DRAWING_LAYER_PIXEL_LIMIT) return null;
  if (preview && pixels() > DRAWING_LAYER_PIXEL_LIMIT) {
    resolution *= Math.sqrt(DRAWING_LAYER_PIXEL_LIMIT / pixels()) * 0.99;
  }
  const pixelWidth = Math.max(1, Math.ceil((width + 2 * padding) * resolution));
  const pixelHeight = Math.max(1, Math.ceil((height + 2 * padding) * resolution));
  return {
    width: pixelWidth / resolution,
    height: pixelHeight / resolution,
    pixelWidth, pixelHeight,
    resolution, padding,
  };
}

export function createNavigationActivity({ onSettled, schedule = setTimeout, cancel = clearTimeout }) {
  let active = false;
  let timer = null;
  let generation = 0;
  const reset = () => {
    generation += 1;
    if (timer !== null) cancel(timer);
    timer = null;
    active = false;
  };
  const end = () => {
    const wasActive = active;
    reset();
    if (wasActive) onSettled();
  };
  return {
    get active() { return active; },
    mark(held = false) {
      reset();
      active = true;
      if (!held) {
        const current = generation;
        timer = schedule(() => { if (generation === current) end(); }, NAVIGATION_SETTLE_MS);
      }
    },
    end, reset,
  };
}
