import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { BoxData } from "../proto/compas_pb/generated/geometry_pb";
import { BoxDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Frame } from "./frame";

export class Box {
  public readonly data: BoxData;
  private _frame?: Frame;

  constructor(input: { bytes: Uint8Array } | { data: BoxData }) {
    let boxData: BoxData;
    if ("bytes" in input) {
      boxData = bytesToBoxData(input.bytes);
    } else {
      boxData = input.data;
    }

    if (!boxData.xsize || !boxData.ysize || !boxData.zsize || !boxData.frame) {
      throw new Error(
        "Invalid BoxData: Missing required properties (xsize, ysize, zsize, or frame).",
      );
    }
    this.data = boxData;
  }

  get bytes(): Uint8Array {
    return boxDataToBytes(this.data);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get xsize(): number {
    return this.data.xsize;
  }

  get ysize(): number {
    return this.data.ysize;
  }

  get zsize(): number {
    return this.data.zsize;
  }

  get frame(): Frame {
    if (!this._frame) {
      this._frame = new Frame({ data: this.data.frame! });
    }
    return this._frame;
  }
}

export function bytesToBoxData(bytes: Uint8Array): BoxData {
  return fromBinary(BoxDataSchema, bytes);
}

export function boxDataToBytes(box: BoxData): Uint8Array {
  return toBinary(BoxDataSchema, box);
}
