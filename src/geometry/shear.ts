import { ShearData } from "../generated/compas_pb/data/geometry";

export class Shear {
  public readonly data: ShearData;

  constructor(input: { bytes: Uint8Array } | { data: ShearData }) {
    let shearData: ShearData;
    if ("bytes" in input) {
      shearData = bytesToShearData(input.bytes);
    } else {
      shearData = input.data;
    }

    if (!shearData.matrix) {
      throw new Error(
        "Invalid ShearData: Missing required properties (matrix).",
      );
    }
    this.data = shearData;
  }

  get bytes(): Uint8Array {
    return shearDataToBytes(this.data);
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

export function bytesToShearData(bytes: Uint8Array): ShearData {
  return ShearData.decode(bytes);
}

export function shearDataToBytes(data: ShearData): Uint8Array {
  return ShearData.encode(data).finish();
}
