import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { ProjectionData } from "../proto/compas_pb/generated/geometry_pb";
import { ProjectionDataSchema } from "../proto/compas_pb/generated/geometry_pb";

/** The fields a Projection is built from. */
export type ProjectionInit = MessageInitShape<typeof ProjectionDataSchema>;

export class Projection {
  public readonly data: ProjectionData;

  constructor(init: ProjectionInit) {
    const projectionData = create(ProjectionDataSchema, init);

    if (!projectionData.matrix) {
      throw new Error(
        "Invalid ProjectionData: Missing required properties (direction).",
      );
    }
    this.data = projectionData;
  }

  get bytes(): Uint8Array {
    return projectionToBytes(this);
  }

  /** Reads a Projection from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Projection {
    return bytesToProjection(bytes);
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

export function bytesToProjection(bytes: Uint8Array): Projection {
  return new Projection(fromBinary(ProjectionDataSchema, bytes));
}

export function projectionToBytes(projection: Projection): Uint8Array {
  return toBinary(ProjectionDataSchema, projection.data);
}
