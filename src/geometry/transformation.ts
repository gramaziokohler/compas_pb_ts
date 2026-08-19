import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { TransformationData } from "../proto/compas_pb/generated/geometry_pb";
import { TransformationDataSchema } from "../proto/compas_pb/generated/geometry_pb";

export class Transformation {
  public readonly data: TransformationData;

  constructor(input: { bytes: Uint8Array } | { data: TransformationData }) {
    let transformationData: TransformationData;
    if ("bytes" in input) {
      transformationData = bytesToTransformationData(input.bytes);
    } else {
      transformationData = input.data;
    }

    this.data = transformationData;
  }

  get bytes(): Uint8Array {
    return transformationDataToBytes(this.data);
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

export function bytesToTransformationData(
  bytes: Uint8Array,
): TransformationData {
  return fromBinary(TransformationDataSchema, bytes);
}

export function transformationDataToBytes(
  data: TransformationData,
): Uint8Array {
  return toBinary(TransformationDataSchema, data);
}
