function values(input) {
  if (!input) return [1, 0, 0, 1, 0, 0];
  if (Array.isArray(input) || ArrayBuffer.isView(input)) {
    return [
      Number(input[0] ?? 1),
      Number(input[1] ?? 0),
      Number(input[2] ?? 0),
      Number(input[3] ?? 1),
      Number(input[4] ?? 0),
      Number(input[5] ?? 0),
    ];
  }
  return [
    Number(input.a ?? 1),
    Number(input.b ?? 0),
    Number(input.c ?? 0),
    Number(input.d ?? 1),
    Number(input.e ?? 0),
    Number(input.f ?? 0),
  ];
}

class NodeTestDOMMatrix {
  constructor(input) {
    [this.a, this.b, this.c, this.d, this.e, this.f] = values(input);
  }

  multiplySelf(input) {
    const [a, b, c, d, e, f] = values(input);
    const current = [this.a, this.b, this.c, this.d, this.e, this.f];
    this.a = current[0] * a + current[2] * b;
    this.b = current[1] * a + current[3] * b;
    this.c = current[0] * c + current[2] * d;
    this.d = current[1] * c + current[3] * d;
    this.e = current[0] * e + current[2] * f + current[4];
    this.f = current[1] * e + current[3] * f + current[5];
    return this;
  }

  preMultiplySelf(input) {
    const left = new NodeTestDOMMatrix(input);
    left.multiplySelf(this);
    [this.a, this.b, this.c, this.d, this.e, this.f] = values(left);
    return this;
  }

  translate(x = 0, y = 0) {
    return new NodeTestDOMMatrix(this).multiplySelf([1, 0, 0, 1, x, y]);
  }

  scale(x = 1, y = x) {
    return new NodeTestDOMMatrix(this).multiplySelf([x, 0, 0, y, 0, 0]);
  }

  invertSelf() {
    const determinant = this.a * this.d - this.b * this.c;
    if (!determinant) throw new Error("Cannot invert a singular test DOMMatrix.");
    const [a, b, c, d, e, f] = values(this);
    this.a = d / determinant;
    this.b = -b / determinant;
    this.c = -c / determinant;
    this.d = a / determinant;
    this.e = (c * f - d * e) / determinant;
    this.f = (b * e - a * f) / determinant;
    return this;
  }
}

export function installPdfJsNodeTestShims() {
  globalThis.DOMMatrix ??= CanvasDOMMatrix ?? NodeTestDOMMatrix;
  globalThis.ImageData ??= CanvasImageData;
  globalThis.Path2D ??= CanvasPath2D;
  Map.prototype.getOrInsert ??= function getOrInsert(key, value) {
    if (!this.has(key)) this.set(key, value);
    return this.get(key);
  };
  Map.prototype.getOrInsertComputed ??= function getOrInsertComputed(key, callback) {
    if (!this.has(key)) this.set(key, callback(key));
    return this.get(key);
  };
  Math.sumPrecise ??= (valuesToSum) => {
    let sum = 0;
    let compensation = 0;
    for (const rawValue of valuesToSum) {
      const value = Number(rawValue);
      const adjusted = value - compensation;
      const next = sum + adjusted;
      compensation = (next - sum) - adjusted;
      sum = next;
    }
    return sum;
  };
  if (!Uint8Array.prototype.toHex) {
    Object.defineProperty(Uint8Array.prototype, "toHex", {
      configurable: true,
      value() {
        return Buffer.from(this.buffer, this.byteOffset, this.byteLength).toString("hex");
      },
    });
  }
  if (!Uint8Array.prototype.toBase64) {
    Object.defineProperty(Uint8Array.prototype, "toBase64", {
      configurable: true,
      value() {
        return Buffer.from(this.buffer, this.byteOffset, this.byteLength).toString("base64");
      },
    });
  }
  Uint8Array.fromBase64 ??= (text) => new Uint8Array(Buffer.from(text, "base64"));
}
import {
  DOMMatrix as CanvasDOMMatrix,
  ImageData as CanvasImageData,
  Path2D as CanvasPath2D,
} from "@napi-rs/canvas";
