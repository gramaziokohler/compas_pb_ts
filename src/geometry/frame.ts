import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { FrameData } from "../proto/compas_pb/generated/geometry_pb";
import { FrameDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Point } from "./point";
import { Vector } from "./vector";

export class Frame {
  public readonly data: FrameData;
  private _point?: Point;
  private _xaxis?: Vector;
  private _yaxis?: Vector;

  constructor(input: { bytes: Uint8Array } | { data: FrameData }) {
    let frameData: FrameData;
    if ("bytes" in input) {
      frameData = bytesToFrameData(input.bytes);
    } else {
      frameData = input.data;
    }

    if (!frameData.point || !frameData.xaxis || !frameData.yaxis) {
      throw new Error(
        "Invalid FrameData: Missing required properties (point, xaxis, or yaxis).",
      );
    }
    this.data = frameData;
  }

  get bytes(): Uint8Array {
    return frameDataToBytes(this.data);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get point(): Point {
    if (!this._point) {
      this._point = new Point({ data: this.data.point! });
    }
    return this._point;
  }

  get xaxis(): Vector {
    if (!this._xaxis) {
      this._xaxis = new Vector({ data: this.data.xaxis! });
    }
    return this._xaxis;
  }

  get yaxis(): Vector {
    if (!this._yaxis) {
      this._yaxis = new Vector({ data: this.data.yaxis! });
    }
    return this._yaxis;
  }
}

export function bytesToFrameData(bytes: Uint8Array): FrameData {
  return fromBinary(FrameDataSchema, bytes);
}

export function frameDataToBytes(frame: FrameData): Uint8Array {
  return toBinary(FrameDataSchema, frame);
}
