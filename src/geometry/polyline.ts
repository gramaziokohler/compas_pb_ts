import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { PolylineData } from "../proto/compas_pb/generated/geometry_pb";
import { PolylineDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { type Point, pointsFromFlatCoordinates } from "./point";

/** The fields a Polyline is built from. */
export type PolylineInit = MessageInitShape<typeof PolylineDataSchema>;

export class Polyline {
  public readonly data: PolylineData;
  private _points?: Point[];

  constructor(init: PolylineInit) {
    const polylineData = create(PolylineDataSchema, init);

    if (!polylineData.points || polylineData.points.length === 0) {
      throw new Error(
        "Invalid PolylineData: Missing required property points.",
      );
    }
    this.data = polylineData;
  }

  get bytes(): Uint8Array {
    return polylineToBytes(this);
  }

  /** Reads a Polyline from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Polyline {
    return bytesToPolyline(bytes);
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

export function bytesToPolyline(bytes: Uint8Array): Polyline {
  return new Polyline(fromBinary(PolylineDataSchema, bytes));
}

export function polylineToBytes(polyline: Polyline): Uint8Array {
  return toBinary(PolylineDataSchema, polyline.data);
}
