import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { CylinderData } from "../proto/compas_pb/generated/geometry_pb";
import { CylinderDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Frame } from "./frame";

/** The fields a Cylinder is built from. */
export type CylinderInit = MessageInitShape<typeof CylinderDataSchema>;

export class Cylinder {
  public readonly data: CylinderData;
  private _frame?: Frame;

  constructor(init: CylinderInit) {
    const cylinderData = create(CylinderDataSchema, init);

    if (!cylinderData.radius || !cylinderData.height || !cylinderData.frame) {
      throw new Error(
        "Invalid CylinderData: Missing required properties (radius, height, or frame).",
      );
    }
    this.data = cylinderData;
  }

  get bytes(): Uint8Array {
    return cylinderToBytes(this);
  }

  /** Reads a Cylinder from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Cylinder {
    return bytesToCylinder(bytes);
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
      this._frame = new Frame(this.data.frame!);
    }
    return this._frame;
  }
}

export function bytesToCylinder(bytes: Uint8Array): Cylinder {
  return new Cylinder(fromBinary(CylinderDataSchema, bytes));
}

export function cylinderToBytes(cylinder: Cylinder): Uint8Array {
  return toBinary(CylinderDataSchema, cylinder.data);
}
