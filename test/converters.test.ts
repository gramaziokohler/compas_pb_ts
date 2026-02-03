import { describe, it, expect } from "vitest";
import { pointDataToBytes, bytesToPointData } from "../src/converters";
import { vectorDataToBytes, bytesToVectorData } from "../src/converters";
import { frameDataToBytes, bytesToFrameData } from "../src/converters";
import { planeDataToBytes, bytesToPlaneData } from "../src/converters";
import { lineDataToBytes, bytesToLineData } from "../src/converters";
import { circleDataToBytes, bytesToCircleData } from "../src/converters";
import {
  PointData,
  VectorData,
  FrameData,
  PlaneData,
  LineData,
  CircleData,
} from "../src/generated/compas_pb/data/geometry";

// Sample Data

const originPoint: PointData = {
  guid: "point-guid-1234",
  name: "Origin",
  x: 0,
  y: 0,
  z: 0,
};

const otherPoint: PointData = {
  guid: "point-guid-5678",
  name: "OtherPoint",
  x: 1,
  y: 1,
  z: 1,
};

const xAxisVector: VectorData = {
  guid: "vector-guid-5678",
  name: "X-Axis",
  x: 1,
  y: 0,
  z: 0,
};

const yAxisVector: VectorData = {
  guid: "vector-guid-9101",
  name: "Y-Axis",
  x: 0,
  y: 1,
  z: 0,
};

const originFrame: FrameData = {
  guid: "frame-guid-1234",
  name: "OriginFrame",
  point: originPoint,
  xaxis: xAxisVector,
  yaxis: yAxisVector,
};

// Tests

