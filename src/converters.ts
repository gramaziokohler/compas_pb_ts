import {
  PointData,
  VectorData,
  FrameData,
  PlaneData,
  LineData,
  CircleData,
} from "./generated/compas_pb/data/geometry";
import { MeshData } from "./generated/compas_pb/data/datastructures";

// ============================================================================
// PointData
// ============================================================================
export function bytesToPointData(bytes: Uint8Array): PointData {
  return PointData.decode(bytes);
}

export function pointDataToBytes(point: PointData): Uint8Array {
  return PointData.encode(point).finish();
}

// ============================================================================
// VectorData
// ============================================================================

export function bytesToVectorData(bytes: Uint8Array): VectorData {
  return VectorData.decode(bytes);
}

export function vectorDataToBytes(vector: VectorData): Uint8Array {
  return VectorData.encode(vector).finish();
}

// ============================================================================
// FrameData
// ============================================================================
export function bytesToFrameData(bytes: Uint8Array): FrameData {
  return FrameData.decode(bytes);
}

export function frameDataToBytes(frame: FrameData): Uint8Array {
  return FrameData.encode(frame).finish();
}

// ============================================================================
// PlaneData
// ============================================================================
export function bytesToPlaneData(bytes: Uint8Array): PlaneData {
  return PlaneData.decode(bytes);
}

export function planeDataToBytes(plane: PlaneData): Uint8Array {
  return PlaneData.encode(plane).finish();
}

// ============================================================================
// LineData
// ============================================================================

export function bytesToLineData(bytes: Uint8Array): LineData {
  return LineData.decode(bytes);
}

export function lineDataToBytes(line: LineData): Uint8Array {
  return LineData.encode(line).finish();
}

// ============================================================================
// CircleData
// ============================================================================

export function bytesToCircleData(bytes: Uint8Array): CircleData {
  return CircleData.decode(bytes);
}

export function circleDataToBytes(circle: CircleData): Uint8Array {
  return CircleData.encode(circle).finish();
}
