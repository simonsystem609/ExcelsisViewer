const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ResEdit = require("resedit");

function readCString(buffer, offset) {
  assert.ok(offset >= 0 && offset < buffer.length, "String offset is outside the PE image.");
  let end = offset;
  while (end < buffer.length && buffer[end] !== 0) end += 1;
  assert.ok(end < buffer.length, "Unterminated PE string.");
  return buffer.subarray(offset, end).toString("ascii");
}

function parsePe(buffer) {
  assert.equal(buffer.readUInt16LE(0), 0x5a4d, "Missing MZ header.");
  const peOffset = buffer.readUInt32LE(0x3c);
  assert.equal(buffer.readUInt32LE(peOffset), 0x00004550, "Missing PE signature.");
  const coff = peOffset + 4;
  const machine = buffer.readUInt16LE(coff);
  const sectionCount = buffer.readUInt16LE(coff + 2);
  const optionalSize = buffer.readUInt16LE(coff + 16);
  const coffCharacteristics = buffer.readUInt16LE(coff + 18);
  const optional = coff + 20;
  assert.equal(buffer.readUInt16LE(optional), 0x20b, "Provider is not a PE32+ image.");
  const dllCharacteristics = buffer.readUInt16LE(optional + 70);
  const dataDirectories = optional + 112;
  const sectionsOffset = optional + optionalSize;
  const sections = [];
  for (let index = 0; index < sectionCount; index += 1) {
    const offset = sectionsOffset + index * 40;
    const name = buffer.subarray(offset, offset + 8).toString("ascii").replace(/\0.*$/s, "");
    sections.push({
      name,
      virtualSize: buffer.readUInt32LE(offset + 8),
      virtualAddress: buffer.readUInt32LE(offset + 12),
      rawSize: buffer.readUInt32LE(offset + 16),
      rawOffset: buffer.readUInt32LE(offset + 20),
    });
  }
  function rvaToOffset(rva) {
    const section = sections.find((candidate) => (
      rva >= candidate.virtualAddress
      && rva < candidate.virtualAddress + Math.max(candidate.virtualSize, candidate.rawSize)
    ));
    assert.ok(section, `RVA 0x${rva.toString(16)} is outside all sections.`);
    return section.rawOffset + (rva - section.virtualAddress);
  }
  function directory(index) {
    return {
      rva: buffer.readUInt32LE(dataDirectories + index * 8),
      size: buffer.readUInt32LE(dataDirectories + index * 8 + 4),
    };
  }

  const imports = [];
  const importDirectory = directory(1);
  if (importDirectory.rva !== 0) {
    let descriptor = rvaToOffset(importDirectory.rva);
    for (let count = 0; count < 256; count += 1, descriptor += 20) {
      const originalThunk = buffer.readUInt32LE(descriptor);
      const nameRva = buffer.readUInt32LE(descriptor + 12);
      const firstThunk = buffer.readUInt32LE(descriptor + 16);
      if (originalThunk === 0 && nameRva === 0 && firstThunk === 0) break;
      imports.push(readCString(buffer, rvaToOffset(nameRva)).toUpperCase());
    }
  }

  const exports = [];
  const exportDirectory = directory(0);
  if (exportDirectory.rva !== 0) {
    const exportOffset = rvaToOffset(exportDirectory.rva);
    const nameCount = buffer.readUInt32LE(exportOffset + 24);
    const namesRva = buffer.readUInt32LE(exportOffset + 32);
    assert.ok(nameCount <= 256, "Unexpected export count.");
    const namesOffset = rvaToOffset(namesRva);
    for (let index = 0; index < nameCount; index += 1) {
      exports.push(readCString(buffer, rvaToOffset(buffer.readUInt32LE(namesOffset + index * 4))));
    }
  }

  return {
    machine,
    coffCharacteristics,
    dllCharacteristics,
    sections,
    imports: imports.sort(),
    exports: exports.sort(),
  };
}

const projectRoot = path.resolve(__dirname, "..");
const providerPath = path.resolve(
  process.argv[2] || path.join(
    projectRoot,
    "shell",
    "thumbnail-provider",
    "bin",
    "x64",
    "ExcelsisDxfThumbnailProvider.dll",
  ),
);
const provider = fs.readFileSync(providerPath);
assert.ok(provider.length > 0 && provider.length <= 2 * 1024 * 1024, "Provider size is outside its release ceiling.");
const pe = parsePe(provider);
assert.equal(pe.machine, 0x8664, "Thumbnail provider is not x64.");
assert.equal(
  pe.coffCharacteristics & 0x2022,
  0x2022,
  "Provider must be an executable, large-address-aware DLL image.",
);
assert.equal(
  pe.dllCharacteristics & 0x0160,
  0x0160,
  "Provider must enable high-entropy ASLR, dynamic base, and DEP/NX.",
);
assert.deepEqual(pe.exports, [
  "DllCanUnloadNow",
  "DllGetClassObject",
  "DllRegisterServer",
  "DllUnregisterServer",
]);
const executable = ResEdit.NtExecutable.from(provider, { ignoreCert: true });
const resources = ResEdit.NtExecutableResource.from(executable);
const versionInfo = ResEdit.Resource.VersionInfo.fromEntries(resources.entries);
assert.equal(versionInfo.length, 1, "Provider version metadata is missing.");
const versionStrings = versionInfo[0].getStringValues({ lang: 1033, codepage: 1200 });
assert.equal(versionStrings.FileDescription, "Excelsis Document Thumbnail Provider");
assert.equal(versionStrings.OriginalFilename, "ExcelsisDxfThumbnailProvider.dll");
assert.equal(versionStrings.ProductName, "ExcelsisView");
const allowedImports = new Set([
  "ADVAPI32.DLL",
  "BCRYPT.DLL",
  "GDI32.DLL",
  "KERNEL32.DLL",
  "MSVCRT.DLL",
  "OLE32.DLL",
  "SHELL32.DLL",
  "USER32.DLL",
]);
for (const importedLibrary of pe.imports) {
  const isWindowsApiSet = /^API-MS-WIN-(?:CORE|CRT)-[A-Z0-9-]+\.DLL$/.test(importedLibrary);
  assert.ok(allowedImports.has(importedLibrary) || isWindowsApiSet, `Unexpected native dependency: ${importedLibrary}`);
}
const configuredPrivateMarkers = String(process.env.PUBLIC_RELEASE_PRIVATE_MARKERS || "")
  .split(";")
  .map((marker) => marker.trim().toLowerCase())
  .filter(Boolean);
const ascii = provider.toString("latin1").toLowerCase();
const utf16 = provider.toString("utf16le").toLowerCase();
for (const marker of configuredPrivateMarkers) {
  assert.ok(!ascii.includes(marker) && !utf16.includes(marker), `Private marker found in provider binary: ${marker}`);
}

console.log(JSON.stringify({
  providerPath,
  bytes: provider.length,
  machine: `0x${pe.machine.toString(16)}`,
  coffCharacteristics: `0x${pe.coffCharacteristics.toString(16)}`,
  dllCharacteristics: `0x${pe.dllCharacteristics.toString(16)}`,
  imports: pe.imports,
  exports: pe.exports,
}, null, 2));
