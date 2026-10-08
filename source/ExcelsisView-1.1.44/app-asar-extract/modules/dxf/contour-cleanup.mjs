function distance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function finitePoint(point) {
  return Number.isFinite(point?.x) && Number.isFinite(point?.y);
}

function recordLength(record) {
  let total = 0;
  for (let index = 1; index < record.points.length; index += 1) {
    total += distance(record.points[index - 1], record.points[index]);
  }
  return total;
}

function boundsForPoints(points) {
  const bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };
  for (const point of points) {
    bounds.minX = Math.min(bounds.minX, point.x);
    bounds.minY = Math.min(bounds.minY, point.y);
    bounds.maxX = Math.max(bounds.maxX, point.x);
    bounds.maxY = Math.max(bounds.maxY, point.y);
  }
  return bounds;
}

function boundsArea(bounds) {
  return Math.max(0, bounds.maxX - bounds.minX) * Math.max(0, bounds.maxY - bounds.minY);
}

function polygonArea(points) {
  let twiceArea = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    twiceArea += points[index].x * points[index + 1].y
      - points[index + 1].x * points[index].y;
  }
  return twiceArea / 2;
}

function pointSegmentDistance(point, first, second) {
  const dx = second.x - first.x;
  const dy = second.y - first.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared <= 1e-18) return distance(point, first);
  const projection = Math.max(0, Math.min(
    1,
    ((point.x - first.x) * dx + (point.y - first.y) * dy) / lengthSquared,
  ));
  return Math.hypot(
    point.x - (first.x + projection * dx),
    point.y - (first.y + projection * dy),
  );
}

function pointPolylineDistance(point, polyline) {
  let best = Infinity;
  for (let index = 1; index < polyline.length; index += 1) {
    best = Math.min(best, pointSegmentDistance(point, polyline[index - 1], polyline[index]));
  }
  return best;
}

function percentile(sorted, fraction) {
  if (!sorted.length) return Infinity;
  const index = Math.max(0, Math.min(
    sorted.length - 1,
    Math.round((sorted.length - 1) * fraction),
  ));
  return sorted[index];
}

function offsetStatistics(first, second) {
  const values = [];
  const addDistances = (source, target) => {
    const stride = Math.max(1, Math.ceil(source.length / 256));
    for (let index = 0; index < source.length; index += stride) {
      values.push(pointPolylineDistance(source[index], target));
    }
  };
  addDistances(first, second);
  addDistances(second, first);
  values.sort((a, b) => a - b);
  return {
    median: percentile(values, 0.5),
    p90: percentile(values, 0.9),
    max: values.at(-1) ?? Infinity,
  };
}

function pointInPolygon(point, polygon) {
  let inside = false;
  const count = Math.max(0, polygon.length - 1);
  for (let firstIndex = 0, secondIndex = count - 1; firstIndex < count; secondIndex = firstIndex++) {
    const first = polygon[firstIndex];
    const second = polygon[secondIndex];
    const crosses = (first.y > point.y) !== (second.y > point.y);
    if (!crosses) continue;
    const crossingX = ((second.x - first.x) * (point.y - first.y))
      / ((second.y - first.y) || Number.EPSILON)
      + first.x;
    if (point.x < crossingX) inside = !inside;
  }
  return inside;
}

function boundsContain(outer, inner, tolerance) {
  return (
    inner.minX >= outer.minX - tolerance
    && inner.minY >= outer.minY - tolerance
    && inner.maxX <= outer.maxX + tolerance
    && inner.maxY <= outer.maxY + tolerance
  );
}

