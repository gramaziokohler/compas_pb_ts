import { PointData } from "../generated/compas_pb/data/geometry";
import * as THREE from "three";

export function bytesToPointData(bytes: Uint8Array): PointData {
  return PointData.decode(bytes);
}

export function pointDataToBytes(point: PointData): Uint8Array {
  return PointData.encode(point).finish();
}
