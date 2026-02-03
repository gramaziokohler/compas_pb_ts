import {
  PointData,
  VectorData,
  FrameData,
  PlaneData,
  LineData,
  CircleData,
  BoxData,
} from "./generated/compas_pb/data/geometry";

import * as THREE from "three";

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

// ============================================================================
// BoxData
// ============================================================================

export function bytesToBoxData(bytes: Uint8Array): BoxData {
  return BoxData.decode(bytes);
}

export function boxDataToBytes(box: BoxData): Uint8Array {
  return BoxData.encode(box).finish();
}

export function boxDataToThree(box: BoxData): THREE.BoxGeometry {
  // geometry of the box
  const box_geometry = new THREE.BoxGeometry(box.xsize, box.ysize, box.zsize);

  // create transformation matrix from the frame
  if (box.frame) {
    const position = new THREE.Vector3(
      box.frame.point!.x,
      box.frame.point!.y,
      box.frame.point!.z,
    );
    const xaxis = new THREE.Vector3(
      box.frame.xaxis!.x,
      box.frame.xaxis!.y,
      box.frame.xaxis!.z,
    );
    const yaxis = new THREE.Vector3(
      box.frame.yaxis!.x,
      box.frame.yaxis!.y,
      box.frame.yaxis!.z,
    );
    const zaxis = new THREE.Vector3().crossVectors(xaxis, yaxis);

    const matrix = new THREE.Matrix4();
    matrix.makeBasis(xaxis, yaxis, zaxis);
    matrix.setPosition(position);

    // applyt the matrix to the geometry
    box_geometry.applyMatrix4(matrix);
  }

  return new THREE.BoxGeometry(10, 10, 10);
}
