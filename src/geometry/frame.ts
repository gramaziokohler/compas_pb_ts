import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { FrameData } from "../proto/compas_pb/generated/geometry_pb";
import { FrameDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Point } from "./point";
import { Vector } from "./vector";

/** The fields a Frame is built from. */
export type FrameInit = MessageInitShape<typeof FrameDataSchema>;

export class Frame {
  public readonly data: FrameData;
  private _point?: Point;
  private _xaxis?: Vector;
  private _yaxis?: Vector;

  constructor(init: FrameInit) {
    const frameData = create(FrameDataSchema, init);

    if (!frameData.point || !frameData.xaxis || !frameData.yaxis) {
      throw new Error(
        "Invalid FrameData: Missing required properties (point, xaxis, or yaxis).",
      );
    }
    this.data = frameData;
  }

  get bytes(): Uint8Array {
    return frameToBytes(this);
  }

  /** Reads a Frame from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Frame {
    return bytesToFrame(bytes);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get point(): Point {
    if (!this._point) {
      this._point = new Point(this.data.point!);
    }
    return this._point;
  }

  get xaxis(): Vector {
    if (!this._xaxis) {
      this._xaxis = new Vector(this.data.xaxis!);
    }
    return this._xaxis;
  }

  get yaxis(): Vector {
    if (!this._yaxis) {
      this._yaxis = new Vector(this.data.yaxis!);
    }
    return this._yaxis;
  }
}

export function bytesToFrame(bytes: Uint8Array): Frame {
  return new Frame(fromBinary(FrameDataSchema, bytes));
}

export function frameToBytes(frame: Frame): Uint8Array {
  return toBinary(FrameDataSchema, frame.data);
}
