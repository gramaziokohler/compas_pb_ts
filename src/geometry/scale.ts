import { ScaleData } from "../generated/compas_pb/data/geometry";

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
  return ScaleData.decode(bytes);
}

export function scaleDataToBytes(data: ScaleData): Uint8Array {
  return ScaleData.encode(data).finish();
}
