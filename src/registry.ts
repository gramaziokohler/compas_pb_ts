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

export interface Registration {
  /** Fully-qualified protobuf message name, e.g. `compas_pb.data.PointData`. */
  fullName: string;
  constructor: Constructor;
}

const byConstructor = new Map<Constructor, Registration>();
const byFullName = new Map<string, Registration>();

/**
 * Registers a wrapper class against the protobuf message it carries.
 *
 * @param fullName Fully-qualified protobuf message name, matching the `type_url` suffix
 *   the other language runtimes write (Python's `DESCRIPTOR.full_name`).
 * @param constructor Wrapper class. It must expose a `bytes` getter and accept
 *   `{ bytes }` in its constructor, which is the contract the codec relies on.
 */
export function registerType(fullName: string, constructor: Constructor): void {
  const registration = { fullName, constructor };
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
