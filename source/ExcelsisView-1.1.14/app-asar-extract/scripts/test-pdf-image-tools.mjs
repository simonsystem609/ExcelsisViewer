import assert from "node:assert/strict";
import {
  boundsFromPoints,
  buildTextMask,
  cropImageData,
  dominantForegroundColor,
  foregroundFromDifference,
  groupOcrWordBoxes,
  imageCropBoxFromBounds,
  inpaintFallback,
  ocrLineRegionsFromBlocks,
  ocrWordRegionsFromBlocks,
  parseTsvWordBoxes,
  segmentMaskRegions,
  splitOcrRegionsByColor,
  suppressOcrFrameLines,
} from "../modules/3dpdf/pdf-image-tools.mjs";

assert.deepEqual(boundsFromPoints([[5, 8], [2, 3], [9, 4]]), {
  x: 2,
  y: 3,
  width: 7,
  height: 5,
});

const width = 24;
const height = 12;
const source = new Uint8ClampedArray(width * height * 4);
source.fill(255);
for (let y = 3; y < 9; y += 1) {
  for (let x = 8; x < 16; x += 1) {
    const offset = (y * width + x) * 4;
    source[offset] = 20;
    source[offset + 1] = 20;
    source[offset + 2] = 20;
  }
}
const imageData = { data: source, width, height };
const mask = buildTextMask(imageData, [{ left: 7, top: 2, width: 10, height: 8 }]);
assert.ok(mask.reduce((count, value) => count + (value ? 1 : 0), 0) >= 48);
assert.equal(mask[0], 0);

const background = inpaintFallback(imageData, mask);
const centerOffset = (6 * width + 12) * 4;
assert.ok(background.data[centerOffset] > 240);
const foreground = foregroundFromDifference(imageData, background, mask);
assert.ok(foreground.data[centerOffset + 3] > 240);
assert.equal(dominantForegroundColor(foreground), "#111111");

const boxes = parseTsvWordBoxes([
  "level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext",
  "5\t1\t1\t1\t1\t1\t10\t20\t30\t12\t92.5\tHello",
  "5\t1\t1\t1\t1\t2\t45\t20\t20\t12\t3\tignored",
].join("\n"));
assert.deepEqual(boxes, [{
  left: 10,
  top: 20,
  width: 30,
  height: 12,
  confidence: 92.5,
  text: "Hello",
  pageNumber: 1,
  blockNumber: 1,
  paragraphNumber: 1,
  lineNumber: 1,
  wordNumber: 1,
}]);

const uncertainBoxes = parseTsvWordBoxes([
  "level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext",
  "5\t1\t1\t1\t1\t1\t10\t20\t30\t12\t92.5\tHello",
  "5\t1\t1\t1\t1\t2\t45\t20\t20\t12\t3\tmaybe",
  "5\t1\t1\t1\t2\t1\t12\t44\t18\t10\t64\tNext",
].join("\n"), { minimumConfidence: 0 });
const ocrLines = groupOcrWordBoxes(uncertainBoxes, 100, 80);
assert.equal(ocrLines.length, 2);
assert.equal(ocrLines[0].text, "Hello maybe");
assert.ok(ocrLines[0].confidence > 50 && ocrLines[0].confidence < 93);
assert.equal(ocrLines[1].text, "Next");

const blockLines = ocrLineRegionsFromBlocks([{
  paragraphs: [{
    lines: [{
      text: "Same style",
      confidence: 87,
      bbox: { x0: 12, y0: 18, x1: 82, y1: 34 },
      baseline: { x0: 12, y0: 33, x1: 82, y1: 33 },
      rowAttributes: { rowHeight: 19 },
      words: [{
        text: "Same",
        confidence: 91,
        bbox: { x0: 12, y0: 18, x1: 42, y1: 34 },
      }],
    }],
  }],
}], 100, 80);
assert.equal(blockLines.length, 1);
assert.equal(blockLines[0].text, "Same style");
assert.equal(blockLines[0].fontSizePixels, 19);
assert.equal(blockLines[0].baselineY, 33);
assert.equal(blockLines[0].inkWidth, 70);

const blockWords = ocrWordRegionsFromBlocks([{
  paragraphs: [{
    lines: [{
      baseline: { x0: 12, y0: 33, x1: 82, y1: 33 },
      rowAttributes: { rowHeight: 19 },
      words: [{
        text: "Same",
        confidence: 91,
        font_name: "Serif",
        bbox: { x0: 12, y0: 18, x1: 42, y1: 34 },
      }, {
        text: "style",
        confidence: 72,
        font_name: "Serif Italic",
        bbox: { x0: 48, y0: 18, x1: 82, y1: 34 },
      }],
    }],
  }],
}], 100, 80);
assert.equal(blockWords.length, 2);
assert.equal(blockWords[0].text, "Same");
assert.equal(blockWords[0].fontSizePixels, 19);
assert.equal(blockWords[1].words[0].fontName, "Serif Italic");
assert.equal(blockWords[1].confidence, 72);

