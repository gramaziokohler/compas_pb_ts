import { MeshData } from "../generated/compas_pb/data/datastructures";
import { Point } from "../geometry/point";
import { MeshFaceList } from "./facelist";

export class Mesh {
  public readonly data: MeshData;
  private _vertices?: Point[];

  constructor(input: { bytes: Uint8Array } | { data: MeshData }) {
    let meshData: MeshData;
    if ("bytes" in input) {
      meshData = bytesToMeshData(input.bytes);
    } else {
      meshData = input.data;
    }

    if (!meshData.vertices || !meshData.faces) {
      throw new Error(
        "Invalid MeshData: Missing required properties (vertices or faces).",
      );
    }
    this.data = meshData;
  }

  get bytes(): Uint8Array {
    return meshDataToBytes(this.data);
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
      this._vertices = [];
      for (const vertexData of this.data.vertices!) {
        const point = new Point({ data: vertexData });
        this._vertices.push(point);
      }
    }
    return this._vertices;
  }

  get faces(): MeshFaceList[] {
    const faces: MeshFaceList[] = [];
    for (const faceData of this.data.faces!) {
      const face = new MeshFaceList({ data: faceData });
      faces.push(face);
    }
    return faces;
  }
}

export function bytesToMeshData(bytes: Uint8Array): MeshData {
  const meshData = MeshData.decode(bytes);
  return meshData;
}

export function meshDataToBytes(mesh: MeshData): Uint8Array {
  return MeshData.encode(mesh).finish();
}
