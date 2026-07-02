import { PointcloudData } from "../generated/compas_pb/data/geometry";
import { Point } from "./point";

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
      this._points = [];
      for (const pointData of this.data.points) {
        const point = new Point({ data: pointData! });
        this._points.push(point);
      }
    }
    return this._points;
  }
}

export function bytesToPointCloudData(bytes: Uint8Array): PointcloudData {
  return PointcloudData.decode(bytes);
}

export function pointCloudDataToBytes(data: PointcloudData): Uint8Array {
  return PointcloudData.encode(data).finish();
}
