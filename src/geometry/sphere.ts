import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { SphereData } from "../proto/compas_pb/generated/geometry_pb";
import { SphereDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Frame } from "./frame";

export class Sphere {
  public readonly data: SphereData;
  private _frame?: Frame;

  constructor(input: { bytes: Uint8Array } | { data: SphereData }) {
    let sphereData: SphereData;
    if ("bytes" in input) {
      sphereData = bytesToSphereData(input.bytes);
    } else {
      sphereData = input.data;
    }

    if (!sphereData.radius || !sphereData.frame) {
      throw new Error(
        "Invalid SphereData: Missing required properties (radius or frame).",
      );
    }
    this.data = sphereData;
  }

  get bytes(): Uint8Array {
    return sphereDataToBytes(this.data);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get radius(): number {
    return this.data.radius;
  }

  get frame(): Frame {
    if (!this._frame) {
      this._frame = new Frame({ data: this.data.frame! });
    }
    return this._frame;
  }
}

export function bytesToSphereData(bytes: Uint8Array): SphereData {
  return fromBinary(SphereDataSchema, bytes);
}

export function sphereDataToBytes(data: SphereData): Uint8Array {
  return toBinary(SphereDataSchema, data);
}
