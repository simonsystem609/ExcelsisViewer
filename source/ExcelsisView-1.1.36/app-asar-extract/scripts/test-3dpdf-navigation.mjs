import assert from "node:assert/strict";
import fs from "node:fs";
import { THREE } from "../modules/3dpdf/vendor/runtime.mjs";
import {
  cameraClipping, closeUpBoost, minimumSurfaceDepth, zoomedSurfaceDepth,
} from "../modules/3dpdf/navigation-math.mjs";

const applicationModule = fs.readFileSync(
  new URL("../modules/3dpdf/app.mjs", import.meta.url),
  "utf8",
);

function cadDelta(dx, dy, width = 922, height = 699) {
  const axis = new THREE.Vector3(dy, dx, 0);
  const angle = Math.hypot(dx, dy) * 2 / Math.min(width, height);
  return new THREE.Quaternion().setFromAxisAngle(axis.normalize(), angle);
}

function assertVectorNear(label, actual, expected, tolerance = 1e-10) {
  const error = actual.distanceTo(expected);
  assert.ok(error <= tolerance, `${label}: ${error}`);
}

const right = new THREE.Vector3(0, 0, 1).applyQuaternion(cadDelta(180, 0));
const down = new THREE.Vector3(0, 0, 1).applyQuaternion(cadDelta(0, 180));
assert.ok(right.x > 0, "Right drag must use the original SOLIDWORKS-style direction.");
assert.ok(down.y < 0, "Down drag must pitch the model downward.");

for (const centerZ of [-4, 0, 4]) {
  const distance = 10;
  const radius = 3;
  const { near, far } = cameraClipping(distance, centerZ, radius);
  const nearestDepth = distance - centerZ - radius;
  const farthestDepth = distance - centerZ + radius;
  assert.ok(near <= nearestDepth, `Near plane must contain model at center z=${centerZ}.`);
  assert.ok(far >= farthestDepth, `Far plane must contain model at center z=${centerZ}.`);
}

const startQuaternion = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(-0.5, 0.6, 0.15),
);
const startPivot = new THREE.Vector3(120, -75, 18);
const pickedWorld = new THREE.Vector3(500, 220, 310);
const pickedLocal = pickedWorld.clone()
  .sub(startPivot)
  .applyQuaternion(startQuaternion.clone().invert());
const nextQuaternion = cadDelta(160, -95)
  .multiply(startQuaternion)
  .normalize();
const nextPivot = pickedWorld.clone().sub(
  pickedLocal.clone().applyQuaternion(nextQuaternion),
);
assertVectorNear(
  "point-under-cursor pivot remains fixed",
  pickedLocal.clone().applyQuaternion(nextQuaternion).add(nextPivot),
  pickedWorld,
);

const backgroundPivot = startPivot.clone();
const backgroundLocal = new THREE.Vector3();
const backgroundWorld = backgroundLocal.clone()
  .applyQuaternion(startQuaternion)
  .add(backgroundPivot);
const backgroundNextPivot = backgroundWorld.clone().sub(
  backgroundLocal.clone().applyQuaternion(nextQuaternion),
);
assertVectorNear(
  "background rotation keeps the assembly-center pivot fixed",
  backgroundNextPivot,
  backgroundPivot,
);

let loop = new THREE.Quaternion();
for (const [dx, dy] of [[150, 0], [0, 150], [-150, 0], [0, -150]]) {
  loop.premultiply(cadDelta(dx, dy)).normalize();
}
assert.ok(Math.abs(loop.z) > 0.001, "Quaternion path must preserve free third-axis roll.");

// An assembly can be huge while the picked part is tiny. Zoom must not stop
// at a global-radius fraction as it previously did.
const assemblyRadius = 100_000;
const partRadius = 2;
let surfaceDepth = 500;
for (let step = 0; step < 80; step++) {
  surfaceDepth = zoomedSurfaceDepth(surfaceDepth, -120, partRadius, assemblyRadius * 100);
}
assert.ok(surfaceDepth < 0.1, `Tiny part should be inspectable closely: ${surfaceDepth}`);
assert.ok(surfaceDepth >= minimumSurfaceDepth(partRadius));
assert.equal(zoomedSurfaceDepth(1000, -120, assemblyRadius, assemblyRadius * 100, false), assemblyRadius * 0.01,
  "Background zoom should stop before passing through a spread-out assembly.");
