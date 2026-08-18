import { defineConfig } from "tsdown";

export default defineConfig([
  {
    // The generated protobuf modules ship as their own entry points, not only bundled into
    // the barrel. Packages whose .proto files import compas_pb's must import the *same*
    // module: protobuf-es links file descriptors by identity, so a second copy of
    // compas_pb.data would register a competing descriptor for the same message.
    entry: ["./src/index.ts", "./src/proto/**/*.ts"],
    dts: true,
    minify: false,
    sourcemap: true,
    unbundle: true,
  },
]);
