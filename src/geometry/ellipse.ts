import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { EllipseData } from "../proto/compas_pb/generated/geometry_pb";
import { EllipseDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Frame } from "./frame";

export class Ellipse {
  public readonly data: EllipseData;
  private _frame?: Frame;

  constructor(input: { bytes: Uint8Array } | { data: EllipseData }) {
    let ellipseData: EllipseData;
    if ("bytes" in input) {
      ellipseData = bytesToEllipseData(input.bytes);
    } else {
      ellipseData = input.data;
    }

    if (!ellipseData.major || !ellipseData.minor || !ellipseData.frame) {
      throw new Error(
        "Invalid EllipseData: Missing required properties (major, minor, or frame).",
      );
    }
    this.data = ellipseData;
  }

  get bytes(): Uint8Array {
    return ellipseDataToBytes(this.data);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get major(): number {
    return this.data.major;
  }

  get minor(): number {
    return this.data.minor;
  }

  get frame(): Frame {
    if (!this._frame) {
      this._frame = new Frame({ data: this.data.frame! });
    }
    return this._frame;
  }
}

export function bytesToEllipseData(bytes: Uint8Array): EllipseData {
  return fromBinary(EllipseDataSchema, bytes);
}

export function ellipseDataToBytes(data: EllipseData): Uint8Array {
  return toBinary(EllipseDataSchema, data);
}
