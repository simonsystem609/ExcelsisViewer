import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { lineScaleOptions } from "../modules/dxf/axis-scale-utils.mjs";

const application = fs.readFileSync(new URL("../modules/dxf/app.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../modules/dxf/index.html", import.meta.url), "utf8");
const ui = {};
for (const match of html.matchAll(/id="(scale[^"]+)"/g)) {
  const listeners = new Map();
  ui[match[1]] = {
    value: "", checked: false, hidden: false, disabled: false, open: false,
    addEventListener(event, callback) { listeners.set(event, callback); },
    removeEventListener(event) { listeners.delete(event); },
    async fire(event) { return listeners.get(event)?.({ preventDefault() {} }); },
    showModal() { this.open = true; },
    close() { this.open = false; },
  };
}
const reference = { start: { x: 10, y: 20 }, end: { x: 40, y: 60 } };
const dialogSource = application.slice(application.indexOf("function setScaleStep("), application.indexOf("// Temporarily takes over canvas input"))
  + application.slice(application.indexOf("function askScaleOptions("), application.indexOf("function scalePathFor("));
const context = vm.createContext({
  ui, lineScaleOptions, fmt: String, pickLineForScale: async () => reference,
  alert(message) { throw new Error(message); },
});
vm.runInContext(dialogSource, context);
const normalize = (value) => JSON.parse(JSON.stringify(value));

let result = context.askScaleOptions();
await ui.scaleModePercentBtn.fire("click");
assert.equal(ui.scaleNonUniformToggle.checked, false);
assert.equal(ui.scaleUniformFieldset.hidden, false);
assert.equal(ui.scaleXYFieldset.hidden, true);
ui.scaleUniformInput.value = "103";
ui.scaleNonUniformToggle.checked = true;
await ui.scaleNonUniformToggle.fire("change");
assert.equal(ui.scaleUniformFieldset.hidden, true);
assert.equal(ui.scaleXYFieldset.hidden, false);
assert.equal(ui.scaleXInput.value, "103");
ui.scaleYInput.value = "100";
await ui.scaleApplyBtn.fire("click");
assert.deepEqual(normalize(await result), { scaleX: 1.03, scaleY: 1 });
assert.equal(ui.scaleDialog.open, false);

result = context.askScaleOptions();
await ui.scaleModeLineBtn.fire("click");
assert.equal(ui.scaleLinePerpendicularRow.hidden, true);
await ui.scalePickLineBtn.fire("click");
assert.equal(ui.scaleLineLengthInput.disabled, false);
ui.scaleLineLengthInput.value = "55";
ui.scaleNonUniformToggle.checked = true;
await ui.scaleNonUniformToggle.fire("change");
assert.equal(ui.scaleLinePerpendicularRow.hidden, false);
assert.equal(ui.scaleLinePerpendicularInput.value, "100");
assert.match(ui.scaleLineLengthLabel.textContent, /Parallel to line/);
await ui.scaleApplyBtn.fire("click");
assert.deepEqual(normalize(await result), { scaleX: 1.1, scaleY: 1, axisAngleRadians: Math.atan2(40, 30) });

result = context.askScaleOptions();
await ui.scaleModeLineBtn.fire("click");
await ui.scalePickLineBtn.fire("click");
ui.scaleLineLengthInput.value = "55";
ui.scaleNonUniformToggle.checked = true;
await ui.scaleNonUniformToggle.fire("change");
ui.scaleLinePerpendicularInput.value = "87";
ui.scaleNonUniformToggle.checked = false;
await ui.scaleNonUniformToggle.fire("change");
assert.equal(ui.scaleLinePerpendicularRow.hidden, true);
await ui.scaleApplyBtn.fire("click");
assert.deepEqual(normalize(await result), { scaleX: 1.1, scaleY: 1.1, axisAngleRadians: 0 });

result = context.askScaleOptions();
await ui.scaleModePercentBtn.fire("click");
ui.scaleNonUniformToggle.checked = true;
await ui.scaleNonUniformToggle.fire("change");
ui.scaleXInput.value = "109";
ui.scaleNonUniformToggle.checked = false;
await ui.scaleNonUniformToggle.fire("change");
assert.equal(ui.scaleUniformInput.value, "109");
await ui.scaleApplyBtn.fire("click");
assert.deepEqual(normalize(await result), { scaleX: 1.09, scaleY: 1.09 });
console.log("DXF scale checkbox, line-relative labels, dialog switching, and uniform fallback tests passed.");
