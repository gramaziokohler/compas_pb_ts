import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { ShearData } from "../proto/compas_pb/generated/geometry_pb";
import { ShearDataSchema } from "../proto/compas_pb/generated/geometry_pb";

/** The fields a Shear is built from. */
export type ShearInit = MessageInitShape<typeof ShearDataSchema>;

export class Shear {
  public readonly data: ShearData;

  constructor(init: ShearInit) {
    const shearData = create(ShearDataSchema, init);

    if (!shearData.matrix) {
      throw new Error(
        "Invalid ShearData: Missing required properties (matrix).",
      );
    }
    this.data = shearData;
  }

  get bytes(): Uint8Array {
    return shearToBytes(this);
  }

  /** Reads a Shear from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Shear {
    return bytesToShear(bytes);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get matrix(): number[] {
    return this.data.matrix;
  }
}

export function bytesToShear(bytes: Uint8Array): Shear {
  return new Shear(fromBinary(ShearDataSchema, bytes));
}

export function shearToBytes(shear: Shear): Uint8Array {
  return toBinary(ShearDataSchema, shear.data);
}
