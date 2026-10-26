const assert = require("node:assert/strict");
const {
  decodeDxfBuffer,
  declaredDxfEncoding,
  encodeDxfTextForWrite,
} = require("../dxf-encoding.cjs");

const prefix = Buffer.from(
  "0\r\nSECTION\r\n2\r\nHEADER\r\n9\r\n$DWGCODEPAGE\r\n3\r\nANSI_1250\r\n"
    + "0\r\nENDSEC\r\n0\r\nSECTION\r\n2\r\nENTITIES\r\n0\r\nTEXT\r\n1\r\n",
  "ascii",
);
const hungarian = Buffer.from([
  0x4d, 0xfb, 0x73, 0x7a, 0x61, 0x6b, 0x69, 0x20,
  0x6c, 0x65, 0xed, 0x72, 0xe1, 0x73,
]);
const suffix = Buffer.from("\r\n0\r\nENDSEC\r\n0\r\nEOF\r\n", "ascii");
const legacyDxf = Buffer.concat([prefix, hungarian, suffix]);

assert.equal(declaredDxfEncoding(legacyDxf), "windows-1250");
assert.match(decodeDxfBuffer(legacyDxf), /Műszaki leírás/);
assert.match(
  encodeDxfTextForWrite("Műszaki leírás").toString("ascii"),
  /M\\U\+0171szaki le\\U\+00EDr\\U\+00E1s/,
);
assert.match(
  decodeDxfBuffer(Buffer.from("Árvíztűrő tükörfúrógép", "utf8")),
  /Árvíztűrő tükörfúrógép/,
);

console.log(JSON.stringify({
  declaredEncoding: declaredDxfEncoding(legacyDxf),
  decodedHungarian: true,
  portableWriteEscapes: true,
}, null, 2));
