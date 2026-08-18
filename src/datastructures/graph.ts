import { fromBinary, toBinary } from "@bufbuild/protobuf";
import { resolveAnyData } from "../analyzers/data";
import type { GraphData } from "../proto/compas_pb/generated/datastructures_pb";
import { GraphDataSchema } from "../proto/compas_pb/generated/datastructures_pb";

export class Graph {
  public readonly data: GraphData;

  constructor(input: { bytes: Uint8Array } | { data: GraphData }) {
    this.data = "bytes" in input ? bytesToGraphData(input.bytes) : input.data;
  }

  get bytes(): Uint8Array {
    return graphDataToBytes(this.data);
  }

  get guid(): string {
    return this.data.guid || "";
  }

  get name(): string {
    return this.data.name || "";
  }

  get nodeKeys(): any[] {
    return this.data.nodeKeys.map(resolveAnyData);
  }
}

export function bytesToGraphData(bytes: Uint8Array): GraphData {
  return fromBinary(GraphDataSchema, bytes);
}

export function graphDataToBytes(data: GraphData): Uint8Array {
  return toBinary(GraphDataSchema, data);
}
