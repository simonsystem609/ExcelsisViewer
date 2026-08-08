export function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function normalizeBounds(bounds) {
  const x1 = Math.min(bounds.x, bounds.x + bounds.width);
  const y1 = Math.min(bounds.y, bounds.y + bounds.height);
  const x2 = Math.max(bounds.x, bounds.x + bounds.width);
  const y2 = Math.max(bounds.y, bounds.y + bounds.height);
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}

export function boundsFromPoints(points) {
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return {
    x,
    y,
    width: Math.max(...xs) - x,
    height: Math.max(...ys) - y,
  };
}

export function expandBounds(bounds, padding, pageView = null) {
  const normalized = normalizeBounds(bounds);
  let x1 = normalized.x - padding;
  let y1 = normalized.y - padding;
  let x2 = normalized.x + normalized.width + padding;
  let y2 = normalized.y + normalized.height + padding;
  if (pageView) {
    x1 = clamp(x1, pageView[0], pageView[2]);
    y1 = clamp(y1, pageView[1], pageView[3]);
    x2 = clamp(x2, pageView[0], pageView[2]);
    y2 = clamp(y2, pageView[1], pageView[3]);
  }
  return { x: x1, y: y1, width: Math.max(0, x2 - x1), height: Math.max(0, y2 - y1) };
}

function median(values) {
  if (!values.length) return 0;
  values.sort((a, b) => a - b);
  const middle = values.length >> 1;
  return values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
}

function luminance(red, green, blue) {
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function otsuThreshold(histogram, total) {
  if (!total) return 127;
  let sum = 0;
  for (let index = 0; index < 256; index += 1) sum += index * histogram[index];
  let backgroundWeight = 0;
  let backgroundSum = 0;
  let bestVariance = -1;
  let threshold = 127;
  for (let index = 0; index < 256; index += 1) {
    backgroundWeight += histogram[index];
    if (!backgroundWeight) continue;
    const foregroundWeight = total - backgroundWeight;
    if (!foregroundWeight) break;
    backgroundSum += index * histogram[index];
    const backgroundMean = backgroundSum / backgroundWeight;
    const foregroundMean = (sum - backgroundSum) / foregroundWeight;
    const variance = backgroundWeight * foregroundWeight * (backgroundMean - foregroundMean) ** 2;
    if (variance > bestVariance) {
      bestVariance = variance;
      threshold = index;
    }
  }
  return threshold;
}

function normalizedPixelBox(box, width, height) {
  const left = clamp(Math.floor(box.left ?? box.x ?? 0), 0, width - 1);
  const top = clamp(Math.floor(box.top ?? box.y ?? 0), 0, height - 1);
  const right = clamp(Math.ceil((box.left ?? box.x ?? 0) + (box.width ?? 0)), left + 1, width);
  const bottom = clamp(Math.ceil((box.top ?? box.y ?? 0) + (box.height ?? 0)), top + 1, height);
  return { left, top, right, bottom };
}

function ocrSymbolsFromWord(sourceWord) {
  return (sourceWord?.symbols || []).map((symbol) => {
    const left = Number(symbol?.bbox?.x0);
    const top = Number(symbol?.bbox?.y0);
    const right = Number(symbol?.bbox?.x1);
    const bottom = Number(symbol?.bbox?.y1);
    return {
      left,
      top,
      width: right - left,
      height: bottom - top,
      confidence: Number(symbol?.confidence),
      text: String(symbol?.text || ""),
    };
  }).filter((symbol) => (
    symbol.text
    && [symbol.left, symbol.top, symbol.width, symbol.height].every(Number.isFinite)
    && symbol.width > 0
    && symbol.height > 0
  ));
}

export function cropImageData(imageData, sourceBox, padding = 0) {
  const box = normalizedPixelBox({
    left: (sourceBox.left ?? sourceBox.x ?? 0) - padding,
    top: (sourceBox.top ?? sourceBox.y ?? 0) - padding,
    width: (sourceBox.width ?? 0) + padding * 2,
    height: (sourceBox.height ?? 0) + padding * 2,
  }, imageData.width, imageData.height);
  const width = box.right - box.left;
  const height = box.bottom - box.top;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const sourceStart = ((box.top + y) * imageData.width + box.left) * 4;
    const sourceEnd = sourceStart + width * 4;
    data.set(imageData.data.subarray(sourceStart, sourceEnd), y * width * 4);
  }
  return {
    box: {
      left: box.left,
      top: box.top,
      width,
      height,
    },
    data,
    width,
    height,
  };
}

