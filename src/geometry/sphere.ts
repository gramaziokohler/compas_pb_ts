import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { SphereData } from "../proto/compas_pb/generated/geometry_pb";
import { SphereDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Frame } from "./frame";

/** The fields a Sphere is built from. */
export type SphereInit = MessageInitShape<typeof SphereDataSchema>;

export class Sphere {
  public readonly data: SphereData;
  private _frame?: Frame;

  constructor(init: SphereInit) {
    const sphereData = create(SphereDataSchema, init);

    if (!sphereData.radius || !sphereData.frame) {
      throw new Error(
        "Invalid SphereData: Missing required properties (radius or frame).",
      );
    }
    this.data = sphereData;
  }

  get bytes(): Uint8Array {
    return sphereToBytes(this);
  }

  /** Reads a Sphere from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Sphere {
    return bytesToSphere(bytes);
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
      this._frame = new Frame(this.data.frame!);
    }
    return this._frame;
  }
}

export function bytesToSphere(bytes: Uint8Array): Sphere {
  return new Sphere(fromBinary(SphereDataSchema, bytes));
}

export function sphereToBytes(sphere: Sphere): Uint8Array {
  return toBinary(SphereDataSchema, sphere.data);
}
