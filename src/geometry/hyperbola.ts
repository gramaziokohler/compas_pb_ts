import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { HyperbolaData } from "../proto/compas_pb/generated/geometry_pb";
import { HyperbolaDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Frame } from "./frame";

/** The fields a Hyperbola is built from. */
export type HyperbolaInit = MessageInitShape<typeof HyperbolaDataSchema>;

export class Hyperbola {
  public readonly data: HyperbolaData;
  private _frame?: Frame;

  constructor(init: HyperbolaInit) {
    const hyperbolaData = create(HyperbolaDataSchema, init);

    if (!hyperbolaData.major || !hyperbolaData.minor || !hyperbolaData.frame) {
      throw new Error(
        "Invalid HyperbolaData: Missing required properties (a, b, or frame).",
      );
    }
    this.data = hyperbolaData;
  }

  get bytes(): Uint8Array {
    return hyperbolaToBytes(this);
  }

  /** Reads a Hyperbola from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Hyperbola {
    return bytesToHyperbola(bytes);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get major(): number {
    return this.data.major;
  }

  get minor(): number {
    return this.data.minor;
  }

  get frame(): Frame {
    if (!this._frame) {
      this._frame = new Frame(this.data.frame!);
    }
    return this._frame;
  }
}

export function bytesToHyperbola(bytes: Uint8Array): Hyperbola {
  return new Hyperbola(fromBinary(HyperbolaDataSchema, bytes));
}

export function hyperbolaToBytes(hyperbola: Hyperbola): Uint8Array {
  return toBinary(HyperbolaDataSchema, hyperbola.data);
}
