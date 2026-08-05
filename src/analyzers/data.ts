import type { Any } from "../generated/google/protobuf/any";
import {
  AnyData,
  MessageData,
  ListData,
  DictData,
  protobufPackage,
} from "../generated/compas_pb/data/message";

import { TYPE_MAP, type Constructor } from "./typemap";

/** Version of the Python compas_pb message format represented by these codecs. */
export const COMPAS_PB_VERSION = "1.0.0";

export interface ProtobufObject {
  readonly bytes: Uint8Array;
}

/**
 * Serializes a supported COMPAS wrapper into the complete MessageData envelope.
 *
 * This is the TypeScript equivalent of Python's `compas_pb.pb_dump_bts(object)`.
 * The returned bytes can be passed directly to `getObjectFromMessage` or sent
 * through transports used by COMPAS viewers.
 */
export function pbDumpBytes(object: ProtobufObject): Uint8Array {
  const typeName = findTypeName(object);
  if (!typeName) {
    throw new TypeError(
      `Unsupported protobuf object: ${object.constructor.name || "unknown"}`,
    );
  }

  const data = AnyData.create({
    message: {
      typeUrl: `type.googleapis.com/${protobufPackage}.${typeName}`,
      value: object.bytes,
    },
  });
  return MessageData.encode(
    MessageData.create({ data, version: COMPAS_PB_VERSION }),
  ).finish();
}

/**
 * Deserializes a complete COMPAS MessageData envelope.
 *
 * Geometry and datastructure messages become their registered wrapper class.
 * ListData and DictData messages are recursively materialized as plain
 * JavaScript arrays and objects.
 *
 * This is the TypeScript equivalent of Python's `compas_pb.pb_load_bts(bytes)`.
 */
export function pbLoadBytes(message: Uint8Array): any {
  return resolveAnyData(decodeMessageData(message));
}

function decodeMessageData(message: Uint8Array): AnyData {
  if (message.length === 0) {
    throw new Error("Binary data is empty.");
  }

  const messageData = MessageData.decode(message);
  checkVersionCompatibility(messageData.version);

  if (!messageData.data) {
    throw new Error("Message contains no data.");
  }

  return messageData.data;
}

function wireCompatibilityKey(version: string): string {
  const parts = version.split(".");
  return parts[0] === "0" && parts.length >= 2
    ? `${parts[0]}.${parts[1]}`
    : parts[0];
}

function checkVersionCompatibility(version?: string): void {
  if (!version) {
    throw new Error(
      "No version tag in the message; cannot verify compas_pb " +
        `wire-format compatibility (reader is ${COMPAS_PB_VERSION}).`,
    );
  }

  if (
    wireCompatibilityKey(version) !== wireCompatibilityKey(COMPAS_PB_VERSION)
  ) {
    throw new Error(
      `Incompatible compas_pb wire format: message was written by version ${version} ` +
        `but this reader is ${COMPAS_PB_VERSION}.`,
    );
  }
}

function findTypeName(object: ProtobufObject): string | null {
  for (const [typeName, constructor] of TYPE_MAP) {
    if (object instanceof constructor) {
      return typeName;
    }
  }
  return null;
}

export function getObjectFromMessage(message: Uint8Array): any {
  /**
   * Extracts the protobuf Any object from a serialized message.
   *
   * This function decodes a serialized message in the form of a Uint8Array
   * and extracts the contained protobuf Any object. The returned Any object
   * can then be used for further processing or deserialization.
   *
   * @param {Uint8Array} message - The serialized message to unpack.
   * @returns {Any} - The unpacked protobuf Any object.
   */
  const data = decodeMessageData(message);
  if (data.message) {
    const objectConstructor = findConstructor(data.message);
    return objectConstructor
      ? new objectConstructor({ bytes: data.message.value })
      : null;
  }
  if (data.dictValue) {
    return new (TYPE_MAP.get("DictData")!)({ data: data.dictValue });
  }
  if (data.listValue) {
    return new (TYPE_MAP.get("ListData")!)({ data: data.listValue });
  }
  if (data.fallback?.data) {
    return new (TYPE_MAP.get("DictData")!)({ data: data.fallback.data });
  }
  return null;
}

export function unpackMessage(message: Uint8Array): Any {
  /**
   * Unpacks a serialized message into a protobuf Any object.
   *
   * This function decodes a serialized message in the form of a Uint8Array
   * and extracts the contained protobuf Any object. The returned Any object
   * can then be used for further processing or deserialization.
   *
   * @param {Uint8Array} message - The serialized message to unpack.
   * @returns {Any} - The unpacked protobuf Any object.
   */
  const data = decodeMessageData(message);
  if (!data.message) {
    throw new Error("Message does not contain a protobuf Any value.");
  }
  return data.message;
}

function findConstructor(data: Any): Constructor | null {
  /**
   * Finds the constructor for a given protobuf Any object.
   *
   * This function extracts the type URL from the provided Any object,
   * determines the corresponding type name, and retrieves the associated
   * constructor from the TYPE_MAP. If no constructor is found for the
   * type name, an error is thrown.
   *
   * @param {Any} data - The protobuf Any object containing the type information.
   * @returns {Constructor} - The constructor function for the specified type.
   * @throws {Error} - If the type is unsupported or not found in TYPE_MAP.
   */
  const typeUrl = data.typeUrl;
  const typeName = typeUrl.split(".").slice(-1)[0];
  const constructor = TYPE_MAP.get(typeName);
  return constructor || null;
}

export function resolveAnyData(item: AnyData): any {
  /**
   * Fully materializes an AnyData item into a plain value.
   *
   * Unlike a shallow read of `.value`/`.message`/`.fallback`, this recurses
   * into nested ListData/DictData payloads (packed as `Any`) so that lists
   * and dicts nested inside a Dictionary or List come back as plain arrays
   * and objects instead of raw, still-packed AnyData.
   *
   * @param {AnyData} item - The AnyData item to resolve.
   * @returns {any} - The resolved value: a primitive, a plain array/object,
   * a wrapper class instance (e.g. Point, Mesh), or null/undefined.
   */
  if (item.value !== undefined) {
    return resolvePrimitive(item.value);
  }
  if (item.intValue !== undefined) {
    return item.intValue;
  }
  if (item.doubleValue !== undefined) {
    return item.doubleValue;
  }
  if (item.dictValue !== undefined) {
    return resolveDictData(item.dictValue);
  }
  if (item.listValue !== undefined) {
    return resolveListData(item.listValue);
  }
  if (item.message !== undefined) {
    return resolveAny(item.message);
  }
  if (item.fallback?.data !== undefined) {
    return resolveDictData(item.fallback.data);
  }
  return undefined;
}

function resolvePrimitive(value: any): any {
  if (typeof value !== "string" || !value.startsWith("base64:")) {
    return value;
  }

  const binary = globalThis.atob(value.slice(7));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function resolveAny(any: Any): any {
  const typeName = any.typeUrl.split(".").slice(-1)[0];
  if (typeName === "ListData") {
    return resolveListData(ListData.decode(any.value));
  }
  if (typeName === "DictData") {
    return resolveDictData(DictData.decode(any.value));
  }
  const constructor = TYPE_MAP.get(typeName);
  return constructor ? new constructor({ bytes: any.value }) : null;
}

export function resolveListData(listData: ListData): any[] {
  return listData.items.map(resolveAnyData);
}

export function resolveDictData(dictData: DictData): { [key: string]: any } {
  const result: { [key: string]: any } = {};
  for (const key of Object.keys(dictData.items)) {
    result[key] = resolveAnyData(dictData.items[key]);
  }
  return result;
}
