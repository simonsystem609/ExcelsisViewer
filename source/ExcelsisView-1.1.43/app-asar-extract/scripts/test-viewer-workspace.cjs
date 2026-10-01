// Synthetic, local model/path-label tests; no Electron or filesystem mutations.
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createWorkspaceModel, folderLabel, sectionForPath, allowsEntryNavigation, MAX_OPEN_DOCUMENTS } = require('../viewer-workspace.cjs');

async function run() {
  const { fitFolderPath, middleCut } = await import(pathToFileURL(path.join(__dirname, '../modules/shared/path-label.mjs')));
  const folders = ['Large parent folder', 'Manufacturing assemblies', 'Drawing versions'];
  const full = folders.join(' › '), measure = value => Array.from(value).length;
  assert.equal(fitFolderPath(folders, measure(full), measure), full, 'Never shorten when the full path fits');
  const short = fitFolderPath(folders, 34, measure);
  assert(measure(short) <= 34);
  assert.equal(short.split(' › ').length, 3);
  for (const [index, name] of short.split(' › ').entries()) {
    assert(name.includes('…'));
    assert.equal(name[0], folders[index][0]);
    assert.equal(name.at(-1), folders[index].at(-1));
  }
  assert.equal(middleCut('abcdefghijkl', 7), 'abc…jkl');
  assert.equal(middleCut('Árvíz😀tűrő', 6), 'Árv…rő');
  assert.equal(fitFolderPath(['ignored', 'one', 'two', 'three'], 100, measure), 'one › two › three');
  assert.equal(fitFolderPath(['one', 'two', 'three'], 9, measure), '… › … › …');
  assert.equal(sectionForPath('PART.DWG'), 'dwg');
  assert.equal(sectionForPath('Drawing.PDF'), 'pdf');
  assert.equal(folderLabel('C:\\Root\\First\\Second\\Third\\A.dxf'), 'First › Second › Third');
  const entry = 'app://excelsis/modules/dxf/index.html';
  assert.equal(allowsEntryNavigation(entry, entry), true);
  for (const target of [entry + '?file=other', entry + '#other', 'https://example.com/',
    'file:///C:/private.txt', 'not-a-url']) {
    assert.equal(allowsEntryNavigation(entry, target), false, `Blocked navigation: ${target}`);
  }

  for (const section of ['dxf', 'dwg', 'pdf']) {
    const model = createWorkspaceModel(section), docs = [];
    for (let index = 0; index < 8; index++) {
      const folder = index < 6 ? 'C:\\Root\\First\\Second\\Third' : 'C:\\Other\\First\\Second\\Third';
      docs.push(model.add(path.join(folder, `Part ${index}.${section}`)));
      assert.equal(model.mode, index ? 'tiles' : 'single');
      assert.equal(model.visibleIds.length, Math.min(index + 1, 6));
    }
    assert.deepEqual(model.visibleIds, [...docs.slice(0, 5), docs[7]].map(doc => doc.id));
    assert.equal(model.snapshot().folders.length, 2, 'Equal display suffixes are not equal folder identities');
    assert.deepEqual(model.snapshot().folders.map(folder => folder.files.length), [6, 2]);
    assert.equal(model.add(docs[2].path.toUpperCase()).id, docs[2].id);
    assert.equal(model.documents.size, 8, 'Duplicate/case-only opens reuse the document');
    assert.equal(model.mode, 'single');
    docs[2].status = { dirty: true };
    assert(model.snapshot().folders[0].files.find(file => file.id === docs[2].id).dirty);
    model.overview(); model.select(docs[5].id);
    assert.deepEqual(model.visibleIds, [...docs.slice(0, 5), docs[5]].map(doc => doc.id));
    model.rename(docs[5].id, `C:\\Renamed\\Folder\\Path\\New.${section}`);
    assert.equal(model.snapshot().folders.length, 3);
    model.remove(docs[5].id);
    assert(!model.snapshot().folders.flatMap(folder => folder.files).some(file => file.id === docs[5].id));
    for (const id of [...model.documents.keys()]) model.remove(id);
    assert.equal(model.mode, 'single'); assert.equal(model.activeId, null); assert.deepEqual(model.visibleIds, []);
  }
  const bounded = createWorkspaceModel('dxf');
  for (let index = 0; index < MAX_OPEN_DOCUMENTS; index++) bounded.add(`C:\\Synthetic\\${index}.dxf`);
  assert.throws(() => bounded.add('C:\\Synthetic\\overflow.dxf'), /safety limit/);
  console.log(JSON.stringify({ passed: true, threeFolderLabels: true, conditionalMiddleCut: true,
    unicode: true, sixTileOverflow: true, exactFolderIdentity: true, duplicates: true, allModules: true, bounded: true }));
}
run().catch(error => { console.error(error); process.exitCode = 1; });
