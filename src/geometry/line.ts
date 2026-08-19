import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { LineData } from "../proto/compas_pb/generated/geometry_pb";
import { LineDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Point } from "./point";

/** The fields a Line is built from. */
export type LineInit = MessageInitShape<typeof LineDataSchema>;

export class Line {
  public readonly data: LineData;
  private _start?: Point;
  private _end?: Point;

  constructor(init: LineInit) {
    const lineData = create(LineDataSchema, init);

    if (!lineData.start || !lineData.end) {
      throw new Error(
        "Invalid LineData: Missing required properties (start or end).",
      );
    }
    this.data = lineData;
  }

  get bytes(): Uint8Array {
    return lineToBytes(this);
  }

  /** Reads a Line from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Line {
    return bytesToLine(bytes);
  }
  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get start(): Point {
    if (!this._start) {
      this._start = new Point(this.data.start!);
    }
    return this._start;
  }

  get end(): Point {
    if (!this._end) {
      this._end = new Point(this.data.end!);
    }
    return this._end;
  }
}

export function bytesToLine(bytes: Uint8Array): Line {
  return new Line(fromBinary(LineDataSchema, bytes));
}

export function lineToBytes(line: Line): Uint8Array {
  return toBinary(LineDataSchema, line.data);
}
