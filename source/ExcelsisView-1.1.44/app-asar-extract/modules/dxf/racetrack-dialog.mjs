import { planRacetrack } from "./racetrack.mjs";
import { bulgeArcGeometry, bulgeArcExtremaPoints } from "./geometry-utils.mjs";

function drawPreview(canvas, plan, a, b) {
  const context = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  context.clearRect(0, 0, w, h);
  if (!plan) return;
  const extrema = plan.points.flatMap((point, i) => bulgeArcExtremaPoints(point, plan.points[(i + 1) % 4], point.bulge));
  const minX = Math.min(...extrema.map((point) => point.x));
  const maxX = Math.max(...extrema.map((point) => point.x));
  const minY = Math.min(...extrema.map((point) => point.y));
  const maxY = Math.max(...extrema.map((point) => point.y));
  const scale = Math.min((w - 50) / (maxX - minX), (h - 40) / (maxY - minY));
  const screen = (p) => ({ x: w / 2 + (p.x - (minX + maxX) / 2) * scale, y: h / 2 - (p.y - (minY + maxY) / 2) * scale });
  context.beginPath();
  context.strokeStyle = "#63ddad";
  context.fillStyle = "#63ddad18";
  context.lineWidth = 2;
  const first = screen(plan.points[0]);
  context.moveTo(first.x, first.y);
  for (let i = 0; i < 4; i += 1) {
    const p = plan.points[i];
    const next = plan.points[(i + 1) % 4];
    const arc = bulgeArcGeometry(p, next, p.bulge);
    if (arc) {
      const center = screen({ x: arc.cx, y: arc.cy });
      context.arc(center.x, center.y, arc.r * scale, -arc.start, -arc.start - arc.sweep, arc.sweep > 0);
    } else {
      const end = screen(next);
      context.lineTo(end.x, end.y);
    }
  }
  context.closePath();
  context.fill();
  context.stroke();
  for (const [index, p] of [a, b].entries()) {
    const s = screen(p);
    context.fillStyle = "#f5cb7e";
    context.beginPath();
    context.arc(s.x, s.y, 3, 0, 2 * Math.PI);
    context.fill();
    context.font = "12px Segoe UI";
    context.fillText(String(index + 1), s.x + 6, s.y - 6);
  }
}

export function askRacetrackOptions(picks) {
  const get = (id) => document.getElementById(id);
  const dialog = get("racetrackDialog");
  const kind = get("racetrackKind");
  const width = get("racetrackWidth");
  const endRadius = get("racetrackEndRadius");
  const curveRadius = get("racetrackCurveRadius");
  const side = get("racetrackSide");
  const hint = get("racetrackHint");
  const preview = get("racetrackPreview");
  const apply = get("racetrackApplyBtn");
  const cancel = get("racetrackCancelBtn");
  const form = dialog.querySelector("form");
  const a = picks[0].point;
  const b = picks[1].point;
  const distance = Math.hypot(b.x - a.x, b.y - a.y);
  const fmt = (n) => Number(n.toFixed(4)).toString();
  get("racetrackPoints").textContent = `1: ${picks[0].label} (${fmt(a.x)}, ${fmt(a.y)}) → 2: ${picks[1].label} (${fmt(b.x)}, ${fmt(b.y)}) · Spacing ${fmt(distance)} mm`;
  curveRadius.value = String(Math.max(distance, Number(width.value)));
  curveRadius.min = String(distance / 2);
  let plan = null;
  return new Promise((resolve) => {
    const update = (event) => {
      if (event?.target === endRadius) width.value = endRadius.value ? String(Number(endRadius.value) * 2) : "";
      else if (event?.target === width) endRadius.value = width.value ? String(Number(width.value) / 2) : "";
      get("racetrackCurveFields").hidden = kind.value !== "curved";
      curveRadius.disabled = kind.value !== "curved";
      try {
        plan = planRacetrack(a, b, { kind: kind.value, width: Number(width.value), curveRadius: Number(curveRadius.value), side: side.value });
        hint.textContent = kind.value === "curved"
          ? `Curve radius ≥ ${fmt(distance / 2)} mm and > ${fmt(plan.endRadius)} mm. Inner / outer radii: ${fmt(plan.curveRadius - plan.endRadius)} / ${fmt(plan.curveRadius + plan.endRadius)} mm.`
          : `Width ${fmt(plan.width)} mm · Rounded end radius ${fmt(plan.endRadius)} mm.`;
        apply.disabled = false;
      } catch (error) {
        plan = null;
        hint.textContent = error.message;
        apply.disabled = true;
      }
      drawPreview(preview, plan, a, b);
    };
    const finish = (value) => {
      form.removeEventListener("input", update);
      form.removeEventListener("change", update);
      form.removeEventListener("submit", submit);
      cancel.removeEventListener("click", onCancel);
      dialog.removeEventListener("cancel", onCancel);
      dialog.close();
      resolve(value);
    };
    const submit = (event) => { event.preventDefault(); update(); if (plan) finish(plan); };
    const onCancel = (event) => { event.preventDefault(); finish(null); };
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    form.addEventListener("submit", submit);
    cancel.addEventListener("click", onCancel);
    dialog.addEventListener("cancel", onCancel);
    update();
    dialog.showModal();
    width.focus();
    width.select();
  });
}
