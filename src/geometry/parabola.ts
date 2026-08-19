import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { ParabolaData } from "../proto/compas_pb/generated/geometry_pb";
import { ParabolaDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Frame } from "./frame";

/** The fields a Parabola is built from. */
export type ParabolaInit = MessageInitShape<typeof ParabolaDataSchema>;

export class Parabola {
  public readonly data: ParabolaData;
  private _frame?: Frame;

  constructor(init: ParabolaInit) {
    const parabolaData = create(ParabolaDataSchema, init);

    if (!parabolaData.focal || !parabolaData.frame) {
      throw new Error(
        "Invalid ParabolaData: Missing required properties (focal_length or frame).",
      );
    }
    this.data = parabolaData;
  }

  get bytes(): Uint8Array {
    return parabolaToBytes(this);
  }

  /** Reads a Parabola from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Parabola {
    return bytesToParabola(bytes);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get focal(): number {
    return this.data.focal;
  }

  get frame(): Frame {
    if (!this._frame) {
      this._frame = new Frame(this.data.frame!);
    }
    return this._frame;
  }
}

export function bytesToParabola(bytes: Uint8Array): Parabola {
  return new Parabola(fromBinary(ParabolaDataSchema, bytes));
}

export function parabolaToBytes(parabola: Parabola): Uint8Array {
  return toBinary(ParabolaDataSchema, parabola.data);
}
