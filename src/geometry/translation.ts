import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { TranslationData } from "../proto/compas_pb/generated/geometry_pb";
import { TranslationDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Vector } from "./vector";

export class Translation {
  public readonly data: TranslationData;
  private _translationVector?: Vector;

  constructor(input: { bytes: Uint8Array } | { data: TranslationData }) {
    let translationData: TranslationData;
    if ("bytes" in input) {
      translationData = bytesToTranslationData(input.bytes);
    } else {
      translationData = input.data;
    }

    if (!translationData.translationVector) {
      throw new Error(
        "Invalid TranslationData: Missing required properties (vector or frame).",
      );
    }
    this.data = translationData;
  }

  get bytes(): Uint8Array {
    return translationDataToBytes(this.data);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get translationVector(): Vector {
    if (!this._translationVector) {
      this._translationVector = new Vector({
        data: this.data.translationVector!,
      });
    }
    return this._translationVector;
  }
}

export function bytesToTranslationData(bytes: Uint8Array): TranslationData {
  return fromBinary(TranslationDataSchema, bytes);
}

export function translationDataToBytes(data: TranslationData): Uint8Array {
  return toBinary(TranslationDataSchema, data);
}
