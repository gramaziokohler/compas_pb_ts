import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { ReflectionData } from "../proto/compas_pb/generated/geometry_pb";
import { ReflectionDataSchema } from "../proto/compas_pb/generated/geometry_pb";

export class Reflection {
  public readonly data: ReflectionData;

  constructor(input: { bytes: Uint8Array } | { data: ReflectionData }) {
    let reflectionData: ReflectionData;
    if ("bytes" in input) {
      reflectionData = bytesToReflectionData(input.bytes);
    } else {
      reflectionData = input.data;
    }

    if (!reflectionData.matrix) {
      throw new Error(
        "Invalid ReflectionData: Missing required properties (frame).",
      );
    }
    this.data = reflectionData;
  }

  get bytes(): Uint8Array {
    return reflectionDataToBytes(this.data);
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

export function bytesToReflectionData(bytes: Uint8Array): ReflectionData {
  return fromBinary(ReflectionDataSchema, bytes);
}

export function reflectionDataToBytes(data: ReflectionData): Uint8Array {
  return toBinary(ReflectionDataSchema, data);
}
