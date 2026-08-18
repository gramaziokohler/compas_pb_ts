import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { PointcloudData } from "../proto/compas_pb/generated/geometry_pb";
import { PointcloudDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { type Point, pointsFromFlatCoordinates } from "./point";

export class Pointcloud {
  public readonly data: PointcloudData;
  private _points?: Point[];

  constructor(input: { bytes: Uint8Array } | { data: PointcloudData }) {
    let pointcloudData: PointcloudData;
    if ("bytes" in input) {
      pointcloudData = bytesToPointCloudData(input.bytes);
    } else {
      pointcloudData = input.data;
    }

    if (!pointcloudData.points || pointcloudData.points.length === 0) {
      throw new Error(
        "Invalid PointcloudData: Missing required property points.",
      );
    }
    this.data = pointcloudData;
  }

  get bytes(): Uint8Array {
    return pointCloudDataToBytes(this.data);
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

export function bytesToPointCloudData(bytes: Uint8Array): PointcloudData {
  return fromBinary(PointcloudDataSchema, bytes);
}

export function pointCloudDataToBytes(data: PointcloudData): Uint8Array {
  return toBinary(PointcloudDataSchema, data);
}
