import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { TranslationData } from "../proto/compas_pb/generated/geometry_pb";
import { TranslationDataSchema } from "../proto/compas_pb/generated/geometry_pb";
import { Vector } from "./vector";

/** The fields a Translation is built from. */
export type TranslationInit = MessageInitShape<typeof TranslationDataSchema>;

export class Translation {
  public readonly data: TranslationData;
  private _translationVector?: Vector;

  constructor(init: TranslationInit) {
    const translationData = create(TranslationDataSchema, init);

    if (!translationData.translationVector) {
      throw new Error(
        "Invalid TranslationData: Missing required properties (vector or frame).",
      );
    }
    this.data = translationData;
  }

  get bytes(): Uint8Array {
    return translationToBytes(this);
  }

  /** Reads a Translation from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Translation {
    return bytesToTranslation(bytes);
  }

  get guid(): string {
    return this.data.guid;
  }

  get name(): string {
    return this.data.name;
  }

  get translationVector(): Vector {
    if (!this._translationVector) {
      this._translationVector = new Vector(this.data.translationVector!);
    }
    return this._translationVector;
  }
}

export function bytesToTranslation(bytes: Uint8Array): Translation {
  return new Translation(fromBinary(TranslationDataSchema, bytes));
}

export function translationToBytes(translation: Translation): Uint8Array {
  return toBinary(TranslationDataSchema, translation.data);
}
