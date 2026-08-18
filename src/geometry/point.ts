import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { PointData } from "../proto/compas_pb/generated/geometry_pb";
import { PointDataSchema } from "../proto/compas_pb/generated/geometry_pb";

export class Point {
  public readonly data: PointData;

  constructor(input: { bytes: Uint8Array } | { data: PointData }) {
    let pointData: PointData;
    if ("bytes" in input) {
      pointData = bytesToPointData(input.bytes);
    } else {
      pointData = input.data;
    }

    if (
      pointData.x === undefined ||
      pointData.y === undefined ||
      pointData.z === undefined
    ) {
      throw new Error(
        "Invalid PointData: Missing required properties (x, y, or z).",
      );
    }
    this.data = pointData;
  }

  get bytes(): Uint8Array {
    return pointDataToBytes(this.data);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get x(): number {
    return this.data.x;
  }

  get y(): number {
    return this.data.y;
  }

  get z(): number {
    return this.data.z;
  }
}

export function bytesToPointData(bytes: Uint8Array): PointData {
  return fromBinary(PointDataSchema, bytes);
}

export function pointDataToBytes(point: PointData): Uint8Array {
  return toBinary(PointDataSchema, point);
}

export function pointsFromFlatCoordinates(coordinates: number[]): Point[] {
  if (coordinates.length % 3 !== 0) {
    throw new Error("Invalid coordinate array: expected x, y, z triplets.");
  }

  const points: Point[] = [];
  for (let index = 0; index < coordinates.length; index += 3) {
    points.push(
      new Point({
        data: create(PointDataSchema, {
          guid: "",
          name: "",
          x: coordinates[index],
          y: coordinates[index + 1],
          z: coordinates[index + 2],
        }),
      }),
    );
  }
  return points;
}
