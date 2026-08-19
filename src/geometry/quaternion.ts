import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { QuaternionData } from "../proto/compas_pb/generated/geometry_pb";
import { QuaternionDataSchema } from "../proto/compas_pb/generated/geometry_pb";

/** The fields a Quaternion is built from. */
export type QuaternionInit = MessageInitShape<typeof QuaternionDataSchema>;

export class Quaternion {
  public readonly data: QuaternionData;

  constructor(init: QuaternionInit) {
    const quaternionData = create(QuaternionDataSchema, init);

    if (
      !quaternionData.w ||
      !quaternionData.x ||
      !quaternionData.y ||
      !quaternionData.z
    ) {
      throw new Error(
        "Invalid QuaternionData: Missing required properties (w, x, y, or z).",
      );
    }
    this.data = quaternionData;
  }

  get bytes(): Uint8Array {
    return quaternionToBytes(this);
  }

  /** Reads a Quaternion from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Quaternion {
    return bytesToQuaternion(bytes);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get w(): number {
    return this.data.w!;
  }

  get x(): number {
    return this.data.x!;
  }

  get y(): number {
    return this.data.y!;
  }

  get z(): number {
    return this.data.z!;
  }
}

export function bytesToQuaternion(bytes: Uint8Array): Quaternion {
  return new Quaternion(fromBinary(QuaternionDataSchema, bytes));
}

export function quaternionToBytes(quaternion: Quaternion): Uint8Array {
  return toBinary(QuaternionDataSchema, quaternion.data);
}
