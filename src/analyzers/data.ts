import type { Any } from "../generated/google/protobuf/any";
import {
  MessageData,
  ListData,
  DictData,
  type AnyData,
} from "../generated/compas_pb/data/message";

import { TYPE_MAP, type Constructor } from "./typemap";

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
  const message_data = unpackMessage(message);
  const objectConstructor = findConstructor(message_data);
  if (objectConstructor) {
    const object = new objectConstructor({ bytes: message_data.value });
    return object;
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
  const message_data = MessageData.decode(message);
  return message_data.data!.message!;
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
    return item.value;
  }
  if (item.message !== undefined) {
    return resolveAny(item.message);
  }
  if (item.fallback?.data !== undefined) {
    return resolveDictData(item.fallback.data);
  }
  return undefined;
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
