const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { spawn } = require("node:child_process");
const electronPath = require("electron");

function createFixture() {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Length 51 >>\nstream\nBT /F1 24 Tf 72 720 Td (Excelsis PDF test) Tj ET\nendstream",
  ];
  let source = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.byteLength(source));
    source += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(source);
  source += `xref\n0 ${objects.length + 1}\n`;
  source += "0000000000 65535 f \n";
  for (const offset of offsets.slice(1)) {
    source += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  source += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(source, "ascii");
}

async function run() {
  const projectRoot = path.resolve(__dirname, "..");
  const tempRoot = path.resolve(projectRoot, "..", "..", "tmp", "pdfs");
  const inputPath = path.join(tempRoot, "thumbnail-helper-fixture.pdf");
  const outputPath = path.join(tempRoot, "thumbnail-helper-output.bmp");
  await fs.mkdir(tempRoot, { recursive: true });
  await fs.writeFile(inputPath, createFixture());

  await new Promise((resolve, reject) => {
    const child = spawn(electronPath, [
      projectRoot,
      `--pdf-thumbnail-input=${inputPath}`,
      `--pdf-thumbnail-output=${outputPath}`,
      "--pdf-thumbnail-size=192",
    ], {
      cwd: projectRoot,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("PDF thumbnail helper timed out."));
    }, 45000);
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`PDF thumbnail helper exited ${code}: ${stderr}`));
    });
  });

  const bitmap = await fs.readFile(outputPath);
  assert.equal(bitmap.subarray(0, 2).toString("ascii"), "BM");
  assert.equal(bitmap.readInt32LE(18), 192);
  assert.equal(bitmap.readInt32LE(22), -192);
  assert.ok(bitmap.length >= 54 + 192 * 192 * 4);
  console.log(JSON.stringify({
    width: 192,
    height: 192,
    bmpBytes: bitmap.length,
    bundledPdfRenderer: true,
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
