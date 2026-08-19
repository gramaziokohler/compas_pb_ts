import type { MessageInitShape } from "@bufbuild/protobuf";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import { resolveAnyData } from "../analyzers/data";
import type { GraphData } from "../proto/compas_pb/generated/datastructures_pb";
import { GraphDataSchema } from "../proto/compas_pb/generated/datastructures_pb";

/** The fields a Graph is built from. */
export type GraphInit = MessageInitShape<typeof GraphDataSchema>;

export class Graph {
  public readonly data: GraphData;

  constructor(init: GraphInit) {
    this.data = create(GraphDataSchema, init);
  }

  get bytes(): Uint8Array {
    return graphToBytes(this);
  }

  /** Reads a Graph from the bytes of its protobuf message. */
  static fromBytes(bytes: Uint8Array): Graph {
    return bytesToGraph(bytes);
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

export function bytesToGraph(bytes: Uint8Array): Graph {
  return new Graph(fromBinary(GraphDataSchema, bytes));
}

export function graphToBytes(graph: Graph): Uint8Array {
  return toBinary(GraphDataSchema, graph.data);
}
