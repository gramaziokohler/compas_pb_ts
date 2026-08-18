import { create, toBinary } from "@bufbuild/protobuf";
import { describe, expect, it } from "vitest";

import { Dictionary } from "../src/messages/dictionary";
import {
  DictDataSchema,
  ListDataSchema,
} from "../src/proto/compas_pb/generated/message_pb";

/** An AnyData holding a plain string, the shape compas_pb writes for str values. */
const stringValue = (value: string) => ({
  data: {
    case: "value" as const,
    value: { kind: { case: "stringValue" as const, value } },
  },
});

describe("Dictionary", () => {
  it("resolves a nested list-of-strings value packed as Any", () => {
    const options = create(ListDataSchema, {
      items: [stringValue("red"), stringValue("green"), stringValue("blue")],
    });
    const dictData = create(DictDataSchema, {
      items: {
        guid: stringValue("1824d5ca-9761-41f6-b577-6b3c8b5a2e55"),
        label: stringValue("Select a color"),
        options: {
          data: {
            case: "message",
            value: {
              typeUrl: "type.googleapis.com/compas_pb.data.ListData",
              value: toBinary(ListDataSchema, options),
            },
          },
        },
      },
    });

    const dictionary = new Dictionary({ data: dictData });

    expect(dictionary.asDict).toEqual({
      guid: "1824d5ca-9761-41f6-b577-6b3c8b5a2e55",
      label: "Select a color",
      options: ["red", "green", "blue"],
    });
  });
});
