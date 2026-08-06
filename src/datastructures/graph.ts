import { resolveAnyData } from "../analyzers/data";
import { GraphData } from "../generated/compas_pb/data/datastructures";

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
  return GraphData.decode(bytes);
}

export function graphDataToBytes(data: GraphData): Uint8Array {
  return GraphData.encode(data).finish();
}
