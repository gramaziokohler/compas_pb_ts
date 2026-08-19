import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { ArcData } from "../proto/compas_pb/generated/geometry_pb";
import { ArcDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Circle } from "./circle";

/** The fields a Arc is built from. */
export type ArcInit = MessageInitShape<typeof ArcDataSchema>;

export class Arc {
  public readonly data: ArcData;
  private _circle?: Circle;

  constructor(init: ArcInit) {
    const arcData = create(ArcDataSchema, init);

    if (!arcData.startAngle || !arcData.endAngle || !arcData.circle) {
      throw new Error(
        "Invalid ArcData: Missing required properties (startAngle, endAngle, or circle).",
      );
    }
    this.data = arcData;
  }

  get bytes(): Uint8Array {
    return arcToBytes(this);
  }

  /** Reads a Arc from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Arc {
    return bytesToArc(bytes);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get startAngle(): number {
    return this.data.startAngle;
  }

  get endAngle(): number {
    return this.data.endAngle;
  }

  get circle(): Circle {
    if (!this._circle) {
      this._circle = new Circle(this.data.circle!);
    }
    return this._circle;
  }
}

export function bytesToArc(bytes: Uint8Array): Arc {
  return new Arc(fromBinary(ArcDataSchema, bytes));
}

export function arcToBytes(arc: Arc): Uint8Array {
  return toBinary(ArcDataSchema, arc.data);
}
