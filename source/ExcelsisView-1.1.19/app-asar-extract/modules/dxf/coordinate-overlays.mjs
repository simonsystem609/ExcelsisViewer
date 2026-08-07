export const DXF_ORIGIN_COLOR = "#7857ff";
export const DXF_CANVAS_BACKGROUND = "#050607";

const X_AXIS_COLOR = "#ff5b69";
const Y_AXIS_COLOR = "#55d98a";

export function originMarkerMetrics(viewScale, fitScale) {
  const safeViewScale = positiveOr(viewScale, 1);
  const safeFitScale = positiveOr(fitScale, safeViewScale);
  const zoomRatio = safeViewScale / safeFitScale;
  const scale = clamp(zoomRatio ** -0.25, 0.55, 1.15);
  return {
    scale,
    outerRadius: 7 * scale,
    dotRadius: 2.25 * scale,
    ringWidth: 1.25 * scale,
  };
}

export function coordinateSystemLayout(width, height) {
  const safeWidth = Math.max(1, Number(width) || 1);
  const safeHeight = Math.max(1, Number(height) || 1);
  const anchor = {
    x: clamp(32, 22, Math.max(22, safeWidth - 42)),
    y: clamp(safeHeight - 82, 42, Math.max(42, safeHeight - 58)),
  };
  return {
    anchor,
    axisLength: 24,
    arrowSize: 4,
    backing: {
      x: anchor.x - 20,
      y: anchor.y - 34,
      width: 58,
      height: 48,
      radius: 7,
    },
  };
}

export function drawDxfOriginMarker(
  context,
  screenPoint,
  {
    width,
    height,
    viewScale,
    fitScale,
    color = DXF_ORIGIN_COLOR,
    background = DXF_CANVAS_BACKGROUND,
  },
) {
  const metrics = originMarkerMetrics(viewScale, fitScale);
  if (!pointNearViewport(screenPoint, width, height, metrics.outerRadius + 2)) return false;

  context.save();
  context.beginPath();
  context.arc(screenPoint.x, screenPoint.y, Math.max(0.5, metrics.outerRadius - metrics.ringWidth / 2), 0, Math.PI * 2);
  context.fillStyle = background;
  context.fill();

  context.beginPath();
  context.arc(screenPoint.x, screenPoint.y, metrics.outerRadius, 0, Math.PI * 2);
  context.strokeStyle = color;
  context.lineWidth = metrics.ringWidth;
  context.stroke();

  context.beginPath();
  context.arc(screenPoint.x, screenPoint.y, metrics.dotRadius, 0, Math.PI * 2);
  context.fillStyle = color;
  context.fill();
  context.restore();
  return true;
}

export function drawDxfCoordinateSystem(context, width, height) {
  const layout = coordinateSystemLayout(width, height);
  const { anchor, axisLength, arrowSize, backing } = layout;
  context.save();
  drawRoundedRectangle(context, backing);
  context.fillStyle = "rgba(5, 6, 7, 0.82)";
  context.fill();

  drawAxis(context, anchor, { x: anchor.x + axisLength, y: anchor.y }, X_AXIS_COLOR, arrowSize);
  drawAxis(context, anchor, { x: anchor.x, y: anchor.y - axisLength }, Y_AXIS_COLOR, arrowSize);

  context.beginPath();
  context.arc(anchor.x, anchor.y, 1.8, 0, Math.PI * 2);
  context.fillStyle = "#d7dde4";
  context.fill();

  context.font = '700 10px "Segoe UI", Arial, sans-serif';
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = X_AXIS_COLOR;
  context.fillText("X", anchor.x + axisLength + 9, anchor.y + 1);
  context.fillStyle = Y_AXIS_COLOR;
  context.fillText("Y", anchor.x, anchor.y - axisLength - 8);
  context.restore();
  return layout;
}

function drawAxis(context, start, end, color, arrowSize) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const normalX = -uy;
  const normalY = ux;

  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.strokeStyle = color;
  context.lineWidth = 1.5;
  context.lineCap = "round";
  context.stroke();

  context.beginPath();
  context.moveTo(end.x, end.y);
  context.lineTo(
    end.x - ux * (arrowSize + 1) + normalX * arrowSize,
    end.y - uy * (arrowSize + 1) + normalY * arrowSize,
  );
  context.lineTo(
    end.x - ux * (arrowSize + 1) - normalX * arrowSize,
    end.y - uy * (arrowSize + 1) - normalY * arrowSize,
  );
  context.closePath();
  context.fillStyle = color;
  context.fill();
}

function drawRoundedRectangle(context, rectangle) {
  const radius = Math.min(rectangle.radius, rectangle.width / 2, rectangle.height / 2);
  const right = rectangle.x + rectangle.width;
  const bottom = rectangle.y + rectangle.height;
  context.beginPath();
  context.moveTo(rectangle.x + radius, rectangle.y);
  context.lineTo(right - radius, rectangle.y);
  context.quadraticCurveTo(right, rectangle.y, right, rectangle.y + radius);
  context.lineTo(right, bottom - radius);
  context.quadraticCurveTo(right, bottom, right - radius, bottom);
  context.lineTo(rectangle.x + radius, bottom);
  context.quadraticCurveTo(rectangle.x, bottom, rectangle.x, bottom - radius);
  context.lineTo(rectangle.x, rectangle.y + radius);
  context.quadraticCurveTo(rectangle.x, rectangle.y, rectangle.x + radius, rectangle.y);
  context.closePath();
}

function pointNearViewport(point, width, height, margin) {
  return Number.isFinite(point?.x)
    && Number.isFinite(point?.y)
    && point.x >= -margin
    && point.y >= -margin
    && point.x <= width + margin
    && point.y <= height + margin;
}

function positiveOr(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}
