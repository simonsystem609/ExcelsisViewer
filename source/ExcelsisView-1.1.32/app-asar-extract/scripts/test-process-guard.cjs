const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { runGuardedProcess } = require("../guarded-process.cjs");

async function main() {
  const projectRoot = path.resolve(__dirname, "..");
  const processGuardPath = path.join(projectRoot, "native", "process-guard.exe");
  const sandboxDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "excelsis-process-guard-"),
  );
  const isolatedChildPath = path.join(sandboxDirectory, "guard-child.exe");
  const readablePath = path.join(sandboxDirectory, "inside.txt");
  const deniedDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "excelsis-process-guard-denied-"),
  );
  const deniedPath = path.join(deniedDirectory, "outside.txt");
  await Promise.all([
    fs.copyFile(processGuardPath, isolatedChildPath),
    fs.writeFile(readablePath, "inside"),
    fs.writeFile(deniedPath, "outside"),
  ]);

  await runGuardedProcess({
    processGuardPath,
    executablePath: isolatedChildPath,
    args: ["--self-test-appcontainer"],
    timeoutMs: 10_000,
    memoryMiB: 256,
    cpuSeconds: 10,
    sandboxReadWriteDirectories: [sandboxDirectory],
  });
  await runGuardedProcess({
    processGuardPath,
    executablePath: isolatedChildPath,
    args: ["--self-test-read", readablePath],
    timeoutMs: 10_000,
    memoryMiB: 256,
    cpuSeconds: 10,
    sandboxReadWriteDirectories: [sandboxDirectory],
  });
  await runGuardedProcess({
    processGuardPath,
    executablePath: isolatedChildPath,
    args: ["--self-test-deny-read", deniedPath],
    timeoutMs: 10_000,
    memoryMiB: 256,
    cpuSeconds: 10,
    sandboxReadWriteDirectories: [sandboxDirectory],
  });
  await assert.rejects(
    runGuardedProcess({
      processGuardPath,
      executablePath: isolatedChildPath,
      args: ["--self-test-sleep-ms", "10000"],
      timeoutMs: 250,
      memoryMiB: 256,
      cpuSeconds: 10,
      sandboxReadWriteDirectories: [sandboxDirectory],
    }),
    /exceeded its .* second limit/,
  );
  console.log("Native AppContainer, file isolation, and Job Object checks passed.");
}

main().catch((error) => {
  console.error(error?.stack || error);
  process.exitCode = 1;
});
