import { exec } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { glob } from "glob";

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define project root and other paths
const projectRoot = path.resolve(__dirname, "..");
const protocGenTsProtoPath = path.join(
  projectRoot,
  "node_modules",
  ".bin",
  "protoc-gen-ts_proto.cmd",
);
const protoPath = path.join(projectRoot, "proto");
const outPath = path.join(projectRoot, "src", "generated");

// Find all .proto files
const protoFiles = glob
  .sync(path.join(protoPath, "**", "*.proto").replace(/\\/g, "/"))
  .join(" ");

// Construct the protoc command
const command = [
  "protoc",
  `--plugin=protoc-gen-ts_proto=${protocGenTsProtoPath}`,
  `--ts_proto_out=${outPath}`,
  "--ts_proto_opt=esModuleInterop=true",
  `--proto_path=${protoPath}`,
  protoFiles,
].join(" ");

console.log("Running command:", command);

// Execute the command
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing protoc: ${error.message}`);
    console.error(stderr);
    return;
  }
  if (stderr) {
    console.warn(`protoc warnings:\n${stderr}`);
  }
  console.log(`protoc output:\n${stdout}`);
  console.log("Successfully generated TypeScript from .proto files.");
});
