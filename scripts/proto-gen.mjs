import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "glob";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const outputArgumentIndex = process.argv.indexOf("--out");
const outPath =
  outputArgumentIndex === -1
    ? path.join(projectRoot, "src", "generated")
    : path.resolve(process.argv[outputArgumentIndex + 1]);
if (outputArgumentIndex !== -1 && !process.argv[outputArgumentIndex + 1]) {
  throw new Error("--out requires a path");
}

const executableSuffix = process.platform === "win32" ? ".cmd" : "";
const protocGenTsProtoPath = path.join(
  projectRoot,
  "node_modules",
  ".bin",
  `protoc-gen-ts_proto${executableSuffix}`,
);
const biomePath = path.join(
  projectRoot,
  "node_modules",
  ".bin",
  `biome${executableSuffix}`,
);
const protoPath = path.join(projectRoot, "proto");
const protoFiles = glob
  .sync(path.join(protoPath, "**", "*.proto").replaceAll("\\", "/"))
  .sort();

mkdirSync(outPath, { recursive: true });
execFileSync(
  "protoc",
  [
    `--plugin=protoc-gen-ts_proto=${protocGenTsProtoPath}`,
    `--ts_proto_out=${outPath}`,
    "--ts_proto_opt=esModuleInterop=true",
    `--proto_path=${protoPath}`,
    ...protoFiles,
  ],
  { stdio: "inherit" },
);
execFileSync(
  biomePath,
  [
    "format",
    "--write",
    `--config-path=${path.join(scriptDirectory, "biome-generated.json")}`,
    outPath,
  ],
  { stdio: "inherit" },
);
console.log(`Generated TypeScript protobuf codecs in ${outPath}.`);
