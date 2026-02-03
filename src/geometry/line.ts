import { LineData } from "../generated/compas_pb/data/geometry";
import * as THREE from "three";

export function bytesToLineData(bytes: Uint8Array): LineData {
  return LineData.decode(bytes);
}

export function lineDataToBytes(line: LineData): Uint8Array {
  return LineData.encode(line).finish();
}

export function lineGeometry(line: LineData): THREE.Line {
  const start_point = new THREE.Vector3(
    line.start!.x,
    line.start!.y,
    line.start!.z,
  );
  const end_point = new THREE.Vector3(line.end!.x, line.end!.y, line.end!.z);
  const geometry = new THREE.BufferGeometry().setFromPoints([
    start_point,
    end_point,
  ]);
  const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
  return new THREE.Line(geometry, material);
}