describe("CONVERTERS", () => {
  it("PointData round trip", () => {
    // 1. Create the original data object
    const originalPoint: PointData = {
      guid: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      name: "MyPoint",
      x: 1.23,
      y: 4.56,
      z: 7.89,
    };

    // 2. Encode the object to a bytestream
    const bytes = pointDataToBytes(originalPoint);

    // 3. Decode the bytestream back to an object
    const decodedPoint = bytesToPointData(bytes);

    // 4. Assert that the properties match
    // Non-float properties can be checked for exact equality
    expect(decodedPoint.guid).toBe(originalPoint.guid);
    expect(decodedPoint.name).toBe(originalPoint.name);

    // Float properties should be checked for closeness to handle precision differences
    expect(decodedPoint.x).toBeCloseTo(originalPoint.x);
    expect(decodedPoint.y).toBeCloseTo(originalPoint.y);
    expect(decodedPoint.z).toBeCloseTo(originalPoint.z);
  });

  it("VectorData round trip", () => {
    const originalVector: VectorData = {
      guid: "f1e2d3c4-b5a6-7890-1234-567890abcdef",
      name: "MyVector",
      x: 9.87,
      y: 6.54,
      z: 3.21,
    };

    const bytes = vectorDataToBytes(originalVector);
    const decodedVector = bytesToVectorData(bytes);

    expect(decodedVector.guid).toBe(originalVector.guid);
    expect(decodedVector.name).toBe(originalVector.name);

    expect(decodedVector.x).toBeCloseTo(originalVector.x);
    expect(decodedVector.y).toBeCloseTo(originalVector.y);
    expect(decodedVector.z).toBeCloseTo(originalVector.z);
  });

  it("FrameData round trip", () => {
    const originalFrame: FrameData = {
      guid: "123e4567-e89b-12d3-a456-426614174000",
      name: "MyFrame",
      point: originPoint,
      xaxis: xAxisVector,
      yaxis: yAxisVector,
    };

    const bytes = frameDataToBytes(originalFrame);
    const decodedFrame = bytesToFrameData(bytes);

    expect(decodedFrame.guid).toBe(originalFrame.guid);
    expect(decodedFrame.name).toBe(originalFrame.name);

    expect(decodedFrame.point?.guid).toBe(originalFrame.point?.guid);
    expect(decodedFrame.point?.name).toBe(originalFrame.point?.name);
    expect(decodedFrame.point?.x).toBeCloseTo(originalFrame.point?.x || 0);
    expect(decodedFrame.point?.y).toBeCloseTo(originalFrame.point?.y || 0);
    expect(decodedFrame.point?.z).toBeCloseTo(originalFrame.point?.z || 0);

    expect(decodedFrame.xaxis?.guid).toBe(originalFrame.xaxis?.guid);
    expect(decodedFrame.xaxis?.name).toBe(originalFrame.xaxis?.name);
    expect(decodedFrame.xaxis?.x).toBeCloseTo(originalFrame.xaxis?.x || 0);
    expect(decodedFrame.xaxis?.y).toBeCloseTo(originalFrame.xaxis?.y || 0);
    expect(decodedFrame.xaxis?.z).toBeCloseTo(originalFrame.xaxis?.z || 0);

    expect(decodedFrame.yaxis?.guid).toBe(originalFrame.yaxis?.guid);
    expect(decodedFrame.yaxis?.name).toBe(originalFrame.yaxis?.name);
    expect(decodedFrame.yaxis?.x).toBeCloseTo(originalFrame.yaxis?.x || 0);
    expect(decodedFrame.yaxis?.y).toBeCloseTo(originalFrame.yaxis?.y || 0);
    expect(decodedFrame.yaxis?.z).toBeCloseTo(originalFrame.yaxis?.z || 0);
  });

  it("PlaneData round trip", () => {
    const originalPlane: PlaneData = {
      guid: "plane-guid-1234",
      name: "MyPlane",
      point: originPoint,
      normal: xAxisVector,
    };

    const bytes = planeDataToBytes(originalPlane);
    const decodedPlane = bytesToPlaneData(bytes);

    expect(decodedPlane.guid).toBe(originalPlane.guid);
    expect(decodedPlane.name).toBe(originalPlane.name);

    expect(decodedPlane.point?.guid).toBe(originalPlane.point?.guid);
    expect(decodedPlane.point?.name).toBe(originalPlane.point?.name);
    expect(decodedPlane.point?.x).toBeCloseTo(originalPlane.point?.x || 0);
    expect(decodedPlane.point?.y).toBeCloseTo(originalPlane.point?.y || 0);
    expect(decodedPlane.point?.z).toBeCloseTo(originalPlane.point?.z || 0);

    expect(decodedPlane.normal?.guid).toBe(originalPlane.normal?.guid);
    expect(decodedPlane.normal?.name).toBe(originalPlane.normal?.name);
    expect(decodedPlane.normal?.x).toBeCloseTo(originalPlane.normal?.x || 0);
    expect(decodedPlane.normal?.y).toBeCloseTo(originalPlane.normal?.y || 0);
    expect(decodedPlane.normal?.z).toBeCloseTo(originalPlane.normal?.z || 0);
  });

  it("LineData round trip", () => {
    const originalLine = {
      guid: "line-guid-1234",
      name: "MyLine",
      start: originPoint,
      end: otherPoint,
    };

    const bytes = lineDataToBytes(originalLine);
    const decodedLine = bytesToLineData(bytes);

    expect(decodedLine.guid).toBe(originalLine.guid);
    expect(decodedLine.name).toBe(originalLine.name);

    expect(decodedLine.start?.guid).toBe(originalLine.start?.guid);
    expect(decodedLine.start?.name).toBe(originalLine.start?.name);
    expect(decodedLine.start?.x).toBeCloseTo(originalLine.start?.x || 0);
    expect(decodedLine.start?.y).toBeCloseTo(originalLine.start?.y || 0);
    expect(decodedLine.start?.z).toBeCloseTo(originalLine.start?.z || 0);

    expect(decodedLine.end?.guid).toBe(originalLine.end?.guid);
    expect(decodedLine.end?.name).toBe(originalLine.end?.name);
    expect(decodedLine.end?.x).toBeCloseTo(originalLine.end?.x || 0);
    expect(decodedLine.end?.y).toBeCloseTo(originalLine.end?.y || 0);
    expect(decodedLine.end?.z).toBeCloseTo(originalLine.end?.z || 0);
  });

  it("CircleData round trip", () => {
    const originalCircle: CircleData = {
      guid: "circle-guid-1234",
      name: "MyCircle",
      radius: 42,
      frame: originFrame,
    };

    const bytes = circleDataToBytes(originalCircle);
    const decodedCircle = bytesToCircleData(bytes);

    expect(decodedCircle.guid).toBe(originalCircle.guid);
    expect(decodedCircle.name).toBe(originalCircle.name);
    expect(decodedCircle.radius).toBeCloseTo(originalCircle.radius);

    expect(decodedCircle.frame?.guid).toBe(originalCircle.frame?.guid);
    expect(decodedCircle.frame?.name).toBe(originalCircle.frame?.name);

    expect(decodedCircle.frame?.point?.guid).toBe(
      originalCircle.frame?.point?.guid,
    );
    expect(decodedCircle.frame?.point?.name).toBe(
      originalCircle.frame?.point?.name,
    );
    expect(decodedCircle.frame?.point?.x).toBeCloseTo(
      originalCircle.frame?.point?.x || 0,
    );
    expect(decodedCircle.frame?.point?.y).toBeCloseTo(
      originalCircle.frame?.point?.y || 0,
    );
    expect(decodedCircle.frame?.point?.z).toBeCloseTo(
      originalCircle.frame?.point?.z || 0,
    );

    expect(decodedCircle.frame?.xaxis?.guid).toBe(
      originalCircle.frame?.xaxis?.guid,
    );
    expect(decodedCircle.frame?.xaxis?.name).toBe(
      originalCircle.frame?.xaxis?.name,
    );
    expect(decodedCircle.frame?.xaxis?.x).toBeCloseTo(
      originalCircle.frame?.xaxis?.x || 0,
    );
    expect(decodedCircle.frame?.xaxis?.y).toBeCloseTo(
      originalCircle.frame?.xaxis?.y || 0,
    );
    expect(decodedCircle.frame?.xaxis?.z).toBeCloseTo(
      originalCircle.frame?.xaxis?.z || 0,
    );

    expect(decodedCircle.frame?.yaxis?.guid).toBe(
      originalCircle.frame?.yaxis?.guid,
    );
    expect(decodedCircle.frame?.yaxis?.name).toBe(
      originalCircle.frame?.yaxis?.name,
    );
    expect(decodedCircle.frame?.yaxis?.x).toBeCloseTo(
      originalCircle.frame?.yaxis?.x || 0,
    );
    expect(decodedCircle.frame?.yaxis?.y).toBeCloseTo(
      originalCircle.frame?.yaxis?.y || 0,
    );
    expect(decodedCircle.frame?.yaxis?.z).toBeCloseTo(
      originalCircle.frame?.yaxis?.z || 0,
    );
  });
});
