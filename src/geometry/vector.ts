import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { VectorData } from "../proto/compas_pb/generated/geometry_pb";
import { VectorDataSchema } from "../proto/compas_pb/generated/geometry_pb";
/** The fields a Vector is built from. */
export type VectorInit = MessageInitShape<typeof VectorDataSchema>;

export class Vector {
  public readonly data: VectorData;

  constructor(init: VectorInit) {
    const vectorData = create(VectorDataSchema, init);

    if (
      vectorData.x === undefined ||
      vectorData.y === undefined ||
      vectorData.z === undefined
    ) {
      throw new Error(
        "Invalid VectorData: Missing required properties (x, y, or z).",
      );
    }
    this.data = vectorData;
  }

  get bytes(): Uint8Array {
    return vectorToBytes(this);
  }

  /** Reads a Vector from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Vector {
    return bytesToVector(bytes);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
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

export function bytesToVector(bytes: Uint8Array): Vector {
  return new Vector(fromBinary(VectorDataSchema, bytes));
}

export function vectorToBytes(vector: Vector): Uint8Array {
  return toBinary(VectorDataSchema, vector.data);
}
