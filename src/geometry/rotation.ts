import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { RotationData } from "../proto/compas_pb/generated/geometry_pb";
import { RotationDataSchema } from "../proto/compas_pb/generated/geometry_pb";

/** The fields a Rotation is built from. */
export type RotationInit = MessageInitShape<typeof RotationDataSchema>;

export class Rotation {
  public readonly data: RotationData;

  constructor(init: RotationInit) {
    const rotationData = create(RotationDataSchema, init);

    if (rotationData.matrix.length !== 16) {
      throw new Error("Invalid RotationData: matrix must contain 16 values.");
    }
    this.data = rotationData;
  }

  get bytes(): Uint8Array {
    return rotationToBytes(this);
  }

  /** Reads a Rotation from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Rotation {
    return bytesToRotation(bytes);
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

export function bytesToRotation(bytes: Uint8Array): Rotation {
  return new Rotation(fromBinary(RotationDataSchema, bytes));
}

export function rotationToBytes(rotation: Rotation): Uint8Array {
  return toBinary(RotationDataSchema, rotation.data);
}