function nestedCycles(first, second, tolerance) {
  const firstBoundsArea = boundsArea(first.bounds);
  const secondBoundsArea = boundsArea(second.bounds);
  const outer = firstBoundsArea >= secondBoundsArea ? first : second;
  const inner = outer === first ? second : first;
  if (!boundsContain(outer.bounds, inner.bounds, tolerance * 2)) return null;
  const points = inner.points.slice(0, -1);
  const stride = Math.max(1, Math.ceil(points.length / 128));
  let tested = 0;
  let contained = 0;
  for (let index = 0; index < points.length; index += stride) {
    tested += 1;
    if (
      pointInPolygon(points[index], outer.points)
      || pointPolylineDistance(points[index], outer.points) <= tolerance
    ) {
      contained += 1;
    }
  }
  if (!tested || contained / tested < 0.96) return null;
  return { outer, inner };
}

function relaxedOffsetCandidate(first, second, options, rejections = null) {
  const reject = (reason, details = {}) => {
    rejections?.push({ reason, ...details });
    return null;
  };
  const nesting = nestedCycles(first, second, options.connectTolerance);
  if (!nesting) return reject("not-nested");
  const lengthRatio = Math.min(first.length, second.length) / Math.max(first.length, second.length);
  if (lengthRatio < 0.78) return reject("length-ratio", { lengthRatio });
  const offsets = offsetStatistics(first.points, second.points);
  if (
    offsets.median <= options.connectTolerance * 0.3
    || offsets.median > options.maxOffsetWidth
    || offsets.p90 > Math.min(
      options.maxOffsetWidth * 1.35,
      offsets.median * 1.8 + options.connectTolerance * 2,
    )
    || offsets.max > Math.min(
      options.maxOffsetWidth * 2.25,
      offsets.median * 3 + options.connectTolerance * 2,
    )
  ) {
    return reject("offset-spread", { offsets });
  }
  const { outer, inner } = nesting;
  const insets = [
    inner.bounds.minX - outer.bounds.minX,
    outer.bounds.maxX - inner.bounds.maxX,
    inner.bounds.minY - outer.bounds.minY,
    outer.bounds.maxY - inner.bounds.maxY,
  ];
  if (
    insets.some((value) => value < -options.connectTolerance * 2)
    || insets.some((value) => value > options.maxOffsetWidth * 2)
    || insets.filter((value) => value > options.connectTolerance).length < 3
  ) {
    return reject("bounds-insets", { insets });
  }
  const meanLength = (first.length + second.length) / 2;
  const areaGap = Math.abs(Math.abs(first.area) - Math.abs(second.area));
  const areaGapRatio = areaGap / Math.max(offsets.median * meanLength, 1e-9);
  if (areaGapRatio < 0.45 || areaGapRatio > 2.2) {
    return reject("area-gap", { areaGapRatio });
  }
  return {
    bridgeIds: new Set(),
    bridgeWidth: null,
    cycles: [first, second],
    offset: offsets.median,
    proof: "relaxed-closed-offset",
    score: (
      offsets.p90 / Math.max(offsets.median, 1e-9)
      + Math.abs(areaGapRatio - 1)
      + (1 - lengthRatio) * 2
    ),
  };
}

function findRelaxedOffsetStrips(groups, recordsById, topology, options, diagnostics = null) {
  const cycles = groups
    .map((group) => traceClosedCycle(group, recordsById, topology, options.connectTolerance))
    .filter((cycle) => cycle && Math.abs(cycle.area) > options.connectTolerance ** 2);
  if (diagnostics) diagnostics.cycleCount = cycles.length;
  const candidates = [];
  const candidatesByCycle = new Map(cycles.map((cycle) => [cycle, []]));
  for (let firstIndex = 0; firstIndex < cycles.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < cycles.length; secondIndex += 1) {
      const candidate = relaxedOffsetCandidate(
        cycles[firstIndex],
        cycles[secondIndex],
        options,
        diagnostics?.rejections,
      );
      if (!candidate) continue;
      candidates.push(candidate);
      candidatesByCycle.get(cycles[firstIndex]).push(candidate);
      candidatesByCycle.get(cycles[secondIndex]).push(candidate);
    }
  }
  // A relaxed match is only accepted when it is unambiguous in both
  // directions. Three or more close concentric design contours are therefore
  // left untouched instead of guessing which pair is a manufacturing strip.
  const accepted = candidates
    .filter((candidate) => candidate.cycles.every(
      (cycle) => candidatesByCycle.get(cycle)?.length === 1,
    ))
    .sort((first, second) => first.score - second.score);
  if (diagnostics) {
    diagnostics.candidateCount = candidates.length;
    diagnostics.acceptedCount = accepted.length;
  }
  return accepted;
}

