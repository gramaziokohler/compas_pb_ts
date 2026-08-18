import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { HyperbolaData } from "../proto/compas_pb/generated/geometry_pb";
import { HyperbolaDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Frame } from "./frame";

export class Hyperbola {
  public readonly data: HyperbolaData;
  private _frame?: Frame;

  constructor(input: { bytes: Uint8Array } | { data: HyperbolaData }) {
    let hyperbolaData: HyperbolaData;
    if ("bytes" in input) {
      hyperbolaData = bytesToHyperbolaData(input.bytes);
    } else {
      hyperbolaData = input.data;
    }

    if (!hyperbolaData.major || !hyperbolaData.minor || !hyperbolaData.frame) {
      throw new Error(
        "Invalid HyperbolaData: Missing required properties (a, b, or frame).",
      );
    }
    this.data = hyperbolaData;
  }

  get bytes(): Uint8Array {
    return hyperbolaDataToBytes(this.data);
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

export function bytesToHyperbolaData(bytes: Uint8Array): HyperbolaData {
  return fromBinary(HyperbolaDataSchema, bytes);
}

export function hyperbolaDataToBytes(data: HyperbolaData): Uint8Array {
  return toBinary(HyperbolaDataSchema, data);
}
