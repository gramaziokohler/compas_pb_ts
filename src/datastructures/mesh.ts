import { MeshData } from "../generated/compas_pb/data/datastructures";
import { type Point, pointsFromFlatCoordinates } from "../geometry/point";
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

export function bytesToMeshData(bytes: Uint8Array): MeshData {
  const meshData = MeshData.decode(bytes);
  return meshData;
}

export function meshDataToBytes(mesh: MeshData): Uint8Array {
  return MeshData.encode(mesh).finish();
}
