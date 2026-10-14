const fs = require("node:fs/promises");
const path = require("node:path");
const ResEdit = require("resedit");

const removableRuntimeFiles = [
  "dxcompiler.dll",
  "dxil.dll",
  "vulkan-1.dll",
  "vk_swiftshader.dll",
  "vk_swiftshader_icd.json",
];

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== "win32") return;
  await replaceExecutableIcon(context);
  await archiveUnusedRuntimeFiles(context);
  await publishSourceMaterials(context);
};

async function publishSourceMaterials(context) {
  const outputDir = path.dirname(context.appOutDir);
  const projectDir = context.packager.projectDir;
  const appVersion = context.packager.appInfo.version;
  const materials = [
    {
      source: path.join(
        projectDir,
        "third_party",
        "source",
        "app",
        `ExcelsisView-${appVersion}-source.zip`,
      ),
      destination: `SOURCE-ExcelsisView-${appVersion}.zip`,
    },
    {
      source: path.join(
        projectDir,
        "third_party",
        "source",
        "nanoprc",
        "nanoPRC-modified-source-66cacb70.zip",
      ),
      destination: "SOURCE-nanoPRC-66cacb70.zip",
    },
    {
      source: path.join(
        projectDir,
        "third_party",
        "source",
        "u3d",
        "u3d-modified-source-5c141d9f.zip",
      ),
      destination: "SOURCE-U3D-5c141d9f.zip",
    },
    {
      source: path.join(
        projectDir,
        "third_party",
        "libredwg",
        "libredwg-0.14.8492-source.tar.gz",
      ),
      destination: "SOURCE-LibreDWG-0.14.8492.tar.gz",
    },
    { source: path.join(projectDir, "LICENSE.txt"), destination: "LICENSE.txt" },
    { source: path.join(projectDir, "README.md"), destination: "README.md" },
    { source: path.join(projectDir, "SOURCE.md"), destination: "SOURCE.md" },
    {
      source: path.join(projectDir, "THIRD_PARTY_NOTICES.md"),
      destination: "THIRD_PARTY_NOTICES.md",
    },
    {
      source: path.join(projectDir, "DISTRIBUTION-RISK-ACCEPTANCE.md"),
      destination: "DISTRIBUTION-RISK-ACCEPTANCE.md",
    },
  ];
  await fs.mkdir(outputDir, { recursive: true });
  for (const material of materials) {
    await fs.copyFile(material.source, path.join(outputDir, material.destination));
  }
}

async function archiveUnusedRuntimeFiles(context) {
  const archiveDir = path.resolve(
    context.packager.projectDir,
    "..",
    "..",
    "trash",
    `excelsisview-${context.packager.appInfo.version}-pruned-runtime`,
  );
  await fs.mkdir(archiveDir, { recursive: true });
  for (const fileName of removableRuntimeFiles) {
    const sourcePath = path.join(context.appOutDir, fileName);
    try {
      await fs.access(sourcePath);
    } catch {
      continue;
    }
    let destinationPath = path.join(archiveDir, fileName);
    try {
      await fs.access(destinationPath);
      destinationPath = path.join(archiveDir, `${Date.now()}-${fileName}`);
    } catch {
      // The original name is available.
    }
    await fs.rename(sourcePath, destinationPath);
  }
}

async function replaceExecutableIcon(context) {
  const exeName = `${context.packager.appInfo.productFilename}.exe`;
  const exePath = path.join(context.appOutDir, exeName);
  const iconPath = path.join(context.packager.projectDir, "build", "icon-dxf.ico");
  const exeData = await fs.readFile(exePath);
  const exe = ResEdit.NtExecutable.from(exeData, { ignoreCert: true });
  const resources = ResEdit.NtExecutableResource.from(exe);
  const iconFile = ResEdit.Data.IconFile.from(await fs.readFile(iconPath));
  const iconGroups = ResEdit.Resource.IconGroupEntry.fromEntries(resources.entries);
  const groupId = iconGroups[0]?.id ?? 1;
  const lang = iconGroups[0]?.lang ?? 1033;

  ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
    resources.entries,
    groupId,
    lang,
    iconFile.icons.map((item) => item.data),
  );
  resources.outputResource(exe);
  await fs.writeFile(exePath, Buffer.from(exe.generate()));
}
