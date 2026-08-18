// Fetches the generated TypeScript bindings published by the schema owner.
//
// This repository does not generate protobuf code. The package that owns the .proto files
// (compas_pb) generates bindings for every supported language on each release and uploads
// them as release assets; consumers pin a version and download it. See the architecture
// page in the compas_pb docs.

import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
  cpSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const manifestPath = path.join(projectRoot, "proto", "upstream.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const outputRoot = path.join(projectRoot, "src", "proto");

const args = parseArguments(process.argv.slice(2));
const assetName = `compas_pb-generated-typescript-${manifest.generatorVersion}.zip`;

const staging = mkdtempSync(path.join(tmpdir(), "compas-pb-bindings-"));
try {
  const archive = args.fromLocal
    ? localArchive(args.fromLocal)
    : await downloadArchive();

  // tar reads zip on macOS, Linux and Windows 10+, so this needs no unzip dependency.
  execFileSync("tar", ["-xf", archive, "-C", staging], { stdio: "inherit" });

  rmSync(outputRoot, { recursive: true, force: true });
  mkdirSync(outputRoot, { recursive: true });
  cpSync(staging, outputRoot, { recursive: true });

  writeFileSync(
    path.join(outputRoot, "version.ts"),
    `// Written by scripts/proto-fetch.mjs from the pinned compas_pb release.\n` +
      `export const COMPAS_PB_VERSION = ${JSON.stringify(manifest.wireVersion)};\n`,
  );

  console.log(
    `Fetched ${assetName} from compas_pb ${manifest.ref} (wire ${manifest.wireVersion}).`,
  );
} finally {
  rmSync(staging, { recursive: true, force: true });
}

function localArchive(localPath) {
  const archive = path.resolve(
    projectRoot,
    localPath,
    "dist",
    "proto",
    assetName,
  );
  if (!existsSync(archive)) {
    throw new Error(
      `No ${assetName} in the local checkout. Run "invoke create-class-assets" in compas_pb first.\n` +
        `  looked for: ${archive}`,
    );
  }
  console.log(`Using local build: ${archive}`);
  return archive;
}

async function downloadArchive() {
  const url = `${manifest.repository.replace(/\.git$/, "")}/releases/download/${manifest.ref}/${assetName}`;
  console.log(`Downloading ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to download ${assetName}: ${response.status} ${response.statusText}\n` +
        `  ${url}\n` +
        `  If compas_pb ${manifest.ref} predates TypeScript bindings, build them from a local\n` +
        `  checkout instead: npm run proto -- --from-local ../compas_pb`,
    );
  }

  const archive = path.join(staging, assetName);
  writeFileSync(archive, Buffer.from(await response.arrayBuffer()));
  return archive;
}

function parseArguments(argv) {
  const parsed = { fromLocal: null };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--from-local") {
      parsed.fromLocal = argv[index + 1];
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  return parsed;
}
