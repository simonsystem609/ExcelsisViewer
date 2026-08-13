import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const runtimePath = path.resolve(
  scriptDirectory,
  "..",
  "modules",
  "3dpdf",
  "vendor",
  "runtime.mjs",
);
const runtimeSource = await readFile(runtimePath, "utf8");

const sourceTarballHashes = new Map([
  ["base64-js-1.5.1.tgz", "b1b7a945b52685269083425216d6597e33d97bf21699d656e92fdb3eb5210a85"],
  ["buffer-6.0.3.tgz", "555b6f49224afcf6b2c5a9aea7cd34a7f443f395b10532bc5580022d57aa51f5"],
  ["ieee754-1.2.1.tgz", "8ef14b9b397e339db89db97881fb714f49319d8f0eb1275901f45567b28f9dac"],
  ["pako-2.1.0.tgz", "49fedc8866b4abfc8e71dc7fe75ad4ef1ff1ac9601b0642cff88ee5bf2338709"],
  ["three-0.160.0.tgz", "1ee2f935c4f555814b388e87b5ef78a44856bd2e9d0feb88643a6e193fb42856"],
]);
const sourceTarballRoot = path.resolve(
  scriptDirectory,
  "..",
  "third_party",
  "source",
  "web-runtime",
);
for (const [name, expectedHash] of sourceTarballHashes) {
  const bytes = await readFile(path.join(sourceTarballRoot, name));
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    expectedHash,
    `unexpected corresponding-source tarball: ${name}`,
  );
}

assert.doesNotMatch(
  runtimeSource,
  /Math\.random\(\)\*4294967295/,
  "the generated Three.js UUID path must not use Math.random",
);
assert.match(
  runtimeSource,
  /crypto\.getRandomValues/,
  "the generated runtime must contain the reviewed secure UUID generator",
);

const originalMathRandom = Math.random;
Math.random = () => {
  throw new Error("Three.js UUID creation called Math.random");
};

try {
  const { Buffer, pako, THREE } = await import(
    `${pathToFileURL(runtimePath).href}?secure-uuid-test=${Date.now()}`
  );

  const values = [
    new THREE.Source().uuid,
    new THREE.Texture().uuid,
    new THREE.Object3D().uuid,
    new THREE.Material().uuid,
    new THREE.BufferGeometry().uuid,
  ];
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  for (const value of values) {
    assert.match(value, uuidPattern, `invalid hardened UUID: ${value}`);
  }
  assert.equal(new Set(values).size, values.length, "UUIDs must be unique");

  const original = Buffer.from("ExcelsisView runtime regression", "utf8");
  const roundTrip = Buffer.from(pako.inflate(pako.deflate(original)));
  assert.equal(roundTrip.toString("utf8"), original.toString("utf8"));
} finally {
  Math.random = originalMathRandom;
}

console.log("3D runtime build and secure UUID regression checks passed.");
