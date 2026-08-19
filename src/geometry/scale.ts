import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { ScaleData } from "../proto/compas_pb/generated/geometry_pb";
import { ScaleDataSchema } from "../proto/compas_pb/generated/geometry_pb";

/** The fields a Scale is built from. */
export type ScaleInit = MessageInitShape<typeof ScaleDataSchema>;

export class Scale {
  public readonly data: ScaleData;

  constructor(init: ScaleInit) {
    const scaleData = create(ScaleDataSchema, init);

    if (!scaleData.matrix) {
      throw new Error(
        "Invalid ScaleData: Missing required properties (factor or frame).",
      );
    }
    this.data = scaleData;
  }

  get bytes(): Uint8Array {
    return scaleToBytes(this);
  }

  /** Reads a Scale from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Scale {
    return bytesToScale(bytes);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get matrix(): number[] {
    return this.data.matrix;
  }
}

export function bytesToScale(bytes: Uint8Array): Scale {
  return new Scale(fromBinary(ScaleDataSchema, bytes));
}

export function scaleToBytes(scale: Scale): Uint8Array {
  return toBinary(ScaleDataSchema, scale.data);
}
