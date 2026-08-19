import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { MeshData } from "../proto/compas_pb/generated/datastructures_pb";
import { MeshDataSchema } from "../proto/compas_pb/generated/datastructures_pb";
import { type Point, pointsFromFlatCoordinates } from "../geometry/point";
import { MeshFaceList } from "./facelist";

/** The fields a Mesh is built from. */
export type MeshInit = MessageInitShape<typeof MeshDataSchema>;

export class Mesh {
  public readonly data: MeshData;
  private _vertices?: Point[];

  constructor(init: MeshInit) {
    const meshData = create(MeshDataSchema, init);

    const faceVertexCount = meshData.faceSizes.reduce(
      (total, size) => total + size,
      0,
    );
    if (
      meshData.vertices.length % 3 !== 0 ||
      faceVertexCount !== meshData.faceVertices.length
    ) {
      throw new Error("Invalid MeshData: malformed vertices or face arrays.");
    }
    this.data = meshData;
  }

  get bytes(): Uint8Array {
    return meshToBytes(this);
  }

  /** Reads a Mesh from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Mesh {
    return bytesToMesh(bytes);
  }

  get guid(): string {
    if (!this.data.guid) {
      return "";
    }
    return this.data.guid;
  }

  get name(): string {
    if (!this.data.name) {
      return "";
    }
    return this.data.name;
  }

  get vertices(): Point[] {
    if (!this._vertices) {
      this._vertices = pointsFromFlatCoordinates(this.data.vertices);
    }
    return this._vertices;
  }

  get faces(): MeshFaceList[] {
    const faces: MeshFaceList[] = [];
    let offset = 0;
    for (const size of this.data.faceSizes) {
      const indices = this.data.faceVertices.slice(offset, offset + size);
      faces.push(new MeshFaceList({ data: { indices } }));
      offset += size;
    }
    return faces;
  }
}

export function bytesToMesh(bytes: Uint8Array): Mesh {
  return new Mesh(fromBinary(MeshDataSchema, bytes));
}

export function meshToBytes(mesh: Mesh): Uint8Array {
  return toBinary(MeshDataSchema, mesh.data);
}
