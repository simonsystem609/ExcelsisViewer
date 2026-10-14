// Vector-only page transforms. No rendering, flattening, or original-file writes.
import {
  PDFDocument, PDFArray, PDFDict, PDFName, PDFNumber, PDFRawStream, degrees,
} from "./vendor/pdf-edit/pdf-export-runtime.mjs";

const name = PDFName.of;
const boxes = ["MediaBox", "CropBox", "BleedBox", "TrimBox", "ArtBox"];
const supportedAnnotations = new Set([
  "Link", "Text", "FreeText", "Square", "Circle", "Highlight", "Underline",
  "Squiggly", "StrikeOut", "Line", "Polygon", "PolyLine", "Ink", "Stamp", "Caret", "Popup",
]);

function numbers(array, count = null) {
  if (!(array instanceof PDFArray) || (count !== null && array.size() !== count)) {
    throw new Error("This PDF has unsupported page or annotation coordinates.");
  }
  const result = array.asArray().map(item => array.context.lookup(item, PDFNumber).asNumber());
  if (!result.every(Number.isFinite)) throw new Error("The PDF contains invalid coordinates.");
  return result;
}

function rectangle(values, [sx, sy, tx, ty]) {
  const [x1, y1, x2, y2] = values;
  const xs = [sx * x1 + tx, sx * x2 + tx], ys = [sy * y1 + ty, sy * y2 + ty];
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

function transformPoints(values, [sx, sy, tx, ty]) {
  if (values.length % 2) throw new Error("The PDF contains invalid annotation coordinates.");
  return values.map((value, index) => index % 2 ? sy * value + ty : sx * value + tx);
}

function mirrorAppearance(context, value, sx, sy, depth = 0) {
  if (depth > 4) throw new Error("This PDF has an invalid annotation appearance tree.");
  const object = context.lookup(value);
  if (object instanceof PDFRawStream) {
    const copy = object.clone(context);
    const bbox = numbers(copy.dict.lookup(name("BBox")), 4);
    const matrix = copy.dict.lookup(name("Matrix"));
    const [a, b, c, d, e, f] = matrix ? numbers(matrix, 6) : [1, 0, 0, 1, 0, 0];
    const points = [[bbox[0], bbox[1]], [bbox[0], bbox[3]], [bbox[2], bbox[1]], [bbox[2], bbox[3]]];
    const xs = points.map(([x,y]) => a*x+c*y+e), ys = points.map(([x,y]) => b*x+d*y+f);
    const tx = sx < 0 ? Math.min(...xs) + Math.max(...xs) : 0;
    const ty = sy < 0 ? Math.min(...ys) + Math.max(...ys) : 0;
    copy.dict.set(name("Matrix"), context.obj([sx*a, sy*b, sx*c, sy*d, sx*e+tx, sy*f+ty]));
    return context.register(copy);
  }
  if (object instanceof PDFDict) {
    const copy = object.clone(context);
    for (const [key, child] of object.entries()) copy.set(key, mirrorAppearance(context, child, sx, sy, depth + 1));
    return copy;
  }
  throw new Error("This PDF has an unsupported annotation appearance.");
}

function transformAnnotation(annotation, transform, context) {
  for (const key of ["Rect", "QuadPoints", "Vertices", "L", "CL"]) {
    const value = annotation.lookup(name(key));
    if (!value) continue;
    const input = numbers(value, key === "Rect" ? 4 : null);
    annotation.set(name(key), context.obj(key === "Rect" ? rectangle(input, transform) : transformPoints(input, transform)));
  }
  const ink = annotation.lookup(name("InkList"));
  if (ink instanceof PDFArray) annotation.set(name("InkList"), context.obj(ink.asArray().map(value => transformPoints(numbers(context.lookup(value)), transform))));
  const [sx, sy] = transform;
  // Insets are distances, not page coordinates. Swap the sides on reflection.
  const rd = annotation.lookup(name("RD"));
  if (rd) {
    let [left, top, right, bottom] = numbers(rd, 4);
    if (sx < 0) [left, right] = [right, left];
    if (sy < 0) [top, bottom] = [bottom, top];
    annotation.set(name("RD"), context.obj([left*Math.abs(sx), top*Math.abs(sy), right*Math.abs(sx), bottom*Math.abs(sy)]));
  }
  const appearance = annotation.lookup(name("AP"));
  if (appearance && (sx < 0 || sy < 0)) {
    annotation.set(name("AP"), mirrorAppearance(context, appearance, Math.sign(sx), Math.sign(sy)));
  }
}

export function validatePageTransform(options, pageCount) {
  const { kind, axis = "horizontal", scope = "all", page = 1, xPercent = 100, yPercent = xPercent, viewRotation = 0 } = options || {};
  if (!["mirror", "scale"].includes(kind) || !["all", "current"].includes(scope)) throw new Error("Choose a valid PDF transform and page scope.");
  if (!Number.isInteger(page) || page < 1 || page > pageCount) throw new Error("The selected PDF page is unavailable.");
  if (![0, 90, 180, 270].includes(viewRotation)) throw new Error("Invalid PDF view rotation.");
  if (kind === "mirror" && !["horizontal", "vertical"].includes(axis)) throw new Error("Choose horizontal or vertical mirroring.");
  if (kind === "scale" && ![xPercent, yPercent].every(value => Number.isFinite(value) && value >= 1 && value <= 1000)) throw new Error("Scale percentages must be between 1 and 1000.");
  return { kind, axis, scope, page, xPercent, yPercent, viewRotation };
}

export async function transformPdfPages(bytes, options) {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: false, updateMetadata: false });
  const pages = doc.getPages(), config = validatePageTransform(options, pages.length);
  const form = doc.catalog.lookup(name("AcroForm"));
  if (form instanceof PDFDict && (form.has(name("XFA")) || form.lookup(name("Fields"))?.size())) {
    throw new Error("Mirror/Scale does not yet support interactive forms or signed PDFs. The original has not been changed.");
  }
  if (doc.catalog.has(name("Perms"))) throw new Error("Signed PDFs cannot be transformed safely. The original has not been changed.");
  for (let index = 0; index < pages.length; index++) {
    const page = pages[index];
    const rotation = ((page.getRotation().angle + config.viewRotation) % 360 + 360) % 360;
    if (![0, 90, 180, 270].includes(rotation)) throw new Error("Unsupported PDF page rotation.");
    page.setRotation(degrees(rotation));
    if (config.scope === "current" && index !== config.page - 1) continue;
    const annotations = page.node.Annots();
    const seen = new Set();
    for (const value of annotations?.asArray() || []) {
      const annotation = doc.context.lookup(value, PDFDict);
      const subtype = annotation.lookup(name("Subtype"))?.decodeText();
      if (!supportedAnnotations.has(subtype)) throw new Error(`Mirror/Scale does not yet support ${subtype || "unknown"} PDF annotations. The original has not been changed.`);
      seen.add(annotation);
    }
    const media = page.getMediaBox(), crop = page.getCropBox();
    const x0 = Math.max(media.x, crop.x), y0 = Math.max(media.y, crop.y);
    const x1 = Math.min(media.x+media.width, crop.x+crop.width), y1 = Math.min(media.y+media.height, crop.y+crop.height);
    if (x1 <= x0 || y1 <= y0) throw new Error("The PDF page has an invalid crop box.");
    let sx = config.kind === "scale" ? config.xPercent / 100 : config.axis === "horizontal" ? -1 : 1;
    let sy = config.kind === "scale" ? config.yPercent / 100 : config.axis === "vertical" ? -1 : 1;
    if (rotation % 180) [sx, sy] = [sy, sx];
    const transform = [sx, sy, sx < 0 ? x0+x1 : 0, sy < 0 ? y0+y1 : 0];
    // Read inherited boxes before changing any page attributes.
    const originals = new Map([["MediaBox", [media.x,media.y,media.x+media.width,media.y+media.height]], ["CropBox", [crop.x,crop.y,crop.x+crop.width,crop.y+crop.height]]]);
    for (const key of boxes.slice(2)) if (page.node.has(name(key))) originals.set(key, numbers(page.node.lookup(name(key)), 4));
    for (const [key, value] of originals) {
      const box = rectangle(value, transform);
      const unit = page.node.lookup(name("UserUnit"))?.asNumber() || 1;
      if (!box.every(Number.isFinite) || (box[2]-box[0])*unit > 14400 || (box[3]-box[1])*unit > 14400 || box[2]-box[0] < 1 || box[3]-box[1] < 1) {
        throw new Error("The transformed page must be between 1 and 14,400 PDF points per side.");
      }
      page.node.set(name(key), doc.context.obj(box));
    }
    page.pushOperators(); // Normalize Contents, including blank pages.
    const [a, d, e, f] = transform;
    const start = doc.context.register(doc.context.flateStream(`q\n${a} 0 0 ${d} ${e} ${f} cm\n`));
    const end = doc.context.register(doc.context.flateStream("Q\n"));
    page.node.wrapContentStreams(start, end);
    for (const annotation of seen) transformAnnotation(annotation, transform, doc.context);
  }
  return doc.save({ useObjectStreams: true, updateFieldAppearances: false });
}
