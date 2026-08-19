import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { ReflectionData } from "../proto/compas_pb/generated/geometry_pb";
import { ReflectionDataSchema } from "../proto/compas_pb/generated/geometry_pb";

/** The fields a Reflection is built from. */
export type ReflectionInit = MessageInitShape<typeof ReflectionDataSchema>;

export class Reflection {
  public readonly data: ReflectionData;

  constructor(init: ReflectionInit) {
    const reflectionData = create(ReflectionDataSchema, init);

    if (!reflectionData.matrix) {
      throw new Error(
        "Invalid ReflectionData: Missing required properties (frame).",
      );
    }
    this.data = reflectionData;
  }

  get bytes(): Uint8Array {
    return reflectionToBytes(this);
  }

  /** Reads a Reflection from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Reflection {
    return bytesToReflection(bytes);
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

export function bytesToReflection(bytes: Uint8Array): Reflection {
  return new Reflection(fromBinary(ReflectionDataSchema, bytes));
}

export function reflectionToBytes(reflection: Reflection): Uint8Array {
  return toBinary(ReflectionDataSchema, reflection.data);
}
