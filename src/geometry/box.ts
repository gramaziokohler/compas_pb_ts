import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { BoxData } from "../proto/compas_pb/generated/geometry_pb";
import { BoxDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Frame } from "./frame";

/** The fields a Box is built from. */
export type BoxInit = MessageInitShape<typeof BoxDataSchema>;

export class Box {
  public readonly data: BoxData;
  private _frame?: Frame;

  constructor(init: BoxInit) {
    const boxData = create(BoxDataSchema, init);

    if (!boxData.xsize || !boxData.ysize || !boxData.zsize || !boxData.frame) {
      throw new Error(
        "Invalid BoxData: Missing required properties (xsize, ysize, zsize, or frame).",
      );
    }
    this.data = boxData;
  }

  get bytes(): Uint8Array {
    return boxToBytes(this);
  }

  /** Reads a Box from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Box {
    return bytesToBox(bytes);
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
      this._frame = new Frame(this.data.frame!);
    }
    return this._frame;
  }
}

export function bytesToBox(bytes: Uint8Array): Box {
  return new Box(fromBinary(BoxDataSchema, bytes));
}

export function boxToBytes(box: Box): Uint8Array {
  return toBinary(BoxDataSchema, box.data);
}