assert.equal(zoomedSurfaceDepth(0.1, -120, assemblyRadius, assemblyRadius * 100, false), 0.1,
  "Background zoom must not jump outward if the camera is already closer than its fallback limit.");
const closeClip = cameraClipping(80 + surfaceDepth, 0, assemblyRadius, surfaceDepth);
assert.ok(closeClip.near < surfaceDepth, "Close picked surface must stay in the frustum.");
assert.ok(closeClip.far > surfaceDepth, "Far plane must cover the picked surface.");

// The stored local surface point must stay under the same screen coordinate
// through a wheel sequence, including a zoom-out reversal.
const anchorLocal = new THREE.Vector3(8, -4, 30);
const view = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.5, 0.6, 0.15));
const zoomPivot = new THREE.Vector3(2, 5, 1);
const anchorWorld = anchorLocal.clone().applyQuaternion(view).add(zoomPivot);
let cameraDistance = anchorWorld.z + 45;
const initialProjection = new THREE.Vector2(anchorWorld.x / 45, anchorWorld.y / 45);
for (const delta of [-120, -120, -120, 120, 120, 120]) {
  const point = anchorLocal.clone().applyQuaternion(view).add(zoomPivot);
  const oldDepth = cameraDistance - point.z;
  const newDepth = zoomedSurfaceDepth(oldDepth, delta, partRadius, assemblyRadius * 100);
  const scale = newDepth / oldDepth;
  zoomPivot.x += point.x * (scale - 1);
  zoomPivot.y += point.y * (scale - 1);
  cameraDistance = point.z + newDepth;
  const updated = anchorLocal.clone().applyQuaternion(view).add(zoomPivot);
  assert.ok(Math.abs(updated.x / newDepth - initialProjection.x) < 1e-12);
  assert.ok(Math.abs(updated.y / newDepth - initialProjection.y) < 1e-12);
}
assert.ok(Math.abs(cameraDistance - (anchorWorld.z + 45)) < 1e-9);
assert.equal(closeUpBoost(100, partRadius, 4), 1);
assert.ok(closeUpBoost(0.01, partRadius, 4) > 1);
assert.equal(closeUpBoost(1e-9, partRadius, 4), 4);
assert.equal(closeUpBoost(1e-9, partRadius, 2.5), 2.5);
assert.ok(Number.isFinite(zoomedSurfaceDepth(1, 1e9, 1, 100)));

assert.match(
  applicationModule,
  /function beginRotation\(event\)\{[\s\S]*?const hit=raycastAt\(event\);/,
  "Middle-button rotation must project the cursor onto visible geometry.",
);
assert.match(
  applicationModule,
  /if\(hit\)dragOrbitLocal\.copy\(hit\.point\)/,
  "A geometry hit must become the transient drag pivot.",
);
assert.match(
  applicationModule,
  /else dragOrbitLocal\.set\(0,0,0\);/,
  "Background rotation must fall back to the assembly center.",
);
assert.match(
  applicationModule,
  /rotationAxis\.set\(dy,dx,0\)/,
  "Horizontal CAD rotation direction must remain regression-tested.",
);
assert.match(
  applicationModule,
  /cameraClipping\(dist,pivot\?\.position\.z\|\|0,modelRadius,focusDepth\)/,
  "Camera clipping must follow the transformed assembly center.",
);
assert.match(applicationModule, /local:point\.clone\(\)\.sub\(pivot\.position\)/,
  "Wheel sequence must hold a picked surface in pivot-local coordinates.");
assert.match(applicationModule, /function beginPan\(event\)\{[\s\S]*?const hit=raycastAt\(event\);/,
  "Right-button pan must use the picked surface depth.");
assert.doesNotMatch(applicationModule, /modelRadius\*0\.08|modelRadius\*0\.01/,
  "Navigation must not stop at an assembly-sized close-up floor.");
assert.doesNotMatch(
  applicationModule,
  /hasCustomOrbit|setRotationCenterAt|customOrbitLocal/,
  "A middle click must not persist a hidden pivot into later drags.",
);

console.log("3D PDF surface navigation, clipping, and quaternion checks passed.");
