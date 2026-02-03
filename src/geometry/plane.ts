import { PlaneData } from "../generated/compas_pb/data/geometry";
import * as THREE from "three";

export function bytesToPlaneData(bytes: Uint8Array): PlaneData {
  return PlaneData.decode(bytes);
}

export function planeDataToBytes(plane: PlaneData): Uint8Array {
  return PlaneData.encode(plane).finish();
}
