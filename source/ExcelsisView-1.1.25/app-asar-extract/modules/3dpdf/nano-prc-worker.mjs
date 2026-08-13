import { decodeNanoDocument } from "./nano-prc.mjs";

function meshMetadata(geometry) {
  const { positions, indices } = geometry;
  const normals = new Float32Array(positions.length);
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (let offset = 0; offset < positions.length; offset += 3) {
    const x = positions[offset];
    const y = positions[offset + 1];
    const z = positions[offset + 2];
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    minZ = Math.min(minZ, z);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, z);
  }

  const wireEdges = new Map();
  let wireEdgeCount = 0;
  const addEdge = (first, second) => {
    const low = Math.min(first, second);
    const high = Math.max(first, second);
    let highIndexes = wireEdges.get(low);
    if (!highIndexes) {
      highIndexes = new Set();
      wireEdges.set(low, highIndexes);
    }
    if (!highIndexes.has(high)) {
      highIndexes.add(high);
      wireEdgeCount += 1;
    }
  };
  for (let offset = 0; offset < indices.length; offset += 3) {
    const ia = indices[offset];
    const ib = indices[offset + 1];
    const ic = indices[offset + 2];
    const ax = positions[ia * 3];
    const ay = positions[ia * 3 + 1];
    const az = positions[ia * 3 + 2];
    const abx = positions[ib * 3] - ax;
    const aby = positions[ib * 3 + 1] - ay;
    const abz = positions[ib * 3 + 2] - az;
    const acx = positions[ic * 3] - ax;
    const acy = positions[ic * 3 + 1] - ay;
    const acz = positions[ic * 3 + 2] - az;
    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;
    normals[ia * 3] += nx;
    normals[ia * 3 + 1] += ny;
    normals[ia * 3 + 2] += nz;
    normals[ib * 3] += nx;
    normals[ib * 3 + 1] += ny;
    normals[ib * 3 + 2] += nz;
    normals[ic * 3] += nx;
    normals[ic * 3 + 1] += ny;
    normals[ic * 3 + 2] += nz;
    addEdge(ia, ib);
    addEdge(ib, ic);
    addEdge(ic, ia);
  }
  for (let offset = 0; offset < normals.length; offset += 3) {
    const length = Math.hypot(normals[offset], normals[offset + 1], normals[offset + 2]) || 1;
    normals[offset] /= length;
    normals[offset + 1] /= length;
    normals[offset + 2] /= length;
  }
  const wireIndices = new Uint32Array(wireEdgeCount * 2);
  let wireOffset = 0;
  for (const [first, highIndexes] of wireEdges) {
    for (const second of highIndexes) {
      wireIndices[wireOffset++] = first;
      wireIndices[wireOffset++] = second;
    }
  }
  return {
    bounds: { minX, minY, minZ, maxX, maxY, maxZ },
    normals,
    wireIndices,
  };
}

