import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { ScaleData } from "../proto/compas_pb/generated/geometry_pb";
import { ScaleDataSchema } from "../proto/compas_pb/generated/geometry_pb";

export class Scale {
  public readonly data: ScaleData;

  constructor(input: { bytes: Uint8Array } | { data: ScaleData }) {
    let scaleData: ScaleData;
    if ("bytes" in input) {
      scaleData = bytesToScaleData(input.bytes);
    } else {
      scaleData = input.data;
    }

    if (!scaleData.matrix) {
      throw new Error(
        "Invalid ScaleData: Missing required properties (factor or frame).",
      );
    }
    this.data = scaleData;
  }

  get bytes(): Uint8Array {
    return scaleDataToBytes(this.data);
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

export function bytesToScaleData(bytes: Uint8Array): ScaleData {
  return fromBinary(ScaleDataSchema, bytes);
}

export function scaleDataToBytes(data: ScaleData): Uint8Array {
  return toBinary(ScaleDataSchema, data);
}
