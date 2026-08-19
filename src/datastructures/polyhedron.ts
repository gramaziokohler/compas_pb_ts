import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { PolyhedronData } from "../proto/compas_pb/generated/datastructures_pb";
import { PolyhedronDataSchema } from "../proto/compas_pb/generated/datastructures_pb";
import { type Point, pointsFromFlatCoordinates } from "../geometry/point";
import { PolyhedronFace } from "./face";

/** The fields a Polyhedron is built from. */
export type PolyhedronInit = MessageInitShape<typeof PolyhedronDataSchema>;

export class Polyhedron {
  public readonly data: PolyhedronData;
  private _points?: Point[];
  private _faces?: PolyhedronFace[];

  constructor(init: PolyhedronInit) {
    const polyhedronData = create(PolyhedronDataSchema, init);

    if (!polyhedronData.vertices || !polyhedronData.faces) {
      throw new Error(
        "Invalid PolyhedronData: Missing required properties (vertices or faces).",
      );
    }
    this.data = polyhedronData;
  }

  get bytes(): Uint8Array {
    return polyhedronToBytes(this);
  }

  /** Reads a Polyhedron from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Polyhedron {
    return bytesToPolyhedron(bytes);
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
        const face = new PolyhedronFace(faceData);
        this._faces.push(face);
      }
    }
    return this._faces;
  }
}

export function bytesToPolyhedron(bytes: Uint8Array): Polyhedron {
  return new Polyhedron(fromBinary(PolyhedronDataSchema, bytes));
}

export function polyhedronToBytes(polyhedron: Polyhedron): Uint8Array {
  return toBinary(PolyhedronDataSchema, polyhedron.data);
}
