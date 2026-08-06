import { RotationData } from "../generated/compas_pb/data/geometry";

export class Rotation {
  public readonly data: RotationData;

  constructor(input: { bytes: Uint8Array } | { data: RotationData }) {
    let rotationData: RotationData;
    if ("bytes" in input) {
      rotationData = bytesToRotationData(input.bytes);
    } else {
      rotationData = input.data;
    }

    if (rotationData.matrix.length !== 16) {
      throw new Error("Invalid RotationData: matrix must contain 16 values.");
    }
    this.data = rotationData;
  }

  get bytes(): Uint8Array {
    return rotationDataToBytes(this.data);
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

export function bytesToRotationData(bytes: Uint8Array): RotationData {
  return RotationData.decode(bytes);
}

export function rotationDataToBytes(data: RotationData): Uint8Array {
  return RotationData.encode(data).finish();
}
