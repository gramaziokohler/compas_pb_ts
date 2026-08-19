import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { ConeData } from "../proto/compas_pb/generated/geometry_pb";
import { ConeDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Frame } from "./frame";
/** The fields a Cone is built from. */
export type ConeInit = MessageInitShape<typeof ConeDataSchema>;

export class Cone {
  public readonly data: ConeData;
  private _frame?: Frame;

  constructor(init: ConeInit) {
    const coneData = create(ConeDataSchema, init);

    if (!coneData.radius || !coneData.height || !coneData.frame) {
      throw new Error(
        "Invalid ConeData: Missing required properties (radius, height, or frame).",
      );
    }
    this.data = coneData;
  }

  get bytes(): Uint8Array {
    return coneToBytes(this);
  }

  /** Reads a Cone from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Cone {
    return bytesToCone(bytes);
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

export function bytesToCone(bytes: Uint8Array): Cone {
  return new Cone(fromBinary(ConeDataSchema, bytes));
}

export function coneToBytes(cone: Cone): Uint8Array {
  return toBinary(ConeDataSchema, cone.data);
}
