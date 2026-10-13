import assert from "node:assert/strict";
import {
  computePrintRenderPlan,
  layoutForPage,
  selectedPages,
} from "../modules/3dpdf/print-layout.mjs";

const a4Portrait = { width: 210 * 72 / 25.4, height: 297 * 72 / 25.4 };
const a3Landscape = { width: 420 * 72 / 25.4, height: 297 * 72 / 25.4 };
const letterLandscape = { width: 792, height: 612 };
const baseSettings = {
  paperSize: "A4",
  orientation: "auto",
  margins: "minimum",
  scaleMode: "fit",
  customScale: 100,
  qualityDpi: 600,
};

assert.deepEqual(selectedPages("all", 4), [1, 2, 3, 4]);
assert.deepEqual(selectedPages("3-5, 2, 999", 5), [2, 3, 4, 5]);
assert.deepEqual(selectedPages("4-2", 5), [2, 3, 4]);
assert.deepEqual(selectedPages("999", 5), []);

const fit = layoutForPage(a4Portrait, baseSettings);
assert.equal(fit.landscape, false);
assert.equal(fit.marginMm, 5);
assert.ok(Math.abs(fit.printScale - (200 / 210)) < 1e-9);
assert.ok(Math.abs(fit.contentWidthMm - 200) < 1e-9);
assert.ok(fit.contentHeightMm < fit.usableHeightMm);

const border = layoutForPage(a4Portrait, { ...baseSettings, scaleMode: "fit-border", margins: "normal" });
assert.equal(border.marginMm, 0);
assert.equal(border.fitToBorder, true);
assert.ok(Math.abs(border.printScale - 1) < 1e-9);
assert.ok(Math.abs(border.contentWidthMm - 210) < 1e-9);
assert.ok(Math.abs(border.contentHeightMm - 297) < 1e-9);

const manualPortrait = layoutForPage(letterLandscape, { ...baseSettings, orientation: "portrait" });
assert.equal(manualPortrait.landscape, false);
assert.ok(manualPortrait.paperWidthMm < manualPortrait.paperHeightMm);
const automaticLandscape = layoutForPage(letterLandscape, baseSettings);
assert.equal(automaticLandscape.landscape, true);
assert.ok(automaticLandscape.paperWidthMm > automaticLandscape.paperHeightMm);

const mixedOrientation = computePrintRenderPlan(
  [a4Portrait, a3Landscape, a4Portrait],
  { ...baseSettings, qualityDpi: 300 },
);
assert.deepEqual(mixedOrientation.pageLandscapes, [false, true, false]);
assert.equal(mixedOrientation.mixedOrientation, true);
assert.equal(mixedOrientation.landscape, false);
const landscapeLayout = mixedOrientation.layouts[1];
assert.ok(landscapeLayout.contentHeightMm <= landscapeLayout.usableHeightMm + 1e-9);
assert.ok(landscapeLayout.contentWidthMm <= landscapeLayout.usableWidthMm + 1e-9);
assert.ok(landscapeLayout.contentHeightMm <= 200 + 1e-9);
assert.ok(landscapeLayout.contentWidthMm <= 287 + 1e-9);
const forcedLandscape = computePrintRenderPlan(
  [a4Portrait, a3Landscape],
  { ...baseSettings, orientation: "landscape", qualityDpi: 300 },
);
assert.deepEqual(forcedLandscape.pageLandscapes, [true, true]);
assert.equal(forcedLandscape.mixedOrientation, false);

const actual = layoutForPage(a4Portrait, { ...baseSettings, scaleMode: "actual" });
assert.equal(actual.printScale, 1);
const custom = layoutForPage(a4Portrait, { ...baseSettings, scaleMode: "custom", customScale: 125 });
assert.equal(custom.printScale, 1.25);

const onePageHigh = computePrintRenderPlan([a4Portrait], baseSettings);
assert.equal(onePageHigh.requestedDpi, 600);
assert.equal(onePageHigh.effectiveDpi, 600);
assert.equal(onePageHigh.reducedQuality, false);
assert.ok(onePageHigh.estimatedLargestPagePixels < 160_000_000);

const sixPageAdaptive = computePrintRenderPlan(
  [a4Portrait, a4Portrait, a4Portrait, a4Portrait, a4Portrait, a4Portrait],
  baseSettings,
);
assert.ok(sixPageAdaptive.effectiveDpi >= 150);
assert.ok(sixPageAdaptive.effectiveDpi < 600);
assert.equal(sixPageAdaptive.reducedQuality, true);
assert.ok(sixPageAdaptive.estimatedTotalPixels <= 180_000_000);

assert.throws(
  () => computePrintRenderPlan(Array.from({ length: 100 }, () => a4Portrait), baseSettings),
  /safe render-memory limit/,
);

console.log(JSON.stringify({
  orientation: "automatic per page plus manual whole-document override",
  scaling: "fit, fit-to-border, actual, custom",
  quality: "600 DPI with bounded adaptive reduction",
}, null, 2));
