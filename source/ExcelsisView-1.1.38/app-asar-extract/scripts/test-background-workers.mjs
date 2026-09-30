import assert from "node:assert/strict";
import { prepareNanoDocument } from "../modules/3dpdf/nano-prc-worker.mjs";
import { runDxfGeometryTask } from "../modules/dxf/geometry-worker.mjs";

function line(id, x1, y1, x2, y2) {
  return {
    id,
    type: "LINE",
    closed: false,
    points: [{ x: x1, y: y1 }, { x: x2, y: y2 }],
  };
}

function rectangle(firstId, { x1, y1, x2, y2 }) {
  return [
    line(firstId, x1, y1, x2, y1),
    line(firstId + 1, x2, y1, x2, y2),
    line(firstId + 2, x2, y2, x1, y2),
    line(firstId + 3, x1, y2, x1, y1),
  ];
}

const outer = rectangle(1, { x1: 0, y1: 0, x2: 20, y2: 10 });
const inner = rectangle(5, { x1: 1, y1: 1, x2: 19, y2: 9 });
const bridges = [
  line(9, 0, 0, 1, 1),
  line(10, 20, 0, 19, 1),
  line(11, 20, 10, 19, 9),
  line(12, 0, 10, 1, 9),
];
const cleanup = await runDxfGeometryTask("chamfer-fillet-plan", {
  records: [...outer, ...inner, ...bridges],
  options: { connectTolerance: 0.05, maxOffsetWidth: 2 },
});
assert.equal(cleanup.strips.length, 1);
assert.equal(cleanup.deleteIds.size, 8);
const relaxedCleanup = await runDxfGeometryTask("chamfer-fillet-plan", {
  records: [...outer, ...inner],
  options: { connectTolerance: 0.05, maxOffsetWidth: 2, relaxed: true },
});
assert.equal(relaxedCleanup.strips.length, 1);
assert.equal(relaxedCleanup.strips[0].proof, "relaxed-closed-offset");
assert.equal(relaxedCleanup.deleteIds.size, 4);

const mesh = new ArrayBuffer(80);
const bytes = new Uint8Array(mesh);
bytes.set([0x4e, 0x50, 0x52, 0x43, 0x4d, 0x30, 0x31, 0x00]);
const view = new DataView(mesh);
view.setUint32(8, 1, true);
view.setUint32(12, 1, true);
view.setUint32(16, 7, true);
view.setUint32(20, 3, true);
view.setUint32(24, 3, true);
new Float32Array(mesh, 32, 9).set([
  0, 0, 0,
  1, 0, 0,
  0, 1, 0,
]);
new Uint32Array(mesh, 68, 3).set([0, 1, 2]);

const scene = prepareNanoDocument({
  format: "Excelsis nanoPRC bridge 1",
  mesh_count: 1,
  decoder: "worker-test",
  model_tree: {
    name: "Triangle",
    part: { tess_indices: [7] },
    children: [],
  },
}, mesh);
assert.equal(scene.geometries.length, 1);
const wireEdges = [];
for (let offset = 0; offset < scene.geometries[0].wireIndices.length; offset += 2) {
  wireEdges.push(`${scene.geometries[0].wireIndices[offset]}:${scene.geometries[0].wireIndices[offset + 1]}`);
}
assert.deepEqual(wireEdges.sort(), ["0:1", "0:2", "1:2"]);
assert.deepEqual([...scene.geometries[0].normals], [
  0, 0, 1,
  0, 0, 1,
  0, 0, 1,
]);
assert.deepEqual(scene.modelCenter, { x: 0.5, y: 0.5, z: 0 });
assert.ok(Math.abs(scene.modelRadius - Math.SQRT1_2) < 1e-7);
assert.deepEqual(scene.componentNodes, [[0]]);

const u3dMesh = mesh.slice(0);
new Uint8Array(u3dMesh).set([0x55, 0x33, 0x44, 0x4d, 0x30, 0x31, 0x00, 0x00]);
const u3dScene = prepareNanoDocument({
  format: "Excelsis U3D bridge 1",
  mesh_count: 1,
  decoder: "worker-u3d-test",
  model_tree: {
    name: "Triangle",
    part: { tess_indices: [7] },
    children: [],
  },
}, u3dMesh);
assert.equal(u3dScene.triangleCount, 1);
assert.equal(u3dScene.vertexCount, 3);

console.log(JSON.stringify({
  dxfCleanupRemoved: cleanup.deleteIds.size,
  dxfRelaxedCleanupRemoved: relaxedCleanup.deleteIds.size,
  nanoNormals: scene.geometries[0].normals.length / 3,
  nanoWireEdges: scene.geometries[0].wireIndices.length / 2,
  u3dTriangles: u3dScene.triangleCount,
}));
