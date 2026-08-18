import { fromBinary, toBinary } from "@bufbuild/protobuf";
import type { ListData } from "../proto/compas_pb/generated/message_pb";
import { ListDataSchema } from "../proto/compas_pb/generated/message_pb";
import { resolveListData } from "../analyzers/data";

export class List {
  public readonly data: ListData;

  constructor(input: { bytes: Uint8Array } | { data: ListData }) {
    let listData: ListData;
    if ("bytes" in input) {
      listData = bytesToListData(input.bytes);
    } else {
      listData = input.data;
    }

    this.data = listData;
  }

  get bytes(): Uint8Array {
    return listDataToBytes(this.data);
  }

  get asList(): any[] {
    return resolveListData(this.data);
  }
}
export function bytesToListData(bytes: Uint8Array): ListData {
  return fromBinary(ListDataSchema, bytes);
}

export function listDataToBytes(list: ListData): Uint8Array {
  return toBinary(ListDataSchema, list);
}
