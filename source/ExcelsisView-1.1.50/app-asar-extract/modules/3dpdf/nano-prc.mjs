const BRIDGE_FORMATS = new Map([
  ["Excelsis nanoPRC bridge 1", {
    label: "nanoPRC",
    magic: [0x4e, 0x50, 0x52, 0x43, 0x4d, 0x30, 0x31, 0x00],
  }],
  ["Excelsis U3D bridge 1", {
    label: "U3D",
    magic: [0x55, 0x33, 0x44, 0x4d, 0x30, 0x31, 0x00, 0x00],
  }],
]);
const IDENTITY_MATRIX = Object.freeze([
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
]);

function asArrayBuffer(value) {
  if (value instanceof ArrayBuffer) return value;
  if (ArrayBuffer.isView(value)) {
    return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
  }
  throw new TypeError("3D mesh data is not an ArrayBuffer.");
}

function multiplyColumnMajor(a, b) {
  const result = new Array(16);
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      let value = 0;
      for (let k = 0; k < 4; k += 1) {
        value += a[k * 4 + row] * b[column * 4 + k];
      }
      result[column * 4 + row] = value;
    }
  }
  return result;
}

function nodeMatrix(node) {
  const values = node?.transform?.matrix;
  if (!Array.isArray(values) || values.length !== 16) return IDENTITY_MATRIX;
  if (!values.every(Number.isFinite)) {
    throw new Error(`The 3D decoder returned a non-finite transform for "${node?.name || "component"}".`);
  }
  return values;
}

function partTessellationIndices(part) {
  if (!part) return [];
  if (Array.isArray(part.tess_indices)) {
    return [...new Set(part.tess_indices.filter(Number.isInteger))];
  }
  return Number.isInteger(part.tess_index) ? [part.tess_index] : [];
}

function readMeshes(meshValue, bridge) {
  const buffer = asArrayBuffer(meshValue);
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  if (bytes.byteLength < 16) throw new Error(`${bridge.label} mesh output is truncated.`);
  for (let index = 0; index < bridge.magic.length; index += 1) {
    if (bytes[index] !== bridge.magic[index]) {
      throw new Error(`${bridge.label} mesh output has an invalid signature.`);
    }
  }

  const version = view.getUint32(8, true);
  const meshCount = view.getUint32(12, true);
  if (version !== 1) throw new Error(`Unsupported ${bridge.label} mesh version ${version}.`);
  if (meshCount > 1_000_000) throw new Error(`${bridge.label} mesh count is unreasonable.`);

  const geometries = [];
  const geometryByTessellation = new Map();
  let offset = 16;
  for (let meshIndex = 0; meshIndex < meshCount; meshIndex += 1) {
    if (offset + 16 > bytes.byteLength) throw new Error(`${bridge.label} mesh header is truncated.`);
    const tessellation = view.getUint32(offset, true);
    const vertexCount = view.getUint32(offset + 4, true);
    const indexCount = view.getUint32(offset + 8, true);
    offset += 16;

    const positionBytes = vertexCount * 3 * Float32Array.BYTES_PER_ELEMENT;
    const indexBytes = indexCount * Uint32Array.BYTES_PER_ELEMENT;
    if (indexCount % 3 !== 0 || offset + positionBytes + indexBytes > bytes.byteLength) {
      throw new Error(`${bridge.label} mesh ${meshIndex} is malformed.`);
    }

    const positions = new Float32Array(buffer, offset, vertexCount * 3);
    offset += positionBytes;
    const indices = new Uint32Array(buffer, offset, indexCount);
    offset += indexBytes;

    for (let index = 0; index < positions.length; index += 1) {
      if (!Number.isFinite(positions[index])) {
        throw new Error(`${bridge.label} mesh ${meshIndex} contains a non-finite vertex.`);
      }
    }
    for (let index = 0; index < indices.length; index += 1) {
      if (indices[index] >= vertexCount) {
        throw new Error(`${bridge.label} mesh ${meshIndex} contains an invalid index.`);
      }
    }

    const geometryIndex = geometries.length;
    geometries.push({
      positions,
      indices,
      vertexCount,
      triangleCount: indexCount / 3,
      tessellation,
    });
    geometryByTessellation.set(tessellation, geometryIndex);
  }
  if (offset !== bytes.byteLength) {
    throw new Error(`${bridge.label} mesh output contains unexpected trailing data.`);
  }
  return { geometries, geometryByTessellation };
}

