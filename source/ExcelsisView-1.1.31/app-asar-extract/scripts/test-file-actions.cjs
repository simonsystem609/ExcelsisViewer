const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { createFileActions, renamedDocumentPath, renameWithoutOverwrite } = require("../file-actions.cjs");

async function main() {
  // All synthetic evidence stays recoverable; no user file or OS trash touched.
  const root = await fs.mkdtemp(path.join(require("node:os").tmpdir(), "excelsis-file-actions-"));
  const source = path.join(root, "Original.DXF");
  for (const name of ["", " ", ".dxf", "../bad.dxf", "dir\\bad.dxf", "C:\\bad.dxf", "bad:dxf", "nul.dxf", "CON.txt.dxf", "COM1.dxf", "LPT².dxf", "name.dxf.", "name.dxf ", "bad\0.dxf", "bad?.dxf", "name.exe", "name.pdf", "x".repeat(256) + ".dxf"]) {
    assert.throws(() => renamedDocumentPath(source, name), undefined, name);
  }
  assert.equal(renamedDocumentPath(source, "részlet [2].dxf"), path.join(root, "részlet [2].dxf"));
  let current = source, token = 1, deny = false;
  let trashCalls = 0;
  const service = createFileActions({
    assertCurrent(owner, file) {
      assert.equal(owner, 7);
      if (deny || file !== current) throw new Error("Not the sole current owner");
      return token;
    },
    trash: async (file) => { trashCalls++; await fs.rename(file, path.join(root, `recovered-${path.basename(file)}`)); },
  });
  await fs.writeFile(source, "original contents");
  await assert.rejects(service.run(7, path.join(root, "neighbor.dxf"), "delete"), /owner/);
  deny = true;
  await assert.rejects(service.run(7, source, "delete"), /owner/);
  deny = false;
  const duplicate = path.join(root, "duplicate.dxf");
  await fs.writeFile(duplicate, "must survive");
  await assert.rejects(service.run(7, source, "rename", path.basename(duplicate)), /already exists/);
  assert.equal(await fs.readFile(duplicate, "utf8"), "must survive");
  // Test the OS no-overwrite primitive independently of the pre-check.
  await assert.rejects(renameWithoutOverwrite(source, duplicate));
  assert.equal(await fs.readFile(source, "utf8"), "original contents");
  assert.equal(await fs.readFile(duplicate, "utf8"), "must survive");
  for (const extension of ["dxf", "dwg", "pdf"]) {
    current = path.join(root, `input.${extension}`);
    await fs.writeFile(current, `bytes-${extension}`);
    const renamed = await service.run(7, current, "rename", `részlet [2]; $notCode.${extension}`);
    assert.equal(await fs.readFile(renamed.path, "utf8"), `bytes-${extension}`);
    await assert.rejects(fs.stat(current), { code: "ENOENT" });
    current = renamed.path;
    const recased = await service.run(7, current, "rename", path.basename(current).toUpperCase());
    assert((await fs.readdir(root)).includes(path.basename(recased.path)), "Case-only rename must update the real directory entry");
    current = recased.path;
    await service.run(7, current, "delete");
    assert.equal(await fs.readFile(path.join(root, `recovered-${path.basename(current)}`), "utf8"), `bytes-${extension}`);
  }
  assert.equal(trashCalls, 3);
  current = source;
  let resume;
  const slow = createFileActions({
    assertCurrent: () => token,
    io: { lstat: async () => { await new Promise(resolve => { resume = resolve; }); return { isFile: () => true, isSymbolicLink: () => false }; } },
    trash: async () => { throw new Error("Must not reach trash after claim changed"); },
  });
  const pending = slow.run(7, source, "delete");
  assert(slow.isBusy(7, source));
  await assert.rejects(slow.run(7, source, "delete"), /progress/);
  token++; resume();
  await assert.rejects(pending, /open file changed/);
  assert.equal(slow.isBusy(7, source), false);
  const unavailableTrash = createFileActions({ assertCurrent: () => token, trash: async () => { throw new Error("Recycle Bin unavailable"); } });
  await assert.rejects(unavailableTrash.run(7, source, "delete"), /Recycle Bin unavailable/);
  assert.equal(await fs.readFile(source, "utf8"), "original contents", "Never permanently delete on recycle failure");
  console.log(JSON.stringify({ validation: true, preservesBytes: true, caseOnlyRename: true, noOverwrite: true, allFormats: true, staleClaim: true, concurrentGuard: true, recoverableDelete: true, evidence: root }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
