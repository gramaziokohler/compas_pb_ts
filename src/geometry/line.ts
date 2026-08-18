import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { LineData } from "../proto/compas_pb/generated/geometry_pb";
import { LineDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Point } from "./point";

export class Line {
  public readonly data: LineData;
  private _start?: Point;
  private _end?: Point;

  constructor(input: { bytes: Uint8Array } | { data: LineData }) {
    let lineData: LineData;
    if ("bytes" in input) {
      lineData = bytesToLineData(input.bytes);
    } else {
      lineData = input.data;
    }

    if (!lineData.start || !lineData.end) {
      throw new Error(
        "Invalid LineData: Missing required properties (start or end).",
      );
    }
    this.data = lineData;
  }

  get bytes(): Uint8Array {
    return lineDataToBytes(this.data);
  }
  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get start(): Point {
    if (!this._start) {
      this._start = new Point({ data: this.data.start! });
    }
    return this._start;
  }

  get end(): Point {
    if (!this._end) {
      this._end = new Point({ data: this.data.end! });
    }
    return this._end;
  }
}

export function bytesToLineData(bytes: Uint8Array): LineData {
  return fromBinary(LineDataSchema, bytes);
}

export function lineDataToBytes(line: LineData): Uint8Array {
  return toBinary(LineDataSchema, line);
}
