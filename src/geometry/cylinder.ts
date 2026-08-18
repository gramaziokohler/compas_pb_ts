import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { CylinderData } from "../proto/compas_pb/generated/geometry_pb";
import { CylinderDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Frame } from "./frame";

export class Cylinder {
  public readonly data: CylinderData;
  private _frame?: Frame;

  constructor(input: { bytes: Uint8Array } | { data: CylinderData }) {
    let cylinderData: CylinderData;
    if ("bytes" in input) {
      cylinderData = bytesToCylinderData(input.bytes);
    } else {
      cylinderData = input.data;
    }

    if (!cylinderData.radius || !cylinderData.height || !cylinderData.frame) {
      throw new Error(
        "Invalid CylinderData: Missing required properties (radius, height, or frame).",
      );
    }
    this.data = cylinderData;
  }

  get bytes(): Uint8Array {
    return cylinderDataToBytes(this.data);
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

  get height(): number {
    return this.data.height;
  }

  get frame(): Frame {
    if (!this._frame) {
      this._frame = new Frame({ data: this.data.frame! });
    }
    return this._frame;
  }
}

export function bytesToCylinderData(bytes: Uint8Array): CylinderData {
  return fromBinary(CylinderDataSchema, bytes);
}

export function cylinderDataToBytes(data: CylinderData): Uint8Array {
  return toBinary(CylinderDataSchema, data);
}
