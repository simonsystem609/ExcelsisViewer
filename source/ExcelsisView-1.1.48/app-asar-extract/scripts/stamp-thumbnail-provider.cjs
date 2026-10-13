const fs = require("node:fs");
const path = require("node:path");
const ResEdit = require("resedit");

const projectRoot = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"));
const providerPath = path.resolve(
  process.argv[2] || path.join(
    projectRoot,
    "shell",
    "thumbnail-provider",
    "bin",
    "x64",
    "ExcelsisDxfThumbnailProvider.dll",
  ),
);
const version = `${manifest.version}.0`;
const executable = ResEdit.NtExecutable.from(fs.readFileSync(providerPath), { ignoreCert: true });
const resources = ResEdit.NtExecutableResource.from(executable);
const versionInfo = ResEdit.Resource.VersionInfo.createEmpty();
versionInfo.lang = 1033;
versionInfo.fixedInfo.fileFlagsMask = 0x3f;
versionInfo.fixedInfo.fileOS = 0x00040004;
versionInfo.fixedInfo.fileType = 0x00000002;
versionInfo.setFileVersion(version, 1033);
versionInfo.setProductVersion(version, 1033);
versionInfo.setStringValues(
  { lang: 1033, codepage: 1200 },
  {
    CompanyName: "Excelsis",
    FileDescription: "Excelsis Document Thumbnail Provider",
    InternalName: "ExcelsisDxfThumbnailProvider",
    LegalCopyright: "Copyright (c) Excelsis contributors",
    OriginalFilename: "ExcelsisDxfThumbnailProvider.dll",
    ProductName: "ExcelsisView",
  },
);
versionInfo.outputToResourceEntries(resources.entries);
resources.outputResource(executable);
fs.writeFileSync(providerPath, Buffer.from(executable.generate()));