function createSpatialNodes(records, tolerance) {
  const nodes = [];
  const buckets = new Map();
  const cellSize = Math.max(tolerance, 1e-9);
  const key = (x, y) => `${x}:${y}`;
  const nodeFor = (point) => {
    const cellX = Math.floor(point.x / cellSize);
    const cellY = Math.floor(point.y / cellSize);
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        for (const nodeIndex of buckets.get(key(cellX + offsetX, cellY + offsetY)) || []) {
          if (distance(nodes[nodeIndex].point, point) <= tolerance) return nodeIndex;
        }
      }
    }
    const nodeIndex = nodes.length;
    nodes.push({ point: { ...point }, records: new Set() });
    const bucketKey = key(cellX, cellY);
    if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);
    buckets.get(bucketKey).push(nodeIndex);
    return nodeIndex;
  };

  const nodeIdsByRecord = new Map();
  for (const record of records) {
    if (record.closed || record.points.length < 2) continue;
    const first = nodeFor(record.points[0]);
    const second = nodeFor(record.points.at(-1));
    nodeIdsByRecord.set(record.id, [first, second]);
    nodes[first].records.add(record.id);
    nodes[second].records.add(record.id);
  }
  return { nodes, nodeIdsByRecord };
}

function connectedRecordGroups(recordIds, recordsById, topology, excluded = new Set()) {
  const remaining = new Set([...recordIds].filter((id) => !excluded.has(id)));
  const groups = [];
  while (remaining.size) {
    const first = remaining.values().next().value;
    remaining.delete(first);
    const group = new Set([first]);
    const queue = [first];
    while (queue.length) {
      const id = queue.pop();
      const record = recordsById.get(id);
      if (!record || record.closed) continue;
      for (const nodeId of topology.nodeIdsByRecord.get(id) || []) {
        for (const neighbor of topology.nodes[nodeId].records) {
          if (!remaining.has(neighbor) || excluded.has(neighbor)) continue;
          remaining.delete(neighbor);
          group.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    groups.push(group);
  }
  return groups;
}

function traceClosedCycle(group, recordsById, topology, tolerance) {
  if (group.size === 1) {
    const record = recordsById.get(group.values().next().value);
    if (!record?.closed) return null;
    const points = record.points.map((point) => ({ ...point }));
    if (distance(points[0], points.at(-1)) > tolerance) points.push({ ...points[0] });
    return {
      entityIds: new Set(group),
      points,
      length: recordLength({ points }),
      area: polygonArea(points),
      bounds: boundsForPoints(points),
    };
  }

  const incident = new Map();
  for (const id of group) {
    const nodeIds = topology.nodeIdsByRecord.get(id);
    if (!nodeIds || nodeIds[0] === nodeIds[1]) return null;
    for (const nodeId of nodeIds) {
      if (!incident.has(nodeId)) incident.set(nodeId, []);
      incident.get(nodeId).push(id);
    }
  }
  if ([...incident.values()].some((ids) => ids.length !== 2)) return null;

  const firstId = group.values().next().value;
  const firstNodes = topology.nodeIdsByRecord.get(firstId);
  const startNode = firstNodes[0];
  let currentNode = startNode;
  const unvisited = new Set(group);
  const points = [];
  while (unvisited.size) {
    const nextId = (incident.get(currentNode) || []).find((id) => unvisited.has(id));
    if (nextId === undefined) return null;
    const record = recordsById.get(nextId);
    const nodeIds = topology.nodeIdsByRecord.get(nextId);
    const forward = nodeIds[0] === currentNode;
    // Always copy the point array: removing the shared join point below must
    // never mutate the source record, because later safety passes reuse it.
    const oriented = forward ? [...record.points] : [...record.points].reverse();
    if (points.length) oriented.shift();
    points.push(...oriented.map((point) => ({ ...point })));
    currentNode = forward ? nodeIds[1] : nodeIds[0];
    unvisited.delete(nextId);
  }
  if (currentNode !== startNode || points.length < 4) return null;
  if (distance(points[0], points.at(-1)) > tolerance) points.push({ ...points[0] });
  return {
    entityIds: new Set(group),
    points,
    length: recordLength({ points }),
    area: polygonArea(points),
    bounds: boundsForPoints(points),
  };
}

function clusterShortBridgeLengths(candidates, maxWidth, tolerance) {
  const sorted = candidates
    .filter((candidate) => candidate.length > tolerance * 0.25 && candidate.length <= maxWidth * 1.25)
    .sort((first, second) => first.length - second.length);
  const clusters = [];
  for (const candidate of sorted) {
    const cluster = clusters.find((entry) => (
      Math.abs(candidate.length - entry.mean)
      <= Math.max(tolerance * 2, entry.mean * 0.16)
    ));
    if (cluster) {
      cluster.items.push(candidate);
      cluster.mean = cluster.items.reduce((sum, item) => sum + item.length, 0) / cluster.items.length;
    } else {
      clusters.push({ mean: candidate.length, items: [candidate] });
    }
  }
  return clusters
    .filter((cluster) => cluster.items.length >= 2)
    .sort((first, second) => (
      second.items.length - first.items.length
      || first.mean - second.mean
    ))[0] || null;
}

function analyzeStrip(recordIds, recordsById, topology, options) {
  const degrees = new Map();
  for (const id of recordIds) {
    for (const nodeId of topology.nodeIdsByRecord.get(id) || []) {
      degrees.set(nodeId, (degrees.get(nodeId) || 0) + 1);
    }
  }
  const bridgeCandidates = [];
  for (const id of recordIds) {
    const record = recordsById.get(id);
    const nodeIds = topology.nodeIdsByRecord.get(id);
    if (record?.type !== "LINE" || !nodeIds) continue;
    if ((degrees.get(nodeIds[0]) || 0) < 3 || (degrees.get(nodeIds[1]) || 0) < 3) continue;
    bridgeCandidates.push({ id, length: recordLength(record) });
  }
  const bridgeCluster = clusterShortBridgeLengths(
    bridgeCandidates,
    options.maxOffsetWidth,
    options.connectTolerance,
  );
  if (!bridgeCluster) return null;
  const bridgeIds = new Set(bridgeCluster.items.map((item) => item.id));
  const groups = connectedRecordGroups(recordIds, recordsById, topology, bridgeIds);
  if (groups.length !== 2) return null;
  const cycles = groups.map((group) => (
    traceClosedCycle(group, recordsById, topology, options.connectTolerance)
  ));
  if (cycles.some((cycle) => !cycle || Math.abs(cycle.area) <= options.connectTolerance ** 2)) {
    return null;
  }
  const [first, second] = cycles;
  const lengthRatio = Math.min(first.length, second.length) / Math.max(first.length, second.length);
  if (lengthRatio < 0.72) return null;
  const offsets = offsetStatistics(first.points, second.points);
  if (
    offsets.median <= options.connectTolerance * 0.3
    || offsets.median > options.maxOffsetWidth
    || offsets.p90 > options.maxOffsetWidth * 1.45
    || offsets.max > options.maxOffsetWidth * 2.75
  ) {
    return null;
  }
  return {
    bridgeIds,
    bridgeWidth: bridgeCluster.mean,
    cycles,
    offset: offsets.median,
    proof: "bridged-offset",
  };
}

function nodeIdsForGroup(group, topology) {
  const nodeIds = new Set();
  for (const id of group) {
    for (const nodeId of topology.nodeIdsByRecord.get(id) || []) nodeIds.add(nodeId);
  }
  return nodeIds;
}

function analyzeRelaxedBridgedStrip(
  recordIds,
  recordsById,
  topology,
  options,
  rejections = null,
) {
  const degrees = new Map();
  for (const id of recordIds) {
    for (const nodeId of topology.nodeIdsByRecord.get(id) || []) {
      degrees.set(nodeId, (degrees.get(nodeId) || 0) + 1);
    }
  }
  const bridges = [];
  for (const id of recordIds) {
    const record = recordsById.get(id);
    const nodeIds = topology.nodeIdsByRecord.get(id);
    if (record?.type !== "LINE" || !nodeIds) continue;
    if ((degrees.get(nodeIds[0]) || 0) < 3 || (degrees.get(nodeIds[1]) || 0) < 3) continue;
    const length = recordLength(record);
    if (length <= options.connectTolerance * 0.25 || length > options.maxOffsetWidth * 1.25) continue;
    bridges.push({ id, length, nodeIds });
  }
  if (bridges.length < 3) return null;
  const sortedLengths = bridges.map((bridge) => bridge.length).sort((a, b) => a - b);
  const medianLength = percentile(sortedLengths, 0.5);
  if (
    sortedLengths.at(-1) > medianLength * 1.55 + options.connectTolerance
    || sortedLengths[0] < medianLength * 0.45 - options.connectTolerance
  ) {
    return null;
  }
  const bridgeIds = new Set(bridges.map((bridge) => bridge.id));
  const groups = connectedRecordGroups(recordIds, recordsById, topology, bridgeIds);
  if (groups.length !== 2) return null;
  const cycles = groups.map((group) => (
    traceClosedCycle(group, recordsById, topology, options.connectTolerance)
  ));
  if (cycles.some((cycle) => !cycle || Math.abs(cycle.area) <= options.connectTolerance ** 2)) {
    return null;
  }
  const groupNodes = groups.map((group) => nodeIdsForGroup(group, topology));
  if (bridges.some((bridge) => !(
    (groupNodes[0].has(bridge.nodeIds[0]) && groupNodes[1].has(bridge.nodeIds[1]))
    || (groupNodes[1].has(bridge.nodeIds[0]) && groupNodes[0].has(bridge.nodeIds[1]))
  ))) {
    return null;
  }
  const candidate = relaxedOffsetCandidate(cycles[0], cycles[1], options, rejections);
  if (!candidate) return null;
  return {
    ...candidate,
    bridgeIds,
    bridgeWidth: bridges.reduce((sum, bridge) => sum + bridge.length, 0) / bridges.length,
    proof: "relaxed-bridged-offset",
  };
}

function analyzeRelaxedExteriorNetwork(
  recordIds,
  recordsById,
  topology,
  options,
  globalArea,
  rejections = null,
) {
  const reject = (reason, details = {}) => {
    rejections?.push({ reason: `exterior-${reason}`, ...details });
    return null;
  };
  const degrees = new Map();
  for (const id of recordIds) {
    for (const nodeId of topology.nodeIdsByRecord.get(id) || []) {
      degrees.set(nodeId, (degrees.get(nodeId) || 0) + 1);
    }
  }
  const junctionCount = [...degrees.values()].filter((degree) => degree >= 3).length;
  if (junctionCount < 4) return reject("too-few-junctions", { junctionCount });
  const bridgeCandidates = [];
  for (const id of recordIds) {
    const record = recordsById.get(id);
    const nodeIds = topology.nodeIdsByRecord.get(id);
    if (record?.type !== "LINE" || !nodeIds) continue;
    if ((degrees.get(nodeIds[0]) || 0) < 3 || (degrees.get(nodeIds[1]) || 0) < 3) continue;
    bridgeCandidates.push({ id, length: recordLength(record) });
  }
  const bridgeCluster = clusterShortBridgeLengths(
    bridgeCandidates,
    options.maxOffsetWidth,
    options.connectTolerance,
  );
  if (!bridgeCluster) return reject("no-repeated-short-bridge");
  if (bridgeCluster.items.length < 4) {
    return reject("too-few-short-bridges", { bridgeCount: bridgeCluster.items.length });
  }
  const bridgeIds = new Set(bridgeCluster.items.map((item) => item.id));
  const splitGroups = connectedRecordGroups(recordIds, recordsById, topology, bridgeIds);
  if (splitGroups.length < 3) {
    return reject("too-few-split-groups", { splitGroups: splitGroups.length });
  }
  const closedCycles = splitGroups
    .map((group) => traceClosedCycle(
      group,
      recordsById,
      topology,
      options.connectTolerance,
    ))
    .filter(Boolean);
  if (closedCycles.length !== 1) {
    return reject("non-unique-closed-survivor", { closedCycles: closedCycles.length });
  }
  const kept = closedCycles[0];
  if (boundsArea(kept.bounds) < globalArea * 0.7) {
    return reject("not-global-outline", {
      areaRatio: boundsArea(kept.bounds) / Math.max(globalArea, 1e-9),
    });
  }
  const keptIds = new Set(kept.entityIds);
  const removedIds = new Set([...recordIds].filter((id) => !keptIds.has(id)));
  if (removedIds.size < 4 || removedIds.size < keptIds.size * 0.5) {
    return reject("too-few-extra-edges", {
      kept: keptIds.size,
      removed: removedIds.size,
    });
  }

  for (const id of removedIds) {
    const record = recordsById.get(id);
    const stride = Math.max(1, Math.ceil(record.points.length / 32));
    for (let index = 0; index < record.points.length; index += stride) {
      const point = record.points[index];
      if (
        !pointInPolygon(point, kept.points)
        && pointPolylineDistance(point, kept.points) > options.connectTolerance * 2
      ) {
        return reject("edge-outside-outline", { id });
      }
    }
  }
  return {
    bridgeIds,
    bridgeWidth: bridgeCluster.mean,
    cycles: [kept],
    offset: bridgeCluster.mean,
    proof: "relaxed-exterior-network",
    exterior: true,
    keptIds,
    removedIds,
  };
}

function idsForStrip(strip) {
  if (strip.keptIds && strip.removedIds) {
    return new Set([...strip.keptIds, ...strip.removedIds]);
  }
  const ids = new Set(strip.bridgeIds);
  for (const cycle of strip.cycles) {
    for (const id of cycle.entityIds) ids.add(id);
  }
  return ids;
}

export function planChamferFilletRemoval(inputRecords, {
  connectTolerance = 0.05,
  maxOffsetWidth = 2,
  relaxed = false,
  diagnostics = false,
} = {}) {
  const records = inputRecords
    .map((record) => ({
      ...record,
      points: (record.points || []).filter(finitePoint).map((point) => ({ ...point })),
    }))
    .filter((record) => (
      Number.isFinite(record.id)
      && record.points.length >= 2
      && record.points.every(finitePoint)
    ));
  const recordsById = new Map(records.map((record) => [record.id, record]));
  const topology = createSpatialNodes(records, connectTolerance);
  const allIds = new Set(records.map((record) => record.id));
  const connected = connectedRecordGroups(allIds, recordsById, topology);
  const globalBounds = boundsForPoints(records.flatMap((record) => record.points));
  const globalArea = Math.max(boundsArea(globalBounds), 1e-9);
  const strictStrips = connected
    .map((group) => analyzeStrip(group, recordsById, topology, {
      connectTolerance,
      maxOffsetWidth,
    }))
    .filter(Boolean);
  const relaxedDiagnostics = diagnostics ? { rejections: [] } : null;
  let relaxedStrips = [];
  if (relaxed) {
    const strictIds = new Set(strictStrips.flatMap((strip) => [...idsForStrip(strip)]));
    const groupsWithoutStrictMatches = connected.filter(
      (group) => ![...group].some((id) => strictIds.has(id)),
    );
    const relaxedBridged = groupsWithoutStrictMatches
      .map((group) => analyzeRelaxedBridgedStrip(
        group,
        recordsById,
        topology,
        { connectTolerance, maxOffsetWidth },
        relaxedDiagnostics?.rejections,
      ))
      .filter(Boolean);
    const relaxedBridgedIds = new Set(relaxedBridged.flatMap((strip) => [...idsForStrip(strip)]));
    const groupsWithoutBridgedMatches = groupsWithoutStrictMatches.filter(
      (group) => ![...group].some((id) => relaxedBridgedIds.has(id)),
    );
    const relaxedExteriorNetworks = groupsWithoutBridgedMatches
      .map((group) => analyzeRelaxedExteriorNetwork(
        group,
        recordsById,
        topology,
        { connectTolerance, maxOffsetWidth },
        globalArea,
        relaxedDiagnostics?.rejections,
      ))
      .filter(Boolean);
    const relaxedExteriorIds = new Set(
      relaxedExteriorNetworks.flatMap((strip) => [...idsForStrip(strip)]),
    );
    const groupsWithoutExteriorMatches = groupsWithoutBridgedMatches.filter(
      (group) => ![...group].some((id) => relaxedExteriorIds.has(id)),
    );
    const relaxedUnbridged = findRelaxedOffsetStrips(
      groupsWithoutExteriorMatches,
      recordsById,
      topology,
      { connectTolerance, maxOffsetWidth },
      relaxedDiagnostics,
    );
    relaxedStrips = [...relaxedBridged, ...relaxedExteriorNetworks, ...relaxedUnbridged];
    if (relaxedDiagnostics) relaxedDiagnostics.bridgedAcceptedCount = relaxedBridged.length;
    if (relaxedDiagnostics) {
      relaxedDiagnostics.exteriorNetworkAcceptedCount = relaxedExteriorNetworks.length;
    }
  }
  const strips = [...strictStrips, ...relaxedStrips];
  if (!strips.length) {
    return {
      deleteIds: new Set(),
      keepIds: new Set(),
      strips: [],
      removedEntities: 0,
      diagnostics: diagnostics ? {
        connectedGroups: connected.length,
        strictStrips: strictStrips.length,
        relaxed: relaxedDiagnostics,
      } : undefined,
    };
  }

  const deleteIds = new Set();
  const keepIds = new Set();
  for (const strip of strips) {
    if (strip.keptIds && strip.removedIds) {
      for (const id of strip.removedIds) deleteIds.add(id);
      for (const id of strip.keptIds) keepIds.add(id);
      continue;
    }
    const [first, second] = strip.cycles;
    const larger = Math.abs(first.area) >= Math.abs(second.area) ? first : second;
    const smaller = larger === first ? second : first;
    const exterior = boundsArea(larger.bounds) >= globalArea * 0.7;
    const kept = exterior ? larger : smaller;
    const removed = exterior ? smaller : larger;
    for (const id of strip.bridgeIds) deleteIds.add(id);
    for (const id of removed.entityIds) deleteIds.add(id);
    for (const id of kept.entityIds) keepIds.add(id);
    strip.exterior = exterior;
    strip.keptIds = new Set(kept.entityIds);
    strip.removedIds = new Set(removed.entityIds);
  }
  return {
    deleteIds,
    keepIds,
    strips,
    removedEntities: deleteIds.size,
    diagnostics: diagnostics ? {
      connectedGroups: connected.length,
      strictStrips: strictStrips.length,
      relaxed: relaxedDiagnostics,
    } : undefined,
  };
}
