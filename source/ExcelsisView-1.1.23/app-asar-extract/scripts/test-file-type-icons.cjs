const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(projectRoot, relativePath));
const readText = (relativePath) => read(relativePath).toString("utf8");
const pkg = JSON.parse(readText("package.json"));
const main = readText("main.cjs");
const installer = readText("build/installer.nsh");
const expectedSizes = [16, 20, 24, 32, 48, 64, 128, 256];

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex").toUpperCase();
}

function assertPng256(fileName) {
  const image = read(path.join("build", fileName));
  assert.equal(image.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", `${fileName} is not PNG.`);
  assert.equal(image.readUInt32BE(16), 256, `${fileName} width is not 256.`);
  assert.equal(image.readUInt32BE(20), 256, `${fileName} height is not 256.`);
}

function assertMultiSizeIco(fileName) {
  const image = read(path.join("build", fileName));
  assert.equal(image.readUInt16LE(0), 0, `${fileName} has an invalid ICO header.`);
  assert.equal(image.readUInt16LE(2), 1, `${fileName} is not an icon.`);
  const count = image.readUInt16LE(4);
  const actualSizes = [];
  for (let index = 0; index < count; index++) {
    const entryAt = 6 + (index * 16);
    const width = image[entryAt] || 256;
    const height = image[entryAt + 1] || 256;
    const bytes = image.readUInt32LE(entryAt + 8);
    const dataAt = image.readUInt32LE(entryAt + 12);
    assert.equal(width, height, `${fileName} contains a non-square image.`);
    assert.ok(dataAt + bytes <= image.length, `${fileName} contains an out-of-range image.`);
    assert.equal(
      image.subarray(dataAt, dataAt + 8).toString("hex"),
      "89504e470d0a1a0a",
      `${fileName} contains a non-PNG icon image.`,
    );
    actualSizes.push(width);
  }
  assert.deepEqual(actualSizes.sort((a, b) => a - b), expectedSizes, `${fileName} size set differs.`);
}

for (const type of ["dxf", "dwg", "pdf"]) {
  assertPng256(`icon-file-${type}-256.png`);
  assertMultiSizeIco(`icon-file-${type}.ico`);
}

assert.equal(
  sha256(read("build/icon-dxf-256.png")),
  "383EE2612F92C89227056F276333F149E36179B03467B8013669D7F7C836E9AC",
  "The red launcher PNG changed.",
);
assert.equal(
  sha256(read("build/icon-dxf.ico")),
  "84FAA26536EA7CF32815F4D57B0133C572AE1CAE7B8942515543CC8189D482A9",
  "The red launcher ICO changed.",
);

const associations = Object.fromEntries(pkg.build.fileAssociations.map((entry) => [entry.ext, entry]));
for (const type of ["dxf", "dwg", "pdf"]) {
  assert.equal(associations[type]?.icon, `build/icon-file-${type}.ico`);
  for (const suffix of ["-256.png", ".ico"]) {
    const asset = `build/icon-file-${type}${suffix}`;
    assert.ok(
      pkg.build.extraResources.some((entry) => entry.from === asset && entry.to === asset),
      `Runtime icon resource is missing: ${asset}`,
    );
  }
}
assert.equal(pkg.build.win.icon, "build/icon-dxf.ico", "The launcher executable icon changed.");
assert.equal(pkg.build.appId, "local.excelsis.view", "The installed launcher identity changed.");
assert.match(pkg.scripts.dist, /npm run test:icons/, "The icon regression test is outside the release gate.");

for (const type of ["dxf", "dwg", "pdf"]) {
  assert.match(main, new RegExp("appId: `\\$\\{APP_ID\\}\\." + type + "`"));
  assert.match(main, new RegExp(`png: ["']icon-file-${type}-256\\.png["']`));
  assert.match(main, new RegExp(`ico: ["']icon-file-${type}\\.ico["']`));
}
assert.match(main, /const iconKind = windowIconKind\(moduleName, fileSet\?\.path\)/);
assert.match(main, /icon:\s*windowIconPath\(iconKind, ["']png["']\)/);
assert.match(main, /claimFileForWebContents[\s\S]{0,500}applyWindowIcon\(win, windowIconKind\(win\.excelsisModuleName, resolved\)\)/);
assert.match(main, /createBatchPrintWindow[\s\S]{0,1600}applyWindowIcon\(win, ["']pdf["']\)/);
assert.match(
  installer,
  /ExcelsisView\.BatchPrint[\s\S]*resources\\build\\icon-file-pdf\.ico/,
  "The PDF batch-print command does not use the PDF icon.",
);

console.log(JSON.stringify({
  family: "A - Royal vivid",
  launcherUnchanged: true,
  explorerFallbackIcons: ["dxf", "dwg", "pdf"],
  dynamicWindowIcons: true,
  icoSizes: expectedSizes,
}));