function sceneBounds(documentScene) {
  const bounds = {
    minX: Infinity,
    minY: Infinity,
    minZ: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
    maxZ: -Infinity,
  };
  for (const node of documentScene.nodes) {
    const geometry = documentScene.geometries[node.geometry];
    const matrix = node.matrix;
    const nodeBounds = {
      minX: Infinity,
      minY: Infinity,
      minZ: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
      maxZ: -Infinity,
    };
    for (let offset = 0; offset < geometry.positions.length; offset += 3) {
      const sourceX = geometry.positions[offset];
      const sourceY = geometry.positions[offset + 1];
      const sourceZ = geometry.positions[offset + 2];
      const x = matrix[0] * sourceX + matrix[4] * sourceY + matrix[8] * sourceZ + matrix[12];
      const y = matrix[1] * sourceX + matrix[5] * sourceY + matrix[9] * sourceZ + matrix[13];
      const z = matrix[2] * sourceX + matrix[6] * sourceY + matrix[10] * sourceZ + matrix[14];
      nodeBounds.minX = Math.min(nodeBounds.minX, x);
      nodeBounds.minY = Math.min(nodeBounds.minY, y);
      nodeBounds.minZ = Math.min(nodeBounds.minZ, z);
      nodeBounds.maxX = Math.max(nodeBounds.maxX, x);
      nodeBounds.maxY = Math.max(nodeBounds.maxY, y);
      nodeBounds.maxZ = Math.max(nodeBounds.maxZ, z);
    }
    node.bounds = nodeBounds;
    bounds.minX = Math.min(bounds.minX, nodeBounds.minX);
    bounds.minY = Math.min(bounds.minY, nodeBounds.minY);
    bounds.minZ = Math.min(bounds.minZ, nodeBounds.minZ);
    bounds.maxX = Math.max(bounds.maxX, nodeBounds.maxX);
    bounds.maxY = Math.max(bounds.maxY, nodeBounds.maxY);
    bounds.maxZ = Math.max(bounds.maxZ, nodeBounds.maxZ);
  }
  const center = {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
    z: (bounds.minZ + bounds.maxZ) / 2,
  };
  let modelRadius = 0;
  for (const node of documentScene.nodes) {
    const geometry = documentScene.geometries[node.geometry];
    const matrix = node.matrix;
    let nodeRadius = 0;
    for (let offset = 0; offset < geometry.positions.length; offset += 3) {
      const sourceX = geometry.positions[offset];
      const sourceY = geometry.positions[offset + 1];
      const sourceZ = geometry.positions[offset + 2];
      const x = matrix[0] * sourceX + matrix[4] * sourceY + matrix[8] * sourceZ + matrix[12];
      const y = matrix[1] * sourceX + matrix[5] * sourceY + matrix[9] * sourceZ + matrix[13];
      const z = matrix[2] * sourceX + matrix[6] * sourceY + matrix[10] * sourceZ + matrix[14];
      nodeRadius = Math.max(nodeRadius, Math.hypot(
        x - center.x,
        y - center.y,
        z - center.z,
      ));
    }
    node.radiusFromModelCenter = nodeRadius;
    modelRadius = Math.max(modelRadius, nodeRadius);
  }
  return { bounds, center, modelRadius };
}

export function prepareNanoDocument(manifest, mesh) {
  const documentScene = decodeNanoDocument(manifest, mesh);
  for (const geometry of documentScene.geometries) {
    Object.assign(geometry, meshMetadata(geometry));
  }
  const model = sceneBounds(documentScene);
  documentScene.modelBounds = model.bounds;
  documentScene.modelCenter = model.center;
  documentScene.modelRadius = model.modelRadius;
  documentScene.componentNodes = documentScene.components.map(() => []);
  for (const [nodeIndex, node] of documentScene.nodes.entries()) {
    for (const componentIndex of node.path || []) {
      documentScene.componentNodes[componentIndex]?.push(nodeIndex);
    }
  }
  return documentScene;
}

function transferableBuffers(documentScene) {
  const buffers = new Set();
  for (const geometry of documentScene.geometries) {
    for (const array of [
      geometry.positions,
      geometry.indices,
      geometry.normals,
      geometry.wireIndices,
    ]) {
      if (array?.buffer instanceof ArrayBuffer) buffers.add(array.buffer);
    }
  }
  return [...buffers];
}

if (typeof self !== "undefined") {
  self.addEventListener("message", (event) => {
    const taskId = Number(event.data?.taskId);
    try {
      if (!["decode-nanoprc", "decode-3d-scene"].includes(event.data?.type)) {
        throw new Error(`Unknown 3D PDF background task: ${event.data?.type}`);
      }
      const result = prepareNanoDocument(
        event.data?.payload?.manifest,
        event.data?.payload?.mesh,
      );
      self.postMessage({ taskId, result }, transferableBuffers(result));
    } catch (error) {
      self.postMessage({
        taskId,
        error: {
          message: error?.message || String(error),
          name: error?.name || "Error",
          stack: error?.stack || "",
        },
      });
    }
  });
}
