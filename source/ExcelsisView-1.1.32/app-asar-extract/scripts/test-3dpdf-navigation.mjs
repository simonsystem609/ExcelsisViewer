import assert from "node:assert/strict";
import fs from "node:fs";
import { THREE } from "../modules/3dpdf/vendor/runtime.mjs";

const applicationModule = fs.readFileSync(
  new URL("../modules/3dpdf/app.mjs", import.meta.url),
  "utf8",
);

function cadDelta(dx, dy, width = 922, height = 699) {
  const axis = new THREE.Vector3(dy, dx, 0);
  const angle = Math.hypot(dx, dy) * 2 / Math.min(width, height);
  return new THREE.Quaternion().setFromAxisAngle(axis.normalize(), angle);
}

function clippingRange(distance, centerZ, radius) {
  const margin = Math.max(radius * 1.15, 1);
  const centerDepth = distance - centerZ;
  const near = Math.max(0.01, centerDepth - margin);
  return { near, far: Math.max(near + 1, centerDepth + margin) };
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
  const { near, far } = clippingRange(distance, centerZ, radius);
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

assert.match(
  applicationModule,
  /function beginRotation\(event\)\{\s*const hit=raycastAt\(event\);/,
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
  /const centerDepth=dist-\(pivot\?\.position\.z\|\|0\);/,
  "Camera clipping must follow the transformed assembly center.",
);
assert.doesNotMatch(
  applicationModule,
  /hasCustomOrbit|setRotationCenterAt|customOrbitLocal/,
  "A middle click must not persist a hidden pivot into later drags.",
);

console.log("3D PDF CAD quaternion navigation checks passed.");
