const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { inspectInstalledMacros, isMacroLockError, replaceInstalledMacros } =
  require("../macro-update-files.cjs");

const sha256 = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");

async function main() {
  const documents = await fs.mkdtemp(path.join(os.tmpdir(), "excelsis-macro-update-test-"));
  const macros = path.join(documents, "Excelsis Helper", "Macros");
  const names = ["DXF_v16.swp", "DXF_v16_ROfriendy.swp"];
  const old = [Buffer.alloc(128, 11), Buffer.alloc(128, 22)];
  const newer = [Buffer.alloc(128, 33), Buffer.alloc(128, 44)];
  try {
    await fs.mkdir(macros, { recursive: true });
    for (let i = 0; i < names.length; i += 1) {
      await fs.writeFile(path.join(macros, names[i]), old[i]);
    }
    const marker = path.join(macros, ".bundled-macros.json");
    await fs.writeFile(marker, JSON.stringify({ schema: "excelsis-bundled-macros-v2",
      appVersion: "1.4.19", files: names }));
    const assets = names.map((name, index) => ({ name, bytes: newer[index],
      sha256: sha256(newer[index]) }));
    const before = await inspectInstalledMacros(documents, "1.4.19", names);
    assert.deepEqual(before.current.map((entry) => entry.sha256), old.map(sha256));
    await assert.rejects(() => inspectInstalledMacros(documents, "1.4.18", names), /Start Helper/i);
    await assert.rejects(() => replaceInstalledMacros(documents, "1.4.19", "20260923.1",
      [{ ...assets[0], sha256: "a".repeat(64) }]), /SHA-256/i);

    const originalRename = fs.rename;
    let lockInjected = false;
    fs.rename = async (from, to) => {
      if (!lockInjected && from.includes(names[1]) && from.endsWith(".part") &&
          to === path.join(macros, names[1])) {
        lockInjected = true;
        const error = new Error("SOLIDWORKS has the macro open");
        error.code = "EBUSY";
        throw error;
      }
      return originalRename(from, to);
    };
    try {
      await assert.rejects(() => replaceInstalledMacros(documents, "1.4.19",
        "20260923.1", assets), (error) => isMacroLockError(error));
    } finally { fs.rename = originalRename; }
    assert.equal(lockInjected, true);
    for (let i = 0; i < names.length; i += 1) {
      assert.deepEqual(await fs.readFile(path.join(macros, names[i])), old[i],
        "A lock must roll back every previously replaced macro.");
    }
    const result = await replaceInstalledMacros(documents, "1.4.19", "20260923.1", assets);
    assert.deepEqual(result.updated, names);
    for (let i = 0; i < names.length; i += 1) {
      assert.deepEqual(await fs.readFile(path.join(macros, names[i])), newer[i]);
      assert.deepEqual(await fs.readFile(path.join(result.backupFolder, names[i])), old[i]);
    }
    const again = await replaceInstalledMacros(documents, "1.4.19", "20260923.1", assets);
    assert.equal(again.alreadyCurrent, true);
    console.log("Macro update backup, lock rollback, hash and retry tests passed.");
  } finally {
    await fs.rm(documents, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
