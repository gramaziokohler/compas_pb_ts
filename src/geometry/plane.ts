import { PlaneData } from "../generated/compas_pb/data/geometry";
import { Point } from "./point";
import { Vector } from "./vector";
import * as THREE from "three";

export class Plane {
  public readonly data: PlaneData;
  private _point?: Point;
  private _normal?: Vector;

  constructor(input: { bytes: Uint8Array } | { data: PlaneData }) {
    let planeData: PlaneData;
    if ("bytes" in input) {
      planeData = bytesToPlaneData(input.bytes);
    } else {
      planeData = input.data;
    }

    if (!planeData.point || !planeData.normal) {
      throw new Error(
        "Invalid PlaneData: Missing required properties (point or normal).",
      );
    }

    this.data = planeData;
  }

  get bytes(): Uint8Array {
    return planeDataToBytes(this.data);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get point(): Point {
    if (!this._point) {
      this._point = new Point({ data: this.data.point! });
    }
    return this._point;
  }

  get normal(): Vector {
    if (!this._normal) {
      this._normal = new Vector({ data: this.data.normal! });
    }
    return this._normal;
  }

  buildGeometry(size: number = 1): THREE.PlaneGeometry {
    throw new Error("Method not implemented.");
  }
}

export function bytesToPlaneData(bytes: Uint8Array): PlaneData {
  return PlaneData.decode(bytes);
}

export function planeDataToBytes(plane: PlaneData): Uint8Array {
  return PlaneData.encode(plane).finish();
}
