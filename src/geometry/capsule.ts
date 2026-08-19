import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { CapsuleData } from "../proto/compas_pb/generated/geometry_pb";
import { CapsuleDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Frame } from "./frame";
/** The fields a Capsule is built from. */
export type CapsuleInit = MessageInitShape<typeof CapsuleDataSchema>;

export class Capsule {
  public readonly data: CapsuleData;
  private _frame?: Frame;

  constructor(init: CapsuleInit) {
    const capsuleData = create(CapsuleDataSchema, init);

    if (!capsuleData.radius || !capsuleData.height || !capsuleData.frame) {
      throw new Error(
        "Invalid CapsuleData: Missing required properties (radius, height, or frame).",
      );
    }
    this.data = capsuleData;
  }

  get bytes(): Uint8Array {
    return capsuleToBytes(this);
  }

  /** Reads a Capsule from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Capsule {
    return bytesToCapsule(bytes);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get radius(): number {
    return this.data.radius;
  }

  get height(): number {
    return this.data.height;
  }

  get frame(): Frame {
    if (!this._frame) {
      this._frame = new Frame(this.data.frame!);
    }
    return this._frame;
  }
}

export function bytesToCapsule(bytes: Uint8Array): Capsule {
  return new Capsule(fromBinary(CapsuleDataSchema, bytes));
}

export function capsuleToBytes(capsule: Capsule): Uint8Array {
  return toBinary(CapsuleDataSchema, capsule.data);
}
