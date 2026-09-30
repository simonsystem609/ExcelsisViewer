import assert from "node:assert/strict";
import {
  createNavigationActivity, drawingBoundsIntersect, drawingLayerCovers,
  drawingLayerSize, drawingLayerTransform, drawingViewportBounds,
  DRAWING_LAYER_PIXEL_LIMIT, NAVIGATION_SETTLE_MS,
} from "../modules/dxf/navigation-render.mjs";

const view = { scale: 2, ox: 500, oy: 400 };
assert.deepEqual(drawingViewportBounds(view, 1000, 800, 100),
  { minX: -300, maxX: 300, minY: -250, maxY: 250 });
assert(drawingBoundsIntersect({ minX: 0, maxX: 5, minY: 0, maxY: 5 },
  { minX: 5, maxX: 10, minY: -1, maxY: 1 }), "Boundary-touching geometry stays visible");
assert(!drawingBoundsIntersect({ minX: 0, maxX: 4, minY: 0, maxY: 5 },
  { minX: 5, maxX: 10, minY: -1, maxY: 1 }));
const layer = { view, padding: 100, width: 1200, height: 1000 };
assert(drawingLayerCovers(layer, view, 1000, 800));
assert(drawingLayerCovers(layer, { ...view, ox: 550, oy: 420 }, 1000, 800));
assert(!drawingLayerCovers(layer, { ...view, ox: 900 }, 1000, 800));
assert(!drawingLayerCovers(layer, { ...view, scale: 0.1 }, 1000, 800));
const point = { x: 20, y: -30 };
for (const next of [view, { scale: 3, ox: 450, oy: 320 }, { scale: 0.25, ox: -70, oy: 85 }]) {
  const mapped = drawingLayerTransform(layer, next);
  const ratio = next.scale / view.scale;
  assert.equal(mapped.x + (point.x * view.scale + view.ox + layer.padding) * ratio,
    point.x * next.scale + next.ox);
  assert.equal(mapped.y + (-point.y * view.scale + view.oy + layer.padding) * ratio,
    -point.y * next.scale + next.oy);
}
for (const dpr of [1, 1.25, 1.5, 2, 3]) {
  const full = drawingLayerSize(1300.5, 780.25, dpr);
  assert(full);
  assert.equal(full.resolution, dpr, "Resting detail keeps native device resolution");
  assert.equal(full.width * full.resolution, full.pixelWidth, "No fractional-DPR resampling drift");
  assert.equal(full.height * full.resolution, full.pixelHeight);
  assert(full.pixelWidth * full.pixelHeight <= DRAWING_LAYER_PIXEL_LIMIT);
  const preview = drawingLayerSize(1300.5, 780.25, dpr, true);
  assert(preview.resolution <= 0.65);
}
assert.equal(drawingLayerSize(7680, 4320, 2), null, "Huge resting surfaces use the native-resolution fallback");
const hugePreview = drawingLayerSize(7680, 4320, 2, true);
assert(hugePreview.pixelWidth * hugePreview.pixelHeight <= DRAWING_LAYER_PIXEL_LIMIT);

let settles = 0, clock = 0, nextId = 0;
const tasks = new Map();
const canceled = [];
const activity = createNavigationActivity({
  onSettled: () => { settles += 1; },
  schedule: (fn, ms) => { const id = ++nextId; tasks.set(id, { fn, at: clock + ms }); return id; },
  cancel: id => { canceled.push(tasks.get(id)?.fn); tasks.delete(id); },
});
function advance(ms) {
  clock += ms;
  for (const [id, task] of [...tasks]) if (task.at <= clock) { tasks.delete(id); task.fn(); }
}
activity.mark();
advance(NAVIGATION_SETTLE_MS - 1);
assert(activity.active);
activity.mark();
canceled.at(-1)(); // A stale queued timer cannot end a newer gesture.
assert(activity.active);
advance(NAVIGATION_SETTLE_MS);
assert(!activity.active);
assert.equal(settles, 1);
activity.mark(true);
advance(10000);
assert(activity.active, "A held pan never silently returns to expensive vector frames");
activity.end(); activity.end();
assert.equal(settles, 2);
activity.mark(); activity.reset(); advance(1000);
assert(!activity.active);
assert.equal(settles, 2, "Resize/file changes cancel the old document's quiet timer");
console.log("DXF/DWG navigation transforms, culling, pixel budgets and settle lifecycle passed.");
