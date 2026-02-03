import type { FrameData } from "../generated/compas_pb/data/geometry";
import * as THREE from "three";

export function buildTransformationFromFrame(frame: FrameData): THREE.Matrix4 {
  const position = new THREE.Vector3(
    frame.point!.x,
    frame.point!.y,
    frame.point!.z,
  );
  const xaxis = new THREE.Vector3(
    frame.xaxis!.x,
    frame.xaxis!.y,
    frame.xaxis!.z,
  );
  const yaxis = new THREE.Vector3(
    frame.yaxis!.x,
    frame.yaxis!.y,
    frame.yaxis!.z,
  );
  const zaxis = new THREE.Vector3().crossVectors(xaxis, yaxis);

  const matrix = new THREE.Matrix4();
  matrix.makeBasis(xaxis, yaxis, zaxis);
  matrix.setPosition(position);
  return matrix;
}