export function imageCropBoxFromBounds(originalBounds, croppedBounds, imageWidth, imageHeight) {
  const original = normalizeBounds(originalBounds);
  const cropped = normalizeBounds(croppedBounds);
  if (
    original.width <= 0
    || original.height <= 0
    || imageWidth <= 0
    || imageHeight <= 0
  ) {
    throw new Error("Image crop dimensions must be positive.");
  }
  const leftRatio = clamp((cropped.x - original.x) / original.width, 0, 1);
  const rightRatio = clamp(
    (cropped.x + cropped.width - original.x) / original.width,
    leftRatio,
    1,
  );
  const originalTop = original.y + original.height;
  const croppedTop = cropped.y + cropped.height;
  const topRatio = clamp((originalTop - croppedTop) / original.height, 0, 1);
  const bottomRatio = clamp(
    (originalTop - cropped.y) / original.height,
    topRatio,
    1,
  );
  const left = clamp(Math.floor(leftRatio * imageWidth), 0, imageWidth - 1);
  const top = clamp(Math.floor(topRatio * imageHeight), 0, imageHeight - 1);
  const right = clamp(Math.ceil(rightRatio * imageWidth), left + 1, imageWidth);
  const bottom = clamp(Math.ceil(bottomRatio * imageHeight), top + 1, imageHeight);
  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
}

export function segmentMaskRegions(mask, width, height, {
  columnGapFactor = 1.5,
  minimumPixels = 4,
  padding = 2,
  rowGap = 2,
} = {}) {
  if (!mask?.length || width <= 0 || height <= 0) return [];
  const rowCounts = new Uint32Array(height);
  for (let y = 0; y < height; y += 1) {
    let count = 0;
    for (let x = 0; x < width; x += 1) count += Number(mask[y * width + x] !== 0);
    rowCounts[y] = count;
  }

  const bands = [];
  let bandTop = -1;
  let lastActiveRow = -1;
  for (let y = 0; y <= height; y += 1) {
    const active = y < height && rowCounts[y] > 0;
    if (active) {
      if (bandTop < 0) bandTop = y;
      lastActiveRow = y;
    }
    if (
      bandTop >= 0
      && (!active && (y - lastActiveRow > rowGap || y === height))
    ) {
      bands.push({ top: bandTop, bottom: lastActiveRow + 1 });
      bandTop = -1;
      lastActiveRow = -1;
    }
  }

  const regions = [];
  for (const band of bands) {
    const bandHeight = band.bottom - band.top;
    const columnGap = Math.max(2, Math.round(bandHeight * columnGapFactor));
    const columnCounts = new Uint32Array(width);
    for (let y = band.top; y < band.bottom; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (mask[y * width + x]) columnCounts[x] += 1;
      }
    }
    let segmentLeft = -1;
    let lastActiveColumn = -1;
    for (let x = 0; x <= width; x += 1) {
      const active = x < width && columnCounts[x] > 0;
      if (active) {
        if (segmentLeft < 0) segmentLeft = x;
        lastActiveColumn = x;
      }
      if (
        segmentLeft >= 0
        && (!active && (x - lastActiveColumn > columnGap || x === width))
      ) {
        let left = width;
        let top = height;
        let right = -1;
        let bottom = -1;
        let pixels = 0;
        for (let y = band.top; y < band.bottom; y += 1) {
          for (let scanX = segmentLeft; scanX <= lastActiveColumn; scanX += 1) {
            if (!mask[y * width + scanX]) continue;
            left = Math.min(left, scanX);
            top = Math.min(top, y);
            right = Math.max(right, scanX);
            bottom = Math.max(bottom, y);
            pixels += 1;
          }
        }
        if (pixels >= minimumPixels && right >= left && bottom >= top) {
          const box = normalizedPixelBox({
            left: left - padding,
            top: top - padding,
            width: right - left + 1 + padding * 2,
            height: bottom - top + 1 + padding * 2,
          }, width, height);
          regions.push({
            left: box.left,
            top: box.top,
            width: box.right - box.left,
            height: box.bottom - box.top,
            pixels,
          });
        }
        segmentLeft = -1;
        lastActiveColumn = -1;
      }
    }
  }
  return regions.sort((first, second) => first.top - second.top || first.left - second.left);
}

