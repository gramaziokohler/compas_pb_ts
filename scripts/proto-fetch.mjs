// Fetches the generated TypeScript bindings published by the schema owner.
//
// This repository does not generate protobuf code. The package that owns the .proto files
// (compas_pb) generates bindings for every supported language on each release and uploads
// them as release assets; consumers pin a version and download it. See the architecture
// page in the compas_pb docs.

import {
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import path from "node:path";
import { unzipSync } from "fflate";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const manifestPath = path.join(projectRoot, "proto", "upstream.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const outputRoot = path.join(projectRoot, "src", "proto");

const args = parseArguments(process.argv.slice(2));
const assetName = `compas_pb-generated-typescript-${manifest.generatorVersion}.zip`;

const archive = args.fromLocal
  ? readFileSync(localArchive(args.fromLocal))
  : await downloadArchive();

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });
extractInto(archive, outputRoot);

writeFileSync(
  path.join(outputRoot, "version.ts"),
  `// Written by scripts/proto-fetch.mjs from the pinned compas_pb release.\n` +
    `export const COMPAS_PB_VERSION = ${JSON.stringify(manifest.wireVersion)};\n`,
);

console.log(
  `Fetched ${assetName} from compas_pb ${manifest.ref} (wire ${manifest.wireVersion}).`,
);

/**
 * Unpacks the archive in-process.
 *
 * Shelling out is not portable here: the assets are zips, and GNU tar -- which is what
 * Linux ships -- cannot read them, while `unzip` is missing from slim images.
 */
function extractInto(zipped, destination) {
  for (const [name, contents] of Object.entries(unzipSync(zipped))) {
    if (name.endsWith("/")) {
      continue;
    }
    const target = path.join(destination, name);
    if (!path.resolve(target).startsWith(path.resolve(destination))) {
      throw new Error(`Refusing to extract outside the output folder: ${name}`);
    }
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, contents);
  }
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

  return new Uint8Array(await response.arrayBuffer());
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
