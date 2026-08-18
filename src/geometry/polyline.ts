import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { PolylineData } from "../proto/compas_pb/generated/geometry_pb";
import { PolylineDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { type Point, pointsFromFlatCoordinates } from "./point";

export class Polyline {
  public readonly data: PolylineData;
  private _points?: Point[];

  constructor(input: { bytes: Uint8Array } | { data: PolylineData }) {
    let polylineData: PolylineData;
    if ("bytes" in input) {
      polylineData = bytesToPolylineData(input.bytes);
    } else {
      polylineData = input.data;
    }

    if (!polylineData.points || polylineData.points.length === 0) {
      throw new Error(
        "Invalid PolylineData: Missing required property points.",
      );
    }
    this.data = polylineData;
  }

  get bytes(): Uint8Array {
    return polylineDataToBytes(this.data);
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

export function bytesToPolylineData(bytes: Uint8Array): PolylineData {
  return fromBinary(PolylineDataSchema, bytes);
}

export function polylineDataToBytes(data: PolylineData): Uint8Array {
  return toBinary(PolylineDataSchema, data);
}
