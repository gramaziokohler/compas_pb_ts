import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { TorusData } from "../proto/compas_pb/generated/geometry_pb";
import { TorusDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Frame } from "./frame";

export class Torus {
  public readonly data: TorusData;
  private _frame?: Frame;

  constructor(input: { bytes: Uint8Array } | { data: TorusData }) {
    let torusData: TorusData;
    if ("bytes" in input) {
      torusData = bytesToTorusData(input.bytes);
    } else {
      torusData = input.data;
    }

    if (!torusData.radiusAxis || !torusData.radiusPipe || !torusData.frame) {
      throw new Error(
        "Invalid TorusData: Missing required properties (major, minor, or frame).",
      );
    }
    this.data = torusData;
  }

  get bytes(): Uint8Array {
    return torusDataToBytes(this.data);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get radiusAxis(): number {
    return this.data.radiusAxis;
  }

  get radiusPipe(): number {
    return this.data.radiusPipe;
  }

  get frame(): Frame {
    if (!this._frame) {
      this._frame = new Frame({ data: this.data.frame! });
    }
    return this._frame;
  }
}

export function bytesToTorusData(bytes: Uint8Array): TorusData {
  return fromBinary(TorusDataSchema, bytes);
}

export function torusDataToBytes(data: TorusData): Uint8Array {
  return toBinary(TorusDataSchema, data);
}
