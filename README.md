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

```ts
import { Point, pointDataToBytes, bytesToPointData } from "@gramaziokohler/compas-pb-ts";

const point = new Point({
  data: {
    guid: "point-guid",
    name: "Point",
    x: 1,
    y: 2,
    z: 3,
  },
});

const bytes = pointDataToBytes(point.data);
const decoded = bytesToPointData(bytes);
```

Serialize and deserialize complete COMPAS message envelopes with `pbDumpBytes`
and `pbLoadBytes`, the TypeScript equivalents of Python's `pb_dump_bts` and
`pb_load_bts`:

```ts
import { Box, pbDumpBytes, pbLoadBytes } from "@gramaziokohler/compas-pb-ts";

const box = new Box({
  data: {
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
  },
});

const bytes = pbDumpBytes(box);
const restoredBox = pbLoadBytes(bytes);
```

Geometry and datastructure messages load as their wrapper classes. Protobuf
`ListData` and `DictData` messages load recursively as plain JavaScript arrays
and objects.

Generated protobuf types are available from namespaced root exports:

```ts
import type { CompasGeometry } from "@gramaziokohler/compas-pb-ts";

const point: CompasGeometry.PointData = {
  guid: "point-guid",
  name: "Point",
  x: 1,
  y: 2,
  z: 3,
};
```

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

`compas_pb` is the canonical schema source. This repository keeps a generated,
pinned snapshot described by `proto/upstream.json`; do not edit the snapshot or
wire-version constant by hand.

To update to a released `compas_pb` tag and regenerate the TypeScript codecs:

```sh
npm run proto:sync -- --ref v1.0.0
npm run proto
npm run proto:check
```

When a local clone is available, the same operation can run without fetching
schema contents from GitHub:

```sh
npm run proto:sync -- --ref v1.0.0 --source ../compas_pb
npm run proto:check -- --source ../compas_pb
```

The sync records the resolved commit and derives `COMPAS_PB_VERSION` from the
selected Python release. CI verifies both the schema snapshot and regenerated
code against that immutable commit. The only normalization is the protobuf
import prefix (`compas_pb/generated` to `compas_pb/data`), which preserves this
package's existing generated-module layout.