function buildSceneTree(modelTree, geometries, geometryByTessellation) {
  const components = [];
  const nodes = [];
  const warnings = [];

  function visit(source, parent, parentMatrix, parentPath) {
    const componentIndex = components.length;
    const component = {
      index: componentIndex,
      name: source?.name || source?.part?.name || `Component ${componentIndex + 1}`,
      sons: [],
      parent,
    };
    components.push(component);
    if (parent >= 0) components[parent].sons.push(componentIndex);

    const worldMatrix = multiplyColumnMajor(parentMatrix, nodeMatrix(source));
    const path = [...parentPath, componentIndex];
    for (const tessellation of partTessellationIndices(source?.part)) {
      const geometry = geometryByTessellation.get(tessellation);
      if (geometry === undefined) {
        warnings.push(`Component "${component.name}" references unsupported tessellation ${tessellation}.`);
        continue;
      }
      nodes.push({
        geometry,
        matrix: worldMatrix,
        occurrence: componentIndex,
        fileStructure: source?.file_index ?? 0,
        path,
        name: component.name,
      });
    }

    for (const child of source?.children || []) {
      visit(child, componentIndex, worldMatrix, path);
    }
    return componentIndex;
  }

  let rootOccurrence = 0;
  if (modelTree) {
    rootOccurrence = visit(modelTree, -1, IDENTITY_MATRIX, []);
  } else {
    components.push({ index: 0, name: "Model", sons: [], parent: -1 });
  }

  if (!nodes.length && geometries.length) {
    for (let geometry = 0; geometry < geometries.length; geometry += 1) {
      nodes.push({
        geometry,
        matrix: IDENTITY_MATRIX,
        occurrence: rootOccurrence,
        fileStructure: 0,
        path: [rootOccurrence],
        name: "Model",
      });
    }
    warnings.push("The product tree had no mesh links; displaying decoded geometry at the model root.");
  }
  return { components, nodes, warnings, rootOccurrence };
}

export function decodeNanoDocument(manifestValue, meshValue) {
  const manifest = typeof manifestValue === "string" ? JSON.parse(manifestValue) : manifestValue;
  const bridge = BRIDGE_FORMATS.get(manifest?.format);
  if (!bridge) throw new Error("Unsupported 3D decoder manifest format.");

  const { geometries, geometryByTessellation } = readMeshes(meshValue, bridge);
  if (manifest.mesh_count !== geometries.length) {
    throw new Error(`${bridge.label} manifest and mesh counts do not match.`);
  }
  const tree = buildSceneTree(
    manifest.model_tree,
    geometries,
    geometryByTessellation,
  );
  if (!tree.nodes.length) throw new Error(`${bridge.label} produced no renderable triangle geometry.`);

  let vertexCount = 0;
  let triangleCount = 0;
  for (const node of tree.nodes) {
    vertexCount += geometries[node.geometry].vertexCount;
    triangleCount += geometries[node.geometry].triangleCount;
  }

  return {
    geometries,
    nodes: tree.nodes,
    components: tree.components,
    rootOccurrence: tree.rootOccurrence,
    assembly: tree.nodes.length > 1 || tree.components.length > 1,
    instanceCount: tree.nodes.length,
    vertexCount,
    triangleCount,
    renderedRecordCount: tree.nodes.length,
    uniqueRecordCount: geometries.length,
    occurrenceCount: tree.components.length,
    fileStructureCount: 0,
    rootFileStructure: 0,
    warnings: tree.warnings,
    decoder: manifest.decoder,
  };
}

export function looksLikePrcPdf(value) {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(asArrayBuffer(value));
  // Uint8Array#indexOf is implemented natively and avoids a JavaScript
  // byte-by-byte pass over large regular PDFs.
  let offset = bytes.indexOf(0x2f);
  while (offset >= 0 && offset <= bytes.length - 4) {
    if (
      bytes[offset + 1] === 0x50
      && bytes[offset + 2] === 0x52
      && bytes[offset + 3] === 0x43
    ) {
      return true;
    }
    offset = bytes.indexOf(0x2f, offset + 1);
  }
  return false;
}

export function looksLikeU3dPdf(value) {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(asArrayBuffer(value));
  let offset = bytes.indexOf(0x2f);
  while (offset >= 0 && offset <= bytes.length - 4) {
    if (
      bytes[offset + 1] === 0x55
      && bytes[offset + 2] === 0x33
      && bytes[offset + 3] === 0x44
    ) {
      return true;
    }
    offset = bytes.indexOf(0x2f, offset + 1);
  }
  return false;
}
