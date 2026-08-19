import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { EllipseData } from "../proto/compas_pb/generated/geometry_pb";
import { EllipseDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Frame } from "./frame";

/** The fields a Ellipse is built from. */
export type EllipseInit = MessageInitShape<typeof EllipseDataSchema>;

export class Ellipse {
  public readonly data: EllipseData;
  private _frame?: Frame;

  constructor(init: EllipseInit) {
    const ellipseData = create(EllipseDataSchema, init);

    if (!ellipseData.major || !ellipseData.minor || !ellipseData.frame) {
      throw new Error(
        "Invalid EllipseData: Missing required properties (major, minor, or frame).",
      );
    }
    this.data = ellipseData;
  }

  get bytes(): Uint8Array {
    return ellipseToBytes(this);
  }

  /** Reads a Ellipse from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Ellipse {
    return bytesToEllipse(bytes);
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

export function bytesToEllipse(bytes: Uint8Array): Ellipse {
  return new Ellipse(fromBinary(EllipseDataSchema, bytes));
}

export function ellipseToBytes(ellipse: Ellipse): Uint8Array {
  return toBinary(EllipseDataSchema, ellipse.data);
}
