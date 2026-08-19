# COMPAS Protobuf TypeScript

TypeScript wrappers and generated protobuf codecs for COMPAS geometry,
datastructures, and messages.

The current codecs target the `compas_pb` 1.x wire format. Messages written by
pre-1.0 releases are intentionally rejected because the binary schema changed.

## Install

```sh
npm install @gramaziokohler/compas-pb-ts
```

## Usage

Messages are built with `create` and a generated schema. The schema is what carries
the field numbers, so it is the first argument to everything at runtime:

```ts
import { create } from "@bufbuild/protobuf";
import { CompasGeometry, Point, bytesToPointData, pointDataToBytes } from "@gramaziokohler/compas-pb-ts";

const point = new Point({
  data: create(CompasGeometry.PointDataSchema, {
    guid: "point-guid",
    name: "Point",
    x: 1,
    y: 2,
    z: 3,
  }),
});

const bytes = pointDataToBytes(point.data);
const decoded = bytesToPointData(bytes);
```

Nested messages can stay plain objects inside `create`:

```ts
import { create } from "@bufbuild/protobuf";
import { Box, CompasGeometry, pbDumpBytes, pbLoadBytes } from "@gramaziokohler/compas-pb-ts";

const box = new Box({
  data: create(CompasGeometry.BoxDataSchema, {
    guid: crypto.randomUUID(),
    name: "Box",
    frame: {
      point: { x: 0, y: 0, z: 0 },
      xaxis: { x: 1, y: 0, z: 0 },
      yaxis: { x: 0, y: 1, z: 0 },
    },
    xsize: 1,
    ysize: 1,
    zsize: 1,
  }),
});

const restored = pbLoadBytes(pbDumpBytes(box));
```

Geometry and datastructure messages load back as their wrapper classes. `ListData` and
`DictData` load recursively as plain JavaScript arrays and objects.

### Envelopes

`pbDump` and `pbLoadBytes` are the equivalents of Python's `pb_dump_bts` and
`pb_load_bts`. `pbDump` takes any supported value, not only a registered wrapper:

```ts
import { pbDump, pbLoadBytes } from "@gramaziokohler/compas-pb-ts";

const bytes = pbDump({ count: 3, ratio: 0.5, items: [1, "two", true] });
pbLoadBytes(bytes); // { count: 3, ratio: 0.5, items: [1, "two", true] }
```

Whole numbers and floats keep their types across the wire, bytes travel through the
`base64:` convention, and an object shaped `{ dtype, data }` is sent as `FallbackData` so
the Python side reconstructs it rather than seeing a plain dictionary.

`pbDumpBytes` remains for the narrower case of packing one already-serialized wrapper.

### Registering your own types

Types outside this package register themselves, so `pbDump` and `pbLoadBytes` carry them
too. Python discovers plugins through packaging entry points; JavaScript has no equivalent,
so registration is an explicit call made once at start-up:

```ts
import { registerType } from "@gramaziokohler/compas-pb-ts";

registerType("example.v1.WidgetData", Widget, {
  toBytes: (widget) => /* ... */,
  fromBytes: (bytes) => /* ... */,
});
```

Omit the codec if your class follows the wrapper convention: a `bytes` getter and a
`{ bytes }` constructor. See `@gramaziokohler/antikythera-ts` for a full plugin.

### Generated types

Generated messages are available as namespaced root exports. Each message is a **type**
(erased at compile time) plus a **schema** (the runtime descriptor):

```ts
import { create } from "@bufbuild/protobuf";
import { CompasGeometry } from "@gramaziokohler/compas-pb-ts";

const data: CompasGeometry.PointData = create(CompasGeometry.PointDataSchema, {
  guid: "point-guid",
  name: "Point",
  x: 1,
  y: 2,
  z: 3,
});
```

A package whose own `.proto` files import compas_pb's should import the schemas from the
subpath export rather than generating a second copy, so both sides share one file
descriptor:

```ts
import { AnyDataSchema } from "@gramaziokohler/compas-pb-ts/proto/compas_pb/generated/message_pb";
```

## Fetching generated bindings

This package generates no protobuf code. The package that owns the schemas publishes
bindings for every supported language on each release, and `compas-pb-fetch` downloads the
pinned one. Any package with its own `.proto` files can use it:

```jsonc
// proto/upstream.json
{
  "repository": "https://github.com/gramaziokohler/antikythera.git",
  "ref": "v0.1.0",
  "package": "antikythera",
  "generatorVersion": "2.14.0",
  "rewriteImports": {
    "./compas_pb/generated/": "@gramaziokohler/compas-pb-ts/proto/compas_pb/generated/"
  }
}
```

```jsonc
// package.json
"scripts": { "proto": "compas-pb-fetch" }
```

`rewriteImports` points schemas you do not own at the package that owns them, and
`versionModule` writes a version constant beside the output. Both are optional. Pass
`--from-local ../antikythera` to build against a local checkout instead of a release.

## Debugging

Class names are preserved in the build for better debugging. Inspect objects in the console to see descriptive names like Point, Box, Sphere instead of minified names.

## Development

```sh
pnpm install
pnpm lint
pnpm test
pnpm build
```

### Updating protobuf schemas

`compas_pb` is the canonical schema source, and it publishes the generated bindings. This
repository keeps a pinned copy under `src/proto`; do not edit it or the wire-version
constant by hand.

To move to a newer `compas_pb` release, set `ref` and `versionModule.value` in
`proto/upstream.json`, then re-fetch:

```sh
npm run proto
```

CI re-runs that and fails on any difference, so the committed copy always matches the pin.
To work against an unreleased build, point it at a local checkout that has run
`invoke create-class-assets`:

```sh
npm run proto -- --from-local ../compas_pb
```

