import { describe, expect, it } from "vitest";
import { Arc, pbDumpBytes, pbLoadBytes } from "../src";

const circle = {
  radius: 2,
  frame: {
    point: { x: 1, y: 2, z: 3 },
    xaxis: { x: 1, y: 0, z: 0 },
    yaxis: { x: 0, y: 1, z: 0 },
  },
};

describe("Arc zero angles", () => {
  it.each([
    [0, Math.PI / 2],
    [Math.PI / 2, 0],
    [0, 0],
  ])(
    "round-trips start %s and end %s through raw bytes and envelopes",
    (startAngle, endAngle) => {
      const arc = new Arc({ circle, startAngle, endAngle });
      for (const decoded of [
        arc,
        Arc.fromBytes(arc.bytes),
        pbLoadBytes(pbDumpBytes(arc)),
      ]) {
        expect(decoded).toBeInstanceOf(Arc);
        expect(decoded.startAngle).toBe(startAngle);
        expect(decoded.endAngle).toBe(endAngle);
        expect(decoded.circle.radius).toBe(2);
      }
    },
  );

  it("accepts protobuf scalar defaults", () => {
    const decoded = Arc.fromBytes(new Arc({ circle }).bytes);
    expect(decoded.startAngle).toBe(0);
    expect(decoded.endAngle).toBe(0);
  });

  it("still rejects a missing circle", () => {
    expect(() => new Arc({ startAngle: 0, endAngle: 1 })).toThrow("circle");
  });
});
