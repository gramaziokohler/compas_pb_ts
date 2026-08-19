import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { PointData } from "../proto/compas_pb/generated/geometry_pb";
import { PointDataSchema } from "../proto/compas_pb/generated/geometry_pb";

/** The fields a Point is built from. */
export type PointInit = MessageInitShape<typeof PointDataSchema>;

export class Point {
  public readonly data: PointData;

  constructor(init: PointInit) {
    const pointData = create(PointDataSchema, init);

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
    return pointToBytes(this);
  }

  /** Reads a Point from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Point {
    return bytesToPoint(bytes);
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

export function bytesToPoint(bytes: Uint8Array): Point {
  return new Point(fromBinary(PointDataSchema, bytes));
}

export function pointToBytes(point: Point): Uint8Array {
  return toBinary(PointDataSchema, point.data);
}

export function pointsFromFlatCoordinates(coordinates: number[]): Point[] {
  if (coordinates.length % 3 !== 0) {
    throw new Error("Invalid coordinate array: expected x, y, z triplets.");
  }

  const points: Point[] = [];
  for (let index = 0; index < coordinates.length; index += 3) {
    points.push(
      new Point({
        guid: "",
        name: "",
        x: coordinates[index],
        y: coordinates[index + 1],
        z: coordinates[index + 2],
      }),
    );
  }
  return points;
}
