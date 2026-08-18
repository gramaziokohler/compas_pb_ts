import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { Any, Value } from "@bufbuild/protobuf/wkt";
import { AnySchema } from "@bufbuild/protobuf/wkt";

import type {
  AnyData,
  DictData,
  ListData,
} from "../proto/compas_pb/generated/message_pb";
import {
  AnyDataSchema,
  DictDataSchema,
  ListDataSchema,
  MessageDataSchema,
} from "../proto/compas_pb/generated/message_pb";

import { TYPE_MAP, type Constructor } from "./typemap";
export { COMPAS_PB_VERSION } from "../proto/version";
import { COMPAS_PB_VERSION } from "../proto/version";

/** Protobuf package the compas_pb schemas declare, used to build type URLs. */
const PROTOBUF_PACKAGE = "compas_pb.data";

export interface ProtobufObject {
  readonly bytes: Uint8Array;
}

/**
 * Serializes a supported COMPAS wrapper into the complete MessageData envelope.
 *
 * This is the TypeScript equivalent of Python's `compas_pb.pb_dump_bts(object)`.
 */
export function pbDumpBytes(object: ProtobufObject): Uint8Array {
  const typeName = findTypeName(object);
  if (!typeName) {
    throw new TypeError(
      `Unsupported protobuf object: ${object.constructor.name || "unknown"}`,
    );
  }

  const data = create(AnyDataSchema, {
    data: {
      case: "message",
      value: create(AnySchema, {
        typeUrl: `type.googleapis.com/${PROTOBUF_PACKAGE}.${typeName}`,
        value: object.bytes,
      }),
    },
  });

  return toBinary(
    MessageDataSchema,
    create(MessageDataSchema, { data, version: COMPAS_PB_VERSION }),
  );
}

/**
 * Deserializes a complete COMPAS MessageData envelope.
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

  const messageData = fromBinary(MessageDataSchema, message);
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
  const data = decodeMessageData(message);

  switch (data.data.case) {
    case "message": {
      const objectConstructor = findConstructor(data.data.value);
      return objectConstructor
        ? new objectConstructor({ bytes: data.data.value.value })
        : null;
    }
    case "dictValue":
      return new (TYPE_MAP.get("DictData")!)({ data: data.data.value });
    case "listValue":
      return new (TYPE_MAP.get("ListData")!)({ data: data.data.value });
    case "fallback": {
      const fallbackData = data.data.value.data;
      return fallbackData
        ? new (TYPE_MAP.get("DictData")!)({ data: fallbackData })
        : null;
    }
    default:
      return null;
  }
}

/** Unpacks a serialized message into the protobuf Any it carries. */
export function unpackMessage(message: Uint8Array): Any {
  const data = decodeMessageData(message);
  if (data.data.case !== "message") {
    throw new Error("Message does not contain a protobuf Any value.");
  }
  return data.data.value;
}

function findConstructor(data: Any): Constructor | null {
  const typeName = data.typeUrl.split(".").slice(-1)[0];
  return TYPE_MAP.get(typeName) || null;
}

/**
 * Fully materializes an AnyData item into a plain value.
 *
 * Dispatches on which arm of the `oneof` is set, mirroring Python's
 * `WhichOneof("data")` in `compas_pb.core._deserialize_any`. Recurses through
 * ListData/DictData so nested containers come back as plain arrays and objects.
 */
export function resolveAnyData(item: AnyData): any {
  switch (item.data.case) {
    case "value":
      return resolvePrimitive(item.data.value);
    case "intValue":
      // int64 arrives as bigint; narrow to number, which is what callers expect.
      return Number(item.data.value);
    case "doubleValue":
      return item.data.value;
    case "dictValue":
      return resolveDictData(item.data.value);
    case "listValue":
      return resolveListData(item.data.value);
    case "message":
      return resolveAny(item.data.value);
    case "fallback": {
      const fallbackData = item.data.value.data;
      return fallbackData ? resolveDictData(fallbackData) : {};
    }
    default:
      return undefined;
  }
}

function resolvePrimitive(value: Value): any {
  switch (value.kind.case) {
    case "nullValue":
      return null;
    case "boolValue":
      return value.kind.value;
    case "numberValue":
      // Legacy path only: int/float now use the explicit intValue/doubleValue arms.
      return value.kind.value;
    case "stringValue": {
      const text = value.kind.value;
      if (!text.startsWith("base64:")) {
        return text;
      }
      const binary = globalThis.atob(text.slice(7));
      return Uint8Array.from(binary, (character) => character.charCodeAt(0));
    }
    default:
      return null;
  }
}

function resolveAny(any: Any): any {
  const typeName = any.typeUrl.split(".").slice(-1)[0];
  if (typeName === "ListData") {
    return resolveListData(fromBinary(ListDataSchema, any.value));
  }
  if (typeName === "DictData") {
    return resolveDictData(fromBinary(DictDataSchema, any.value));
  }
  const constructor = TYPE_MAP.get(typeName);
  return constructor ? new constructor({ bytes: any.value }) : null;
}

export function resolveListData(listData: ListData): any[] {
  return listData.items.map(resolveAnyData);
}

export function resolveDictData(dictData: DictData): {
  [key: string]: any;
} {
  const result: { [key: string]: any } = {};
  for (const key of Object.keys(dictData.items)) {
    result[key] = resolveAnyData(dictData.items[key]);
  }
  return result;
}
