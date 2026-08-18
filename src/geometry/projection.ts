import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { ProjectionData } from "../proto/compas_pb/generated/geometry_pb";
import { ProjectionDataSchema } from "../proto/compas_pb/generated/geometry_pb";

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
  return fromBinary(ProjectionDataSchema, bytes);
}

export function projectionDataToBytes(data: ProjectionData): Uint8Array {
  return toBinary(ProjectionDataSchema, data);
}
