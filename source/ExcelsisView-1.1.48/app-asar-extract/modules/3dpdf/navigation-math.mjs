// Model units are not necessarily millimetres. Keep close-up limits relative to
// the picked component, with only a tiny numerical floor for ray/camera math.
export function minimumSurfaceDepth(surfaceScale) {
  return Math.max(1e-7, Math.min(surfaceScale * 1e-5, 1e-3));
}

export function zoomedSurfaceDepth(depth, wheelDelta, surfaceScale, maxDepth, hasSurface = true) {
  const minimum = hasSurface
    ? minimumSurfaceDepth(surfaceScale)
    : Math.min(depth, Math.max(minimumSurfaceDepth(surfaceScale), surfaceScale * 0.01));
  const factor = Math.exp(Math.max(-2, Math.min(2, wheelDelta * 0.001)));
  return Math.max(minimum, Math.min(maxDepth, depth * factor));
}

export function closeUpBoost(depth, surfaceScale, cap) {
  if (!(depth > 0) || !(surfaceScale > 0)) return 1;
  return Math.min(cap, Math.max(1, Math.sqrt(surfaceScale * 0.08 / depth)));
}

export function cameraClipping(distance, centerZ, modelRadius, focusDepth = null) {
  const margin = Math.max(modelRadius * 1.15, 1);
  const centerDepth = distance - centerZ;
  const assemblyNear = Math.max(0.01, centerDepth - margin);
  const near = focusDepth > 0
    ? Math.max(1e-7, Math.min(assemblyNear, focusDepth * 0.1))
    : assemblyNear;
  return {
    near,
    far: Math.max(near + 1, centerDepth + margin, focusDepth > 0 ? focusDepth * 1.5 : 0),
  };
}
