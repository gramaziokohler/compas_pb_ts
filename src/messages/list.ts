import { ListData } from "../generated/compas_pb/data/message";
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
  return ListData.decode(bytes);
}

export function listDataToBytes(list: ListData): Uint8Array {
  return ListData.encode(list).finish();
}
