import {
  boundsFromPoints,
  clamp,
  cropImageData,
  dominantForegroundColor,
  expandBounds,
  imageCropBoxFromBounds,
  normalizeBounds,
  ocrLineRegionsFromBlocks,
  parseTsvWordBoxes,
} from "./pdf-image-tools.mjs";
import { createWorkerTaskClient } from "../shared/worker-client.mjs";
import {
  editedSingleLineWidth,
  fittedTracking,
  matchPdfTextMetric,
  pdfTextMetricFromItem,
  typographyFromPdfTextMetrics,
} from "./pdf-text-metrics.mjs";

const MAX_NATIVE_OBJECTS_PER_PAGE = 3000;
const MAX_EDIT_PIXELS = 8_000_000;
const MAX_IMAGE_BYTES = 50 * 1024 * 1024;
const MIN_OBJECT_SIZE = 2;
const EDIT_RENDER_SCALE = 3;
const OCR_RENDER_SCALE = 4;
const HISTORY_LIMIT = 100;
const OCR_UNCERTAIN_CONFIDENCE = 70;
const MAX_SEGMENTED_OBJECTS = 120;
const EDITOR_FONT_FAMILIES = {
  sans: "Excelsis Liberation Sans",
  light: "Excelsis Roboto Light",
  serif: "Excelsis Liberation Serif",
  mono: "Excelsis Liberation Mono",
};
const EDITOR_FONT_FILES = {
  "sans:400:normal": "LiberationSans-Regular.ttf",
  "sans:700:normal": "LiberationSans-Bold.ttf",
  "sans:400:italic": "LiberationSans-Italic.ttf",
  "sans:700:italic": "LiberationSans-BoldItalic.ttf",
  "light:400:normal": "Roboto-Light.ttf",
  "light:700:normal": "Roboto-Bold.ttf",
  "light:400:italic": "Roboto-LightItalic.ttf",
  "light:700:italic": "Roboto-BoldItalic.ttf",
  "serif:400:normal": "LiberationSerif-Regular.ttf",
  "serif:700:normal": "LiberationSerif-Bold.ttf",
  "serif:400:italic": "LiberationSerif-Italic.ttf",
  "serif:700:italic": "LiberationSerif-BoldItalic.ttf",
  "mono:400:normal": "LiberationMono-Regular.ttf",
  "mono:700:normal": "LiberationMono-Bold.ttf",
  "mono:400:italic": "LiberationMono-Italic.ttf",
  "mono:700:italic": "LiberationMono-BoldItalic.ttf",
};
const EDITOR_FONT_CANDIDATES = Object.keys(EDITOR_FONT_FILES).map((key) => {
  const [family, weight, style] = key.split(":");
  return { family, weight, style };
});

function editorFontKey(object) {
  return `${object.fontFamily || "sans"}:${object.fontWeight || "400"}:${object.fontStyle || "normal"}`;
}

function editorFontFamily(object) {
  if (object.useNativeFont && object.nativeFontFamily) return object.nativeFontFamily;
  return EDITOR_FONT_FAMILIES[object.fontFamily] || EDITOR_FONT_FAMILIES.sans;
}

function editorCanvasFont(object, size = object.fontSize) {
  const family = editorFontFamily(object);
  return `${object.fontStyle || "normal"} ${object.fontWeight || "400"} ${Math.max(1, size)}px "${family}"`;
}

function copyBounds(bounds) {
  return {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };
}

function boundsEqual(first, second) {
  return ["x", "y", "width", "height"].every(
    (key) => Math.abs(first[key] - second[key]) < 0.001,
  );
}

function textFromOperatorArguments(args) {
  let result = "";
  const visit = (value) => {
    if (Array.isArray(value) || ArrayBuffer.isView(value)) {
      for (const item of value) visit(item);
    } else if (value && typeof value === "object" && typeof value.unicode === "string") {
      result += value.unicode;
    }
  };
  visit(args);
  return result;
}

function hexToRgb(hex) {
  const normalized = /^#[0-9a-f]{6}$/i.test(hex) ? hex.slice(1) : "111111";
  return [
    parseInt(normalized.slice(0, 2), 16) / 255,
    parseInt(normalized.slice(2, 4), 16) / 255,
    parseInt(normalized.slice(4, 6), 16) / 255,
  ];
}

function imageDataFromCanvas(canvas) {
  return canvas.getContext("2d", { willReadFrequently: true }).getImageData(
    0,
    0,
    canvas.width,
    canvas.height,
  );
}

function imageDataToDataUrl(imageData) {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  canvas.getContext("2d").putImageData(
    imageData instanceof ImageData
      ? imageData
      : new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height),
    0,
    0,
  );
  return canvas.toDataURL("image/png");
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The selected image could not be decoded."));
    image.src = dataUrl;
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

async function cropImageDataUrl(dataUrl, originalBounds, croppedBounds) {
  const image = await loadImage(dataUrl);
  const sourceBox = imageCropBoxFromBounds(
    originalBounds,
    croppedBounds,
    image.naturalWidth,
    image.naturalHeight,
  );
  const canvas = document.createElement("canvas");
  canvas.width = sourceBox.width;
  canvas.height = sourceBox.height;
  canvas.getContext("2d").drawImage(
    image,
    sourceBox.left,
    sourceBox.top,
    sourceBox.width,
    sourceBox.height,
    0,
    0,
    sourceBox.width,
    sourceBox.height,
  );
  return canvas.toDataURL("image/png");
}

