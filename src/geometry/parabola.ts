import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { ParabolaData } from "../proto/compas_pb/generated/geometry_pb";
import { ParabolaDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Frame } from "./frame";

export class Parabola {
  public readonly data: ParabolaData;
  private _frame?: Frame;

  constructor(input: { bytes: Uint8Array } | { data: ParabolaData }) {
    let parabolaData: ParabolaData;
    if ("bytes" in input) {
      parabolaData = bytesToParabolaData(input.bytes);
    } else {
      parabolaData = input.data;
    }

    if (!parabolaData.focal || !parabolaData.frame) {
      throw new Error(
        "Invalid ParabolaData: Missing required properties (focal_length or frame).",
      );
    }
    this.data = parabolaData;
  }

  get bytes(): Uint8Array {
    return parabolaDataToBytes(this.data);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get focal(): number {
    return this.data.focal;
  }

  get frame(): Frame {
    if (!this._frame) {
      this._frame = new Frame({ data: this.data.frame! });
    }
    return this._frame;
  }
}

export function bytesToParabolaData(bytes: Uint8Array): ParabolaData {
  return fromBinary(ParabolaDataSchema, bytes);
}

export function parabolaDataToBytes(data: ParabolaData): Uint8Array {
  return toBinary(ParabolaDataSchema, data);
}
