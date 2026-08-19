/**
 * Registry of types that can cross the wire, and the API third-party packages use to add
 * their own.
 *
 * This mirrors `compas_pb.registry.SerializerRegistry` on the Python side. Python keys
 * serializers by class and walks the MRO on lookup; the equivalent here walks the
 * prototype chain, so registering a base class covers its subclasses.
 *
 * Python discovers plugins automatically through packaging entry points. JavaScript has no
 * equivalent registry, and a bundled browser application cannot inspect its own dependency
 * tree at runtime, so plugins register explicitly:
 *
 *     import { registerAntikytheraTypes } from "antikythera_ts";
 *     registerAntikytheraTypes();
 *
 * Registration and discovery are deliberately separate concerns, so a future build-time
 * discovery step can be added without changing how plugins declare their types.
 */

export type Constructor<T = any> = new (...args: any[]) => T;

/** A wrapper class able to serialize itself to the bytes of its protobuf message. */
export interface ProtobufObject {
  readonly bytes: Uint8Array;
}

/**
 * How a registered type converts to and from the bytes of its protobuf message.
 *
 * Python stores functions in its registry (`@pb_serializer` / `@pb_deserializer`) rather
 * than requiring a class shape, which lets a domain model stay free of protobuf concerns.
 * Supplying a codec here does the same. Omit it and the wrapper convention is assumed --
 * a `bytes` getter and a static `fromBytes`, which is how compas_pb's own types work.
 */
export interface Codec<T = any> {
  toBytes(value: T): Uint8Array;
  fromBytes(bytes: Uint8Array): T;
}

export interface Registration {
  /** Fully-qualified protobuf message name, e.g. `compas_pb.data.PointData`. */
  fullName: string;
  constructor: Constructor;
  toBytes(value: any): Uint8Array;
  fromBytes(bytes: Uint8Array): unknown;
}

const byConstructor = new Map<Constructor, Registration>();
const byFullName = new Map<string, Registration>();

/**
 * Registers a wrapper class against the protobuf message it carries.
 *
 * @param fullName Fully-qualified protobuf message name, matching the `type_url` suffix
 *   the other language runtimes write (Python's `DESCRIPTOR.full_name`).
 * @param constructor The class instances of this type are, used to recognise values on
 *   the way out and to key the prototype-chain lookup.
 * @param codec How to convert to and from the message bytes. Omit it for the wrapper
 *   convention: a `bytes` getter and a static `fromBytes`.
 */
export function registerType<T>(
  fullName: string,
  constructor: Constructor<T>,
  codec?: Codec<T>,
): void {
  const registration: Registration = {
    fullName,
    constructor,
    toBytes: codec
      ? (value: T) => codec.toBytes(value)
      : (value: ProtobufObject) => value.bytes,
    fromBytes: codec
      ? (bytes: Uint8Array) => codec.fromBytes(bytes)
      : (bytes: Uint8Array) =>
          (
            constructor as unknown as { fromBytes(bytes: Uint8Array): T }
          ).fromBytes(bytes),
  };
  byConstructor.set(constructor, registration);
  byFullName.set(fullName, registration);
}

/** Registers many types at once. */
export function registerTypes(entries: Iterable<[string, Constructor]>): void {
  for (const [fullName, constructor] of entries) {
    registerType(fullName, constructor);
  }
}

/**
 * Finds the registration for a value by walking its prototype chain, so a subclass of a
 * registered type resolves to its base registration. Mirrors Python's MRO walk.
 */
export function findRegistrationForValue(
  value: object,
): Registration | undefined {
  let prototype = Object.getPrototypeOf(value);
  while (prototype && prototype !== Object.prototype) {
    const registration = byConstructor.get(prototype.constructor);
    if (registration) {
      return registration;
    }
    prototype = Object.getPrototypeOf(prototype);
  }
  return undefined;
}

/**
 * Finds the registration a protobuf `Any` type URL refers to.
 *
 * Everything after the final `/` is the fully-qualified message name, matching Python's
 * `type_url.rpartition("/")[2]`.
 */
export function findRegistrationForTypeUrl(
  typeUrl: string,
): Registration | undefined {
  return byFullName.get(typeUrl.split("/").pop() ?? typeUrl);
}

/** Looks up a registration by fully-qualified protobuf message name. */
export function findRegistration(fullName: string): Registration | undefined {
  return byFullName.get(fullName);
}

/** Every registered type, for diagnostics. */
export function registeredTypes(): Registration[] {
  return [...byFullName.values()];
}
