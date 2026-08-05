import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const temporaryOutput = mkdtempSync(path.join(tmpdir(), "compas-pb-ts-gen-"));

try {
  execFileSync(
    process.execPath,
    [
      path.join(scriptDirectory, "proto-sync.mjs"),
      "--check",
      ...process.argv.slice(2),
    ],
    { cwd: projectRoot, stdio: "inherit" },
  );
  execFileSync(
    process.execPath,
    [path.join(scriptDirectory, "proto-gen.mjs"), "--out", temporaryOutput],
    { cwd: projectRoot, stdio: "inherit" },
  );

  const generatedRoot = path.join(projectRoot, "src", "generated");
  const expectedFiles = listTypeScriptFiles(generatedRoot).filter(
    (filename) => filename !== "compas_pb/version.ts",
  );
  const actualFiles = listTypeScriptFiles(temporaryOutput);
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
    throw new Error("Generated protobuf file list is stale");
  }
  for (const filename of actualFiles) {
    const actual = readFileSync(path.join(temporaryOutput, filename), "utf8");
    const expected = readFileSync(path.join(generatedRoot, filename), "utf8");
    if (actual !== expected) {
      throw new Error(`Generated protobuf codec is stale: ${filename}`);
    }
  }
  console.log("Generated protobuf codecs are current.");
} finally {
  rmSync(temporaryOutput, { recursive: true, force: true });
}

function listTypeScriptFiles(root) {
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
    .map((entry) =>
      path
        .relative(root, path.join(entry.parentPath, entry.name))
        .replaceAll("\\", "/"),
    )
    .sort();
}
