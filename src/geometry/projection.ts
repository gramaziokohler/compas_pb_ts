import { ProjectionData } from "../generated/compas_pb/data/geometry";

export class Projection {
  public readonly data: ProjectionData;

  constructor(input: { bytes: Uint8Array } | { data: ProjectionData }) {
    let projectionData: ProjectionData;
    if ("bytes" in input) {
      projectionData = bytesToProjectionData(input.bytes);
    } else {
      projectionData = input.data;
    }

    if (!projectionData.matrix) {
      throw new Error(
        "Invalid ProjectionData: Missing required properties (direction).",
      );
    }
    this.data = projectionData;
  }

  get bytes(): Uint8Array {
    return projectionDataToBytes(this.data);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get matrix(): number[] {
    return this.data.matrix!;
  }
}

export function bytesToProjectionData(bytes: Uint8Array): ProjectionData {
  return ProjectionData.decode(bytes);
}

export function projectionDataToBytes(data: ProjectionData): Uint8Array {
  return ProjectionData.encode(data).finish();
}
