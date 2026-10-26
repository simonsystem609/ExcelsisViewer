// Display-only macro metadata. Never use these names/IDs as filesystem paths,
// ownership grants, URLs or executable markup. Original pairs remain untouched.
export const METADATA_BEGIN = "EXCELSIS-DXF-META-V1-BEGIN";
export const METADATA_END = "EXCELSIS-DXF-META-V1-END";
export const METADATA_JSON = "EXCELSIS-DXF-JSON ";
export const MAX_METADATA_CHARS = 256 * 1024;
export const MAX_METADATA_PAIRS = 8192;

function displayValue(value) {
  return typeof value === "string" && value.length <= 4096 && value.trim() &&
    !/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/u.test(value)
    ? value : null;
}

export function readDxfMetadataFromPairs(pairs) {
  let opened = false, closed = false, length = 0;
  const chunks = [];
  for (let index = 0; index < Math.min(pairs.length, MAX_METADATA_PAIRS); index++) {
    const pair = pairs[index], code = String(pair.code).trim(), value = String(pair.value ?? "");
    if (code === "0" && value.trim().toUpperCase() === "SECTION") break;
    if (code !== "999") { if (opened && !closed) return null; continue; }
    const marker = value.trim();
    if (marker === METADATA_BEGIN) {
      if (opened || closed) return null; opened = true;
    } else if (marker === METADATA_END) {
      if (!opened || closed || !chunks.length) return null; closed = true;
    } else if (value.startsWith(METADATA_JSON)) {
      if (!opened || closed) return null;
      const chunk = value.slice(METADATA_JSON.length);
      length += chunk.length; if (length > MAX_METADATA_CHARS) return null;
      chunks.push(chunk);
    }
  }
  if (!opened || !closed) return null;
  try {
    const data = JSON.parse(chunks.join(""));
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;
    const fullFilename = displayValue(data.fullFilename);
    if (!fullFilename) return null;
    return Object.freeze({ fullFilename, configuration: displayValue(data.configuration),
      sourceId: displayValue(data.sourceId), ownerId: displayValue(data.ownerId) });
  } catch { return null; }
}

// Small standalone reader for the macro/host integration agent. The Viewer
// parser uses its existing pair array, avoiding another full-file scan/copy.
export function readDxfMetadata(text) {
  if (typeof text !== "string") return null;
  const lines = text.slice(0, MAX_METADATA_CHARS + MAX_METADATA_PAIRS * 64)
    .replace(/\r\n?/g, "\n").split("\n");
  const pairs = [];
  for (let index = 0; index + 1 < lines.length && pairs.length < MAX_METADATA_PAIRS; index += 2) {
    const pair = { code: lines[index].trim(), value: lines[index + 1] };
    pairs.push(pair);
    if (pair.code === "0" && pair.value.trim().toUpperCase() === "SECTION") break;
  }
  return readDxfMetadataFromPairs(pairs);
}
