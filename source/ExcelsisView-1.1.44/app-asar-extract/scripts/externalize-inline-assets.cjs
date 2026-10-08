const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");

function externalize({
  htmlPath,
  stylesheetPath,
  scriptPath,
  scriptType = "",
}) {
  let html = fs.readFileSync(htmlPath, "utf8");

  if (/<style\b/i.test(html)) {
    const styleMatch = html.match(/<style>\s*([\s\S]*?)\s*<\/style>/i);
    if (!styleMatch) throw new Error(`Could not isolate the stylesheet in ${htmlPath}.`);
    fs.writeFileSync(stylesheetPath, `${styleMatch[1].trim()}\n`);
    html = html.replace(
      styleMatch[0],
      `<link rel="stylesheet" href="./${path.basename(stylesheetPath)}">`,
    );
  }

  const inlineScriptPattern = scriptType === "module"
    ? /<script\s+type=["']module["']>\s*([\s\S]*?)\s*<\/script>/i
    : /<script>\s*([\s\S]*?)\s*<\/script>/i;
  if (inlineScriptPattern.test(html)) {
    const scriptMatch = html.match(inlineScriptPattern);
    if (!scriptMatch) throw new Error(`Could not isolate the script in ${htmlPath}.`);
    fs.writeFileSync(scriptPath, `${scriptMatch[1].trim()}\n`);
    const typeAttribute = scriptType ? ` type="${scriptType}"` : "";
    html = html.replace(
      scriptMatch[0],
      `<script${typeAttribute} src="./${path.basename(scriptPath)}"></script>`,
    );
  }

  fs.writeFileSync(htmlPath, html);
}

externalize({
  htmlPath: path.join(projectRoot, "launcher", "index.html"),
  stylesheetPath: path.join(projectRoot, "launcher", "styles.css"),
  scriptPath: path.join(projectRoot, "launcher", "app.js"),
});

externalize({
  htmlPath: path.join(projectRoot, "modules", "3dpdf", "index.html"),
  stylesheetPath: path.join(projectRoot, "modules", "3dpdf", "styles.css"),
  scriptPath: path.join(projectRoot, "modules", "3dpdf", "app.mjs"),
  scriptType: "module",
});

console.log("Inline application scripts and styles are externalized.");