export function groupOcrWordBoxes(wordBoxes, width, height, padding = 2) {
  const groups = new Map();
  for (const word of wordBoxes) {
    const hasLineIdentity = [word.pageNumber, word.blockNumber, word.paragraphNumber, word.lineNumber]
      .every(Number.isFinite);
    const key = hasLineIdentity
      ? `${word.pageNumber}:${word.blockNumber}:${word.paragraphNumber}:${word.lineNumber}`
      : `word:${groups.size}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  }

  const regions = [];
  for (const words of groups.values()) {
    words.sort((first, second) => first.left - second.left);
    let left = Math.min(...words.map((word) => word.left));
    let top = Math.min(...words.map((word) => word.top));
    let right = Math.max(...words.map((word) => word.left + word.width));
    let bottom = Math.max(...words.map((word) => word.top + word.height));
    const box = normalizedPixelBox({
      left: left - padding,
      top: top - padding,
      width: right - left + padding * 2,
      height: bottom - top + padding * 2,
    }, width, height);
    const weight = words.reduce((sum, word) => sum + Math.max(1, word.width * word.height), 0);
    const confidence = words.reduce(
      (sum, word) => sum + word.confidence * Math.max(1, word.width * word.height),
      0,
    ) / weight;
    regions.push({
      left: box.left,
      top: box.top,
      width: box.right - box.left,
      height: box.bottom - box.top,
      confidence,
      text: words.map((word) => word.text).join(" "),
      words,
    });
  }
  return regions.sort((first, second) => first.top - second.top || first.left - second.left);
}

export function ocrLineRegionsFromBlocks(blocks, width, height, padding = 2) {
  const regions = [];
  for (const block of blocks || []) {
    for (const paragraph of block?.paragraphs || []) {
      for (const line of paragraph?.lines || []) {
        const source = line?.bbox;
        if (!source) continue;
        const inkLeft = Number(source.x0);
        const inkTop = Number(source.y0);
        const inkRight = Number(source.x1);
        const inkBottom = Number(source.y1);
        if (![inkLeft, inkTop, inkRight, inkBottom].every(Number.isFinite)) continue;
        if (inkRight <= inkLeft || inkBottom <= inkTop) continue;
        const box = normalizedPixelBox({
          left: inkLeft - padding,
          top: inkTop - padding,
          width: inkRight - inkLeft + padding * 2,
          height: inkBottom - inkTop + padding * 2,
        }, width, height);
        const words = (line.words || []).map((word) => ({
          left: Number(word?.bbox?.x0),
          top: Number(word?.bbox?.y0),
          width: Number(word?.bbox?.x1) - Number(word?.bbox?.x0),
          height: Number(word?.bbox?.y1) - Number(word?.bbox?.y0),
          confidence: Number(word?.confidence),
          text: String(word?.text || "").trim(),
          fontName: String(word?.font_name || ""),
          symbols: ocrSymbolsFromWord(word),
        })).filter((word) => (
          word.text
          && [word.left, word.top, word.width, word.height, word.confidence].every(Number.isFinite)
          && word.width > 0
          && word.height > 0
        ));
        const rowHeight = Number(line?.rowAttributes?.rowHeight);
        const baselineY = Number(line?.baseline?.y0);
        regions.push({
          left: box.left,
          top: box.top,
          width: box.right - box.left,
          height: box.bottom - box.top,
          inkLeft,
          inkTop,
          inkWidth: inkRight - inkLeft,
          inkHeight: inkBottom - inkTop,
          baselineY: Number.isFinite(baselineY) ? baselineY : inkBottom,
          fontSizePixels: Number.isFinite(rowHeight) && rowHeight > 0
            ? rowHeight
            : inkBottom - inkTop,
          confidence: Number.isFinite(Number(line.confidence))
            ? Number(line.confidence)
            : (words.length ? median(words.map((word) => word.confidence)) : 0),
          text: String(line.text || words.map((word) => word.text).join(" ")).trim(),
          words,
          symbols: words.flatMap((word) => word.symbols),
        });
      }
    }
  }
  return regions.sort((first, second) => first.top - second.top || first.left - second.left);
}

export function ocrWordRegionsFromBlocks(blocks, width, height, padding = 2) {
  const regions = [];
  for (const block of blocks || []) {
    for (const paragraph of block?.paragraphs || []) {
      for (const line of paragraph?.lines || []) {
        const rowHeight = Number(line?.rowAttributes?.rowHeight);
        const lineBaseline = Number(line?.baseline?.y0);
        for (const sourceWord of line?.words || []) {
          const inkLeft = Number(sourceWord?.bbox?.x0);
          const inkTop = Number(sourceWord?.bbox?.y0);
          const inkRight = Number(sourceWord?.bbox?.x1);
          const inkBottom = Number(sourceWord?.bbox?.y1);
          const confidence = Number(sourceWord?.confidence);
          const text = String(sourceWord?.text || "").trim();
          if (
            !text
            || ![inkLeft, inkTop, inkRight, inkBottom].every(Number.isFinite)
            || inkRight <= inkLeft
            || inkBottom <= inkTop
          ) {
            continue;
          }
          const box = normalizedPixelBox({
            left: inkLeft - padding,
            top: inkTop - padding,
            width: inkRight - inkLeft + padding * 2,
            height: inkBottom - inkTop + padding * 2,
          }, width, height);
          const word = {
            left: inkLeft,
            top: inkTop,
            width: inkRight - inkLeft,
            height: inkBottom - inkTop,
            confidence: Number.isFinite(confidence) ? confidence : 0,
            text,
            fontName: String(sourceWord?.font_name || ""),
            symbols: ocrSymbolsFromWord(sourceWord),
          };
          regions.push({
            left: box.left,
            top: box.top,
            width: box.right - box.left,
            height: box.bottom - box.top,
            inkLeft,
            inkTop,
            inkWidth: inkRight - inkLeft,
            inkHeight: inkBottom - inkTop,
            baselineY: Number.isFinite(lineBaseline) ? lineBaseline : inkBottom,
            fontSizePixels: Number.isFinite(rowHeight) && rowHeight > 0
              ? rowHeight
              : inkBottom - inkTop,
            confidence: word.confidence,
            text,
            words: [word],
            symbols: word.symbols,
          });
        }
      }
    }
  }
  return regions.sort((first, second) => first.top - second.top || first.left - second.left);
}

export function dilateMask(mask, width, height, radius = 1) {
  if (radius <= 0) return new Uint8Array(mask);
  const output = new Uint8Array(mask.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!mask[y * width + x]) continue;
      const minY = Math.max(0, y - radius);
      const maxY = Math.min(height - 1, y + radius);
      const minX = Math.max(0, x - radius);
      const maxX = Math.min(width - 1, x + radius);
      for (let scanY = minY; scanY <= maxY; scanY += 1) {
        output.fill(255, scanY * width + minX, scanY * width + maxX + 1);
      }
    }
  }
  return output;
}

export function buildTextMask(imageData, wordBoxes = []) {
  const { data, width, height } = imageData;
  const mask = new Uint8Array(width * height);
  const boxes = wordBoxes.length
    ? wordBoxes
    : [{ left: 1, top: 1, width: Math.max(1, width - 2), height: Math.max(1, height - 2) }];

  for (const sourceBox of boxes) {
    const box = normalizedPixelBox(sourceBox, width, height);
    const pad = clamp(Math.round(Math.min(box.right - box.left, box.bottom - box.top) * 0.08), 2, 8);
    const sampleBox = {
      left: Math.max(0, box.left - pad),
      top: Math.max(0, box.top - pad),
      right: Math.min(width, box.right + pad),
      bottom: Math.min(height, box.bottom + pad),
    };
    const borderR = [];
    const borderG = [];
    const borderB = [];
    const borderL = [];
    const histogram = new Uint32Array(256);
    let pixelCount = 0;

    for (let y = sampleBox.top; y < sampleBox.bottom; y += 1) {
      for (let x = sampleBox.left; x < sampleBox.right; x += 1) {
        const offset = (y * width + x) * 4;
        const gray = Math.round(luminance(data[offset], data[offset + 1], data[offset + 2]));
        histogram[gray] += 1;
        pixelCount += 1;
        const onBorder = y < box.top || y >= box.bottom || x < box.left || x >= box.right;
        if (onBorder) {
          borderR.push(data[offset]);
          borderG.push(data[offset + 1]);
          borderB.push(data[offset + 2]);
          borderL.push(gray);
        }
      }
    }

    const backgroundR = median(borderR);
    const backgroundG = median(borderG);
    const backgroundB = median(borderB);
    const backgroundL = borderL.length ? median(borderL) : luminance(backgroundR, backgroundG, backgroundB);
    const threshold = otsuThreshold(histogram, pixelCount);
    const darkText = backgroundL >= threshold;
    const polarityMargin = Math.max(4, Math.abs(backgroundL - threshold) * 0.08);

    for (let y = sampleBox.top; y < sampleBox.bottom; y += 1) {
      for (let x = sampleBox.left; x < sampleBox.right; x += 1) {
        const offset = (y * width + x) * 4;
        const red = data[offset];
        const green = data[offset + 1];
        const blue = data[offset + 2];
        const gray = luminance(red, green, blue);
        const colorDistance = Math.hypot(
          red - backgroundR,
          green - backgroundG,
          blue - backgroundB,
        );
        const luminanceDistance = Math.abs(gray - backgroundL);
        const polarityMatches = darkText
          ? gray <= threshold + polarityMargin
          : gray >= threshold - polarityMargin;
        if (
          (polarityMatches && luminanceDistance >= 10 && colorDistance >= 16)
          || (colorDistance >= 42 && luminanceDistance >= 6)
        ) {
          mask[y * width + x] = 255;
        }
      }
    }
  }

  return dilateMask(mask, width, height, 1);
}

export function inpaintFallback(imageData, sourceMask) {
  const { width, height } = imageData;
  const data = new Uint8ClampedArray(imageData.data);
  const pending = new Uint8Array(sourceMask);
  const queued = new Uint8Array(pending.length);
  const queue = new Uint32Array(pending.length);
  let head = 0;
  let tail = 0;

  function hasKnownNeighbor(index) {
    const x = index % width;
    const y = Math.floor(index / width);
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (!dx && !dy) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && !pending[ny * width + nx]) return true;
      }
    }
    return false;
  }

  for (let index = 0; index < pending.length; index += 1) {
    if (pending[index] && hasKnownNeighbor(index)) {
      queue[tail++] = index;
      queued[index] = 1;
    }
  }

  while (head < tail) {
    const index = queue[head++];
    if (!pending[index]) continue;
    const x = index % width;
    const y = Math.floor(index / width);
    let red = 0;
    let green = 0;
    let blue = 0;
    let count = 0;
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (!dx && !dy) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const neighbor = ny * width + nx;
        if (pending[neighbor]) continue;
        const offset = neighbor * 4;
        red += data[offset];
        green += data[offset + 1];
        blue += data[offset + 2];
        count += 1;
      }
    }
    if (!count) continue;
    const offset = index * 4;
    data[offset] = Math.round(red / count);
    data[offset + 1] = Math.round(green / count);
    data[offset + 2] = Math.round(blue / count);
    data[offset + 3] = 255;
    pending[index] = 0;

    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const neighbor = ny * width + nx;
        if (pending[neighbor] && !queued[neighbor]) {
          queue[tail++] = neighbor;
          queued[neighbor] = 1;
        }
      }
    }
  }

  return { data, width, height };
}

export function foregroundFromDifference(original, background, mask = null) {
  if (original.width !== background.width || original.height !== background.height) {
    throw new Error("Foreground images must have matching dimensions.");
  }
  const output = new Uint8ClampedArray(original.data.length);
  for (let pixel = 0; pixel < original.width * original.height; pixel += 1) {
    if (mask && !mask[pixel]) continue;
    const offset = pixel * 4;
    const difference = Math.max(
      Math.abs(original.data[offset] - background.data[offset]),
      Math.abs(original.data[offset + 1] - background.data[offset + 1]),
      Math.abs(original.data[offset + 2] - background.data[offset + 2]),
    );
    if (difference < 2) continue;
    const alpha = difference >= 12 ? 1 : clamp((difference - 2) / 10, 0, 1);
    for (let channel = 0; channel < 3; channel += 1) {
      const source = original.data[offset + channel];
      const backdrop = background.data[offset + channel];
      output[offset + channel] = alpha >= 0.999
        ? source
        : clamp(Math.round((source - (1 - alpha) * backdrop) / Math.max(alpha, 0.01)), 0, 255);
    }
    output[offset + 3] = Math.round(alpha * 255);
  }
  return { data: output, width: original.width, height: original.height };
}

function dominantForegroundSample(imageData) {
  const buckets = new Map();
  let opaquePixels = 0;
  for (let offset = 0; offset < imageData.data.length; offset += 4) {
    const alpha = imageData.data[offset + 3];
    if (alpha < 96) continue;
    opaquePixels += 1;
    const red = imageData.data[offset] >> 4;
    const green = imageData.data[offset + 1] >> 4;
    const blue = imageData.data[offset + 2] >> 4;
    const key = (red << 8) | (green << 4) | blue;
    buckets.set(key, (buckets.get(key) || 0) + alpha);
  }
  let bestKey = 0;
  let bestWeight = -1;
  for (const [key, weight] of buckets) {
    if (weight > bestWeight) {
      bestKey = key;
      bestWeight = weight;
    }
  }
  const red = ((bestKey >> 8) & 15) * 17;
  const green = ((bestKey >> 4) & 15) * 17;
  const blue = (bestKey & 15) * 17;
  return {
    color: `#${[red, green, blue].map((value) => value.toString(16).padStart(2, "0")).join("")}`,
    opaquePixels,
    weight: Math.max(0, bestWeight),
  };
}

