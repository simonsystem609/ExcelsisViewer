export const DXF_MODEL_SPACE = "model";
export const DXF_PAPER_SPACE = "paper";

function pairCode(pair) {
  return String(pair?.code ?? "").trim();
}

function pairValue(pair) {
  return String(pair?.value ?? "").trim();
}

// DXF $TILEMODE is 1 while model space is active and 0 while a paper-space
// layout is active. Group 67 entities from both spaces share one ENTITIES
// section, but they must never be rendered as one combined drawing.
export function activeDxfSpace(pairs) {
  for (let index = 0; index < pairs.length; index += 1) {
    if (pairCode(pairs[index]) !== "9") continue;
    if (pairValue(pairs[index]).toUpperCase() !== "$TILEMODE") continue;
    for (let valueIndex = index + 1; valueIndex < pairs.length; valueIndex += 1) {
      const code = pairCode(pairs[valueIndex]);
      if (code === "9" || code === "0") break;
      if (code !== "70") continue;
      const tileMode = Number.parseInt(pairValue(pairs[valueIndex]), 10);
      if (tileMode === 0) return DXF_PAPER_SPACE;
      if (tileMode === 1) return DXF_MODEL_SPACE;
      break;
    }
  }
  return DXF_MODEL_SPACE;
}

export function dxfEntitySpace(pairs, startIndex, endIndex = pairs.length) {
  for (let index = Math.max(0, startIndex + 1); index < endIndex; index += 1) {
    const code = pairCode(pairs[index]);
    if (code === "0") break;
    if (code !== "67") continue;
    return Number.parseInt(pairValue(pairs[index]), 10) === 1
      ? DXF_PAPER_SPACE
      : DXF_MODEL_SPACE;
  }
  return DXF_MODEL_SPACE;
}
