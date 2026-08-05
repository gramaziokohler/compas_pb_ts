import { PolygonData } from "../generated/compas_pb/data/geometry";
import { type Point, pointsFromFlatCoordinates } from "./point";

export class Polygon {
  public readonly data: PolygonData;
  private _points?: Point[];

  constructor(input: { bytes: Uint8Array } | { data: PolygonData }) {
    let polygonData: PolygonData;
    if ("bytes" in input) {
      polygonData = bytesToPolygonData(input.bytes);
    } else {
      polygonData = input.data;
    }

    if (!polygonData.points || polygonData.points.length === 0) {
      throw new Error("Invalid PolygonData: Missing required property points.");
    }
    this.data = polygonData;
  }

  get bytes(): Uint8Array {
    return polygonDataToBytes(this.data);
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

export function bytesToPolygonData(bytes: Uint8Array): PolygonData {
  return PolygonData.decode(bytes);
}

export function polygonDataToBytes(data: PolygonData): Uint8Array {
  return PolygonData.encode(data).finish();
}
