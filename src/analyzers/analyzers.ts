import { Any } from "../generated/google/protobuf/any";
import { MessageData } from "../generated/compas_pb/data/message";
import {
  BoxData,
  PointData,
  VectorData,
  FrameData,
} from "../generated/compas_pb/data/geometry";

export function analyzeMessage(message: Uint8Array): Any {
  const message_data = MessageData.decode(message);
  return message_data.data!.message!;
}

export function analyzeType(data: Any): any {
  const typeUrl = data.typeUrl;
  const typeName = typeUrl.split("/").slice(-1)[0];
  return typeMap.get(typeName);
}

const typeMap = new Map<string, any>([
  ["BoxData", BoxData],
  ["PointData", PointData],
  ["VectorData", VectorData],
  ["FrameData", FrameData],
]);
