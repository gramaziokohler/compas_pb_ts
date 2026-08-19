import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { TorusData } from "../proto/compas_pb/generated/geometry_pb";
import { TorusDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Frame } from "./frame";

/** The fields a Torus is built from. */
export type TorusInit = MessageInitShape<typeof TorusDataSchema>;

export class Torus {
  public readonly data: TorusData;
  private _frame?: Frame;

  constructor(init: TorusInit) {
    const torusData = create(TorusDataSchema, init);

    if (!torusData.radiusAxis || !torusData.radiusPipe || !torusData.frame) {
      throw new Error(
        "Invalid TorusData: Missing required properties (major, minor, or frame).",
      );
    }
    this.data = torusData;
  }

  get bytes(): Uint8Array {
    return torusToBytes(this);
  }

  /** Reads a Torus from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Torus {
    return bytesToTorus(bytes);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get radiusAxis(): number {
    return this.data.radiusAxis;
  }

  get radiusPipe(): number {
    return this.data.radiusPipe;
  }

  get frame(): Frame {
    if (!this._frame) {
      this._frame = new Frame(this.data.frame!);
    }
    return this._frame;
  }
}

export function bytesToTorus(bytes: Uint8Array): Torus {
  return new Torus(fromBinary(TorusDataSchema, bytes));
}

export function torusToBytes(torus: Torus): Uint8Array {
  return toBinary(TorusDataSchema, torus.data);
}
