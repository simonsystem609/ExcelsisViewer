// Model checks for "Offset All Thread Holes" detection (no renderer needed).
import assert from "node:assert/strict";
import { DEFAULT_THREAD_HOLE_OFFSET, THREAD_TAP_DRILLS, groupThreadHoles, offsetHoleDiameter, threadForDiameter }
  from "../modules/dxf/thread-holes.mjs";

// ISO coarse tap drills = major diameter - pitch, M3 to M24.
assert.deepEqual(THREAD_TAP_DRILLS.map(size => [size.thread, size.diameter]), [
  ["M3", 2.5], ["M4", 3.3], ["M5", 4.2], ["M6", 5], ["M8", 6.8], ["M10", 8.5],
  ["M12", 10.2], ["M14", 12], ["M16", 14], ["M18", 15.5], ["M20", 17.5], ["M22", 19.5], ["M24", 21],
]);
for (const size of THREAD_TAP_DRILLS) {
  const major = Number(size.thread.slice(1));
  const pitch = { 3: 0.5, 4: 0.7, 5: 0.8, 6: 1, 8: 1.25, 10: 1.5, 12: 1.75, 14: 2, 16: 2, 18: 2.5, 20: 2.5, 22: 2.5, 24: 3 }[major];
  assert(Math.abs(major - pitch - size.diameter) <= 0.051, `${size.thread} tap drill`);
}
assert.equal(DEFAULT_THREAD_HOLE_OFFSET, -0.5, "thread holes shrink by default");
assert.equal(threadForDiameter(5).thread, "M6");
assert.equal(threadForDiameter(5.009).thread, "M6");
assert.equal(threadForDiameter(5.02), null, "outside the 0.01 mm tolerance");
assert.equal(threadForDiameter(6), null, "plain Ø6 is not a thread hole");
assert.equal(threadForDiameter(2), null);
assert.equal(threadForDiameter(-5), null);
assert.equal(threadForDiameter(Number.NaN), null);

const holes = [5, 4.2, 6, 5, 21, 8.5, 2.5000001, 30].map((diameter, id) => ({ id, diameter }));
const groups = groupThreadHoles(holes);
assert.deepEqual(groups.map(group => [group.thread, group.holes.map(hole => hole.id)]),
  [["M3", [6]], ["M5", [1]], ["M6", [0, 3]], ["M10", [5]], ["M24", [4]]], "grouped in size order, plain holes left out");
assert.deepEqual(groupThreadHoles([]), []);
assert.equal(offsetHoleDiameter(5, 0.5), 6, "offset is per side, like the selection Offset");
assert.equal(offsetHoleDiameter(5, -0.5), 4);
console.log(JSON.stringify({ passed: true, sizes: THREAD_TAP_DRILLS.length, tolerance: 0.01, perSideOffset: true }));
