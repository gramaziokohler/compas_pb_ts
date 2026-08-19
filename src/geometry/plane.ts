import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { PlaneData } from "../proto/compas_pb/generated/geometry_pb";
import { PlaneDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Point } from "./point";
import { Vector } from "./vector";

/** The fields a Plane is built from. */
export type PlaneInit = MessageInitShape<typeof PlaneDataSchema>;

export class Plane {
  public readonly data: PlaneData;
  private _point?: Point;
  private _normal?: Vector;

  constructor(init: PlaneInit) {
    const planeData = create(PlaneDataSchema, init);

    if (!planeData.point || !planeData.normal) {
      throw new Error(
        "Invalid PlaneData: Missing required properties (point or normal).",
      );
    }

    this.data = planeData;
  }

  get bytes(): Uint8Array {
    return planeToBytes(this);
  }

  /** Reads a Plane from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Plane {
    return bytesToPlane(bytes);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get point(): Point {
    if (!this._point) {
      this._point = new Point(this.data.point!);
    }
    return this._point;
  }

  get normal(): Vector {
    if (!this._normal) {
      this._normal = new Vector(this.data.normal!);
    }
    return this._normal;
  }
}

export function bytesToPlane(bytes: Uint8Array): Plane {
  return new Plane(fromBinary(PlaneDataSchema, bytes));
}

export function planeToBytes(plane: Plane): Uint8Array {
  return toBinary(PlaneDataSchema, plane.data);
}
