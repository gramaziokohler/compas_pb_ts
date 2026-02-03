import { BoxData } from "../generated/compas_pb/data/geometry";
import { buildTransformationFromFrame } from "./transformation";
import * as THREE from "three";

export function bytesToBoxData(bytes: Uint8Array): BoxData {
  return BoxData.decode(bytes);
}

export function boxDataToBytes(box: BoxData): Uint8Array {
  return BoxData.encode(box).finish();
}

export function boxGeometry(box: BoxData): THREE.BoxGeometry {
  // geometry of the box
  const box_geometry = new THREE.BoxGeometry(box.xsize, box.ysize, box.zsize);
  // create transformation matrix from the frame
  const matrix = buildTransformationFromFrame(box.frame!);
  // applyt the matrix to the geometry
  box_geometry.applyMatrix4(matrix);

  return box_geometry;
}
