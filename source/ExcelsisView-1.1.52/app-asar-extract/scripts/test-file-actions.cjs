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
  assert.equal(await fs.readFile(source, "utf8"), "original contents", "Never silently delete on recycle failure");
  let permanentCalls = 0, permanentPrompts = 0;
  const failedRecycle = async () => { throw new Error("Recycle Bin unavailable"); };
  const permanentIo = { ...fs, unlink: async (...args) => {
    assert.equal(args.length, 1, "The fallback must pass one exact file path, no options");
    assert.equal(path.dirname(args[0]), root);
    permanentCalls++;
    // Exercise the real service boundary without destroying even synthetic data.
    await fs.rename(args[0], path.join(root, `permanent-recovery-${permanentCalls}-${path.basename(args[0])}`));
  } };
  const neighbor = path.join(root, "must-stay.dxf");
  const childFolder = path.join(root, "must-stay-folder.dxf");
  await fs.writeFile(neighbor, "neighbor survives");
  await fs.mkdir(childFolder);
  await fs.writeFile(path.join(childFolder, "inside.txt"), "folder survives");
  for (const extension of ["dxf", "dwg", "pdf"]) {
    const target = path.join(root, `nas-fallback.${extension}`);
    await fs.writeFile(target, `nas-${extension}`);
    const canceled = createFileActions({ assertCurrent: () => token, trash: failedRecycle, io: permanentIo,
      confirmPermanentDelete: async (owner, file, error) => {
        permanentPrompts++;
        assert.equal(owner, 7); assert.equal(file, target);
        assert.match(error.message, /Recycle Bin/);
        return false;
      } });
    assert.deepEqual(await canceled.run(7, target, "delete"), { ok: false, canceled: true, path: target });
    assert.equal(await fs.readFile(target, "utf8"), `nas-${extension}`);
    const approved = createFileActions({ assertCurrent: () => token, trash: failedRecycle, io: permanentIo,
      confirmPermanentDelete: async () => { permanentPrompts++; return true; } });
    const removed = await approved.run(7, target, "delete");
    assert.equal(removed.permanent, true);
    assert.equal(await fs.readFile(path.join(root, `permanent-recovery-${permanentCalls}-${path.basename(target)}`), "utf8"), `nas-${extension}`);
  }
  assert.equal(permanentCalls, 3);
  assert.equal(permanentPrompts, 6);
  const recycledWithoutPrompt = createFileActions({ assertCurrent: () => token,
    trash: async () => {}, io: permanentIo,
    confirmPermanentDelete: async () => { throw new Error("Must not ask after successful recycling"); } });
  assert.equal((await recycledWithoutPrompt.run(7, source, "delete")).permanent, false);
  const nonBooleanApproval = createFileActions({ assertCurrent: () => token, trash: failedRecycle, io: permanentIo,
    confirmPermanentDelete: async () => "yes" });
  assert.equal((await nonBooleanApproval.run(7, source, "delete")).canceled, true);
  const changedDuringPrompt = createFileActions({ assertCurrent: () => token, trash: failedRecycle, io: permanentIo,
    confirmPermanentDelete: async () => { await fs.writeFile(source, "external modification survives"); return true; } });
  await assert.rejects(changedDuringPrompt.run(7, source, "delete"), /file changed while deletion was pending/);
  assert.equal(await fs.readFile(source, "utf8"), "external modification survives");
  const switchedDuringPrompt = createFileActions({ assertCurrent: () => token, trash: failedRecycle, io: permanentIo,
    confirmPermanentDelete: async () => { token++; return true; } });
  await assert.rejects(switchedDuringPrompt.run(7, source, "delete"), /open file changed/);
  const changedBeforePrompt = createFileActions({ assertCurrent: () => token, io: permanentIo,
    trash: async () => { await fs.writeFile(source, "changed before warning survives"); throw new Error("Cannot recycle"); },
    confirmPermanentDelete: async () => { throw new Error("Changed target must not reach confirmation"); } });
  await assert.rejects(changedBeforePrompt.run(7, source, "delete"), /file changed while deletion was pending/);
  await assert.rejects(nonBooleanApproval.run(7, childFolder, "delete"), /regular files/);
  await assert.rejects(nonBooleanApproval.run(7, source, "delete-recursively"), /Unknown file action/);
  for (const replacement of ["directory", "symlink"]) {
    let checks = 0;
    const original = await fs.lstat(source);
    const switchedType = createFileActions({ assertCurrent: () => token, trash: failedRecycle,
      confirmPermanentDelete: async () => true,
      io: { ...permanentIo, lstat: async () => (++checks < 3 ? original : {
        ...original, isFile: () => replacement !== "directory", isSymbolicLink: () => replacement === "symlink",
      }) } });
    await assert.rejects(switchedType.run(7, source, "delete"), /file changed while deletion was pending/);
  }
  let failedUnlinks = 0;
  const deleteFailure = createFileActions({ assertCurrent: () => token, trash: failedRecycle,
    confirmPermanentDelete: async () => true,
    io: { ...fs, unlink: async (...args) => {
      assert.deepEqual(args, [source]); failedUnlinks++;
      throw Object.assign(new Error("File is locked; deletion denied"), { code: "EACCES" });
    } } });
  await assert.rejects(deleteFailure.run(7, source, "delete"), /File is locked/);
  assert.equal(failedUnlinks, 1, "No retry, folder wipe, or cleanup fallback after unlink fails");
  assert.equal(deleteFailure.isBusy(7, source), false);
  let promptReady, releasePrompt;
  const ready = new Promise(resolve => { promptReady = resolve; });
  const heldConfirmation = createFileActions({ assertCurrent: () => token, trash: failedRecycle, io: permanentIo,
    confirmPermanentDelete: async () => { promptReady(); return new Promise(resolve => { releasePrompt = resolve; }); } });
  const heldDelete = heldConfirmation.run(7, source, "delete");
  await ready;
  assert(heldConfirmation.isBusy(7, source));
  await assert.rejects(heldConfirmation.run(7, source, "rename", "blocked.dxf"), /progress/);
  releasePrompt(false);
  assert.equal((await heldDelete).canceled, true);
  assert.equal(heldConfirmation.isBusy(7, source), false);
  assert.equal(permanentCalls, 3, "No additional destructive adapter calls on cancel, changed target, or bad type");
  assert.equal(await fs.readFile(neighbor, "utf8"), "neighbor survives");
  assert.equal(await fs.readFile(path.join(childFolder, "inside.txt"), "utf8"), "folder survives");
  console.log(JSON.stringify({ validation: true, preservesBytes: true, caseOnlyRename: true, noOverwrite: true, allFormats: true, staleClaim: true, concurrentGuard: true, recoverableDelete: true,
    permanentDelete: { secondConfirmation: true, defaultNoFallback: true, cancelPreservesFile: true, strictApproval: true, rechecksIdentityAndClaim: true, directoriesAndLinksRejected: true, oneExactPathOnly: true, failureStopsWithoutRetry: true, neighborsAndFoldersUntouched: true, syntheticRecoveryAdapter: true }, evidence: root }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
