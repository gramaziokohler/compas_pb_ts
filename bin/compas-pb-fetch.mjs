#!/usr/bin/env node
// Downloads generated protobuf bindings published by the package that owns the schemas.
//
// A package owning .proto files generates bindings for every supported language on each
// release and uploads them as release assets. Nothing downstream generates protobuf code;
// it pins a version and fetches it. This is the TypeScript counterpart of the Invoke tasks
// compas_pb ships for Python. See the architecture page in the compas_pb docs.
//
// Configuration lives in proto/upstream.json of the calling package:
//
//   {
//     "repository": "https://github.com/compas-dev/compas_pb.git",
//     "ref": "v1.2.0",
//     "package": "compas_pb",
//     "generatorVersion": "2.14.0",
//     "output": "src/proto",
//     "versionModule": { "file": "version.ts", "export": "COMPAS_PB_VERSION", "value": "1.2.0" },
//     "rewriteImports": { "./compas_pb/generated/": "@gramaziokohler/compas-pb-ts/proto/compas_pb/generated/" }
//   }
//
// Only repository, ref, package and generatorVersion are required.

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { unzipSync } from "fflate";

const projectRoot = process.cwd();
const manifestPath = path.join(projectRoot, "proto", "upstream.json");

if (!existsSync(manifestPath)) {
  fail(`No manifest at ${path.relative(projectRoot, manifestPath)}`);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
for (const required of ["repository", "ref", "package", "generatorVersion"]) {
  if (!manifest[required]) {
    fail(`Manifest is missing "${required}"`);
  }
}

const args = parseArguments(process.argv.slice(2));
const outputRoot = path.join(
  projectRoot,
  manifest.output ?? path.join("src", "proto"),
);
const assetName = `${manifest.package}-generated-typescript-${manifest.generatorVersion}.zip`;

const archive = args.fromLocal
  ? readFileSync(localArchive(args.fromLocal))
  : await downloadArchive();

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });
extractInto(archive, outputRoot);

if (manifest.rewriteImports) {
  rewriteImports(outputRoot, manifest.rewriteImports);
}

if (manifest.versionModule) {
  const { file, export: exported, value } = manifest.versionModule;
  writeFileSync(
    path.join(outputRoot, file),
    `// Written by compas-pb-fetch from the pinned ${manifest.package} release.\n` +
      `export const ${exported} = ${JSON.stringify(value)};\n`,
  );
}

console.log(`Fetched ${assetName} from ${manifest.package} ${manifest.ref}.`);

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
      fail(`Refusing to extract outside the output folder: ${name}`);
    }
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, contents);
  }
}

/**
 * Points imports of another package's schemas at that package.
 *
 * Generated code imports schemas it does not own using the path they had at generation
 * time. Vendoring a second copy would register a competing file descriptor for the same
 * messages, and the two runtimes would then disagree about types they are meant to share.
 */
function rewriteImports(root, rules) {
  for (const entry of readdirSync(root, {
    recursive: true,
    withFileTypes: true,
  })) {
    if (!entry.isFile() || !entry.name.endsWith(".ts")) {
      continue;
    }

    const file = path.join(entry.parentPath ?? entry.path, entry.name);
    const source = readFileSync(file, "utf8");
    let rewritten = source;

    for (const [from, to] of Object.entries(rules)) {
      const pattern = new RegExp(
        `(["'])${escapeForRegExp(from)}([^"']+)\\1`,
        "g",
      );
      rewritten = rewritten.replace(pattern, (_match, quote, rest) => {
        return `${quote}${to}${rest.replace(/\.js$/, "")}${quote}`;
      });
    }

    if (rewritten !== source) {
      writeFileSync(file, rewritten);
      console.log(`Rewrote shared imports in ${path.relative(root, file)}`);
    }
  }
}

function escapeForRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
    fail(
      `No ${assetName} in the local checkout.\n` +
        `  Run "invoke create-class-assets" in ${manifest.package} first.\n` +
        `  Looked for: ${archive}`,
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
    fail(
      `Failed to download ${assetName}: ${response.status} ${response.statusText}\n` +
        `  ${url}\n` +
        `  If ${manifest.package} ${manifest.ref} predates published bindings, build them\n` +
        `  from a local checkout instead: npm run proto -- --from-local ../${manifest.package}`,
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
      fail(`Unknown argument: ${argv[index]}`);
    }
  }
  return parsed;
}

function fail(message) {
  console.error(`compas-pb-fetch: ${message}`);
  process.exit(1);
}
