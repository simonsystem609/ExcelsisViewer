import {
  decodePDFRawStream,
  PDFDocument,
  PDFName,
  PDFRawStream,
} from "./vendor/pdf-edit/pdf-export-runtime.mjs";

const MAX_PDF_BYTES = 512 * 1024 * 1024;
const MAX_U3D_BYTES = 512 * 1024 * 1024;
const U3D_HEADER = [0x55, 0x33, 0x44, 0x00];

function asArrayBuffer(value) {
  if (value instanceof ArrayBuffer) return value;
  if (ArrayBuffer.isView(value)) {
    return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
  }
  throw new TypeError("PDF data is not an ArrayBuffer.");
}

function assertU3dStream(bytes) {
  if (bytes.byteLength < U3D_HEADER.length || bytes.byteLength > MAX_U3D_BYTES) {
    throw new Error("Embedded U3D data exceeds the 512 MiB safety limit.");
  }
  for (let index = 0; index < U3D_HEADER.length; index += 1) {
    if (bytes[index] !== U3D_HEADER[index]) {
      throw new Error("The PDF's 3D stream is not valid ECMA-363 U3D data.");
    }
  }
}

export async function extractU3dStream(pdfValue) {
  const pdfBuffer = asArrayBuffer(pdfValue);
  if (!pdfBuffer.byteLength || pdfBuffer.byteLength > MAX_PDF_BYTES) {
    throw new Error("PDF input exceeds the 512 MiB safety limit.");
  }
  const pdfBytes = new Uint8Array(pdfBuffer);
  const document = await PDFDocument.load(pdfBytes, {
    ignoreEncryption: false,
    updateMetadata: false,
  });
  const streams = [];
  for (const [, object] of document.context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFRawStream)) continue;
    const subtype = object.dict.lookup(PDFName.of("Subtype"));
    if (String(subtype) !== "/U3D") continue;
    const decoded = decodePDFRawStream(object).decode();
    assertU3dStream(decoded);
    streams.push(decoded);
  }
  if (!streams.length) throw new Error("This PDF contains no embedded U3D model.");

  const selected = streams[0];
  const bytes = selected.buffer.slice(
    selected.byteOffset,
    selected.byteOffset + selected.byteLength,
  );
  return {
    bytes,
    streamCount: streams.length,
  };
}

if (typeof self !== "undefined") {
  self.addEventListener("message", async (event) => {
    const taskId = Number(event.data?.taskId);
    try {
      if (event.data?.type !== "extract-u3d") {
        throw new Error(`Unknown U3D PDF background task: ${event.data?.type}`);
      }
      const result = await extractU3dStream(event.data?.payload?.pdf);
      self.postMessage({ taskId, result }, [result.bytes]);
    } catch (error) {
      self.postMessage({
        taskId,
        error: {
          message: error?.message || String(error),
          name: error?.name || "Error",
          stack: error?.stack || "",
        },
      });
    }
  });
}