export function dominantForegroundColor(imageData) {
  return dominantForegroundSample(imageData).color;
}

function rgbFromHex(color) {
  const value = Number.parseInt(String(color || "").replace(/^#/, ""), 16);
  return [
    (value >> 16) & 255,
    (value >> 8) & 255,
    value & 255,
  ];
}

function rgbDistance(first, second) {
  return Math.hypot(
    first[0] - second[0],
    first[1] - second[1],
    first[2] - second[2],
  );
}

function rgbHex(rgb) {
  return `#${rgb.map((value) => (
    clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0")
  )).join("")}`;
}

function sourceForegroundSample(imageData, sourceBox) {
  const glyphBox = normalizedPixelBox(sourceBox, imageData.width, imageData.height);
  const sampleBox = normalizedPixelBox({
    left: glyphBox.left - 2,
    top: glyphBox.top - 2,
    width: glyphBox.right - glyphBox.left + 4,
    height: glyphBox.bottom - glyphBox.top + 4,
  }, imageData.width, imageData.height);
  const borderRed = [];
  const borderGreen = [];
  const borderBlue = [];
  for (let y = sampleBox.top; y < sampleBox.bottom; y += 1) {
    for (let x = sampleBox.left; x < sampleBox.right; x += 1) {
      if (
        x >= glyphBox.left
        && x < glyphBox.right
        && y >= glyphBox.top
        && y < glyphBox.bottom
      ) continue;
      const offset = (y * imageData.width + x) * 4;
      if (imageData.data[offset + 3] < 32) continue;
      borderRed.push(imageData.data[offset]);
      borderGreen.push(imageData.data[offset + 1]);
      borderBlue.push(imageData.data[offset + 2]);
    }
  }
  const background = borderRed.length
    ? [median(borderRed), median(borderGreen), median(borderBlue)]
    : [255, 255, 255];
  const buckets = new Map();
  let foregroundPixels = 0;
  for (let y = glyphBox.top; y < glyphBox.bottom; y += 1) {
    for (let x = glyphBox.left; x < glyphBox.right; x += 1) {
      const offset = (y * imageData.width + x) * 4;
      const alpha = imageData.data[offset + 3];
      if (alpha < 32) continue;
      const rgb = [
        imageData.data[offset],
        imageData.data[offset + 1],
        imageData.data[offset + 2],
      ];
      const distance = rgbDistance(rgb, background);
      if (distance < 20) continue;
      foregroundPixels += 1;
      const key = ((rgb[0] >> 4) << 8) | ((rgb[1] >> 4) << 4) | (rgb[2] >> 4);
      const weight = alpha * Math.max(1, distance - 8);
      buckets.set(key, (buckets.get(key) || 0) + weight);
    }
  }
  let bestKey = 0;
  let bestWeight = -1;
  for (const [key, weight] of buckets) {
    if (weight > bestWeight) {
      bestKey = key;
      bestWeight = weight;
    }
  }
  const rgb = [
    ((bestKey >> 8) & 15) * 17,
    ((bestKey >> 4) & 15) * 17,
    (bestKey & 15) * 17,
  ];
  return {
    color: rgbHex(rgb),
    foregroundPixels,
    rgb,
    weight: Math.max(0, bestWeight),
  };
}

function representativeSymbolColor(symbols) {
  const buckets = new Map();
  for (const symbol of symbols) {
    const key = symbol.color;
    const weight = Math.max(1, symbol.colorPixels || 0);
    buckets.set(key, (buckets.get(key) || 0) + weight);
  }
  let bestColor = symbols[0]?.color || "#111111";
  let bestWeight = -1;
  for (const [color, weight] of buckets) {
    if (weight > bestWeight) {
      bestColor = color;
      bestWeight = weight;
    }
  }
  return bestColor;
}

export function splitOcrRegionsByColor(
  imageData,
  sourceRegions,
  { minimumDistance = 70, padding = 2, sourcePixels = false } = {},
) {
  const regions = [];
  for (const region of sourceRegions || []) {
    let symbols = (region.symbols || region.words?.flatMap((word) => word.symbols || []) || [])
      .filter((symbol) => (
        String(symbol.text || "")
        && [symbol.left, symbol.top, symbol.width, symbol.height].every(Number.isFinite)
      ));
    const letterHeights = symbols
      .filter((symbol) => /[\p{L}\p{N}]/u.test(symbol.text))
      .map((symbol) => symbol.height);
    const typicalLetterHeight = median(letterHeights);
    while (
      symbols.length > 1
      && /^[\[\]\|]$/.test(symbols[0].text)
      && (!typicalLetterHeight || symbols[0].height >= typicalLetterHeight * 1.2)
    ) symbols = symbols.slice(1);
    while (
      symbols.length > 1
      && /^[\[\]\|]$/.test(symbols.at(-1).text)
      && (!typicalLetterHeight || symbols.at(-1).height >= typicalLetterHeight * 1.2)
    ) symbols = symbols.slice(0, -1);
    if (symbols.length < 2) {
      regions.push(region);
      continue;
    }
    const coloredSymbols = symbols.map((symbol) => {
      const crop = cropImageData(imageData, symbol);
      const sample = sourcePixels
        ? sourceForegroundSample(imageData, symbol)
        : dominantForegroundSample(crop);
      return {
        ...symbol,
        color: sample.color,
        rgb: sample.rgb || rgbFromHex(sample.color),
        colorPixels: sample.foregroundPixels ?? sample.opaquePixels,
      };
    });
    if (coloredSymbols.some((symbol) => symbol.colorPixels < 2)) {
      regions.push(region);
      continue;
    }
    const runs = [];
    for (const symbol of coloredSymbols) {
      const current = runs.at(-1);
      if (!current || rgbDistance(current.rgb, symbol.rgb) >= minimumDistance) {
        runs.push({ rgb: symbol.rgb, symbols: [symbol] });
      } else {
        current.symbols.push(symbol);
      }
    }
    if (runs.length < 2 || runs.length > 8) {
      regions.push({
        ...region,
        text: symbols.map((symbol) => symbol.text).join(""),
        color: representativeSymbolColor(coloredSymbols),
      });
      continue;
    }
    for (const run of runs) {
      const left = Math.min(...run.symbols.map((symbol) => symbol.left));
      const top = Math.min(...run.symbols.map((symbol) => symbol.top));
      const right = Math.max(...run.symbols.map((symbol) => symbol.left + symbol.width));
      const bottom = Math.max(...run.symbols.map((symbol) => symbol.top + symbol.height));
      const box = normalizedPixelBox({
        left: left - padding,
        top: top - padding,
        width: right - left + padding * 2,
        height: bottom - top + padding * 2,
      }, imageData.width, imageData.height);
      const runBox = {
        left: box.left,
        top: box.top,
        width: box.right - box.left,
        height: box.bottom - box.top,
      };
      const text = run.symbols.map((symbol) => symbol.text).join("");
      regions.push({
        ...region,
        ...runBox,
        inkLeft: left,
        inkTop: top,
        inkWidth: right - left,
        inkHeight: bottom - top,
        text,
        words: [{
          ...(region.words?.[0] || {}),
          left,
          top,
          width: right - left,
          height: bottom - top,
          text,
          symbols: run.symbols,
        }],
        symbols: run.symbols,
        color: representativeSymbolColor(run.symbols),
      });
    }
  }
  return regions.sort((first, second) => first.top - second.top || first.left - second.left);
}

export function suppressOcrFrameLines(imageData) {
  const { width, height } = imageData;
  const data = new Uint8ClampedArray(imageData.data);
  if (width < 8 || height < 8) {
    return { data, width, height, horizontalLines: [], verticalLines: [], removedPixels: 0 };
  }
  const sampleDepth = Math.max(1, Math.min(4, Math.floor(Math.min(width, height) * 0.04)));
  const borderRed = [];
  const borderGreen = [];
  const borderBlue = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (
        x >= sampleDepth
        && x < width - sampleDepth
        && y >= sampleDepth
        && y < height - sampleDepth
      ) continue;
      const offset = (y * width + x) * 4;
      borderRed.push(data[offset]);
      borderGreen.push(data[offset + 1]);
      borderBlue.push(data[offset + 2]);
    }
  }
  const background = [
    median(borderRed),
    median(borderGreen),
    median(borderBlue),
  ];
  const backgroundLuminance = luminance(...background);
  const ink = new Uint8Array(width * height);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const offset = pixel * 4;
    const distance = Math.hypot(
      data[offset] - background[0],
      data[offset + 1] - background[1],
      data[offset + 2] - background[2],
    );
    const luminanceDistance = Math.abs(
      luminance(data[offset], data[offset + 1], data[offset + 2]) - backgroundLuminance,
    );
    if (distance >= 32 && luminanceDistance >= 15) ink[pixel] = 1;
  }
  const outerRows = Math.max(2, Math.floor(height * 0.24));
  const outerColumns = Math.max(2, Math.floor(width * 0.24));
  const horizontalLines = [];
  for (let y = 0; y < height; y += 1) {
    if (y >= outerRows && y < height - outerRows) continue;
    let count = 0;
    for (let x = 0; x < width; x += 1) count += ink[y * width + x];
    if (count >= width * 0.58) horizontalLines.push(y);
  }
  const verticalLineSet = new Set();
  let groupStart = 0;
  while (groupStart < horizontalLines.length) {
    let groupEnd = groupStart + 1;
    while (
      groupEnd < horizontalLines.length
      && horizontalLines[groupEnd] <= horizontalLines[groupEnd - 1] + 1
    ) groupEnd += 1;
    let bestRun = null;
    for (const y of horizontalLines.slice(groupStart, groupEnd)) {
      let runStart = -1;
      let lastInk = -1;
      for (let x = 0; x <= width; x += 1) {
        const occupied = x < width && ink[y * width + x];
        if (occupied) {
          if (runStart < 0) runStart = x;
          lastInk = x;
        }
        if (runStart >= 0 && (!occupied && (x - lastInk > 1 || x === width))) {
          const run = { left: runStart, right: lastInk, width: lastInk - runStart + 1 };
          if (!bestRun || run.width > bestRun.width) bestRun = run;
          runStart = -1;
          lastInk = -1;
        }
      }
    }
    if (bestRun?.width >= width * 0.5) {
      for (const x of [bestRun.left, bestRun.right]) {
        if (x < outerColumns || x >= width - outerColumns) verticalLineSet.add(x);
      }
    }
    groupStart = groupEnd;
  }
  if (horizontalLines.length) {
    for (let x = 0; x < width; x += 1) {
      if (x >= outerColumns && x < width - outerColumns) continue;
      let count = 0;
      let longestRun = 0;
      let currentRun = 0;
      let gap = 0;
      for (let y = 0; y < height; y += 1) {
        let occupied = false;
        for (let scanX = Math.max(0, x - 1); scanX <= Math.min(width - 1, x + 1); scanX += 1) {
          if (ink[y * width + scanX]) {
            occupied = true;
            break;
          }
        }
        if (occupied) {
          count += 1;
          currentRun += gap + 1;
          gap = 0;
          longestRun = Math.max(longestRun, currentRun);
        } else if (currentRun && gap < 1) {
          gap += 1;
        } else {
          currentRun = 0;
          gap = 0;
        }
      }
      if (
        count >= height * 0.55
        && longestRun >= height * 0.48
        && horizontalLines.some((y) => ink[y * width + x])
      ) {
        verticalLineSet.add(x);
      }
    }
  }
  const verticalLines = [...verticalLineSet].sort((first, second) => first - second);
  const radius = clamp(Math.round(Math.min(width, height) / 70), 2, 5);
  const removed = new Uint8Array(width * height);
  for (const y of horizontalLines) {
    const top = Math.max(0, y - radius);
    const bottom = Math.min(height - 1, y + radius);
    for (let scanY = top; scanY <= bottom; scanY += 1) {
      removed.fill(1, scanY * width, (scanY + 1) * width);
    }
  }
  for (const x of verticalLines) {
    const left = Math.max(0, x - radius * (x >= width / 2 ? 2 : 1));
    const right = Math.min(width - 1, x + radius * (x < width / 2 ? 2 : 1));
    for (let y = 0; y < height; y += 1) {
      removed.fill(1, y * width + left, y * width + right + 1);
    }
  }
  let removedPixels = 0;
  for (let pixel = 0; pixel < removed.length; pixel += 1) {
    if (!removed[pixel]) continue;
    removedPixels += 1;
    const offset = pixel * 4;
    data[offset] = background[0];
    data[offset + 1] = background[1];
    data[offset + 2] = background[2];
    data[offset + 3] = 255;
  }
  return {
    data,
    width,
    height,
    horizontalLines,
    verticalLines,
    removedPixels,
  };
}

