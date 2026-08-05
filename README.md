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
