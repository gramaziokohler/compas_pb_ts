import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { PolygonData } from "../proto/compas_pb/generated/geometry_pb";
import { PolygonDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { type Point, pointsFromFlatCoordinates } from "./point";

/** The fields a Polygon is built from. */
export type PolygonInit = MessageInitShape<typeof PolygonDataSchema>;

export class Polygon {
  public readonly data: PolygonData;
  private _points?: Point[];

  constructor(init: PolygonInit) {
    const polygonData = create(PolygonDataSchema, init);

    if (!polygonData.points || polygonData.points.length === 0) {
      throw new Error("Invalid PolygonData: Missing required property points.");
    }
    this.data = polygonData;
  }

  get bytes(): Uint8Array {
    return polygonToBytes(this);
  }

  /** Reads a Polygon from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Polygon {
    return bytesToPolygon(bytes);
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

export function bytesToPolygon(bytes: Uint8Array): Polygon {
  return new Polygon(fromBinary(PolygonDataSchema, bytes));
}

export function polygonToBytes(polygon: Polygon): Uint8Array {
  return toBinary(PolygonDataSchema, polygon.data);
}
