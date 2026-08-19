import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { BezierData } from "../proto/compas_pb/generated/geometry_pb";
import { BezierDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { type Point, pointsFromFlatCoordinates } from "./point";

/** The fields a Bezier is built from. */
export type BezierInit = MessageInitShape<typeof BezierDataSchema>;

export class Bezier {
  public readonly data: BezierData;
  private _points?: Point[];

  constructor(init: BezierInit) {
    const bezierData = create(BezierDataSchema, init);

    if (!bezierData.points || bezierData.points.length === 0) {
      throw new Error("Invalid BezierData: Missing required property points.");
    }
    this.data = bezierData;
  }

  get bytes(): Uint8Array {
    return bezierToBytes(this);
  }

  /** Reads a Bezier from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Bezier {
    return bytesToBezier(bytes);
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
export function bytesToBezier(bytes: Uint8Array): Bezier {
  return new Bezier(fromBinary(BezierDataSchema, bytes));
}

export function bezierToBytes(bezier: Bezier): Uint8Array {
  return toBinary(BezierDataSchema, bezier.data);
}
