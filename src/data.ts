import { AnyData, MessageData } from "../compas_pb/generated/message";
import { Any } from "../google/protobuf/any";
import { BeamData } from "../compas_timber_pb/generated/beam";
import { BTLxProcessingData } from "../compas_timber_pb/generated/processing";
// Add more imports as needed

// Build-time registry for protobuf message types
export const protobufRegistry = new Map<any, { encode: Function, decode: Function, name: string, protobufPackage: string }>([
    [BeamData, { encode: BeamData.encode, decode: BeamData.decode, name: "BeamData", protobufPackage: "compas_timber_pb.data" }],
    [BTLxProcessingData, { encode: BTLxProcessingData.encode, decode: BTLxProcessingData.decode, name: "BTLxProcessingData", protobufPackage: "compas_timber_pb.data" }],
    // Add more message types here as needed
]);

export function packAsBytes(data: AnyData): Uint8Array {
    const message = MessageData.create({ data: data });
    return MessageData.encode(message).finish();
}

export function packAnyData<T>(obj: T, iface: any): AnyData {
    const entry = protobufRegistry.get(iface);
    if (!entry) throw new Error(`No protobuf registry entry for interface: ${iface}`);
    const typeUrl = `type.googleapis.com/${entry.protobufPackage}.${entry.name}`;
    const value = entry.encode(obj).finish();
    const any = Any.create({ typeUrl, value });
    return AnyData.create({ message: any });
}

export function packPrimitive(value: any): AnyData {
    // Now we use the protobuf Value field directly for primitives
    return AnyData.create({ value: value });
}

export function unpackPrimitive(data: AnyData): any {
    // Simply return the value field since protobuf Value handles the type conversion
    return data.value;
}

export function unpackAnyData<T>(data: AnyData, iface: any): T {
    if (data.message) {
        // Handle complex protobuf messages
        const entry = protobufRegistry.get(iface);
        if (!entry) throw new Error(`No protobuf registry entry for interface: ${iface}`);
        return entry.decode(data.message.value) as T;
    } else if (data.value !== undefined) {
        // Handle primitive values
        return data.value as T;
    }
    throw new Error("AnyData contains neither message nor value");
}

export function isPrimitive(data: AnyData): boolean {
    return data.value !== undefined && data.message === undefined;
}

export function isMessage(data: AnyData): boolean {
    return data.message !== undefined && data.value === undefined;
}