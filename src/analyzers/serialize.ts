import { create, toBinary } from "@bufbuild/protobuf";
import { AnySchema, ValueSchema } from "@bufbuild/protobuf/wkt";

import type { AnyData } from "../proto/compas_pb/generated/message_pb";
import {
  AnyDataSchema,
  DictDataSchema,
  ListDataSchema,
  MessageDataSchema,
} from "../proto/compas_pb/generated/message_pb";
import { COMPAS_PB_VERSION } from "../proto/version";
import { findRegistrationForValue, type ProtobufObject } from "../registry";
import "./typemap";

/**
 * A plain object shaped like compas.data's own JSON envelope (`{dtype, data}`) is how a
 * COMPAS object arrives when it has been through JSON rather than a live class -- which is
 * always the case in a browser, where no `compas.data.Data` instances exist.
 *
 * It matters that these go out as FallbackData: on the Python side `_deserialize_dict`
 * hands back a plain dict, while `_deserialize_fallback` is the only arm that runs
 * DataDecoder and reconstructs the object. This branch is the TypeScript stand-in for
 * Python's `isinstance(obj, Data)` test, and sits at the same point in the dispatch.
 */
function isCompasEnvelope(value: Record<string, unknown>): boolean {
  return typeof value.dtype === "string" && "data" in value;
}

function isProtobufObject(value: object): value is ProtobufObject {
  return (
    "bytes" in value && (value as ProtobufObject).bytes instanceof Uint8Array
  );
}

/**
 * Serializes an arbitrary value into AnyData.
 *
 * Mirrors `compas_pb.core._serializer_any`: containers get their explicit arms and recurse,
 * registered types are packed as `Any`, envelope-shaped objects degrade to FallbackData,
 * and everything else must be a primitive.
 */
export function serializeAny(value: unknown): AnyData {
  if (value === null || value === undefined) {
    return create(AnyDataSchema, {
      data: {
        case: "value",
        value: create(ValueSchema, { kind: { case: "nullValue", value: 0 } }),
      },
    });
  }

  if (Array.isArray(value)) {
    return create(AnyDataSchema, {
      data: {
        case: "listValue",
        value: create(ListDataSchema, { items: value.map(serializeAny) }),
      },
    });
  }

  if (typeof value === "string") {
    return primitive({ case: "stringValue", value });
  }
  if (typeof value === "boolean") {
    return primitive({ case: "boolValue", value });
  }
  if (typeof value === "bigint") {
    return create(AnyDataSchema, { data: { case: "intValue", value } });
  }
  if (typeof value === "number") {
    // An integral float must stay a float, so only exact integers take the int arm.
    return Number.isInteger(value)
      ? create(AnyDataSchema, {
          data: { case: "intValue", value: BigInt(value) },
        })
      : create(AnyDataSchema, { data: { case: "doubleValue", value } });
  }
  if (value instanceof Uint8Array) {
    // google.protobuf.Value has no bytes kind, so compas_pb uses a "base64:" string.
    const binary = Array.from(value, (byte) => String.fromCharCode(byte)).join(
      "",
    );
    return primitive({
      case: "stringValue",
      value: `base64:${globalThis.btoa(binary)}`,
    });
  }

  if (typeof value === "object") {
    const registration = findRegistrationForValue(value);
    if (registration && isProtobufObject(value)) {
      return create(AnyDataSchema, {
        data: {
          case: "message",
          value: create(AnySchema, {
            typeUrl: `type.googleapis.com/${registration.fullName}`,
            value: value.bytes,
          }),
        },
      });
    }

    const record = value as Record<string, unknown>;
    const items = serializeMap(record);
    if (isCompasEnvelope(record)) {
      return create(AnyDataSchema, {
        data: {
          case: "fallback",
          value: { data: create(DictDataSchema, { items }) },
        },
      });
    }
    return create(AnyDataSchema, {
      data: { case: "dictValue", value: create(DictDataSchema, { items }) },
    });
  }

  throw new TypeError(
    `Unsupported type for compas_pb serialization: ${typeof value}`,
  );
}

function primitive(
  kind:
    | { case: "stringValue"; value: string }
    | { case: "boolValue"; value: boolean }
    | { case: "nullValue"; value: 0 },
): AnyData {
  return create(AnyDataSchema, {
    data: { case: "value", value: create(ValueSchema, { kind }) },
  });
}

/** Serializes each value of a plain object, keeping the keys. */
export function serializeMap(value: Record<string, unknown>): {
  [key: string]: AnyData;
} {
  const items: { [key: string]: AnyData } = {};
  for (const [key, item] of Object.entries(value)) {
    items[key] = serializeAny(item);
  }
  return items;
}

/**
 * Serializes any supported value into a complete MessageData envelope.
 *
 * The counterpart of `pbLoadBytes`, and the TypeScript equivalent of Python's
 * `compas_pb.pb_dump_bts`. Unlike `pbDumpBytes` it accepts arbitrary values, not only a
 * registered wrapper.
 */
export function pbDump(value: unknown): Uint8Array {
  return toBinary(
    MessageDataSchema,
    create(MessageDataSchema, {
      data: serializeAny(value),
      version: COMPAS_PB_VERSION,
    }),
  );
}