export function parseTsvWordBoxes(tsv, { minimumConfidence = 15 } = {}) {
  if (!tsv) return [];
  const lines = String(tsv).trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split("\t");
  const indexOf = (name) => headers.indexOf(name);
  const levelIndex = indexOf("level");
  const pageIndex = indexOf("page_num");
  const blockIndex = indexOf("block_num");
  const paragraphIndex = indexOf("par_num");
  const lineIndex = indexOf("line_num");
  const wordIndex = indexOf("word_num");
  const leftIndex = indexOf("left");
  const topIndex = indexOf("top");
  const widthIndex = indexOf("width");
  const heightIndex = indexOf("height");
  const confidenceIndex = indexOf("conf");
  const textIndex = indexOf("text");
  const boxes = [];
  for (const line of lines.slice(1)) {
    const columns = line.split("\t");
    if (Number(columns[levelIndex]) !== 5) continue;
    const confidence = Number(columns[confidenceIndex]);
    const text = columns.slice(textIndex).join("\t").trim();
    if (!text || !Number.isFinite(confidence) || confidence < minimumConfidence) continue;
    const box = {
      left: Number(columns[leftIndex]),
      top: Number(columns[topIndex]),
      width: Number(columns[widthIndex]),
      height: Number(columns[heightIndex]),
      confidence,
      text,
      pageNumber: Number(columns[pageIndex]),
      blockNumber: Number(columns[blockIndex]),
      paragraphNumber: Number(columns[paragraphIndex]),
      lineNumber: Number(columns[lineIndex]),
      wordNumber: Number(columns[wordIndex]),
    };
    if (box.width > 0 && box.height > 0) boxes.push(box);
  }
  return boxes;
}
