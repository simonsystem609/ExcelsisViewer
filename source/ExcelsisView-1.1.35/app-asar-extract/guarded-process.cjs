const fs = require("node:fs");
const { spawn } = require("node:child_process");
const path = require("node:path");

function runGuardedProcess(options) {
  const guardPath = path.resolve(String(options.processGuardPath || ""));
  const executablePath = path.resolve(String(options.executablePath || ""));
  if (!fs.statSync(guardPath).isFile()) {
    throw new Error("The native process guard is unavailable.");
  }
  if (!fs.statSync(executablePath).isFile()) {
    throw new Error("The native decoder is unavailable.");
  }

  const timeoutMs = Math.max(100, Math.min(3_600_000, Number(options.timeoutMs) || 180_000));
  const memoryMiB = Math.max(64, Math.min(16_384, Number(options.memoryMiB) || 1024));
  const activeProcesses = Math.max(1, Math.min(64, Number(options.activeProcesses) || 1));
  const cpuSeconds = Math.max(1, Math.min(3600, Number(options.cpuSeconds) || 180));
  const stderrLimit = Math.max(1024, Math.min(1024 * 1024, Number(options.stderrLimit) || 128 * 1024));
  const sandbox = options.sandbox === "none" ? "none" : "appcontainer";
  const resolveSandboxDirectories = (values) => (values || []).map((value) => {
    const directory = path.resolve(String(value || ""));
    if (!fs.statSync(directory).isDirectory()) {
      throw new Error(`Native decoder sandbox path is not a directory: ${directory}`);
    }
    return directory;
  });
  const sandboxReadOnlyDirectories = resolveSandboxDirectories(
    options.sandboxReadOnlyDirectories,
  );
  const sandboxReadWriteDirectories = resolveSandboxDirectories(
    options.sandboxReadWriteDirectories,
  );
  if (sandbox === "appcontainer" && !sandboxReadWriteDirectories.length) {
    throw new Error("Native decoder AppContainer requires an isolated writable directory.");
  }
  const outputLimits = (options.outputLimits || []).map((entry) => ({
    path: path.resolve(entry.path),
    maximumBytes: Math.max(1, Number(entry.maximumBytes) || 1),
  }));
  const guardArguments = [
    "--memory-mib", String(memoryMiB),
    "--active-processes", String(activeProcesses),
    "--cpu-seconds", String(cpuSeconds),
    "--timeout-ms", String(timeoutMs),
    "--sandbox", sandbox,
  ];
  for (const directory of sandboxReadOnlyDirectories) {
    guardArguments.push("--sandbox-ro", directory);
  }
  for (const directory of sandboxReadWriteDirectories) {
    guardArguments.push("--sandbox-rw", directory);
  }
  if (outputLimits.length) {
    guardArguments.push(
      "--output", outputLimits[0].path,
      "--output-max-mib", String(Math.ceil(outputLimits[0].maximumBytes / 1024 / 1024)),
    );
  }
  guardArguments.push("--", executablePath, ...(options.args || []).map(String));

  return new Promise((resolve, reject) => {
    const child = spawn(guardPath, guardArguments, {
      cwd: options.cwd,
      windowsHide: true,
      stdio: ["ignore", "ignore", "pipe"],
    });
    let stderr = "";
    let settled = false;
    let limitViolation = null;
    const fallback = setTimeout(() => {
      if (!settled) child.kill();
    }, timeoutMs + 10_000);
    const outputMonitor = outputLimits.length ? setInterval(() => {
      for (const entry of outputLimits) {
        try {
          if (fs.statSync(entry.path).size > entry.maximumBytes) {
            limitViolation = new Error(`Native decoder output exceeded its ${Math.round(entry.maximumBytes / 1024 / 1024)} MiB limit.`);
            child.kill();
            break;
          }
        } catch (error) {
          if (error?.code !== "ENOENT") {
            limitViolation = error;
            child.kill();
            break;
          }
        }
      }
    }, 250) : null;

    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      if (stderr.length < stderrLimit) stderr += chunk.slice(0, stderrLimit - stderr.length);
    });
    child.once("error", (error) => {
      settled = true;
      clearTimeout(fallback);
      if (outputMonitor) clearInterval(outputMonitor);
      reject(error);
    });
    child.once("exit", (code, signal) => {
      settled = true;
      clearTimeout(fallback);
      if (outputMonitor) clearInterval(outputMonitor);
      if (limitViolation) {
        reject(limitViolation);
        return;
      }
      if (code === 0) {
        resolve({ stderr });
        return;
      }
      const detail = stderr.trim().split(/\r?\n/).filter(Boolean).at(-1);
      if (code === 124) {
        reject(new Error(`Native decoder exceeded its ${Math.round(timeoutMs / 1000)} second limit.`));
      } else if (code === 126) {
        reject(new Error("Native decoder output exceeded its configured limit."));
      } else {
        reject(new Error(detail || `Native decoder failed (exit ${code ?? signal ?? "unknown"}).`));
      }
    });
  });
}

module.exports = { runGuardedProcess };
