import { describe, it, expect } from "vitest";
import {
  Box,
  Circle,
  Frame,
  Line,
  Plane,
  Point,
  Vector,
  pointToBytes,
  bytesToPoint,
  vectorToBytes,
  bytesToVector,
  frameToBytes,
  bytesToFrame,
  planeToBytes,
  bytesToPlane,
  lineToBytes,
  bytesToLine,
  circleToBytes,
  bytesToCircle,
  boxToBytes,
  bytesToBox,
} from "../src/geometry";

// Sample Data

const originPoint = new Point({
  guid: "point-guid-1234",
  name: "Origin",
  x: 0,
  y: 0,
  z: 0,
});

const otherPoint = new Point({
  guid: "point-guid-5678",
  name: "OtherPoint",
  x: 1,
  y: 1,
  z: 1,
});

const xAxisVector = new Vector({
  guid: "vector-guid-5678",
  name: "X-Axis",
  x: 1,
  y: 0,
  z: 0,
});

const yAxisVector = new Vector({
  guid: "vector-guid-9101",
  name: "Y-Axis",
  x: 0,
  y: 1,
  z: 0,
});

const originFrame = new Frame({
  guid: "frame-guid-1234",
  name: "OriginFrame",
  point: originPoint,
  xaxis: xAxisVector,
  yaxis: yAxisVector,
});

// Tests

describe("GEOMETRIC PRIMITIVES", () => {
  it("PointData round trip", () => {
    // 1. Create the original data object
    const originalPoint = new Point({
      guid: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      name: "MyPoint",
      x: 1.23,
      y: 4.56,
      z: 7.89,
    });

    // 2. Encode the object to a bytestream
    const bytes = pointToBytes(originalPoint);

    // 3. Decode the bytestream back to an object
    const decodedPoint = bytesToPoint(bytes);

    // 4. Assert that the properties match
    // Non-float properties can be checked for exact equality
    expect(decodedPoint.guid).toBe(originalPoint.guid);
    expect(decodedPoint.name).toBe(originalPoint.name);

    // Float properties should be checked for closeness to handle precision differences
    point_similar_to_point(decodedPoint, originalPoint);
  });

  it("VectorData round trip", () => {
    const originalVector = new Vector({
      guid: "f1e2d3c4-b5a6-7890-1234-567890abcdef",
      name: "MyVector",
      x: 9.87,
      y: 6.54,
      z: 3.21,
    });

    const bytes = vectorToBytes(originalVector);
    const decodedVector = bytesToVector(bytes);

    expect(decodedVector.guid).toBe(originalVector.guid);
    expect(decodedVector.name).toBe(originalVector.name);

    vector_similar_to_vector(decodedVector, originalVector);
  });

  it("FrameData round trip", () => {
    const originalFrame = new Frame({
      guid: "123e4567-e89b-12d3-a456-426614174000",
      name: "MyFrame",
      point: originPoint,
      xaxis: xAxisVector,
      yaxis: yAxisVector,
    });

    const bytes = frameToBytes(originalFrame);
    const decodedFrame = bytesToFrame(bytes);

    expect(decodedFrame.guid).toBe(originalFrame.guid);
    expect(decodedFrame.name).toBe(originalFrame.name);

    frame_similar_to_frame(decodedFrame, originalFrame);
  });

  it("PlaneData round trip", () => {
    const originalPlane = new Plane({
      guid: "plane-guid-1234",
      name: "MyPlane",
      point: originPoint,
      normal: xAxisVector,
    });

    const bytes = planeToBytes(originalPlane);
    const decodedPlane = bytesToPlane(bytes);

    expect(decodedPlane.guid).toBe(originalPlane.guid);
    expect(decodedPlane.name).toBe(originalPlane.name);

    point_similar_to_point(decodedPlane.point!, originalPlane.point!);
    vector_similar_to_vector(decodedPlane.normal!, originalPlane.normal!);
  });

  it("LineData round trip", () => {
    const originalLine = new Line({
      guid: "line-guid-1234",
      name: "MyLine",
      start: originPoint,
      end: otherPoint,
    });

    const bytes = lineToBytes(originalLine);
    const decodedLine = bytesToLine(bytes);

    expect(decodedLine.guid).toBe(originalLine.guid);
    expect(decodedLine.name).toBe(originalLine.name);

    point_similar_to_point(decodedLine.start!, originalLine.start!);
    point_similar_to_point(decodedLine.end!, originalLine.end!);
  });

  it("CircleData round trip", () => {
    const originalCircle = new Circle({
      guid: "circle-guid-1234",
      name: "MyCircle",
      radius: 42,
      frame: originFrame,
    });

    const bytes = circleToBytes(originalCircle);
    const decodedCircle = bytesToCircle(bytes);

    expect(decodedCircle.guid).toBe(originalCircle.guid);
    expect(decodedCircle.name).toBe(originalCircle.name);
    expect(decodedCircle.radius).toBeCloseTo(originalCircle.radius);

    frame_similar_to_frame(decodedCircle.frame!, originalCircle.frame!);
  });

  it("BoxData round trip", () => {
    const originalBox = new Box({
      guid: "box-guid-1234",
      name: "MyBox",
      frame: originFrame,
      xsize: 10,
      ysize: 20,
      zsize: 30,
    });

    const bytes = boxToBytes(originalBox);
    const decodedBox = bytesToBox(bytes);

    expect(decodedBox.guid).toBe(originalBox.guid);
    expect(decodedBox.name).toBe(originalBox.name);
    expect(decodedBox.xsize).toBeCloseTo(originalBox.xsize);
    expect(decodedBox.ysize).toBeCloseTo(originalBox.ysize);
    expect(decodedBox.zsize).toBeCloseTo(originalBox.zsize);

    frame_similar_to_frame(decodedBox.frame!, originalBox.frame!);
  });
});

// hELPER FUNCTIONS

function frame_similar_to_frame(
  frameData: FrameData,
  otherFrameData: FrameData,
) {
  expect(frameData.guid).toBe(otherFrameData.guid);
  expect(frameData.name).toBe(otherFrameData.name);

  point_similar_to_point(frameData.point!, otherFrameData.point!);
  vector_similar_to_vector(frameData.xaxis!, otherFrameData.xaxis!);
  vector_similar_to_vector(frameData.yaxis!, otherFrameData.yaxis!);
}

function vector_similar_to_vector(
  vectorData: VectorData,
  otherVectorData: VectorData,
) {
  expect(vectorData.guid).toBe(otherVectorData.guid);
  expect(vectorData.name).toBe(otherVectorData.name);
  expect(vectorData.x).toBeCloseTo(otherVectorData.x);
  expect(vectorData.y).toBeCloseTo(otherVectorData.y);
  expect(vectorData.z).toBeCloseTo(otherVectorData.z);
}

function point_similar_to_point(
  pointData: PointData,
  otherPointData: PointData,
) {
  expect(pointData.guid).toBe(otherPointData.guid);
  expect(pointData.name).toBe(otherPointData.name);
  expect(pointData.x).toBeCloseTo(otherPointData.x);
  expect(pointData.y).toBeCloseTo(otherPointData.y);
  expect(pointData.z).toBeCloseTo(otherPointData.z);
}
