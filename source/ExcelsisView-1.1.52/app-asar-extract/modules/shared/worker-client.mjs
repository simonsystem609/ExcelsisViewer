function workerError(value, fallback = "Background task failed.") {
  const error = new Error(String(value?.message || fallback));
  if (value?.name) error.name = String(value.name);
  if (value?.stack) error.stack = String(value.stack);
  return error;
}

export function createWorkerTaskClient(workerUrl, {
  name = "excelsis-worker",
  type = "module",
  defaultTimeoutMs = 10 * 60 * 1000,
} = {}) {
  let worker = null;
  let nextTaskId = 1;
  let disposed = false;
  const pending = new Map();

  const rejectAll = (error) => {
    for (const task of pending.values()) {
      clearTimeout(task.timeout);
      task.reject(error);
    }
    pending.clear();
  };

  const ensureWorker = () => {
    if (disposed) throw new Error(`${name} is already disposed.`);
    if (worker) return worker;
    worker = new Worker(workerUrl, { name, type });
    worker.addEventListener("message", (event) => {
      const taskId = Number(event.data?.taskId);
      const task = pending.get(taskId);
      if (!task) return;
      pending.delete(taskId);
      clearTimeout(task.timeout);
      if (event.data?.error) task.reject(workerError(event.data.error));
      else task.resolve(event.data?.result);
    });
    worker.addEventListener("error", (event) => {
      const error = workerError(event.error || { message: event.message }, `${name} crashed.`);
      rejectAll(error);
      worker?.terminate();
      worker = null;
    });
    worker.addEventListener("messageerror", () => {
      const error = new Error(`${name} returned an unreadable result.`);
      rejectAll(error);
      worker?.terminate();
      worker = null;
    });
    return worker;
  };

  const run = (typeName, payload, {
    transfer = [],
    timeoutMs = defaultTimeoutMs,
  } = {}) => new Promise((resolve, reject) => {
    const activeWorker = ensureWorker();
    const taskId = nextTaskId++;
    const timeout = Number.isFinite(timeoutMs) && timeoutMs > 0
      ? setTimeout(() => {
        const error = new Error(`${name} timed out.`);
        activeWorker.terminate();
        if (worker === activeWorker) worker = null;
        rejectAll(error);
      }, timeoutMs)
      : 0;
    pending.set(taskId, { reject, resolve, timeout });
    try {
      activeWorker.postMessage({ taskId, type: typeName, payload }, transfer);
    } catch (error) {
      pending.delete(taskId);
      clearTimeout(timeout);
      reject(error);
    }
  });

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    worker?.terminate();
    worker = null;
    rejectAll(new Error(`${name} was closed.`));
  };

  return {
    dispose,
    run,
  };
}
