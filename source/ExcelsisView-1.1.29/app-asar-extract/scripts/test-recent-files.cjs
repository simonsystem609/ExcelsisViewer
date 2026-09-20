const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { createRecentFiles, sectionForPath, LIMIT_PER_SECTION, MAX_HISTORY_BYTES } = require("../recent-files.cjs");
const file = (name) => path.resolve("synthetic-recent-files", name);

async function run() {
  let saved = null;
  let time = 1000;
  const writes = [];
  const store = createRecentFiles({ read: async () => saved, write: async (text) => { saved = text; writes.push(JSON.parse(text)); }, now: () => ++time });
  await Promise.all([store.remember(file("one.dxf")), store.remember(file("two.DWG")), store.remember(file("three.pdf"))]);
  assert.equal((await store.list("dxf")).entries.length, 1);
  assert.equal((await store.list("dwg")).entries.length, 1);
  assert.equal((await store.list("pdf")).entries.length, 1);
  await store.remember(file("ONE.DXF"));
  let result = await store.list("dxf");
  assert.equal(result.entries.length, 1, "Windows paths must deduplicate without case sensitivity.");
  assert.equal(result.entries[0].name, "ONE.DXF");
  assert.equal(await store.resolve("dwg", result.entries[0].id), null, "Cannot open an id from another section.");
  assert.equal(await store.resolve("dxf", file("one.dxf")), null, "Opening requires an opaque stored id, not an arbitrary path.");
  assert.equal((await store.resolve("dxf", result.entries[0].id)).path, file("ONE.DXF"));
  assert.equal(await store.remember(file("bad.exe")), false);
  assert.equal(sectionForPath("relative.dxf"), null);
  assert.equal(sectionForPath(file("null\0.dxf")), null);
  await Promise.all(Array.from({ length: 70 }, (_, i) => store.remember(file(`${i}.dxf`))));
  result = await store.list("dxf");
  assert.equal(result.entries.length, LIMIT_PER_SECTION);
  assert.equal(result.entries[0].name, "69.dxf");
  assert.equal(result.entries.at(-1).name, "10.dxf");
  assert.equal((await store.list("dwg")).entries.length, 1, "DXF trimming must not trim the other sections.");
  assert.equal(writes.at(-1).entries.length, LIMIT_PER_SECTION + 2, "Concurrent writes must serialize without losing other windows' opens.");
  const restored = createRecentFiles({ read: async () => saved, write: async () => {} });
  assert.deepEqual(await restored.list("dxf"), result, "History must survive restart.");
  for (const raw of ["bad json", "{}", "x".repeat(MAX_HISTORY_BYTES + 1)]) {
    const invalid = createRecentFiles({ read: async () => raw, write: async () => {} });
    assert.equal((await invalid.list("pdf")).entries.length, 0);
    assert((await invalid.list("pdf")).warning);
    await invalid.remember(file("recovered.pdf"));
    assert.equal((await invalid.list("pdf")).entries.length, 1);
  }
  const session = createRecentFiles({ read: async () => null, write: async () => { throw new Error("denied"); } });
  await session.remember(file("local.pdf"));
  assert.match((await session.list("pdf")).warning, /session/);
  assert.equal((await session.list("pdf")).entries.length, 1);
  await assert.rejects(store.list("exe"));
  const read = (p) => fs.readFileSync(path.resolve(__dirname, "..", p), "utf8");
  const main = read("main.cjs");
  const view = read("modules/shared/recents.mjs");
  assert.match(main, /handleTrusted\("recents:list", \["dxf", "3dpdf"\]/);
  assert.match(main, /handleTrusted\("recents:open", \["dxf", "3dpdf"\]/);
  assert.match(main, /getRecentFiles\(\).resolve\(section, id\)/);
  assert.match(main, /win.excelsisIconKind === "dwg"/);
  assert.match(main, /findExistingWindowForFile\(entry.path\)/);
  assert.match(main, /if \(!claim && pending\?\.path/);
  assert.doesNotMatch(view, /innerHTML|insertAdjacentHTML/);
  assert.match(view, /dialog.showModal\(\)/);
  assert.match(read("modules/shared/recents.css"), /width: 96vw; max-width: none/, "Recents must remain nearly full-width even on large displays.");
  assert.match(view, /event.stopImmediatePropagation\(\)/);
  for (const html of ["modules/dxf/index.html", "modules/3dpdf/index.html"]) {
    assert.match(read(html), /shared\/recents.mjs/);
    assert.match(read(html), /shared\/recents.css/);
  }
  assert(JSON.parse(read("package.json")).build.files.includes("recent-files.cjs"));
  assert.match(read("scripts/package-corresponding-source.ps1"), /"recent-files.cjs"/);
  console.log(JSON.stringify({ sharedHistory: true, strictSectionIsolation: true, persistence: true, boundedHistory: true, orderedWrites: true, recovery: true, safeDom: true }));
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
