import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { DictData } from "../proto/compas_pb/generated/message_pb";
import { DictDataSchema } from "../proto/compas_pb/generated/message_pb";
import { resolveDictData } from "../analyzers/data";

export class Dictionary {
  public readonly data: DictData;

  constructor(input: { bytes: Uint8Array } | { data: DictData }) {
    let dictData: DictData;
    if ("bytes" in input) {
      dictData = bytesToDictData(input.bytes);
    } else {
      dictData = input.data;
    }

    this.data = dictData;
  }

  get bytes(): Uint8Array {
    return dictDataToBytes(this.data);
  }

  get asDict(): { [key: string]: any } {
    return resolveDictData(this.data);
  }
}
export function bytesToDictData(bytes: Uint8Array): DictData {
  return fromBinary(DictDataSchema, bytes);
}

export function dictDataToBytes(dict: DictData): Uint8Array {
  return toBinary(DictDataSchema, dict);
}
