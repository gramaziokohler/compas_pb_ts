import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { PolyhedronData } from "../proto/compas_pb/generated/datastructures_pb";
import { PolyhedronDataSchema } from "../proto/compas_pb/generated/datastructures_pb";
import { type Point, pointsFromFlatCoordinates } from "../geometry/point";
import { PolyhedronFace } from "./face";

export class Polyhedron {
  public readonly data: PolyhedronData;
  private _points?: Point[];
  private _faces?: PolyhedronFace[];

  constructor(input: { bytes: Uint8Array } | { data: PolyhedronData }) {
    let polyhedronData: PolyhedronData;
    if ("bytes" in input) {
      polyhedronData = bytesToPolyhedronData(input.bytes);
    } else {
      polyhedronData = input.data;
    }

    if (!polyhedronData.vertices || !polyhedronData.faces) {
      throw new Error(
        "Invalid PolyhedronData: Missing required properties (vertices or faces).",
      );
    }
    this.data = polyhedronData;
  }

  get bytes(): Uint8Array {
    return polyhedronDataToBytes(this.data);
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
    if (!this._points) {
      this._points = pointsFromFlatCoordinates(this.data.vertices);
    }
    return this._points;
  }

  get faces(): PolyhedronFace[] {
    if (!this._faces) {
      this._faces = [];
      for (const faceData of this.data.faces!) {
        const face = new PolyhedronFace({ data: faceData });
        this._faces.push(face);
      }
    }
    return this._faces;
  }
}

export function bytesToPolyhedronData(bytes: Uint8Array): PolyhedronData {
  const polyhedronData = fromBinary(PolyhedronDataSchema, bytes);
  return polyhedronData;
}

export function polyhedronDataToBytes(polyhedron: PolyhedronData): Uint8Array {
  return toBinary(PolyhedronDataSchema, polyhedron);
}
