import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { PointcloudData } from "../proto/compas_pb/generated/geometry_pb";
import { PointcloudDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { type Point, pointsFromFlatCoordinates } from "./point";

/** The fields a Pointcloud is built from. */
export type PointcloudInit = MessageInitShape<typeof PointcloudDataSchema>;

export class Pointcloud {
  public readonly data: PointcloudData;
  private _points?: Point[];

  constructor(init: PointcloudInit) {
    const pointcloudData = create(PointcloudDataSchema, init);

    if (!pointcloudData.points || pointcloudData.points.length === 0) {
      throw new Error(
        "Invalid PointcloudData: Missing required property points.",
      );
    }
    this.data = pointcloudData;
  }

  get bytes(): Uint8Array {
    return pointCloudToBytes(this);
  }

  /** Reads a Pointcloud from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Pointcloud {
    return bytesToPointcloud(bytes);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get points(): Point[] {
    if (!this._points) {
      this._points = pointsFromFlatCoordinates(this.data.points);
    }
    return this._points;
  }
}

export function bytesToPointcloud(bytes: Uint8Array): Pointcloud {
  return new Pointcloud(fromBinary(PointcloudDataSchema, bytes));
}

export function pointCloudToBytes(pointCloud: Pointcloud): Uint8Array {
  return toBinary(PointcloudDataSchema, pointCloud.data);
}
