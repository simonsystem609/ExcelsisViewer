import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const threeModulePath = path.resolve(
  projectRoot,
  "node_modules",
  "three",
  "build",
  "three.module.js",
);

const insecureUuidSource = [
  "\tconst d0 = Math.random() * 0xffffffff | 0;",
  "\tconst d1 = Math.random() * 0xffffffff | 0;",
  "\tconst d2 = Math.random() * 0xffffffff | 0;",
  "\tconst d3 = Math.random() * 0xffffffff | 0;",
].join("\n");

const secureUuidSource = [
  "\t// ExcelsisView hardening: UUIDs identify serialized Three.js objects.",
  "\t// Use the browser cryptographic generator instead of Math.random().",
  "\tconst randomValues = new Uint32Array( 4 );",
  "\tglobalThis.crypto.getRandomValues( randomValues );",
  "\tconst d0 = randomValues[ 0 ];",
  "\tconst d1 = randomValues[ 1 ];",
  "\tconst d2 = randomValues[ 2 ];",
  "\tconst d3 = randomValues[ 3 ];",
].join("\n");

const secureThreeUuidPlugin = {
  name: "secure-three-uuid",
  setup(buildContext) {
    buildContext.onLoad({ filter: /three\.module\.js$/ }, async (args) => {
      if (path.resolve(args.path) !== threeModulePath) {
        return undefined;
      }

      const upstreamSource = await readFile(args.path, "utf8");
      const occurrences = upstreamSource.split(insecureUuidSource).length - 1;
      if (occurrences !== 1) {
        throw new Error(
          `Expected exactly one Three.js 0.160.0 UUID generator, found ${occurrences}.`,
        );
      }

      return {
        contents: upstreamSource.replace(insecureUuidSource, secureUuidSource),
        loader: "js",
      };
    });
  },
};

await build({
  absWorkingDir: projectRoot,
  entryPoints: ["scripts/3d-runtime-entry.mjs"],
  outfile: "modules/3dpdf/vendor/runtime.mjs",
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "chrome120",
  minify: true,
  legalComments: "eof",
  plugins: [secureThreeUuidPlugin],
});
