import { describe, expect, it } from "vitest";

import {
  CompasDataStructures,
  COMPAS_PB_VERSION,
  CompasMessages,
  Graph,
  Mesh,
  Polyline,
  Rotation,
  pbDumpBytes,
  pbLoadBytes,
} from "../src";

describe("compas_pb 1.0 wire format", () => {
  it("materializes flattened geometry coordinates through wrapper APIs", () => {
    const polyline = new Polyline({
      data: {
        guid: "polyline-guid",
        name: "Polyline",
        points: [0, 0, 0, 1.25, 2.5, 3.75],
      },
    });

    const loaded = pbLoadBytes(pbDumpBytes(polyline));

    expect(loaded).toBeInstanceOf(Polyline);
    expect(loaded.points.map(({ x, y, z }) => [x, y, z])).toEqual([
      [0, 0, 0],
      [1.25, 2.5, 3.75],
    ]);
  });

  it("materializes mesh CSR faces through the existing wrapper API", () => {
    const mesh = new Mesh({
      data: CompasDataStructures.MeshData.create({
        guid: "mesh-guid",
        name: "Mesh",
        vertices: [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0],
        faceVertices: [0, 1, 2, 3],
        faceSizes: [4],
      }),
    });

    const loaded = pbLoadBytes(pbDumpBytes(mesh));

    expect(loaded).toBeInstanceOf(Mesh);
    expect(loaded.vertices.map(({ x, y, z }) => [x, y, z])).toEqual([
      [0, 0, 0],
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ]);
    expect(loaded.faces.map(({ indices }) => indices)).toEqual([[0, 1, 2, 3]]);
  });

  it("loads matrix rotations and graphs", () => {
    const matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const rotation = new Rotation({
      data: { guid: "rotation-guid", name: "Rotation", matrix },
    });
    const graph = new Graph({
      data: CompasDataStructures.GraphData.create({
        guid: "graph-guid",
        name: "Graph",
        nodeKeys: [{ intValue: 7 }, { value: "node-b" }],
        edgeU: [0],
        edgeV: [1],
      }),
    });

    const loadedRotation = pbLoadBytes(pbDumpBytes(rotation));
    const loadedGraph = pbLoadBytes(pbDumpBytes(graph));

    expect(loadedRotation).toBeInstanceOf(Rotation);
    expect(loadedRotation.matrix).toEqual(matrix);
    expect(loadedGraph).toBeInstanceOf(Graph);
    expect(loadedGraph.nodeKeys).toEqual([7, "node-b"]);
    expect(loadedGraph.data.edgeU).toEqual([0]);
    expect(loadedGraph.data.edgeV).toEqual([1]);
  });

  it("loads Python bytes values as Uint8Array", () => {
    const bytes = CompasMessages.MessageData.encode({
      version: COMPAS_PB_VERSION,
      data: { value: "base64:AAEC/w==" },
    }).finish();

    expect(pbLoadBytes(bytes)).toEqual(new Uint8Array([0, 1, 2, 255]));
  });
});
