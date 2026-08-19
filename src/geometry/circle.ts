import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { CircleData } from "../proto/compas_pb/generated/geometry_pb";
import { CircleDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Frame } from "./frame";

/** The fields a Circle is built from. */
export type CircleInit = MessageInitShape<typeof CircleDataSchema>;

export class Circle {
  public readonly data: CircleData;
  private _frame?: Frame;

  constructor(init: CircleInit) {
    const circleData = create(CircleDataSchema, init);

    if (!circleData.radius || !circleData.frame) {
      throw new Error(
        "Invalid CircleData: Missing required properties (radius or frame).",
      );
    }
    this.data = circleData;
  }

  get bytes(): Uint8Array {
    return circleToBytes(this);
  }

  /** Reads a Circle from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Circle {
    return bytesToCircle(bytes);
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

  get frame(): Frame {
    if (!this._frame) {
      this._frame = new Frame(this.data.frame!);
    }
    return this._frame;
  }
}

export function bytesToCircle(bytes: Uint8Array): Circle {
  return new Circle(fromBinary(CircleDataSchema, bytes));
}

export function circleToBytes(circle: Circle): Uint8Array {
  return toBinary(CircleDataSchema, circle.data);
}
