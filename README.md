# COMPAS Protobuf TypeScript

TypeScript wrappers and generated protobuf codecs for COMPAS geometry,
datastructures, and messages.

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

## Development

```sh
pnpm install
pnpm lint
pnpm test
pnpm build
```
