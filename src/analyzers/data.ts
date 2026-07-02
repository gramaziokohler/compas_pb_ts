import { Any } from "../generated/google/protobuf/any";
import { MessageData } from "../generated/compas_pb/data/message";

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
