import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { ArcData } from "../proto/compas_pb/generated/geometry_pb";
import { ArcDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Circle } from "./circle";

export class Arc {
  public readonly data: ArcData;
  private _circle?: Circle;

  constructor(input: { bytes: Uint8Array } | { data: ArcData }) {
    let arcData: ArcData;
    if ("bytes" in input) {
      arcData = bytesToArcData(input.bytes);
    } else {
      arcData = input.data;
    }

    if (!arcData.startAngle || !arcData.endAngle || !arcData.circle) {
      throw new Error(
        "Invalid ArcData: Missing required properties (startAngle, endAngle, or circle).",
      );
    }
    this.data = arcData;
  }

  get bytes(): Uint8Array {
    return arcDataToBytes(this.data);
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
      this._circle = new Circle({ data: this.data.circle! });
    }
    return this._circle;
  }
}

export function bytesToArcData(bytes: Uint8Array): ArcData {
  return fromBinary(ArcDataSchema, bytes);
}

export function arcDataToBytes(data: ArcData): Uint8Array {
  return toBinary(ArcDataSchema, data);
}