function dataUrlBytes(dataUrl) {
  const comma = dataUrl.indexOf(",");
  const binary = atob(dataUrl.slice(comma + 1));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function cleanOcrText(text) {
  return String(text || "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function operationSets(pdfjs) {
  const text = new Set([
    pdfjs.OPS.showText,
    pdfjs.OPS.showSpacedText,
    pdfjs.OPS.nextLineShowText,
    pdfjs.OPS.nextLineSetSpacingShowText,
  ].filter(Number.isFinite));
  const imageMasks = new Set([
    pdfjs.OPS.paintImageMaskXObject,
    pdfjs.OPS.paintImageMaskXObjectGroup,
    pdfjs.OPS.paintImageMaskXObjectRepeat,
    pdfjs.OPS.paintSolidColorImageMask,
  ].filter(Number.isFinite));
  const images = new Set([
    ...imageMasks,
    pdfjs.OPS.paintImageXObject,
    pdfjs.OPS.paintInlineImageXObject,
    pdfjs.OPS.paintInlineImageXObjectGroup,
    pdfjs.OPS.paintImageXObjectRepeat,
  ].filter(Number.isFinite));
  return { text, images, imageMasks };
}

function stateOf(object) {
  return {
    activated: object.activated,
    assetDataUrl: object.assetDataUrl,
    baselineOffset: object.baselineOffset,
    bounds: copyBounds(object.bounds),
    color: object.color,
    deleted: object.deleted,
    fontFamily: object.fontFamily,
    fontSize: object.fontSize,
    fontStyle: object.fontStyle,
    fontWeight: object.fontWeight,
    horizontalScale: object.horizontalScale,
    letterSpacing: object.letterSpacing,
    lineHeight: object.lineHeight,
    opacity: object.opacity,
    removed: object.removed,
    renderMode: object.renderMode,
    rotation: object.rotation,
    sourceTextWidth: object.sourceTextWidth,
    text: object.text,
    textInsetX: object.textInsetX,
    useNativeFont: object.useNativeFont,
  };
}

function statesEqual(first, second) {
  return (
    first.activated === second.activated
    && first.assetDataUrl === second.assetDataUrl
    && first.baselineOffset === second.baselineOffset
    && first.color === second.color
    && first.deleted === second.deleted
    && first.fontFamily === second.fontFamily
    && first.fontSize === second.fontSize
    && first.fontStyle === second.fontStyle
    && first.fontWeight === second.fontWeight
    && first.horizontalScale === second.horizontalScale
    && first.letterSpacing === second.letterSpacing
    && first.lineHeight === second.lineHeight
    && first.opacity === second.opacity
    && first.removed === second.removed
    && first.renderMode === second.renderMode
    && first.rotation === second.rotation
    && first.sourceTextWidth === second.sourceTextWidth
    && first.text === second.text
    && first.textInsetX === second.textInsetX
    && first.useNativeFont === second.useNativeFont
    && boundsEqual(first.bounds, second.bounds)
  );
}

export function createPdfEditor({
  pdfjs,
  getCurrentPage,
  getEntries,
  getSourceBytes,
  getSourceLabel,
  onStatus,
} = {}) {
  const editorBar = document.getElementById("pdfEditorBar");
  const selectButton = document.getElementById("pdfEditSelect");
  const addTextButton = document.getElementById("pdfAddText");
  const addImageButton = document.getElementById("pdfAddImage");
  const imageInput = document.getElementById("pdfImageFile");
  const ocrButton = document.getElementById("pdfOcrRegion");
  const undoButton = document.getElementById("pdfUndo");
  const redoButton = document.getElementById("pdfRedo");
  const deleteButton = document.getElementById("pdfDeleteObject");
  const objectKind = document.getElementById("pdfObjectKind");
  const widthInput = document.getElementById("pdfObjectWidth");
  const heightInput = document.getElementById("pdfObjectHeight");
  const textInput = document.getElementById("pdfObjectText");
  const fontSizeInput = document.getElementById("pdfFontSize");
  const fontFamilyInput = document.getElementById("pdfFontFamily");
  const fontVariantInput = document.getElementById("pdfFontVariant");
  const characterSpacingInput = document.getElementById("pdfCharacterSpacing");
  const colorInput = document.getElementById("pdfObjectColor");
  const colorValue = document.getElementById("pdfObjectColorValue");
  const opacityInput = document.getElementById("pdfObjectOpacity");
  const objectMenu = document.getElementById("pdfObjectMenu");
  const moveObjectButton = document.getElementById("pdfMoveObject");
  const rewriteTextButton = document.getElementById("pdfRewriteText");
  const recognizeImageTextButton = document.getElementById("pdfRecognizeImageText");
  const cropImageButton = document.getElementById("pdfCropImage");
  const operationListCache = new WeakMap();
  const objects = new Map();
  const history = [];
  const redoHistory = [];
  const {
    text: textOperations,
    images: imageOperations,
    imageMasks: imageMaskOperations,
  } = operationSets(pdfjs);

  let nextObjectId = 1;
  let mode = "select";
  let selectedObject = null;
  let readOnly = false;
  let busy = false;
  let controlBefore = null;
  let moveArmedObject = null;
  let cropModeObject = null;
  let inlineTextEditor = null;
  let ocrWorkerPromise = null;
  let editorFontsPromise = null;
  const nativeFontPromises = new Map();
  const textMeasureCanvas = document.createElement("canvas");
  const textMeasureContext = textMeasureCanvas.getContext("2d");
  const imageWorker = createWorkerTaskClient(
    new URL("./pdf-image-worker.js", import.meta.url),
    {
      name: "excelsis-pdf-image",
      type: "classic",
      defaultTimeoutMs: 10 * 60 * 1000,
    },
  );

  function status(message) {
    onStatus?.(message);
  }

  function currentEntry() {
    const entries = getEntries?.() || [];
    return entries[clamp((Number(getCurrentPage?.()) || 1) - 1, 0, Math.max(0, entries.length - 1))] || null;
  }

  function closeObjectMenu() {
    if (objectMenu) objectMenu.hidden = true;
  }

  function setMoveArmed(object) {
    if (object && inlineTextEditor?.object === object) closeInlineTextEditor();
    const previous = moveArmedObject;
    moveArmedObject = object && object === selectedObject ? object : null;
    if (previous && previous !== moveArmedObject) refreshObject(previous);
    if (moveArmedObject) refreshObject(moveArmedObject);
    updateControls();
  }

  function setCropMode(object) {
    const previous = cropModeObject;
    cropModeObject = object
      && object === selectedObject
      && object.kind === "image"
      && object.assetDataUrl
      ? object
      : null;
    if (cropModeObject) moveArmedObject = null;
    if (previous && previous !== cropModeObject) refreshObject(previous);
    if (cropModeObject) refreshObject(cropModeObject);
    updateControls();
  }

  function showObjectMenu(object, event) {
    if (!objectMenu || readOnly || busy) return;
    selectObject(object);
    closeObjectMenu();
    if (rewriteTextButton) {
      rewriteTextButton.hidden = false;
      rewriteTextButton.textContent = object.kind === "text" ? "Edit text" : "Edit image";
    }
    if (recognizeImageTextButton) recognizeImageTextButton.hidden = object.kind !== "image";
    if (cropImageButton) cropImageButton.hidden = object.kind !== "image";
    objectMenu.hidden = false;
    const rect = objectMenu.getBoundingClientRect();
    const left = clamp(event.clientX, 6, Math.max(6, window.innerWidth - rect.width - 6));
    const top = clamp(event.clientY, 6, Math.max(6, window.innerHeight - rect.height - 6));
    objectMenu.style.left = `${left}px`;
    objectMenu.style.top = `${top}px`;
    rewriteTextButton?.focus();
  }

  function setToolbarMode(nextMode) {
    mode = nextMode;
    selectButton?.setAttribute("aria-pressed", String(mode === "select"));
    addTextButton?.setAttribute("aria-pressed", String(mode === "text"));
    ocrButton?.setAttribute("aria-pressed", String(mode === "ocr"));
    for (const entry of getEntries?.() || []) {
      entry.editorLayer?.classList.toggle("region-mode", mode === "ocr" || mode === "text");
    }
  }

  function setBusy(nextBusy) {
    busy = nextBusy;
    updateControls();
  }

  function isDirty() {
    for (const object of objects.values()) {
      if (object.removed) continue;
      if (object.source !== "native" || object.activated) return true;
    }
    return false;
  }

  function updateHistoryControls() {
    if (undoButton) undoButton.disabled = readOnly || busy || !history.length;
    if (redoButton) redoButton.disabled = readOnly || busy || !redoHistory.length;
  }

  function updateControls() {
    const editable = !!selectedObject && !selectedObject.removed && !selectedObject.deleted;
    const textObject = editable && selectedObject.kind === "text";
    const textEditable = textObject && selectedObject.renderMode === "text";
    for (const control of [selectButton, addTextButton, addImageButton, ocrButton]) {
      if (control) control.disabled = readOnly || busy;
    }
    if (deleteButton) deleteButton.disabled = readOnly || busy || !editable;
    if (moveObjectButton) moveObjectButton.disabled = readOnly || busy || !editable;
    if (rewriteTextButton) {
      rewriteTextButton.disabled = readOnly || busy || !editable;
    }
    if (recognizeImageTextButton) {
      recognizeImageTextButton.disabled = readOnly || busy || !editable || selectedObject.kind !== "image";
    }
    if (cropImageButton) {
      cropImageButton.disabled = readOnly
        || busy
        || !editable
        || selectedObject.kind !== "image"
        || !selectedObject.assetDataUrl;
      cropImageButton.textContent = cropModeObject === selectedObject ? "Cancel crop" : "Crop image";
    }
    if (widthInput) {
      widthInput.disabled = readOnly || busy || !editable;
      widthInput.value = editable ? String(Math.round(selectedObject.bounds.width * 10) / 10) : "";
    }
    if (heightInput) {
      heightInput.disabled = readOnly || busy || !editable;
      heightInput.value = editable ? String(Math.round(selectedObject.bounds.height * 10) / 10) : "";
    }
    if (textInput) {
      textInput.disabled = readOnly || busy || !textEditable;
      textInput.value = textEditable ? selectedObject.text : "";
    }
    if (fontSizeInput) {
      fontSizeInput.disabled = readOnly || busy || !textEditable;
      fontSizeInput.value = textEditable ? String(Math.round(selectedObject.fontSize * 10) / 10) : "";
    }
    if (fontFamilyInput) {
      fontFamilyInput.disabled = readOnly || busy || !textEditable;
      fontFamilyInput.value = textEditable ? selectedObject.fontFamily : "sans";
    }
    if (fontVariantInput) {
      fontVariantInput.disabled = readOnly || busy || !textEditable;
      fontVariantInput.value = textEditable
        ? `${selectedObject.fontWeight}:${selectedObject.fontStyle}`
        : "400:normal";
    }
    if (characterSpacingInput) {
      characterSpacingInput.disabled = readOnly || busy || !textEditable;
      characterSpacingInput.value = textEditable
        ? String(Math.round(selectedObject.letterSpacing * 100) / 100)
        : "";
    }
    if (colorInput) {
      colorInput.disabled = readOnly || busy || !textEditable;
      colorInput.value = textEditable ? selectedObject.color : "#111111";
    }
    if (colorValue) colorValue.value = colorInput?.value || "#111111";
    if (opacityInput) {
      opacityInput.disabled = readOnly || busy || !editable;
      opacityInput.value = editable ? String(selectedObject.opacity) : "1";
    }
    if (objectKind) {
      if (!editable) {
        objectKind.textContent = "No selection";
      } else if (selectedObject.source === "ocr") {
        const label = selectedObject.ocrUncertain
          ? "OCR uncertain"
          : "OCR";
        const appearance = selectedObject.renderMode === "image"
          ? "original appearance"
          : "editable matched text";
        objectKind.textContent = `${label} ${appearance}${moveArmedObject === selectedObject ? " - move unlocked" : ""}`;
      } else if (selectedObject.kind === "text" && selectedObject.renderMode === "image") {
        objectKind.textContent = `text - original appearance${moveArmedObject === selectedObject ? " - move unlocked" : ""}`;
      } else {
        objectKind.textContent = `${selectedObject.kind}`
          + `${cropModeObject === selectedObject ? " - crop handles" : ""}`
          + `${moveArmedObject === selectedObject ? " - move unlocked" : ""}`;
      }
    }
    updateHistoryControls();
  }

  function applyState(object, state) {
    object.activated = state.activated;
    object.assetDataUrl = state.assetDataUrl;
    object.baselineOffset = state.baselineOffset;
    object.bounds = copyBounds(state.bounds);
    object.color = state.color;
    object.deleted = state.deleted;
    object.fontFamily = state.fontFamily;
    object.fontSize = state.fontSize;
    object.fontStyle = state.fontStyle;
    object.fontWeight = state.fontWeight;
    object.horizontalScale = state.horizontalScale;
    object.letterSpacing = state.letterSpacing;
    object.lineHeight = state.lineHeight;
    object.opacity = state.opacity;
    object.removed = state.removed;
    object.renderMode = state.renderMode;
    object.rotation = state.rotation;
    object.sourceTextWidth = state.sourceTextWidth;
    object.text = state.text;
    object.textInsetX = state.textInsetX;
    object.useNativeFont = state.useNativeFont;
    refreshObject(object);
  }

  function pushStateHistory(object, before) {
    const after = stateOf(object);
    if (statesEqual(before, after)) return;
    history.push({ type: "state", object, before, after });
    if (history.length > HISTORY_LIMIT) history.shift();
    redoHistory.length = 0;
    updateControls();
  }

  function pushAddHistory(object) {
    history.push({ type: "add", object });
    if (history.length > HISTORY_LIMIT) history.shift();
    redoHistory.length = 0;
    updateControls();
  }

  function pushAddGroupHistory(groupObjects) {
    if (!groupObjects.length) return;
    history.push({ type: "add-group", objects: [...groupObjects] });
    if (history.length > HISTORY_LIMIT) history.shift();
    redoHistory.length = 0;
    updateControls();
  }

  function pushReplaceWithGroupHistory(object, before, groupObjects) {
    if (!object || !groupObjects.length) return;
    history.push({
      type: "replace-with-group",
      object,
      before,
      after: stateOf(object),
      objects: [...groupObjects],
    });
    if (history.length > HISTORY_LIMIT) history.shift();
    redoHistory.length = 0;
    updateControls();
  }

  function applyHistoryAction(action, undo) {
    if (action.type === "add") {
      action.object.removed = undo;
      refreshObject(action.object);
      if (undo && selectedObject === action.object) selectObject(null);
      return;
    }
    if (action.type === "add-group") {
      for (const object of action.objects) {
        object.removed = undo;
        refreshObject(object);
      }
      if (undo && action.objects.includes(selectedObject)) selectObject(null);
      return;
    }
    if (action.type === "replace-with-group") {
      applyState(action.object, undo ? action.before : action.after);
      for (const object of action.objects) {
        object.removed = undo;
        refreshObject(object);
      }
      if (undo && action.objects.includes(selectedObject)) selectObject(action.object);
      return;
    }
    applyState(action.object, undo ? action.before : action.after);
  }

  function undo() {
    if (readOnly || busy || !history.length) return;
    const action = history.pop();
    applyHistoryAction(action, true);
    redoHistory.push(action);
    updateControls();
  }

  function redo() {
    if (readOnly || busy || !redoHistory.length) return;
    const action = redoHistory.pop();
    applyHistoryAction(action, false);
    history.push(action);
    updateControls();
  }

  function pageBounds(entry) {
    const [x1, y1, x2, y2] = entry.page.view;
    return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
  }

  function constrainBounds(entry, sourceBounds) {
    const page = pageBounds(entry);
    const width = clamp(Math.abs(sourceBounds.width), MIN_OBJECT_SIZE, page.width);
    const height = clamp(Math.abs(sourceBounds.height), MIN_OBJECT_SIZE, page.height);
    return {
      x: clamp(sourceBounds.x, page.x - width + MIN_OBJECT_SIZE, page.x + page.width - MIN_OBJECT_SIZE),
      y: clamp(sourceBounds.y, page.y - height + MIN_OBJECT_SIZE, page.y + page.height - MIN_OBJECT_SIZE),
      width,
      height,
    };
  }

  function pdfTransformForBounds(bounds, viewport) {
    const topLeft = viewport.convertToViewportPoint(bounds.x, bounds.y + bounds.height);
    const topRight = viewport.convertToViewportPoint(
      bounds.x + bounds.width,
      bounds.y + bounds.height,
    );
    const bottomLeft = viewport.convertToViewportPoint(bounds.x, bounds.y);
    return [
      (topRight[0] - topLeft[0]) / Math.max(bounds.width, 0.001),
      (topRight[1] - topLeft[1]) / Math.max(bounds.width, 0.001),
      (bottomLeft[0] - topLeft[0]) / Math.max(bounds.height, 0.001),
      (bottomLeft[1] - topLeft[1]) / Math.max(bounds.height, 0.001),
      topLeft[0],
      topLeft[1],
    ];
  }

  function positionElement(element, bounds, viewport) {
    if (!element || !viewport) return;
    const transform = pdfTransformForBounds(bounds, viewport);
    element.style.width = `${Math.max(bounds.width, 0.001)}px`;
    element.style.height = `${Math.max(bounds.height, 0.001)}px`;
    element.style.transform = `matrix(${transform.join(",")})`;
  }

  function ensureEditorFonts() {
    if (editorFontsPromise) return editorFontsPromise;
    editorFontsPromise = document.fonts
      ? Promise.all(EDITOR_FONT_CANDIDATES.map(({ family, weight, style }) => (
        document.fonts.load(
          `${style} ${weight} 24px "${EDITOR_FONT_FAMILIES[family]}"`,
        )
      )))
      : Promise.resolve();
    return editorFontsPromise;
  }

  function ensureNativeFont(object) {
    if (!object?.useNativeFont || !object.nativeFontFamily || !object.nativeFontData) {
      return Promise.resolve();
    }
    let promise = nativeFontPromises.get(object.nativeFontKey || object.nativeFontFamily);
    if (!promise) {
      promise = (async () => {
        const source = object.nativeFontData instanceof Uint8Array
          ? object.nativeFontData
          : new Uint8Array(object.nativeFontData);
        const fontFace = new FontFace(
          object.nativeFontFamily,
          source.slice().buffer,
          {
            style: object.fontStyle || "normal",
            weight: object.fontWeight || "400",
          },
        );
        await fontFace.load();
        document.fonts?.add(fontFace);
        return true;
      })().catch((error) => {
        console.warn(`Could not load embedded PDF font ${object.nativeFontName || object.nativeFontFamily}.`, error);
        return false;
      });
      nativeFontPromises.set(object.nativeFontKey || object.nativeFontFamily, promise);
    }
    return promise.then((loaded) => {
      if (!loaded) object.useNativeFont = false;
    });
  }

  function measuredTextWidth(object, text = object.text, size = object.fontSize) {
    textMeasureContext.font = editorCanvasFont(object, size);
    return textMeasureContext.measureText(String(text)).width;
  }

  function fittedLetterSpacing(object, text = object.text, size = object.fontSize) {
    const characters = [...String(text)];
    return fittedTracking({
      sourceWidth: object.sourceTextWidth,
      naturalWidth: measuredTextWidth(object, text, size),
      horizontalScale: object.horizontalScale,
      characterCount: characters.length,
      fontSize: size,
    });
  }

  function dilateBinaryMask(mask, width, height, radius = 1) {
    const output = new Uint8Array(mask.length);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (!mask[y * width + x]) continue;
        for (let scanY = Math.max(0, y - radius); scanY <= Math.min(height - 1, y + radius); scanY += 1) {
          output.fill(1, scanY * width + Math.max(0, x - radius), scanY * width + Math.min(width, x + radius + 1));
        }
      }
    }
    return output;
  }

  function renderTypographyMask(width, height, text, typography) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.font = editorCanvasFont(typography, typography.fontSize);
    context.fillStyle = "#000";
    context.textBaseline = "alphabetic";
    const horizontalScale = typography.horizontalScale || 1;
    context.save();
    context.translate(typography.textInsetX, typography.baselineOffset);
    if (typography.rotation) context.rotate(-typography.rotation);
    context.scale(horizontalScale, 1);
    context.letterSpacing = `${typography.letterSpacing / horizontalScale}px`;
    context.fillText(text, 0, 0);
    context.restore();
    const pixels = context.getImageData(0, 0, width, height).data;
    const mask = new Uint8Array(width * height);
    for (let pixel = 0; pixel < mask.length; pixel += 1) {
      mask[pixel] = pixels[pixel * 4 + 3] >= 48 ? 1 : 0;
    }
    return mask;
  }

  function typographyMaskScore(sourceMask, dilatedSource, candidateMask, width, height) {
    const dilatedCandidate = dilateBinaryMask(candidateMask, width, height, 1);
    let sourcePixels = 0;
    let candidatePixels = 0;
    let sourceMatches = 0;
    let candidateMatches = 0;
    for (let index = 0; index < sourceMask.length; index += 1) {
      if (sourceMask[index]) {
        sourcePixels += 1;
        if (dilatedCandidate[index]) sourceMatches += 1;
      }
      if (candidateMask[index]) {
        candidatePixels += 1;
        if (dilatedSource[index]) candidateMatches += 1;
      }
    }
    if (!sourcePixels || !candidatePixels) return 0;
    const recall = sourceMatches / sourcePixels;
    const precision = candidateMatches / candidatePixels;
    const shapeScore = (2 * recall * precision) / Math.max(0.0001, recall + precision);
    const inkDensityScore = Math.pow(
      Math.min(sourcePixels, candidatePixels) / Math.max(sourcePixels, candidatePixels),
      0.8,
    );
    return shapeScore * inkDensityScore;
  }

  async function inferOcrTypography(foregroundCrop, region, scale) {
    await ensureEditorFonts();
    const width = foregroundCrop.width;
    const height = foregroundCrop.height;
    const sourceMask = new Uint8Array(width * height);
    for (let pixel = 0; pixel < sourceMask.length; pixel += 1) {
      sourceMask[pixel] = foregroundCrop.data[pixel * 4 + 3] >= 48 ? 1 : 0;
    }
    const dilatedSource = dilateBinaryMask(sourceMask, width, height, 1);
    const cropBox = foregroundCrop.box;
    const inkLeft = Number.isFinite(region.inkLeft)
      ? region.inkLeft
      : Math.min(...(region.words || []).map((word) => word.left), region.left);
    const inkWidth = Number.isFinite(region.inkWidth)
      ? region.inkWidth
      : Math.max(1, region.width - 4);
    const baselineY = Number.isFinite(region.baselineY)
      ? region.baselineY
      : region.top + region.height - 2;
    const basePixelSize = clamp(
      Number(region.fontSizePixels)
        || median((region.words || []).map((word) => word.height))
        || region.height * 0.78,
      4,
      512,
    );
    const smallText = basePixelSize <= 32;
    let best = null;
    const bestByFont = new Map();
    const considerCandidate = (candidate, typography, score) => {
      const selectionScore = score
        * (candidate.style === "italic" ? (smallText ? 0.9 : 0.94) : 1)
        * (candidate.weight === "700" ? (smallText ? 0.94 : 0.99) : 1)
        * (candidate.family === "serif" ? (smallText ? 0.97 : 0.995) : 1);
      const key = `${candidate.family}:${candidate.weight}:${candidate.style}`;
      const previous = bestByFont.get(key);
      if (!previous || selectionScore > previous.selectionScore) {
        bestByFont.set(key, { ...typography, score, selectionScore });
      }
      if (!best || selectionScore > best.selectionScore) {
        best = { ...typography, score, selectionScore };
      }
    };
    for (const candidate of EDITOR_FONT_CANDIDATES) {
      for (const sizeFactor of [0.72, 0.8, 0.88, 0.96, 1.04, 1.12]) {
        const baseTypography = {
          ...candidate,
          fontFamily: candidate.family,
          fontWeight: candidate.weight,
          fontStyle: candidate.style,
          fontSize: basePixelSize * sizeFactor,
          textInsetX: clamp(inkLeft - cropBox.left, 0, width),
          baselineOffset: clamp(baselineY - cropBox.top, 1, height + basePixelSize),
          sourceTextWidth: clamp(inkWidth, 1, width),
          rotation: 0,
        };
        const naturalWidth = measuredTextWidth(
          baseTypography,
          region.text,
          baseTypography.fontSize,
        );
        const inferredScale = clamp(
          baseTypography.sourceTextWidth / Math.max(0.01, naturalWidth),
          0.45,
          2.2,
        );
        for (const horizontalScale of [
          clamp(inferredScale * 0.92, 0.45, 2.2),
          inferredScale,
          clamp(inferredScale * 1.08, 0.45, 2.2),
        ]) {
          const typography = {
            ...baseTypography,
            horizontalScale,
          };
          typography.letterSpacing = fittedLetterSpacing(
            typography,
            region.text,
            typography.fontSize,
          );
          const mask = renderTypographyMask(width, height, region.text, typography);
          const score = typographyMaskScore(sourceMask, dilatedSource, mask, width, height);
          considerCandidate(candidate, typography, score);
        }
      }
    }
    const divisor = Math.max(0.01, scale);
    const convertedTypography = (choice) => ({
      fontFamily: choice?.fontFamily || "sans",
      fontWeight: choice?.fontWeight || "400",
      fontStyle: choice?.fontStyle || "normal",
      fontSize: clamp((choice?.fontSize || basePixelSize) / divisor, 1, 500),
      horizontalScale: clamp(choice?.horizontalScale || 1, 0.05, 8),
      letterSpacing: (choice?.letterSpacing || 0) / divisor,
      baselineOffset: (choice?.baselineOffset || height * 0.8) / divisor,
      textInsetX: (choice?.textInsetX || 0) / divisor,
      sourceTextWidth: (choice?.sourceTextWidth || width) / divisor,
      rotation: 0,
      typographyScore: choice?.score || 0,
      selectionScore: choice?.selectionScore || 0,
    });
    return {
      ...convertedTypography(best),
      candidateTypographies: Object.fromEntries(
        [...bestByFont].map(([key, choice]) => [key, convertedTypography(choice)]),
      ),
    };
  }

  function harmonizeSmallOcrLines(specifications) {
    const groups = [];
    for (const specification of [...specifications].sort(
      (first, second) => (
        Number(first.region.baselineY) - Number(second.region.baselineY)
        || first.region.left - second.region.left
      ),
    )) {
      const baseline = Number(specification.region.baselineY);
      const height = Number(specification.region.fontSizePixels)
        || Number(specification.region.height)
        || 1;
      const group = groups.find((candidate) => (
        candidate.color === specification.color
        && Math.abs(candidate.baseline - baseline) <= Math.max(2, candidate.height * 0.3)
        && Math.max(candidate.height, height) / Math.max(1, Math.min(candidate.height, height)) <= 1.25
      ));
      if (group) {
        const count = group.items.length;
        group.items.push(specification);
        group.baseline = (group.baseline * count + baseline) / (count + 1);
        group.height = (group.height * count + height) / (count + 1);
      } else {
        groups.push({
          baseline,
          color: specification.color,
          height,
          items: [specification],
        });
      }
    }

    for (const group of groups) {
      if (
        group.items.length < 3
        || Math.max(...group.items.map((item) => item.typography.fontSize)) > 12
      ) {
        continue;
      }
      const candidateKeys = Object.keys(
        group.items[0].typography.candidateTypographies || {},
      ).filter((key) => group.items.every(
        (item) => item.typography.candidateTypographies?.[key],
      ));
      let sharedKey = "";
      let sharedScore = -Infinity;
      for (const key of candidateKeys) {
        let weightedLogScore = 0;
        let totalWeight = 0;
        for (const item of group.items) {
          const candidate = item.typography.candidateTypographies[key];
          const weight = Math.max(1, [...String(item.region.text || "")].length);
          weightedLogScore += Math.log(Math.max(0.000001, candidate.selectionScore)) * weight;
          totalWeight += weight;
        }
        const score = weightedLogScore / Math.max(1, totalWeight);
        if (score > sharedScore) {
          sharedKey = key;
          sharedScore = score;
        }
      }
      if (!sharedKey) continue;

      const selected = group.items.map(
        (item) => item.typography.candidateTypographies[sharedKey],
      );
      const maskSpecifications = group.items.map((item) => {
        const sourceMask = new Uint8Array(
          item.foregroundCrop.width * item.foregroundCrop.height,
        );
        for (let pixel = 0; pixel < sourceMask.length; pixel += 1) {
          sourceMask[pixel] = item.foregroundCrop.data[pixel * 4 + 3] >= 48 ? 1 : 0;
        }
        return {
          dilatedSource: dilateBinaryMask(
            sourceMask,
            item.foregroundCrop.width,
            item.foregroundCrop.height,
            1,
          ),
          sourceMask,
        };
      });
      const distinctNumbers = (values) => [...new Set(
        values.filter(Number.isFinite).map((value) => Math.round(value * 1_000_000) / 1_000_000),
      )];
      const baseFontSize = median(selected.map((candidate) => candidate.fontSize));
      let sharedFit = null;
      for (const fontSize of distinctNumbers([
        baseFontSize * 0.72,
        baseFontSize * 0.8,
        baseFontSize * 0.88,
        baseFontSize * 0.96,
        baseFontSize,
        baseFontSize * 1.04,
        baseFontSize * 1.12,
      ])) {
        const widths = group.items.map((item, index) => ({
          gaps: Math.max(0, [...String(item.region.text || "")].length - 1),
          naturalWidth: measuredTextWidth(
            { ...selected[index], fontSize },
            item.region.text,
            fontSize,
          ),
          sourceWidth: selected[index].sourceTextWidth,
        }));
        const baseScale = median(selected.map((candidate) => candidate.horizontalScale));
        const widthScale = median(widths.map(
          (item) => item.sourceWidth / Math.max(0.01, item.naturalWidth),
        ));
        for (const horizontalScale of distinctNumbers([
          baseScale * 0.92,
          baseScale,
          baseScale * 1.08,
          widthScale * 0.92,
          widthScale,
          widthScale * 1.08,
        ]).map((value) => clamp(value, 0.45, 2.2))) {
          const exactSpacing = median(widths.map((item) => fittedTracking({
            sourceWidth: item.sourceWidth,
            naturalWidth: item.naturalWidth,
            horizontalScale,
            characterCount: item.gaps + 1,
            fontSize,
          })));
          const baseSpacing = median(selected.map((candidate) => candidate.letterSpacing));
          for (const letterSpacing of distinctNumbers([
            0,
            baseSpacing,
            exactSpacing * 0.85,
            exactSpacing,
            exactSpacing * 1.15,
          ]).map((value) => clamp(
            value,
            -fontSize * horizontalScale * 0.95,
            fontSize * 2,
          ))) {
            let weightedLogScore = 0;
            let totalWeight = 0;
            for (const [index, item] of group.items.entries()) {
              const renderScale = Math.max(0.01, Number(item.renderScale) || 1);
              const typography = {
                ...selected[index],
                fontSize: fontSize * renderScale,
                horizontalScale,
                letterSpacing: letterSpacing * renderScale,
                baselineOffset: selected[index].baselineOffset * renderScale,
                textInsetX: selected[index].textInsetX * renderScale,
                sourceTextWidth: selected[index].sourceTextWidth * renderScale,
              };
              const candidateMask = renderTypographyMask(
                item.foregroundCrop.width,
                item.foregroundCrop.height,
                item.region.text,
                typography,
              );
              const score = typographyMaskScore(
                maskSpecifications[index].sourceMask,
                maskSpecifications[index].dilatedSource,
                candidateMask,
                item.foregroundCrop.width,
                item.foregroundCrop.height,
              );
              const weight = Math.max(1, [...String(item.region.text || "")].length);
              weightedLogScore += Math.log(Math.max(0.000001, score)) * weight;
              totalWeight += weight;
            }
            const score = weightedLogScore / Math.max(1, totalWeight);
            if (!sharedFit || score > sharedFit.score) {
              sharedFit = {
                fontSize,
                horizontalScale,
                letterSpacing,
                score,
              };
            }
          }
        }
      }
      if (!sharedFit) continue;

      for (const [index, item] of group.items.entries()) {
        item.typography = {
          ...selected[index],
          fontSize: sharedFit.fontSize,
          horizontalScale: sharedFit.horizontalScale,
          letterSpacing: sharedFit.letterSpacing,
          typographyScore: Math.exp(sharedFit.score),
          uniformMaskFit: true,
        };
      }
    }
  }

  function styleInlineTextEditor(session) {
    if (!session?.element?.isConnected || !session.object?.root) return;
    const { element, object, singleLine } = session;
    const horizontalScale = clamp(Number(object.horizontalScale) || 1, 0.05, 8);
    const viewportScale = Math.max(0.01, Number(object.entry?.displayViewport?.scale) || 1);
    const minimumLocalHeight = 18 / viewportScale;
    element.style.color = object.color;
    element.style.fontFamily = `"${editorFontFamily(object)}"`;
    element.style.fontSize = `${object.fontSize}px`;
    element.style.fontStyle = object.fontStyle;
    element.style.fontWeight = object.fontWeight;
    element.style.lineHeight = singleLine ? "1" : String(object.lineHeight);
    if (singleLine) {
      const localHeight = Math.max(object.fontSize * 1.35, minimumLocalHeight);
      element.style.left = `${object.textInsetX}px`;
      element.style.top = `${object.baselineOffset - object.fontSize}px`;
      element.style.width = `${
        Math.max(
          (object.bounds.width - object.textInsetX) / horizontalScale,
          object.fontSize * 3,
        )
      }px`;
      element.style.height = `${localHeight}px`;
      element.style.letterSpacing = `${object.letterSpacing / horizontalScale}px`;
      element.style.transform = `rotate(${-Number(object.rotation || 0)}rad) scaleX(${horizontalScale})`;
      element.style.transformOrigin = "0 50%";
    } else {
      element.style.inset = "0";
      element.style.width = "100%";
      element.style.height = "100%";
      element.style.letterSpacing = `${object.letterSpacing}px`;
      element.style.transform = "none";
    }
  }

  function closeInlineTextEditor({ commit = true, revert = false } = {}) {
    const session = inlineTextEditor;
    if (!session) return;
    inlineTextEditor = null;
    const { before, element, object } = session;
    element.remove();
    object.root?.classList.remove("inline-editing");
    if (revert) {
      applyState(object, before);
      return;
    }
    if (commit) {
      resizeEditedTextBounds(object);
      pushStateHistory(object, before);
    }
    refreshObject(object);
  }

  function openInlineTextEditor(object) {
    if (
      readOnly
      || !object
      || object.kind !== "text"
      || object.renderMode !== "text"
      || object.deleted
      || object.removed
    ) return;
    if (inlineTextEditor?.object === object) {
      inlineTextEditor.element.focus();
      inlineTextEditor.element.select();
      return;
    }
    closeInlineTextEditor();
    selectObject(object);
    const singleLine = !object.text.includes("\n");
    const element = document.createElement(singleLine ? "input" : "textarea");
    if (singleLine) element.type = "text";
    element.className = "pdf-inline-text-editor";
    element.value = object.text;
    element.maxLength = 20_000;
    element.spellcheck = false;
    element.setAttribute("aria-label", "Edit PDF text in place");
    const session = {
      before: stateOf(object),
      element,
      object,
      singleLine,
    };
    inlineTextEditor = session;
    object.root.classList.add("inline-editing");
    object.root.append(element);
    styleInlineTextEditor(session);
    element.addEventListener("pointerdown", (event) => event.stopPropagation());
    element.addEventListener("click", (event) => event.stopPropagation());
    element.addEventListener("dblclick", (event) => event.stopPropagation());
    element.addEventListener("input", () => {
      object.activated = true;
      object.text = element.value.slice(0, 20_000);
      updateControls();
    });
    element.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeInlineTextEditor({ commit: false, revert: true });
        object.root?.focus();
      } else if (
        (singleLine && event.key === "Enter")
        || (!singleLine && event.key === "Enter" && (event.ctrlKey || event.metaKey))
      ) {
        event.preventDefault();
        event.stopPropagation();
        closeInlineTextEditor();
        object.root?.focus();
      }
    });
    element.addEventListener("blur", () => {
      if (inlineTextEditor?.element === element) closeInlineTextEditor();
    });
    element.focus();
    element.select();
    status("Editing text in place. Enter applies; Escape restores the previous text.");
  }

  async function beginInlineRewrite(object) {
    await beginRewriteText(object, { focusToolbar: false });
    if (!busy && object?.renderMode === "text") openInlineTextEditor(object);
  }

  function refreshObject(object) {
    const { entry } = object;
    if (!entry?.displayViewport || !object.root) return;
    const showPatch = !object.removed && object.activated && !!object.patchDataUrl;
    object.patchElement.hidden = !showPatch;
    if (showPatch) {
      object.patchElement.src = object.patchDataUrl;
      positionElement(object.patchElement, object.patchBounds, entry.displayViewport);
    }

    const showRoot = !object.removed && !object.deleted;
    object.root.hidden = !showRoot;
    object.root.classList.toggle("selected", showRoot && selectedObject === object);
    object.root.classList.toggle("inactive", object.source === "native" && !object.activated);
    object.root.classList.toggle("move-armed", showRoot && moveArmedObject === object);
    object.root.classList.toggle("crop-mode", showRoot && cropModeObject === object);
    object.root.classList.toggle("inline-editing", inlineTextEditor?.object === object);
    if (showRoot) {
      positionElement(object.root, object.bounds, entry.displayViewport);
      object.root.style.opacity = String(object.opacity);
      object.content.replaceChildren();
      if (object.renderMode === "text") {
        const family = editorFontFamily(object);
        if (object.sourceTextWidth && !object.text.includes("\n")) {
          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.setAttribute("viewBox", `0 0 ${object.bounds.width} ${object.bounds.height}`);
          svg.setAttribute("width", "100%");
          svg.setAttribute("height", "100%");
          svg.setAttribute("overflow", "visible");
          const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
          const rotationDegrees = -(Number(object.rotation) || 0) * 180 / Math.PI;
          group.setAttribute(
            "transform",
            `translate(${object.textInsetX} ${object.baselineOffset}) rotate(${rotationDegrees})`,
          );
          const horizontalScale = clamp(Number(object.horizontalScale) || 1, 0.05, 8);
          const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
          text.textContent = object.text;
          text.setAttribute("x", "0");
          text.setAttribute("y", "0");
          text.setAttribute("fill", object.color);
          text.setAttribute("font-family", family);
          text.setAttribute("font-size", String(object.fontSize));
          text.setAttribute("font-style", object.fontStyle);
          text.setAttribute("font-weight", object.fontWeight);
          text.setAttribute("letter-spacing", String(object.letterSpacing / horizontalScale));
          text.setAttribute("transform", `scale(${horizontalScale} 1)`);
          group.append(text);
          svg.append(group);
          object.content.append(svg);
        } else {
          const text = document.createElement("div");
          text.className = "pdf-edit-text";
          text.textContent = object.text;
          text.style.color = object.color;
          text.style.fontFamily = `"${family}"`;
          text.style.fontSize = `${object.fontSize}px`;
          text.style.fontStyle = object.fontStyle;
          text.style.fontWeight = object.fontWeight;
          text.style.letterSpacing = `${object.letterSpacing}px`;
          text.style.lineHeight = String(object.lineHeight);
          object.content.append(text);
        }
      } else if (object.assetDataUrl) {
        const image = document.createElement("img");
        image.alt = "";
        image.draggable = false;
        image.src = object.assetDataUrl;
        object.content.append(image);
      }
    }
    const nativeHit = object.native?.hitElement;
    nativeHit?.classList.toggle("materialized", !!object.native?.materialized);
    nativeHit?.classList.toggle(
      "interaction-bypass",
      object.deleted
        || object.removed
        || moveArmedObject === object
        || inlineTextEditor?.object === object,
    );
    if (nativeHit && object.kind === "text") {
      nativeHit.title = `Text: ${object.text.slice(0, 120)}`;
      positionElement(nativeHit, object.bounds, entry.displayViewport);
    }
    if (inlineTextEditor?.object === object) styleInlineTextEditor(inlineTextEditor);
    updateControls();
  }

  function refreshEntry(entry) {
    if (!entry?.displayViewport) return;
    for (const native of entry.nativeObjects || []) {
      positionElement(native.hitElement, native.bounds, entry.displayViewport);
    }
    for (const object of entry.editObjects || []) refreshObject(object);
  }

  function selectObject(object) {
    if (inlineTextEditor && inlineTextEditor.object !== object) closeInlineTextEditor();
    if (selectedObject === object) {
      updateControls();
      return;
    }
    const previous = selectedObject;
    const previouslyArmed = moveArmedObject;
    const previouslyCropped = cropModeObject;
    if (moveArmedObject && moveArmedObject !== object) moveArmedObject = null;
    if (cropModeObject && cropModeObject !== object) cropModeObject = null;
    selectedObject = object;
    if (previous) refreshObject(previous);
    if (previouslyArmed && previouslyArmed !== previous) refreshObject(previouslyArmed);
    if (previouslyCropped && previouslyCropped !== previous) refreshObject(previouslyCropped);
    if (selectedObject) refreshObject(selectedObject);
    updateControls();
  }

  function activateObject(object) {
    object.activated = true;
    refreshObject(object);
  }

  function pointerToPdf(entry, event) {
    const pageRect = entry.pageElement.getBoundingClientRect();
    return entry.displayViewport.convertToPdfPoint(
      event.clientX - pageRect.left,
      event.clientY - pageRect.top,
    );
  }

  function beginObjectDrag(object, event) {
    if (readOnly || busy || event.button !== 0) return;
    const handle = event.target.closest(".pdf-resize-handle")?.dataset.handle || "move";
    const cropping = cropModeObject === object && object.kind === "image" && handle !== "move";
    if (cropModeObject === object && handle === "move") {
      event.stopPropagation();
      selectObject(object);
      status("Crop mode is active. Drag a corner or edge handle inward.");
      return;
    }
    if (handle === "move" && (selectedObject !== object || moveArmedObject !== object)) {
      event.stopPropagation();
      selectObject(object);
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    selectObject(object);
    const startPoint = pointerToPdf(object.entry, event);
    const startBounds = copyBounds(object.bounds);
    const before = stateOf(object);
    let moved = false;
    try {
      object.root.setPointerCapture(event.pointerId);
    } catch {
      // Window-level listeners below still keep the resize active.
    }

    const onMove = (moveEvent) => {
      const point = pointerToPdf(object.entry, moveEvent);
      const dx = point[0] - startPoint[0];
      const dy = point[1] - startPoint[1];
      if (!moved && Math.hypot(moveEvent.clientX - event.clientX, moveEvent.clientY - event.clientY) >= 2) {
        moved = true;
        activateObject(object);
      }
      if (!moved) return;
      if (handle === "move") {
        object.bounds = constrainBounds(object.entry, {
          ...startBounds,
          x: startBounds.x + dx,
          y: startBounds.y + dy,
        });
      } else {
        let x1 = startBounds.x;
        let y1 = startBounds.y;
        let x2 = startBounds.x + startBounds.width;
        let y2 = startBounds.y + startBounds.height;
        if (handle.includes("w")) x1 += dx;
        if (handle.includes("e")) x2 += dx;
        if (handle.includes("s")) y1 += dy;
        if (handle.includes("n")) y2 += dy;
        if (cropping) {
          x1 = clamp(x1, startBounds.x, startBounds.x + startBounds.width - MIN_OBJECT_SIZE);
          x2 = clamp(x2, startBounds.x + MIN_OBJECT_SIZE, startBounds.x + startBounds.width);
          y1 = clamp(y1, startBounds.y, startBounds.y + startBounds.height - MIN_OBJECT_SIZE);
          y2 = clamp(y2, startBounds.y + MIN_OBJECT_SIZE, startBounds.y + startBounds.height);
        }
        if (x2 - x1 < MIN_OBJECT_SIZE) {
          if (handle.includes("w")) x1 = x2 - MIN_OBJECT_SIZE;
          else x2 = x1 + MIN_OBJECT_SIZE;
        }
        if (y2 - y1 < MIN_OBJECT_SIZE) {
          if (handle.includes("s")) y1 = y2 - MIN_OBJECT_SIZE;
          else y2 = y1 + MIN_OBJECT_SIZE;
        }
        object.bounds = constrainBounds(object.entry, {
          x: x1,
          y: y1,
          width: x2 - x1,
          height: y2 - y1,
        });
      }
      refreshObject(object);
    };

    const onEnd = async (upEvent) => {
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("pointerup", onEnd, true);
      window.removeEventListener("pointercancel", onEnd, true);
      if (object.root.hasPointerCapture(upEvent.pointerId)) object.root.releasePointerCapture(upEvent.pointerId);
      if (moved && cropping) {
        setBusy(true);
        try {
          object.assetDataUrl = await cropImageDataUrl(
            before.assetDataUrl,
            startBounds,
            object.bounds,
          );
          refreshObject(object);
          pushStateHistory(object, before);
          status("Image cropped. Undo restores the uncropped image.");
        } catch (error) {
          applyState(object, before);
          status(`Could not crop image: ${error.message}`);
        } finally {
          setCropMode(null);
          setBusy(false);
        }
      } else if (moved) {
        pushStateHistory(object, before);
      }
      if (handle === "move") setMoveArmed(null);
    };
    window.addEventListener("pointermove", onMove, true);
    window.addEventListener("pointerup", onEnd, true);
    window.addEventListener("pointercancel", onEnd, true);
  }

  function textNeedsOcr(text) {
    const cleaned = cleanOcrText(text);
    return !cleaned || /[\u0000-\u0008\uFFFD]/.test(cleaned);
  }

  async function prepareOcrCanvas(sourceCanvas) {
    const sourceImage = imageDataFromCanvas(sourceCanvas);
    const prepared = await imageWorker.run("prepare-ocr", {
      source: sourceImage,
    }, {
      transfer: [sourceImage.data.buffer],
    });
    const canvas = document.createElement("canvas");
    canvas.width = prepared.width;
    canvas.height = prepared.height;
    canvas.getContext("2d").putImageData(
      new ImageData(
        prepared.data instanceof Uint8ClampedArray
          ? prepared.data
          : new Uint8ClampedArray(prepared.data),
        prepared.width,
        prepared.height,
      ),
      0,
      0,
    );
    return canvas;
  }

  async function recognizeOcrCanvas(sourceCanvas) {
    const worker = await ensureOcrWorker();
    const ocrCanvas = await prepareOcrCanvas(sourceCanvas);
    const sparseLayout = ocrCanvas.width >= ocrCanvas.height * 1.8;
    await worker.setParameters({
      tessedit_pageseg_mode: sparseLayout ? "11" : "3",
      hocr_font_info: "1",
      preserve_interword_spaces: "1",
    });
    let result = await worker.recognize(
      ocrCanvas,
      {},
      { text: true, tsv: true, blocks: true },
    );
    if (!cleanOcrText(result.data.text)) {
      await worker.setParameters({ tessedit_pageseg_mode: "6" });
      result = await worker.recognize(
        ocrCanvas,
        {},
        { text: true, tsv: true, blocks: true },
      );
    }
    return result;
  }

  async function recognizeTextObject(object) {
    status(`Recognizing selected text on page ${object.pageNumber}...`);
    const spec = cropSpec(object.entry, object.originBounds || object.bounds, OCR_RENDER_SCALE, 1);
    const sourceCanvas = await renderCrop(object.entry, spec, "normal");
    const result = await recognizeOcrCanvas(sourceCanvas);
    const text = cleanOcrText(result.data.text);
    if (!text) throw new Error("No editable text was recognized in this object.");
    const lineRegions = ocrLineRegionsFromBlocks(
      result.data.blocks,
      sourceCanvas.width,
      sourceCanvas.height,
    );
    const recognizedLines = lineRegions
      .map((region) => cleanOcrText(region.text))
      .filter(Boolean);
    if (recognizedLines.length) object.text = recognizedLines.join("\n");
    let inferredTypography = null;
    if (lineRegions.length && object.assetDataUrl) {
      try {
        const asset = await loadImage(object.assetDataUrl);
        const assetCanvas = document.createElement("canvas");
        assetCanvas.width = asset.naturalWidth;
        assetCanvas.height = asset.naturalHeight;
        assetCanvas.getContext("2d").drawImage(asset, 0, 0);
        const assetImage = imageDataFromCanvas(assetCanvas);
        const scaleX = asset.naturalWidth / sourceCanvas.width;
        const scaleY = asset.naturalHeight / sourceCanvas.height;
        const primaryLine = [...lineRegions].sort(
          (first, second) => (second.inkWidth || second.width) - (first.inkWidth || first.width),
        )[0];
        const mappedRegion = {
          ...primaryLine,
          left: primaryLine.left * scaleX,
          top: primaryLine.top * scaleY,
          width: primaryLine.width * scaleX,
          height: primaryLine.height * scaleY,
          inkLeft: primaryLine.inkLeft * scaleX,
          inkWidth: primaryLine.inkWidth * scaleX,
          baselineY: primaryLine.baselineY * scaleY,
          fontSizePixels: primaryLine.fontSizePixels * scaleY,
          words: (primaryLine.words || []).map((word) => ({
            ...word,
            left: word.left * scaleX,
            top: word.top * scaleY,
            width: word.width * scaleX,
            height: word.height * scaleY,
          })),
        };
        const foregroundCrop = cropImageData(assetImage, mappedRegion);
        const assetScale = asset.naturalWidth / Math.max(0.01, object.originBounds.width);
        inferredTypography = await inferOcrTypography(
          foregroundCrop,
          mappedRegion,
          assetScale,
        );
      } catch (error) {
        console.warn("Could not infer selected text typography.", error);
      }
    }
    const fontNames = lineRegions
      .flatMap((region) => region.words || [])
      .map((word) => String(word.fontName || "").toLowerCase())
      .filter(Boolean);
    const fontDescription = fontNames.join(" ");
    if (inferredTypography) {
      object.fontFamily = inferredTypography.fontFamily;
      object.fontWeight = inferredTypography.fontWeight;
      object.fontStyle = inferredTypography.fontStyle;
      object.fontSize = inferredTypography.fontSize;
      object.horizontalScale = inferredTypography.horizontalScale;
      object.letterSpacing = inferredTypography.letterSpacing;
      object.baselineOffset = inferredTypography.baselineOffset;
      object.textInsetX = inferredTypography.textInsetX;
      object.sourceTextWidth = inferredTypography.sourceTextWidth;
      object.rotation = inferredTypography.rotation;
      object.useNativeFont = false;
    } else {
      if (/courier|mono|typewriter/.test(fontDescription)) object.fontFamily = "mono";
      else if (/times|serif|roman|georgia|garamond/.test(fontDescription)) object.fontFamily = "serif";
      else if (fontDescription) object.fontFamily = "sans";
      object.fontWeight = /bold|black|heavy/.test(fontDescription) ? "700" : "400";
      object.fontStyle = /italic|oblique/.test(fontDescription) ? "italic" : "normal";
    }
    const recognizedFontSizes = lineRegions
      .map((region) => Number(region.fontSizePixels) / spec.scale)
      .filter((size) => Number.isFinite(size) && size > 0);
    if (recognizedFontSizes.length && !inferredTypography) {
      object.fontSize = clamp(
        median(recognizedFontSizes),
        1,
        500,
      );
      const baselinePositions = lineRegions
        .map((region) => Number(region.baselineY) / spec.scale)
        .filter(Number.isFinite);
      const baselineGaps = baselinePositions
        .slice(1)
        .map((value, index) => value - baselinePositions[index])
        .filter((value) => value > 0);
      if (baselineGaps.length) {
        object.lineHeight = clamp(median(baselineGaps) / object.fontSize, 0.9, 1.8);
      }
      if (recognizedLines.length > 1) {
        object.fontSize = Math.min(
          object.fontSize,
          object.bounds.height / (recognizedLines.length * object.lineHeight),
        );
      }
      await ensureEditorFonts();
      const widestLine = Math.max(
        ...recognizedLines.map((line) => measuredTextWidth(object, line, object.fontSize)),
        0,
      );
      if (widestLine > object.bounds.width) {
        object.fontSize *= object.bounds.width / widestLine;
      }
      if (recognizedLines.length > 1) object.fontSize *= 0.9;
      object.fontSize = clamp(object.fontSize, 1, 500);
      object.baselineOffset = clamp(
        object.bounds.height * 0.82,
        object.fontSize,
        object.bounds.height + object.fontSize,
      );
    }
    if (!recognizedLines.length) object.text = text;
    if (object.text.includes("\n")) {
      object.sourceTextWidth = 0;
      object.horizontalScale = 1;
      object.letterSpacing = 0;
    } else if (!inferredTypography) {
      object.sourceTextWidth = object.bounds.width;
      object.horizontalScale = 1;
      fitOriginalTextSpacing(object);
    }
  }

  async function beginRewriteText(object, { focusToolbar = true } = {}) {
    if (
      readOnly
      || busy
      || !object
      || object.kind !== "text"
      || object.deleted
      || object.removed
    ) return;
    selectObject(object);
    const before = stateOf(object);
    let usedOcr = false;
    if (textNeedsOcr(object.text)) {
      setBusy(true);
      try {
        await recognizeTextObject(object);
        usedOcr = true;
      } finally {
        setBusy(false);
      }
    }
    if (object.renderMode !== "text") {
      object.activated = true;
      object.renderMode = "text";
      refreshObject(object);
      status(
        usedOcr
          ? "OCR text is editable and replaces the original region. Undo restores the original appearance."
          : object.source === "ocr"
          ? "OCR text is editable and replaces the original region."
          : "Text is editable. Undo restores the exact original appearance.",
      );
    }
    pushStateHistory(object, before);
    if (focusToolbar) {
      textInput?.focus();
      textInput?.select();
    }
  }

  async function beginEditObject(object) {
    if (!object || readOnly || busy) return;
    selectObject(object);
    if (object.kind === "text") {
      await beginRewriteText(object);
      return;
    }
    setCropMode(null);
    status("Image editing enabled. Drag the corner handles to resize, or right-click and choose Crop image.");
  }

  function recognitionBoundsForImage(object) {
    const base = normalizeBounds(object.originBounds || object.bounds);
    const baseArea = Math.max(0.01, base.width * base.height);
    let merged = copyBounds(base);
    for (const native of object.entry?.nativeObjects || []) {
      if (native.kind !== "image") continue;
      const candidate = normalizeBounds(native.bounds);
      const candidateArea = candidate.width * candidate.height;
      if (candidateArea < baseArea * 0.28 || candidateArea > baseArea * 3.25) continue;
      const overlapWidth = Math.max(
        0,
        Math.min(merged.x + merged.width, candidate.x + candidate.width)
          - Math.max(merged.x, candidate.x),
      );
      const overlapHeight = Math.max(
        0,
        Math.min(merged.y + merged.height, candidate.y + candidate.height)
          - Math.max(merged.y, candidate.y),
      );
      if (
        overlapWidth < Math.min(base.width, candidate.width) * 0.2
        || overlapHeight < Math.min(base.height, candidate.height) * 0.45
      ) continue;
      const union = normalizeBounds(boundsFromPoints([
        [merged.x, merged.y],
        [merged.x + merged.width, merged.y + merged.height],
        [candidate.x, candidate.y],
        [candidate.x + candidate.width, candidate.y + candidate.height],
      ]));
      if (
        union.width > base.width * 3.25
        || union.height > base.height * 2.25
        || union.width * union.height > baseArea * 5
      ) continue;
      merged = union;
    }
    return merged;
  }

  async function recognizeImageText(object) {
    if (
      readOnly
      || busy
      || !object
      || object.kind !== "image"
      || object.deleted
      || object.removed
    ) return;
    setCropMode(null);
    setMoveArmed(null);
    return liftOcrRegion(
      object.entry,
      recognitionBoundsForImage(object),
      { replaceObject: object },
    );
  }

  function createObjectDom(object) {
    const patch = document.createElement("img");
    patch.className = "pdf-edit-patch";
    patch.alt = "";
    patch.draggable = false;
    patch.hidden = true;

    const root = document.createElement("div");
    root.className = `pdf-edit-object ${object.kind}-object`;
    root.dataset.objectId = object.id;
    root.tabIndex = 0;
    root.title = object.kind === "text"
      ? "PDF text object. Double-click to edit in place; right-click to unlock moving."
      : "PDF image object. Double-click to recognize its text; right-click for image tools.";
    const content = document.createElement("div");
    content.className = "pdf-edit-content";
    root.append(content);
    for (const handle of ["nw", "n", "ne", "e", "se", "s", "sw", "w"]) {
      const element = document.createElement("span");
      element.className = `pdf-resize-handle handle-${handle}`;
      element.dataset.handle = handle;
      root.append(element);
    }
    root.addEventListener("pointerdown", (event) => beginObjectDrag(object, event));
    root.addEventListener("click", (event) => {
      event.stopPropagation();
      selectObject(object);
    });
    root.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
      showObjectMenu(object, event);
    });
    root.addEventListener("dblclick", (event) => {
      if (readOnly) return;
      event.preventDefault();
      event.stopPropagation();
      const action = object.kind === "text"
        ? beginInlineRewrite(object)
        : recognizeImageText(object);
      action.catch((error) => {
        status(`Could not edit object text: ${error.message}`);
        setBusy(false);
      });
    });
    object.entry.editorLayer.append(patch, root);
    object.patchElement = patch;
    object.root = root;
    object.content = content;
  }

  function registerObject(object, { historyEntry = false, select = true } = {}) {
    object.id ||= `pdf-object-${nextObjectId++}`;
    object.bounds = constrainBounds(object.entry, object.bounds);
    object.originBounds ||= copyBounds(object.bounds);
    object.patchBounds ||= copyBounds(object.originBounds);
    object.activated ??= object.source !== "native";
    object.color ||= "#111111";
    object.deleted ??= false;
    object.fontFamily ||= "sans";
    object.fontSize ||= 12;
    object.fontStyle ||= "normal";
    object.fontWeight ||= "400";
    object.text ||= "";
    object.horizontalScale = clamp(Number(object.horizontalScale) || 1, 0.05, 8);
    object.letterSpacing ??= 0;
    object.lineHeight ||= 1.18;
    object.opacity ??= 1;
    object.removed ??= false;
    object.renderMode ||= object.kind === "text" ? "text" : "image";
    object.rotation = Number(object.rotation) || 0;
    object.sourceTextWidth ??= 0;
    object.textInsetX ??= 0;
    object.baselineOffset ??= object.fontSize;
    object.useNativeFont ??= !!(object.nativeFontData && object.nativeFontFamily);
    objects.set(object.id, object);
    object.entry.editObjects ||= [];
    object.entry.editObjects.push(object);
    createObjectDom(object);
    refreshObject(object);
    if (select) selectObject(object);
    if (historyEntry) pushAddHistory(object);
    return object;
  }

  function deleteSelectedObject() {
    if (readOnly || busy || !selectedObject || selectedObject.deleted || selectedObject.removed) return;
    const object = selectedObject;
    const before = stateOf(object);
    if (object.source === "native" || object.source === "ocr") activateObject(object);
    object.deleted = true;
    refreshObject(object);
    selectObject(null);
    pushStateHistory(object, before);
  }

  async function getOperationList(entry) {
    let promise = operationListCache.get(entry.page);
    if (!promise) {
      promise = entry.page.getOperatorList();
      operationListCache.set(entry.page, promise);
    }
    return promise;
  }

  function operationFilter(entry, operationList, variant) {
    if (variant === "normal") return null;
    const blocked = variant === "no-text" ? textOperations : imageOperations;
    return (index) => !blocked.has(operationList.fnArray[index]);
  }

  function cropSpec(entry, sourceBounds, desiredScale, padding = 0) {
    const bounds = expandBounds(sourceBounds, padding, entry.page.view);
    const unscaledWidth = Math.max(bounds.width, 0.1);
    const unscaledHeight = Math.max(bounds.height, 0.1);
    const limitedScale = Math.min(
      desiredScale,
      Math.sqrt(MAX_EDIT_PIXELS / Math.max(1, unscaledWidth * unscaledHeight)),
    );
    const scale = clamp(limitedScale, 0.5, desiredScale);
    const viewport = entry.page.getViewport({ scale, rotation: 0 });
    const corners = [
      viewport.convertToViewportPoint(bounds.x, bounds.y),
      viewport.convertToViewportPoint(bounds.x + bounds.width, bounds.y),
      viewport.convertToViewportPoint(bounds.x, bounds.y + bounds.height),
      viewport.convertToViewportPoint(bounds.x + bounds.width, bounds.y + bounds.height),
    ];
    const pixelBounds = boundsFromPoints(corners);
    const left = Math.max(0, Math.floor(pixelBounds.x));
    const top = Math.max(0, Math.floor(pixelBounds.y));
    const right = Math.min(Math.ceil(viewport.width), Math.ceil(pixelBounds.x + pixelBounds.width));
    const bottom = Math.min(Math.ceil(viewport.height), Math.ceil(pixelBounds.y + pixelBounds.height));
    const pdfCorners = [
      viewport.convertToPdfPoint(left, top),
      viewport.convertToPdfPoint(right, top),
      viewport.convertToPdfPoint(left, bottom),
      viewport.convertToPdfPoint(right, bottom),
    ];
    return {
      bounds: normalizeBounds(boundsFromPoints(pdfCorners)),
      height: Math.max(1, bottom - top),
      left,
      scale,
      top,
      viewport,
      width: Math.max(1, right - left),
    };
  }

  async function renderCrop(entry, spec, variant = "normal") {
    const canvas = document.createElement("canvas");
    canvas.width = spec.width;
    canvas.height = spec.height;
    const context = canvas.getContext("2d", { alpha: false, willReadFrequently: true });
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    const operationList = await getOperationList(entry);
    await entry.page.render({
      background: "#ffffff",
      canvas,
      canvasContext: context,
      operationsFilter: operationFilter(entry, operationList, variant),
      transform: [1, 0, 0, 1, -spec.left, -spec.top],
      viewport: spec.viewport,
    }).promise;
    return canvas;
  }

  function pdfBoundsFromPixelRegion(spec, region) {
    const left = spec.left + region.left;
    const top = spec.top + region.top;
    const right = left + region.width;
    const bottom = top + region.height;
    return normalizeBounds(boundsFromPoints([
      spec.viewport.convertToPdfPoint(left, top),
      spec.viewport.convertToPdfPoint(right, top),
      spec.viewport.convertToPdfPoint(left, bottom),
      spec.viewport.convertToPdfPoint(right, bottom),
    ]));
  }

  function isLargeScannedImage(native) {
    const page = pageBounds(native.entry);
    return native.bounds.width >= page.width * 0.18
      && native.bounds.height >= page.height * 0.075;
  }

  function nearestObject(objectsToSearch, point) {
    let nearest = objectsToSearch[0] || null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const object of objectsToSearch) {
      const inside = point[0] >= object.bounds.x
        && point[0] <= object.bounds.x + object.bounds.width
        && point[1] >= object.bounds.y
        && point[1] <= object.bounds.y + object.bounds.height;
      if (inside) return object;
      const centerX = object.bounds.x + object.bounds.width / 2;
      const centerY = object.bounds.y + object.bounds.height / 2;
      const distance = Math.hypot(point[0] - centerX, point[1] - centerY);
      if (distance < nearestDistance) {
        nearest = object;
        nearestDistance = distance;
      }
    }
    return nearest;
  }

  async function materializeNative(native) {
    if (native.editObjects?.length) return native.editObjects;
    if (native.materializePromise) return native.materializePromise;
    native.materializePromise = (async () => {
      setBusy(true);
      status(`Separating ${native.kind} object on page ${native.entry.pageNumber}...`);
      try {
        const padding = native.kind === "text" ? 0.75 : 0.25;
        const spec = cropSpec(native.entry, native.bounds, EDIT_RENDER_SCALE, padding);
        const normalCanvas = await renderCrop(native.entry, spec, "normal");
        const backgroundCanvas = await renderCrop(
          native.entry,
          spec,
          native.kind === "text" ? "no-text" : "no-images",
        );
        const normalImage = imageDataFromCanvas(normalCanvas);
        const renderedBackground = imageDataFromCanvas(backgroundCanvas);
        const processed = await imageWorker.run("separate-native", {
          source: normalImage,
          renderedBackground,
          maskLike: native.kind === "image" && native.maskLike,
          segment: isLargeScannedImage(native),
        }, {
          transfer: [normalImage.data.buffer, renderedBackground.data.buffer],
        });
        const replacementBackground = processed.background;
        const foreground = processed.foreground;
        if (native.kind === "image" && native.maskLike) {
          const regions = processed.regions || [];
          if (regions.length > 1 && regions.length <= MAX_SEGMENTED_OBJECTS) {
            const segmentSpecs = [];
            for (const region of regions) {
              const foregroundCrop = cropImageData(foreground, region);
              const backgroundCrop = cropImageData(replacementBackground, foregroundCrop.box);
              const bounds = pdfBoundsFromPixelRegion(spec, foregroundCrop.box);
              if (bounds.width < MIN_OBJECT_SIZE || bounds.height < MIN_OBJECT_SIZE) continue;
              segmentSpecs.push({ backgroundCrop, bounds, foregroundCrop });
            }
            if (segmentSpecs.length > 1) {
              const separated = segmentSpecs.map(({ backgroundCrop, bounds, foregroundCrop }) => (
                registerObject({
                  entry: native.entry,
                  pageNumber: native.entry.pageNumber,
                  kind: bounds.width >= bounds.height * 1.2 ? "text" : "image",
                  source: "native",
                  native,
                  activated: false,
                  bounds,
                  originBounds: copyBounds(bounds),
                  patchBounds: copyBounds(bounds),
                  patchDataUrl: imageDataToDataUrl(backgroundCrop),
                  assetDataUrl: imageDataToDataUrl(foregroundCrop),
                  renderMode: "image",
                  text: "",
                  fontSize: clamp(bounds.height * 0.78, 5, 144),
                  color: dominantForegroundColor(foregroundCrop),
                }, { select: false })
              ));
              native.editObjects = separated;
              native.editObject = separated[0];
              native.materialized = true;
              for (const object of separated) refreshObject(object);
              status(`Separated page ${native.entry.pageNumber} image into ${separated.length} visual objects.`);
              return separated;
            }
          }
        }
        const visualKind = native.kind === "image"
          && native.maskLike
          && native.bounds.width >= native.bounds.height * 1.2
          ? "text"
          : native.kind;
        const nativeTypography = native.kind === "text"
          ? typographyFromPdfTextMetrics(native.textMetrics, spec.bounds)
          : null;
        const object = registerObject({
          entry: native.entry,
          pageNumber: native.entry.pageNumber,
          kind: visualKind,
          source: "native",
          native,
          activated: false,
          bounds: copyBounds(spec.bounds),
          originBounds: copyBounds(spec.bounds),
          patchBounds: copyBounds(spec.bounds),
          patchDataUrl: imageDataToDataUrl(replacementBackground),
          assetDataUrl: imageDataToDataUrl(foreground),
          renderMode: "image",
          text: native.text || "",
          fontSize: clamp(native.bounds.height * 0.78, 5, 144),
          color: dominantForegroundColor(foreground),
          ...nativeTypography,
        }, { select: false });
        if (nativeTypography?.sourceTextWidth) {
          await ensureNativeFont(object);
          if (!object.useNativeFont) await ensureEditorFonts();
          fitOriginalTextSpacing(object);
          refreshObject(object);
        }
        native.editObject = object;
        native.editObjects = [object];
        native.materialized = true;
        refreshObject(object);
        status(`${getSourceLabel?.() || "PDF"} - ${getEntries?.().length || 0} page(s)`);
        return [object];
      } finally {
        setBusy(false);
      }
    })();
    try {
      return await native.materializePromise;
    } finally {
      native.materializePromise = null;
    }
  }

  function boundsFromRecorded(entry, renderViewport, index) {
    const bboxes = entry.page.recordedBBoxes;
    if (!bboxes || bboxes.isEmpty(index)) return null;
    const left = bboxes.minX(index) * renderViewport.width;
    const top = bboxes.minY(index) * renderViewport.height;
    const right = bboxes.maxX(index) * renderViewport.width;
    const bottom = bboxes.maxY(index) * renderViewport.height;
    const bounds = normalizeBounds(boundsFromPoints([
      renderViewport.convertToPdfPoint(left, top),
      renderViewport.convertToPdfPoint(right, top),
      renderViewport.convertToPdfPoint(left, bottom),
      renderViewport.convertToPdfPoint(right, bottom),
    ]));
    return bounds.width >= 0.25 && bounds.height >= 0.25 ? bounds : null;
  }

  function mergeTextNatives(natives) {
    const merged = [];
    for (const native of natives) {
      const previous = merged.at(-1);
      if (previous) {
        const overlap = Math.max(
          0,
          Math.min(previous.bounds.y + previous.bounds.height, native.bounds.y + native.bounds.height)
            - Math.max(previous.bounds.y, native.bounds.y),
        );
        const overlapRatio = overlap / Math.max(0.1, Math.min(previous.bounds.height, native.bounds.height));
        const gap = native.bounds.x - (previous.bounds.x + previous.bounds.width);
        const maxHeight = Math.max(previous.bounds.height, native.bounds.height);
        if (overlapRatio > 0.55 && gap > -maxHeight * 0.25 && gap < maxHeight * 2.5) {
          previous.bounds = normalizeBounds(boundsFromPoints([
            [previous.bounds.x, previous.bounds.y],
            [previous.bounds.x + previous.bounds.width, previous.bounds.y + previous.bounds.height],
            [native.bounds.x, native.bounds.y],
            [native.bounds.x + native.bounds.width, native.bounds.y + native.bounds.height],
          ]));
          const needsSpace = previous.text && native.text
            && !/\s$/.test(previous.text)
            && !/^[,.;:!?)]/.test(native.text);
          previous.text += `${needsSpace ? " " : ""}${native.text}`;
          previous.operationIndices.push(...native.operationIndices);
          previous.textMetrics.push(...native.textMetrics);
          continue;
        }
      }
      merged.push(native);
    }
    return merged;
  }

  function nativeHitElement(native) {
    const hit = document.createElement("button");
    hit.type = "button";
    hit.className = `pdf-native-hit native-${native.kind}`;
    hit.tabIndex = -1;
    hit.title = native.kind === "text"
      ? `Text: ${native.text.slice(0, 120)}`
      : "Image object";
    hit.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (readOnly || busy) return;
      try {
        const point = pointerToPdf(native.entry, event);
        const separated = await materializeNative(native);
        selectObject(nearestObject(separated, point));
      } catch (error) {
        status(`Could not separate PDF object: ${error.message}`);
      }
    });
    hit.addEventListener("dblclick", async (event) => {
      if (readOnly) return;
      event.preventDefault();
      event.stopPropagation();
      try {
        const point = pointerToPdf(native.entry, event);
        const separated = await materializeNative(native);
        const object = nearestObject(separated, point);
        if (object?.kind === "text") await beginInlineRewrite(object);
        else if (object?.kind === "image") await recognizeImageText(object);
      } catch (error) {
        status(`Could not edit PDF text: ${error.message}`);
        setBusy(false);
      }
    });
    hit.addEventListener("contextmenu", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (readOnly || busy) return;
      const menuPoint = { clientX: event.clientX, clientY: event.clientY };
      try {
        const point = pointerToPdf(native.entry, event);
        const separated = await materializeNative(native);
        const object = nearestObject(separated, point);
        if (object) showObjectMenu(object, menuPoint);
      } catch (error) {
        status(`Could not edit PDF object: ${error.message}`);
      }
    });
    native.hitElement = hit;
    native.entry.editorLayer.append(hit);
    return hit;
  }

  async function discoverEntry(entry, renderViewport) {
    if (entry.nativeDiscovered) return;
    entry.nativeDiscovered = true;
    const operationList = await getOperationList(entry);
    let textMetrics = [];
    try {
      const textContent = await entry.page.getTextContent();
      textMetrics = textContent.items
        .map((item, index) => {
          let nativeFont = null;
          try {
            nativeFont = entry.page.commonObjs.get(item.fontName);
          } catch {
            // The text metric remains usable even when a malformed PDF omits its font program.
          }
          const metric = pdfTextMetricFromItem(
            item,
            {
              ...textContent.styles?.[item.fontName],
              fontFamily: nativeFont?.name
                || textContent.styles?.[item.fontName]?.fontFamily,
              loadedName: nativeFont?.loadedName,
              fontName: nativeFont?.name,
            },
            index,
          );
          if (!metric || !nativeFont) return metric;
          const nativeFontData = nativeFont.data instanceof Uint8Array
            ? nativeFont.data
            : nativeFont.data instanceof ArrayBuffer
              ? new Uint8Array(nativeFont.data)
              : null;
          metric.fontWeight = nativeFont.bold ? "700" : metric.fontWeight;
          metric.fontStyle = nativeFont.italic ? "italic" : metric.fontStyle;
          metric.nativeFontData = nativeFontData;
          metric.nativeFontFamily = String(nativeFont.loadedName || item.fontName || "");
          metric.nativeFontKey = [
            item.fontName,
            nativeFont.loadedName,
            nativeFont.name,
          ].filter(Boolean).join(":");
          metric.nativeFontName = String(nativeFont.name || "");
          return metric;
        })
        .filter(Boolean);
    } catch (error) {
      console.warn("Could not read native PDF text metrics.", error);
    }
    const textNatives = textMetrics
      .slice(0, MAX_NATIVE_OBJECTS_PER_PAGE)
      .map((metric) => ({
        entry,
        kind: "text",
        text: metric.text,
        bounds: metric.bounds,
        operationIndices: [],
        textMetrics: [metric],
      }));
    let mergeFallbackText = false;
    if (!textNatives.length) {
      mergeFallbackText = true;
      const usedTextMetricIds = new Set();
      for (let index = 0; index < operationList.fnArray.length; index += 1) {
        if (!textOperations.has(operationList.fnArray[index])) continue;
        const text = textFromOperatorArguments(operationList.argsArray[index]).trim();
        if (!text) continue;
        const bounds = boundsFromRecorded(entry, renderViewport, index);
        if (!bounds) continue;
        const textMetric = matchPdfTextMetric(
          textMetrics,
          text,
          bounds,
          usedTextMetricIds,
        );
        textNatives.push({
          entry,
          kind: "text",
          text,
          bounds,
          operationIndices: [index],
          textMetrics: textMetric ? [textMetric] : [],
        });
        if (textNatives.length >= MAX_NATIVE_OBJECTS_PER_PAGE) break;
      }
    }

    const discoveredImageNatives = [];
    for (let index = 0; index < operationList.fnArray.length; index += 1) {
      const operation = operationList.fnArray[index];
      if (!imageOperations.has(operation)) continue;
      const bounds = boundsFromRecorded(entry, renderViewport, index);
      if (!bounds) continue;
      discoveredImageNatives.push({
        entry,
        kind: "image",
        text: "",
        bounds,
        maskLike: imageMaskOperations.has(operation),
        operationIndices: [index],
      });
      if (discoveredImageNatives.length + textNatives.length >= MAX_NATIVE_OBJECTS_PER_PAGE) break;
    }
    const coordinates = entry.page.imageCoordinates || [];
    for (let index = 0; index + 5 < coordinates.length; index += 6) {
      const first = [
        coordinates[index] * renderViewport.width,
        coordinates[index + 1] * renderViewport.height,
      ];
      const second = [
        coordinates[index + 2] * renderViewport.width,
        coordinates[index + 3] * renderViewport.height,
      ];
      const third = [
        coordinates[index + 4] * renderViewport.width,
        coordinates[index + 5] * renderViewport.height,
      ];
      const fourth = [
        second[0] + third[0] - first[0],
        second[1] + third[1] - first[1],
      ];
      const bounds = normalizeBounds(boundsFromPoints(
        [first, second, third, fourth].map((point) => renderViewport.convertToPdfPoint(...point)),
      ));
      if (bounds.width < 0.5 || bounds.height < 0.5) continue;
      const duplicate = discoveredImageNatives.some((native) => (
        Math.abs(native.bounds.x - bounds.x) < 0.25
        && Math.abs(native.bounds.y - bounds.y) < 0.25
        && Math.abs(native.bounds.width - bounds.width) < 0.25
        && Math.abs(native.bounds.height - bounds.height) < 0.25
      ));
      if (!duplicate) {
        discoveredImageNatives.push({
          entry,
          kind: "image",
          text: "",
          bounds,
          maskLike: false,
          operationIndices: [],
        });
      }
      if (discoveredImageNatives.length + textNatives.length >= MAX_NATIVE_OBJECTS_PER_PAGE) break;
    }
    const page = pageBounds(entry);
    const pageArea = Math.max(1, page.width * page.height);
    const imageNatives = discoveredImageNatives
      .filter((native) => native.bounds.width * native.bounds.height / pageArea < 0.82)
      .sort(
        (first, second) => second.bounds.width * second.bounds.height
          - first.bounds.width * first.bounds.height,
      );

    entry.nativeObjects = [
      ...imageNatives,
      ...(mergeFallbackText ? mergeTextNatives(textNatives) : textNatives),
    ].slice(0, MAX_NATIVE_OBJECTS_PER_PAGE);
    for (const native of entry.nativeObjects) nativeHitElement(native);
    refreshEntry(entry);
  }

  function createEditorLayer(entry) {
    if (entry.editorLayer) return;
    const layer = document.createElement("div");
    layer.className = "pdf-editor-layer";
    layer.dataset.page = String(entry.pageNumber);
    (entry.pageSurface || entry.pageElement).insertBefore(layer, entry.loading);
    entry.editorLayer = layer;
    entry.editObjects = [];
    entry.nativeObjects = [];
    layer.addEventListener("pointerdown", (event) => beginPageTool(entry, event));
  }

  function centeredPlacement(entry, width, height) {
    const page = pageBounds(entry);
    return {
      x: page.x + (page.width - width) / 2,
      y: page.y + (page.height - height) / 2,
      width,
      height,
    };
  }

  function addTextAt(entry, point) {
    const page = pageBounds(entry);
    const width = Math.min(180, page.width * 0.42);
    const height = Math.min(42, page.height * 0.08);
    const bounds = {
      x: point[0],
      y: point[1] - height,
      width,
      height,
    };
    const object = registerObject({
      entry,
      pageNumber: entry.pageNumber,
      kind: "text",
      source: "added",
      activated: true,
      bounds,
      renderMode: "text",
      text: "Text",
      fontSize: 14,
      color: "#111111",
    }, { historyEntry: true });
    setToolbarMode("select");
    textInput?.focus();
    textInput?.select();
    return object;
  }

  function selectionElement(entry, bounds) {
    const element = document.createElement("div");
    element.className = "pdf-region-selection";
    entry.editorLayer.append(element);
    positionElement(element, bounds, entry.displayViewport);
    return element;
  }

  function beginPageTool(entry, event) {
    if (readOnly || busy || event.button !== 0) return;
    if (event.target !== entry.editorLayer) return;
    if (mode === "select") {
      selectObject(null);
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const start = pointerToPdf(entry, event);
    if (mode === "text") {
      addTextAt(entry, start);
      return;
    }
    if (mode !== "ocr") return;
    let currentBounds = { x: start[0], y: start[1], width: 0.1, height: 0.1 };
    const selection = selectionElement(entry, currentBounds);
    entry.editorLayer.setPointerCapture(event.pointerId);
    const onMove = (moveEvent) => {
      const point = pointerToPdf(entry, moveEvent);
      currentBounds = normalizeBounds({
        x: start[0],
        y: start[1],
        width: point[0] - start[0],
        height: point[1] - start[1],
      });
      positionElement(selection, currentBounds, entry.displayViewport);
    };
    const onEnd = (upEvent) => {
      entry.editorLayer.removeEventListener("pointermove", onMove);
      entry.editorLayer.removeEventListener("pointerup", onEnd);
      entry.editorLayer.removeEventListener("pointercancel", onEnd);
      if (entry.editorLayer.hasPointerCapture(upEvent.pointerId)) {
        entry.editorLayer.releasePointerCapture(upEvent.pointerId);
      }
      selection.remove();
      setToolbarMode("select");
      if (currentBounds.width < MIN_OBJECT_SIZE || currentBounds.height < MIN_OBJECT_SIZE) return;
      editTextRegion(entry, currentBounds).catch((error) => {
        status(`Text edit failed: ${error.message}`);
        setBusy(false);
      });
    };
    entry.editorLayer.addEventListener("pointermove", onMove);
    entry.editorLayer.addEventListener("pointerup", onEnd);
    entry.editorLayer.addEventListener("pointercancel", onEnd);
  }

  function loadClassicScript(url, marker) {
    const existing = document.querySelector(`script[data-pdf-runtime="${marker}"]`);
    if (existing?.dataset.loaded === "true") return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = existing || document.createElement("script");
      script.dataset.pdfRuntime = marker;
      script.src ||= url;
      script.onload = () => {
        script.dataset.loaded = "true";
        resolve();
      };
      script.onerror = () => reject(new Error(`Could not load ${marker} runtime.`));
      if (!existing) document.head.append(script);
    });
  }

  async function ensureOcrWorker() {
    if (ocrWorkerPromise) return ocrWorkerPromise;
    ocrWorkerPromise = (async () => {
      await loadClassicScript(
        new URL("./vendor/tesseract/tesseract.min.js", import.meta.url).href,
        "ocr",
      );
      const Tesseract = globalThis.Tesseract;
      if (!Tesseract?.createWorker) throw new Error("OCR runtime is unavailable.");
      const workerPath = new URL("./vendor/tesseract/worker.min.js", import.meta.url).href;
      const corePath = new URL("./vendor/tesseract/core/", import.meta.url).href.replace(/\/$/, "");
      const langPath = new URL("./vendor/tesseract/lang/", import.meta.url).href.replace(/\/$/, "");
      const worker = await Tesseract.createWorker(["hun", "eng"], Tesseract.OEM.LSTM_ONLY, {
        workerPath,
        corePath,
        langPath,
        workerBlobURL: false,
        logger: (message) => {
          if (!message?.status) return;
          const percent = Number.isFinite(message.progress) ? ` ${Math.round(message.progress * 100)}%` : "";
          status(`OCR: ${message.status}${percent}`);
        },
      });
      await worker.setParameters({
        hocr_font_info: "1",
        preserve_interword_spaces: "1",
      });
      return worker;
    })().catch((error) => {
      ocrWorkerPromise = null;
      throw error;
    });
    return ocrWorkerPromise;
  }

  function boundsOverlapRatio(first, second) {
    const width = Math.max(
      0,
      Math.min(first.x + first.width, second.x + second.width)
        - Math.max(first.x, second.x),
    );
    const height = Math.max(
      0,
      Math.min(first.y + first.height, second.y + second.height)
        - Math.max(first.y, second.y),
    );
    return width * height / Math.max(0.01, second.width * second.height);
  }

  async function editTextRegion(entry, bounds) {
    const embeddedCandidates = (entry.nativeObjects || []).filter((native) => (
      native.kind === "text"
      && boundsOverlapRatio(bounds, native.bounds) >= 0.35
    ));
    if (!embeddedCandidates.length) return liftOcrRegion(entry, bounds);

    status(`Opening embedded text on page ${entry.pageNumber}; OCR is not needed...`);
    const editableObjects = [];
    for (const native of embeddedCandidates) {
      const separated = await materializeNative(native);
      for (const object of separated.filter((candidate) => candidate.kind === "text")) {
        await beginRewriteText(object);
        editableObjects.push(object);
      }
    }
    if (!editableObjects.length) return liftOcrRegion(entry, bounds);
    selectObject(editableObjects[0]);
    textInput?.focus();
    textInput?.select();
    status(
      `Editing ${editableObjects.length} embedded text object(s); OCR was not used.`,
    );
    return editableObjects;
  }

  async function liftOcrRegion(entry, bounds, { replaceObject = null } = {}) {
    setBusy(true);
    status(`No embedded text found; recognizing page ${entry.pageNumber} selection...`);
    try {
      const spec = cropSpec(entry, bounds, OCR_RENDER_SCALE, 1);
      const sourceCanvas = await renderCrop(entry, spec, "normal");
      const result = await recognizeOcrCanvas(sourceCanvas);
      const text = cleanOcrText(result.data.text);
      const wordBoxes = parseTsvWordBoxes(result.data.tsv, { minimumConfidence: 0 });
      if (!text && !wordBoxes.length) {
        status("No text was recognized in that region.");
        return null;
      }
      const sourceImage = imageDataFromCanvas(sourceCanvas);
      const processed = await imageWorker.run("separate-ocr", {
        source: sourceImage,
        wordBoxes,
        blocks: result.data.blocks,
        text,
      }, {
        transfer: [sourceImage.data.buffer],
      });
      if (!processed.maskedPixels) {
        throw new Error("Text was recognized, but its pixels could not be separated.");
      }
      const background = processed.background;
      const foreground = processed.foreground;
      let regions = processed.regions || [];
      regions = regions.slice(0, MAX_SEGMENTED_OBJECTS);
      const recognizedSpecifications = [];
      for (const region of regions) {
        const foregroundCrop = cropImageData(foreground, region);
        const backgroundCrop = cropImageData(background, foregroundCrop.box);
        const objectBounds = pdfBoundsFromPixelRegion(spec, foregroundCrop.box);
        if (objectBounds.width < MIN_OBJECT_SIZE || objectBounds.height < MIN_OBJECT_SIZE) continue;
        const confidence = Number.isFinite(region.confidence) ? region.confidence : 0;
        const typography = await inferOcrTypography(foregroundCrop, region, spec.scale);
        recognizedSpecifications.push({
          backgroundCrop,
          color: region.color || dominantForegroundColor(foregroundCrop),
          confidence,
          foregroundCrop,
          objectBounds,
          region,
          renderScale: spec.scale,
          typography,
        });
      }
      harmonizeSmallOcrLines(recognizedSpecifications);
      const recognizedObjects = recognizedSpecifications.map((specification) => {
        const {
          candidateTypographies,
          selectionScore,
          uniformMaskFit,
          ...typography
        } = specification.typography;
        return registerObject({
          entry,
          pageNumber: entry.pageNumber,
          kind: "text",
          source: "ocr",
          activated: true,
          bounds: specification.objectBounds,
          originBounds: copyBounds(specification.objectBounds),
          patchBounds: copyBounds(specification.objectBounds),
          patchDataUrl: imageDataToDataUrl(specification.backgroundCrop),
          assetDataUrl: imageDataToDataUrl(specification.foregroundCrop),
          renderMode: "text",
          text: specification.region.text || "",
          ...typography,
          color: specification.color,
          ocrConfidence: specification.confidence,
          ocrUncertain: specification.confidence < OCR_UNCERTAIN_CONFIDENCE,
          uniformMaskFit: !!uniformMaskFit,
        }, { select: false });
      });
      if (!recognizedObjects.length) {
        throw new Error("Text was recognized, but no editable visual crops could be created.");
      }
      if (replaceObject) {
        const before = stateOf(replaceObject);
        replaceObject.removed = true;
        refreshObject(replaceObject);
        pushReplaceWithGroupHistory(replaceObject, before, recognizedObjects);
      } else {
        pushAddGroupHistory(recognizedObjects);
      }
      selectObject(recognizedObjects[0]);
      textInput?.focus();
      textInput?.select();
      const uncertainCount = recognizedObjects.filter((object) => object.ocrUncertain).length;
      status(
        `Replaced the original region with ${recognizedObjects.length} editable OCR text object(s)`
          + `${uncertainCount ? `; ${uncertainCount} marked uncertain` : ""}.`,
      );
      return recognizedObjects;
    } finally {
      setBusy(false);
    }
  }

  async function addImageFile(file) {
    if (!file || readOnly || busy) return;
    if (!file.type.startsWith("image/")) throw new Error("Choose a PNG, JPEG, WebP, GIF, or BMP image.");
    if (file.size > MAX_IMAGE_BYTES) throw new Error("The image is larger than 50 MB.");
    const entry = currentEntry();
    if (!entry) return;
    setBusy(true);
    try {
      const sourceUrl = await fileToDataUrl(file);
      const image = await loadImage(sourceUrl);
      if (image.naturalWidth * image.naturalHeight > 40_000_000) {
        throw new Error("The image exceeds the 40 megapixel editing limit.");
      }
      const normalizedCanvas = document.createElement("canvas");
      normalizedCanvas.width = image.naturalWidth;
      normalizedCanvas.height = image.naturalHeight;
      normalizedCanvas.getContext("2d").drawImage(image, 0, 0);
      const dataUrl = normalizedCanvas.toDataURL("image/png");
      normalizedCanvas.width = 0;
      normalizedCanvas.height = 0;
      const page = pageBounds(entry);
      const width = Math.min(page.width * 0.36, image.naturalWidth * 0.75);
      const height = Math.min(page.height * 0.36, width * image.naturalHeight / image.naturalWidth);
      registerObject({
        entry,
        pageNumber: entry.pageNumber,
        kind: "image",
        source: "added",
        activated: true,
        bounds: centeredPlacement(entry, width, height),
        assetDataUrl: dataUrl,
        renderMode: "image",
      }, { historyEntry: true });
    } finally {
      setBusy(false);
      imageInput.value = "";
    }
  }

  function wrapText(font, text, fontSize, maxWidth) {
    const lines = [];
    for (const paragraph of String(text).split(/\r?\n/)) {
      if (!paragraph) {
        lines.push("");
        continue;
      }
      let line = "";
      for (const word of paragraph.split(/\s+/)) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && font.widthOfTextAtSize(candidate, fontSize) > maxWidth) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      lines.push(line);
    }
    return lines;
  }

  async function exportBytes() {
    const sourceBytes = new Uint8Array(getSourceBytes?.() || []);
    if (!isDirty()) return sourceBytes;
    status("Building edited PDF...");
    const {
      beginText,
      endText,
      PDFDocument,
      PDFName,
      fontkit,
      popGraphicsState,
      pushGraphicsState,
      rgb,
      setCharacterSpacing,
      setCharacterSqueeze,
      setFillingColor,
      setFontAndSize,
      setGraphicsState,
      setTextMatrix,
      showText,
    } = await import(
      "./vendor/pdf-edit/pdf-export-runtime.mjs"
    );
    status("Loading edited PDF...");
    const pdfDocument = await PDFDocument.load(sourceBytes, {
      ignoreEncryption: false,
      updateMetadata: false,
    });
    const exportFontkit = {
      ...fontkit,
      create(fontData) {
        const parsedFont = fontkit.create(fontData);
        const bytes = fontData instanceof Uint8Array
          ? fontData
          : new Uint8Array(fontData);
        const openTypeCff = bytes.length >= 4
          && bytes[0] === 0x4f
          && bytes[1] === 0x54
          && bytes[2] === 0x54
          && bytes[3] === 0x4f
          && parsedFont?.["CFF "];
        if (openTypeCff && !parsedFont.cff) {
          Object.defineProperty(parsedFont, "cff", {
            configurable: true,
            value: parsedFont["CFF "],
          });
        }
        return parsedFont;
      },
    };
    pdfDocument.registerFontkit(exportFontkit);
    const fontCache = new Map();
    const nativeFontCache = new Map();
    const openTypeCffFonts = new Set();
    const fallbackFont = async (object) => {
      const key = editorFontKey(object);
      let promise = fontCache.get(key);
      if (!promise) {
        const fileName = EDITOR_FONT_FILES[key] || EDITOR_FONT_FILES["sans:400:normal"];
        promise = (async () => {
          status("Embedding matched text font...");
          const fontUrl = new URL(`./vendor/pdf-edit/fonts/${fileName}`, import.meta.url);
          const fontBytes = new Uint8Array(await (await fetch(fontUrl)).arrayBuffer());
          return pdfDocument.embedFont(fontBytes, { subset: false });
        })();
        fontCache.set(key, promise);
      }
      return promise;
    };
    const fontSupportsText = (font, text) => {
      const supportedCharacters = new Set(font.getCharacterSet());
      return [...String(text)].every((character) => (
        /\s/.test(character) || supportedCharacters.has(character.codePointAt(0))
      ));
    };
    const embeddedFont = async (object, text) => {
      if (object.useNativeFont && object.nativeFontData && object.nativeFontKey) {
        let promise = nativeFontCache.get(object.nativeFontKey);
        if (!promise) {
          promise = (async () => {
            status(`Embedding original PDF font ${object.nativeFontName || ""}...`);
            const font = await pdfDocument.embedFont(object.nativeFontData, { subset: false });
            const bytes = object.nativeFontData;
            if (
              bytes?.length >= 4
              && bytes[0] === 0x4f
              && bytes[1] === 0x54
              && bytes[2] === 0x54
              && bytes[3] === 0x4f
              && font.embedder?.isCFF?.()
            ) {
              openTypeCffFonts.add(font);
            }
            return font;
          })().catch((error) => {
            console.warn(`Could not embed original PDF font ${object.nativeFontName || ""}.`, error);
            return null;
          });
          nativeFontCache.set(object.nativeFontKey, promise);
        }
        const nativeFont = await promise;
        if (nativeFont && fontSupportsText(nativeFont, text)) return nativeFont;
      }
      return fallbackFont(object);
    };
    const imageCache = new Map();
    const embedPng = async (dataUrl) => {
      let promise = imageCache.get(dataUrl);
      if (!promise) {
        promise = pdfDocument.embedPng(dataUrlBytes(dataUrl));
        imageCache.set(dataUrl, promise);
      }
      return promise;
    };

    for (let pageIndex = 0; pageIndex < pdfDocument.getPageCount(); pageIndex += 1) {
      const page = pdfDocument.getPage(pageIndex);
      const pageObjects = [...objects.values()].filter(
        (object) => object.pageNumber === pageIndex + 1 && !object.removed,
      );
      for (const object of pageObjects) {
        if (!object.activated || !object.patchDataUrl) continue;
        const patch = await embedPng(object.patchDataUrl);
        page.drawImage(patch, {
          x: object.patchBounds.x,
          y: object.patchBounds.y,
          width: object.patchBounds.width,
          height: object.patchBounds.height,
        });
      }
      for (const object of pageObjects) {
        if (object.deleted || (object.source === "native" && !object.activated)) continue;
        if (object.renderMode === "image") {
          if (!object.assetDataUrl) continue;
          const image = await embedPng(object.assetDataUrl);
          page.drawImage(image, {
            x: object.bounds.x,
            y: object.bounds.y,
            width: object.bounds.width,
            height: object.bounds.height,
            opacity: object.opacity,
          });
          continue;
        }
        const font = await embeddedFont(object, object.text);
        const supportedCharacters = new Set(font.getCharacterSet());
        const safeText = [...object.text]
          .map((character) => supportedCharacters.has(character.codePointAt(0)) ? character : "?")
          .join("");
        const fontSize = clamp(Number(object.fontSize) || 12, 1, 500);
        const [red, green, blue] = hexToRgb(object.color);
        if (object.sourceTextWidth && !safeText.includes("\n")) {
          const x = object.bounds.x + object.textInsetX;
          const y = object.bounds.y + object.bounds.height - object.baselineOffset;
          const angle = Number(object.rotation) || 0;
          const cosine = Math.cos(angle);
          const sine = Math.sin(angle);
          const horizontalScale = clamp(Number(object.horizontalScale) || 1, 0.05, 8);
          const { oldFont, newFontKey } = page.setOrEmbedFont(font);
          const graphicsStateKey = page.maybeEmbedGraphicsState({
            opacity: object.opacity,
          });
          page.pushOperators(
            pushGraphicsState(),
            ...(graphicsStateKey ? [setGraphicsState(graphicsStateKey)] : []),
            beginText(),
            setFillingColor(rgb(red, green, blue)),
            setFontAndSize(newFontKey, fontSize),
            setCharacterSqueeze(horizontalScale * 100),
            setCharacterSpacing(object.letterSpacing / horizontalScale),
            setTextMatrix(cosine, sine, -sine, cosine, x, y),
            showText(font.encodeText(safeText)),
            endText(),
            popGraphicsState(),
          );
          if (oldFont) page.setFont(oldFont);
          else page.resetFont();
          continue;
        }
        const lineHeight = fontSize * (Number(object.lineHeight) || 1.18);
        const lines = wrapText(font, safeText, fontSize, object.bounds.width);
        const maximumLines = Math.max(1, Math.floor(object.bounds.height / lineHeight));
        let y = object.bounds.y + object.bounds.height - fontSize;
        for (const line of lines.slice(0, maximumLines)) {
          page.drawText(line, {
            x: object.bounds.x,
            y,
            size: fontSize,
            font,
            color: rgb(red, green, blue),
            opacity: object.opacity,
          });
          y -= lineHeight;
        }
      }
    }
    for (const font of openTypeCffFonts) {
      await font.embed();
      const type0Font = pdfDocument.context.lookup(font.ref);
      const descendantFonts = type0Font?.lookup?.(PDFName.of("DescendantFonts"));
      const descendantFont = descendantFonts?.lookup?.(0);
      const descriptor = descendantFont?.lookup?.(PDFName.of("FontDescriptor"));
      const fontStream = descriptor?.lookup?.(PDFName.of("FontFile3"));
      if (!fontStream?.dict) {
        throw new Error(`Could not finalize embedded OpenType font ${font.name || ""}.`);
      }
      fontStream.dict.set(PDFName.of("Subtype"), PDFName.of("OpenType"));
    }
    status("Writing edited PDF...");
    return pdfDocument.save({ useObjectStreams: true });
  }

  function beginControlMutation() {
    controlBefore = selectedObject ? stateOf(selectedObject) : null;
  }

  function finishControlMutation() {
    if (selectedObject && controlBefore) pushStateHistory(selectedObject, controlBefore);
    controlBefore = null;
  }

  function mutateSelectedText(mutator) {
    if (
      readOnly
      || busy
      || !selectedObject
      || selectedObject.kind !== "text"
      || selectedObject.renderMode !== "text"
    ) return;
    selectedObject.activated = true;
    mutator(selectedObject);
    refreshObject(selectedObject);
  }

  function fitOriginalTextSpacing(object) {
    if (object.sourceTextWidth) {
      object.letterSpacing = fittedLetterSpacing(object);
    }
  }

  function resizeEditedTextBounds(object) {
    if (!object.sourceTextWidth || object.text.includes("\n")) return;
    if (Math.abs(Number(object.rotation) || 0) > 0.001) return;
    const characters = [...String(object.text)];
    const rightPadding = Math.max(1, object.fontSize * 0.12);
    const naturalWidth = object.textInsetX
      + editedSingleLineWidth({
        naturalWidth: measuredTextWidth(object),
        horizontalScale: object.horizontalScale,
        letterSpacing: object.letterSpacing,
        characterCount: characters.length,
      })
      + rightPadding;
    const page = pageBounds(object.entry);
    const availableWidth = page.x + page.width - object.bounds.x;
    object.bounds.width = clamp(naturalWidth, MIN_OBJECT_SIZE, availableWidth);
  }

  function mutateSelectedBounds(mutator) {
    if (readOnly || busy || !selectedObject) return;
    const nextBounds = copyBounds(selectedObject.bounds);
    mutator(nextBounds);
    selectedObject.activated = true;
    selectedObject.bounds = constrainBounds(selectedObject.entry, nextBounds);
    refreshObject(selectedObject);
  }

  function clear() {
    closeInlineTextEditor({ commit: false });
    closeObjectMenu();
    setMoveArmed(null);
    setCropMode(null);
    selectedObject = null;
    objects.clear();
    history.length = 0;
    redoHistory.length = 0;
    nextObjectId = 1;
    setToolbarMode("select");
    updateControls();
  }

  function setReadOnly(nextReadOnly) {
    readOnly = !!nextReadOnly;
    if (readOnly) {
      closeInlineTextEditor();
      closeObjectMenu();
      setMoveArmed(null);
      setCropMode(null);
      setToolbarMode("select");
    }
    editorBar?.classList.toggle("read-only", readOnly);
    updateControls();
  }

  selectButton?.addEventListener("click", () => setToolbarMode("select"));
  addTextButton?.addEventListener("click", () => setToolbarMode(mode === "text" ? "select" : "text"));
  ocrButton?.addEventListener("click", () => setToolbarMode(mode === "ocr" ? "select" : "ocr"));
  moveObjectButton?.addEventListener("click", () => {
    closeObjectMenu();
    if (!selectedObject || readOnly || busy) return;
    setCropMode(null);
    setMoveArmed(selectedObject);
    status("Move unlocked for the selected object. Drag once; it will lock again.");
  });
  rewriteTextButton?.addEventListener("click", () => {
    closeObjectMenu();
    beginEditObject(selectedObject).catch((error) => {
      status(`Could not edit object: ${error.message}`);
      setBusy(false);
    });
  });
  recognizeImageTextButton?.addEventListener("click", () => {
    closeObjectMenu();
    recognizeImageText(selectedObject).catch((error) => {
      status(`Could not recognize image text: ${error.message}`);
      setBusy(false);
    });
  });
  cropImageButton?.addEventListener("click", () => {
    closeObjectMenu();
    if (!selectedObject || selectedObject.kind !== "image" || readOnly || busy) return;
    if (cropModeObject === selectedObject) {
      setCropMode(null);
      status("Image crop cancelled.");
      return;
    }
    setCropMode(selectedObject);
    status("Crop image: drag a corner or edge handle inward. The crop applies when released.");
  });
  objectMenu?.addEventListener("pointerdown", (event) => event.stopPropagation());
  addEventListener("pointerdown", (event) => {
    if (!objectMenu?.hidden && !objectMenu.contains(event.target)) closeObjectMenu();
  }, true);
  addImageButton?.addEventListener("click", () => {
    if (!readOnly && !busy) imageInput?.click();
  });
  imageInput?.addEventListener("change", () => {
    addImageFile(imageInput.files?.[0]).catch((error) => {
      status(`Could not add image: ${error.message}`);
      setBusy(false);
      imageInput.value = "";
    });
  });
  undoButton?.addEventListener("click", undo);
  redoButton?.addEventListener("click", redo);
  deleteButton?.addEventListener("click", deleteSelectedObject);
  for (const control of [
    widthInput,
    heightInput,
    textInput,
    fontSizeInput,
    fontFamilyInput,
    fontVariantInput,
    characterSpacingInput,
    colorInput,
    opacityInput,
  ]) {
    control?.addEventListener("focus", beginControlMutation);
    control?.addEventListener("change", finishControlMutation);
    control?.addEventListener("blur", finishControlMutation);
  }
  textInput?.addEventListener("input", () => mutateSelectedText(
    (object) => {
      object.text = textInput.value.slice(0, 20_000);
      resizeEditedTextBounds(object);
    },
  ));
  widthInput?.addEventListener("input", () => {
    const width = Number(widthInput.value);
    if (Number.isFinite(width)) mutateSelectedBounds((bounds) => { bounds.width = width; });
  });
  heightInput?.addEventListener("input", () => {
    const height = Number(heightInput.value);
    if (Number.isFinite(height)) mutateSelectedBounds((bounds) => { bounds.height = height; });
  });
  fontSizeInput?.addEventListener("input", () => mutateSelectedText(
    (object) => {
      object.fontSize = clamp(Number(fontSizeInput.value) || 1, 1, 500);
      resizeEditedTextBounds(object);
    },
  ));
  fontFamilyInput?.addEventListener("input", () => mutateSelectedText(
    (object) => {
      object.fontFamily = EDITOR_FONT_FAMILIES[fontFamilyInput.value]
        ? fontFamilyInput.value
        : "sans";
      object.useNativeFont = false;
      resizeEditedTextBounds(object);
    },
  ));
  fontVariantInput?.addEventListener("input", () => mutateSelectedText(
    (object) => {
      const [weight, style] = String(fontVariantInput.value).split(":");
      object.fontWeight = weight === "700" ? "700" : "400";
      object.fontStyle = style === "italic" ? "italic" : "normal";
      object.useNativeFont = false;
      resizeEditedTextBounds(object);
    },
  ));
  characterSpacingInput?.addEventListener("input", () => mutateSelectedText(
    (object) => {
      const spacing = Number(characterSpacingInput.value);
      if (!Number.isFinite(spacing)) return;
      object.letterSpacing = clamp(spacing, -100, 500);
      resizeEditedTextBounds(object);
    },
  ));
  colorInput?.addEventListener("input", () => mutateSelectedText(
    (object) => {
      object.color = colorInput.value;
      if (colorValue) colorValue.value = colorInput.value;
    },
  ));
  opacityInput?.addEventListener("input", () => {
    if (readOnly || busy || !selectedObject) return;
    const opacity = clamp(Number(opacityInput.value) || 0.05, 0.05, 1);
    selectedObject.activated = true;
    selectedObject.opacity = opacity;
    refreshObject(selectedObject);
  });
  addEventListener("keydown", (event) => {
    if (editorBar?.hidden) return;
    const editingInput = event.target instanceof HTMLInputElement
      || event.target instanceof HTMLTextAreaElement
      || event.target instanceof HTMLSelectElement;
    if (event.key === "Delete" && !editingInput && selectedObject) {
      event.preventDefault();
      event.stopImmediatePropagation();
      deleteSelectedObject();
    } else if (event.key === "Escape" && !editingInput) {
      closeObjectMenu();
      setMoveArmed(null);
      setCropMode(null);
      setToolbarMode("select");
      selectObject(null);
    } else if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === "z" && !editingInput) {
      event.preventDefault();
      undo();
    } else if (
      event.ctrlKey
      && (event.key.toLowerCase() === "y" || (event.shiftKey && event.key.toLowerCase() === "z"))
      && !editingInput
    ) {
      event.preventDefault();
      redo();
    }
  });
  addEventListener("beforeunload", () => {
    ocrWorkerPromise?.then((worker) => worker.terminate()).catch(() => {});
    imageWorker.dispose();
  }, { once: true });

  updateControls();

  return {
    attachEntry: createEditorLayer,
    clear,
    discoverEntry,
    exportBytes,
    isDirty,
    refreshEntry,
    setReadOnly,
  };
}
