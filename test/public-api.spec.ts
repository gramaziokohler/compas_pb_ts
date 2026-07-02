import { describe, expect, it } from "vitest";

import {
  Box,
  type CompasGeometry,
  Point,
  bytesToPointData,
  pointDataToBytes,
} from "../src";

describe("public API", () => {
  it("exports geometry wrappers and generated data namespaces", () => {
    const data: CompasGeometry.PointData = {
      guid: "point-guid",
      name: "Point",
      x: 1,
      y: 2,
      z: 3,
    };

    const point = new Point({ data });
    const decoded = bytesToPointData(pointDataToBytes(point.data));

    expect(point).toBeInstanceOf(Point);
    expect(Box).toBeTypeOf("function");
    expect(decoded).toEqual(data);
  });
});
