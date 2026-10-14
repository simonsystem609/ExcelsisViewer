const { TextDecoder } = require("node:util");

const CODEPAGE_LABELS = new Map([
  ["UTF-8", "utf-8"],
  ["UTF8", "utf-8"],
  ["ANSI_874", "windows-874"],
  ["ANSI_932", "shift_jis"],
  ["ANSI_936", "gb18030"],
  ["ANSI_949", "euc-kr"],
  ["ANSI_950", "big5"],
  ...Array.from({ length: 9 }, (_, index) => {
    const codepage = 1250 + index;
    return [`ANSI_${codepage}`, `windows-${codepage}`];
  }),
]);

function declaredDxfEncoding(bytes) {
  const probe = Buffer.from(bytes).subarray(0, 128 * 1024).toString("latin1");
  const match = probe.match(
    /(?:^|\r?\n)\s*\$DWGCODEPAGE\s*\r?\n\s*3\s*\r?\n\s*([^\r\n]+)/i,
  );
  if (!match) return null;
  return CODEPAGE_LABELS.get(match[1].trim().toUpperCase()) || null;
}

function isValidUtf8(bytes) {
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return true;
  } catch {
    return false;
  }
}

function decodeDxfBuffer(bytes) {
  const source = Buffer.from(bytes);
  if (source.length >= 3 && source[0] === 0xef && source[1] === 0xbb && source[2] === 0xbf) {
    return new TextDecoder("utf-8").decode(source.subarray(3));
  }
  if (source.length >= 2 && source[0] === 0xff && source[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(source.subarray(2));
  }
  if (source.length >= 2 && source[0] === 0xfe && source[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(source.subarray(2));
  }

  const declared = declaredDxfEncoding(source);
  if (declared) return new TextDecoder(declared).decode(source);
  if (isValidUtf8(source)) return new TextDecoder("utf-8").decode(source);
  return new TextDecoder("windows-1252").decode(source);
}

function encodeDxfTextForWrite(text) {
  return Buffer.from(
    String(text).replace(/[^\x00-\x7f]/g, (character) => (
      `\\U+${character.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")}`
    )),
    "ascii",
  );
}

module.exports = {
  decodeDxfBuffer,
  declaredDxfEncoding,
  encodeDxfTextForWrite,
};