const framedWidth = 80;
const framedHeight = 40;
const framedData = new Uint8ClampedArray(framedWidth * framedHeight * 4);
framedData.fill(255);
const setFramedPixel = (x, y, value = 16) => {
  const offset = (y * framedWidth + x) * 4;
  framedData[offset] = value;
  framedData[offset + 1] = value;
  framedData[offset + 2] = value;
};
for (let x = 5; x <= 74; x += 1) {
  setFramedPixel(x, 4);
  setFramedPixel(x, 35);
}
for (let y = 4; y <= 35; y += 1) {
  setFramedPixel(5, y);
  setFramedPixel(74, y);
}
for (let y = 16; y <= 23; y += 1) {
  for (let x = 28; x <= 35; x += 1) setFramedPixel(x, y, 32);
}
const frameSuppressed = suppressOcrFrameLines({
  data: framedData,
  width: framedWidth,
  height: framedHeight,
});
assert.ok(frameSuppressed.horizontalLines.includes(4));
assert.ok(frameSuppressed.verticalLines.includes(5));
assert.equal(frameSuppressed.data[(4 * framedWidth + 20) * 4], 255);
assert.equal(frameSuppressed.data[(19 * framedWidth + 31) * 4], 32);

const coloredWidth = 84;
const coloredHeight = 24;
const coloredData = new Uint8ClampedArray(coloredWidth * coloredHeight * 4);
coloredData.fill(255);
const symbols = [..."EDUKOR"].map((text, index) => ({
  left: 4 + index * 13,
  top: 4,
  width: 10,
  height: 16,
  text,
  confidence: 99,
}));
for (const [index, symbol] of symbols.entries()) {
  const color = index < 3 ? [0, 85, 170] : [17, 17, 17];
  for (let y = symbol.top; y < symbol.top + symbol.height; y += 1) {
    for (let x = symbol.left; x < symbol.left + symbol.width; x += 1) {
      const offset = (y * coloredWidth + x) * 4;
      coloredData[offset] = color[0];
      coloredData[offset + 1] = color[1];
      coloredData[offset + 2] = color[2];
      coloredData[offset + 3] = 255;
    }
  }
}
const colorRuns = splitOcrRegionsByColor({
  data: coloredData,
  width: coloredWidth,
  height: coloredHeight,
}, [{
  left: 2,
  top: 2,
  width: 80,
  height: 20,
  text: "EDUKOR",
  confidence: 99,
  words: [{ text: "EDUKOR", symbols }],
  symbols,
}], { sourcePixels: true });
assert.deepEqual(colorRuns.map((region) => region.text), ["EDU", "KOR"]);
assert.deepEqual(colorRuns.map((region) => region.color), ["#0055aa", "#111111"]);

const regionMask = new Uint8Array(80 * 50);
for (let y = 5; y < 12; y += 1) regionMask.fill(255, y * 80 + 8, y * 80 + 55);
for (let y = 28; y < 36; y += 1) regionMask.fill(255, y * 80 + 20, y * 80 + 68);
const regions = segmentMaskRegions(regionMask, 80, 50);
assert.equal(regions.length, 2);
assert.ok(regions[0].top < regions[1].top);

const cropped = cropImageData(imageData, { left: 8, top: 3, width: 8, height: 6 });
assert.equal(cropped.width, 8);
assert.equal(cropped.height, 6);
assert.equal(cropped.data[(3 * cropped.width + 4) * 4], 20);

assert.deepEqual(
  imageCropBoxFromBounds(
    { x: 10, y: 20, width: 200, height: 100 },
    { x: 60, y: 45, width: 100, height: 50 },
    800,
    400,
  ),
  { left: 200, top: 100, width: 400, height: 200 },
);

console.log(JSON.stringify({
  maskPixels: mask.reduce((count, value) => count + (value ? 1 : 0), 0),
  centerBackground: background.data[centerOffset],
  foregroundColor: dominantForegroundColor(foreground),
  tsvWords: boxes.length,
  ocrLines: ocrLines.length,
  visualRegions: regions.length,
  suppressedFrameLines: frameSuppressed.horizontalLines.length + frameSuppressed.verticalLines.length,
  colorRuns: colorRuns.map((region) => `${region.text}:${region.color}`),
}, null, 2));
