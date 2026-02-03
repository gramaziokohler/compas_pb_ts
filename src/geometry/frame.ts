import { FrameData } from "../generated/compas_pb/data/geometry";
import * as THREE from "three";

export function bytesToFrameData(bytes: Uint8Array): FrameData {
  return FrameData.decode(bytes);
}

export function frameDataToBytes(frame: FrameData): Uint8Array {
  return FrameData.encode(frame).finish();
}
