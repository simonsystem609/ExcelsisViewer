import { planChamferFilletRemoval } from "./contour-cleanup.mjs";

export async function runDxfGeometryTask(type, payload) {
  if (type === "chamfer-fillet-plan") {
    return planChamferFilletRemoval(payload?.records || [], payload?.options || {});
  }
  throw new Error(`Unknown DXF background task: ${type}`);
}

if (typeof self !== "undefined") {
  self.addEventListener("message", async (event) => {
    const taskId = Number(event.data?.taskId);
    try {
      const result = await runDxfGeometryTask(event.data?.type, event.data?.payload);
      self.postMessage({ taskId, result });
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
