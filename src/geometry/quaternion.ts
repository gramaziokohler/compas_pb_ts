import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { QuaternionData } from "../proto/compas_pb/generated/geometry_pb";
import { QuaternionDataSchema } from "../proto/compas_pb/generated/geometry_pb";

export class Quaternion {
  public readonly data: QuaternionData;

  constructor(input: { bytes: Uint8Array } | { data: QuaternionData }) {
    let quaternionData: QuaternionData;
    if ("bytes" in input) {
      quaternionData = bytesToQuaternionData(input.bytes);
    } else {
      quaternionData = input.data;
    }

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
    return quaternionDataToBytes(this.data);
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

export function bytesToQuaternionData(bytes: Uint8Array): QuaternionData {
  return fromBinary(QuaternionDataSchema, bytes);
}

export function quaternionDataToBytes(data: QuaternionData): Uint8Array {
  return toBinary(QuaternionDataSchema, data);
}
