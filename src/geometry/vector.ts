import { VectorData } from "../generated/compas_pb/data/geometry";
import * as THREE from "three";

export function bytesToVectorData(bytes: Uint8Array): VectorData {
  return VectorData.decode(bytes);
}

export function vectorDataToBytes(vector: VectorData): Uint8Array {
  return VectorData.encode(vector).finish();
}
