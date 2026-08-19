import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { FaceData } from "../proto/compas_pb/generated/datastructures_pb";
import { FaceDataSchema } from "../proto/compas_pb/generated/datastructures_pb";

/** The fields a PolyhedronFace is built from. */
export type PolyhedronFaceInit = MessageInitShape<typeof FaceDataSchema>;

export class PolyhedronFace {
  public readonly data: FaceData;

  constructor(init: PolyhedronFaceInit) {
    const faceData = create(FaceDataSchema, init);

    if (!faceData.vertexIndices) {
      throw new Error(
        "Invalid FaceData: Missing required property 'vertices'.",
      );
    }
    this.data = faceData;
  }

  get bytes(): Uint8Array {
    return faceToBytes(this);
  }

  /** Reads a PolyhedronFace from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): PolyhedronFace {
    return bytesToPolyhedronFace(bytes);
  }

  get vertexIndices(): number[] {
    return this.data.vertexIndices!;
  }
}

export function bytesToPolyhedronFace(bytes: Uint8Array): PolyhedronFace {
  return new PolyhedronFace(fromBinary(FaceDataSchema, bytes));
}

export function faceToBytes(face: PolyhedronFace): Uint8Array {
  return toBinary(FaceDataSchema, face.data);
}
