import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { CircleData } from "../proto/compas_pb/generated/geometry_pb";
import { CircleDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Frame } from "./frame";

export class Circle {
  public readonly data: CircleData;
  private _frame?: Frame;

  constructor(input: { bytes: Uint8Array } | { data: CircleData }) {
    let circleData: CircleData;
    if ("bytes" in input) {
      circleData = bytesToCircleData(input.bytes);
    } else {
      circleData = input.data;
    }

    if (!circleData.radius || !circleData.frame) {
      throw new Error(
        "Invalid CircleData: Missing required properties (radius or frame).",
      );
    }
    this.data = circleData;
  }

  get bytes(): Uint8Array {
    return circleDataToBytes(this.data);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get radius(): number {
    return this.data.radius;
  }

  get frame(): Frame {
    if (!this._frame) {
      this._frame = new Frame({ data: this.data.frame! });
    }
    return this._frame;
  }
}

export function bytesToCircleData(bytes: Uint8Array): CircleData {
  return fromBinary(CircleDataSchema, bytes);
}

export function circleDataToBytes(circle: CircleData): Uint8Array {
  return toBinary(CircleDataSchema, circle);
}
