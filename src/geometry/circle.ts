import { CircleData } from "../generated/compas_pb/data/geometry";
import { buildTransformationFromFrame } from "./transformation";
import * as THREE from "three";

export function bytesToCircleData(bytes: Uint8Array): CircleData {
  return CircleData.decode(bytes);
}

export function circleDataToBytes(circle: CircleData): Uint8Array {
  return CircleData.encode(circle).finish();
}

export function circleGeometry(circle: CircleData): THREE.CircleGeometry {
  const circleGeometry = new THREE.CircleGeometry(circle.radius, 32);
  const matrix = buildTransformationFromFrame(circle.frame!);
  circleGeometry.applyMatrix4(matrix);
  return circleGeometry;
}
