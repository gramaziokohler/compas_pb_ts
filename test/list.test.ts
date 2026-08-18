import { create, toBinary } from "@bufbuild/protobuf";
import { describe, expect, it } from "vitest";

import { List, bytesToListData, listDataToBytes } from "../src/messages/list";
import { ListDataSchema } from "../src/proto/compas_pb/generated/message_pb";

const stringValue = (value: string) => ({
  data: {
    case: "value" as const,
    value: { kind: { case: "stringValue" as const, value } },
  },
});

describe("List", () => {
  // google.protobuf.Value has no integer kind, so a plain number goes out as numberValue.
  const items = [
    {
      data: {
        case: "value" as const,
        value: { kind: { case: "numberValue" as const, value: 1 } },
      },
    },
    stringValue("two"),
    {
      data: {
        case: "value" as const,
        value: { kind: { case: "boolValue" as const, value: true } },
      },
    },
  ];
  const listData = create(ListDataSchema, { items });

  it("round trips through bytes", () => {
    const bytes = listDataToBytes(listData);
    const decoded = bytesToListData(bytes);

    expect(decoded.items).toEqual(listData.items);
  });

  it("constructs from bytes or data and exposes asList as plain values", () => {
    const fromData = new List({ data: listData });
    const fromBytes = new List({ bytes: listDataToBytes(listData) });

    expect(fromData.asList).toEqual([1, "two", true]);
    expect(fromBytes.asList).toEqual([1, "two", true]);
    expect(fromBytes.bytes).toEqual(listDataToBytes(listData));
  });

  it("resolves a nested ListData packed as Any", () => {
    const nested = create(ListDataSchema, {
      items: [stringValue("red"), stringValue("green"), stringValue("blue")],
    });
    const outer = new List({
      data: create(ListDataSchema, {
        items: [
          {
            data: {
              case: "message",
              value: {
                typeUrl: "type.googleapis.com/compas_pb.data.ListData",
                value: toBinary(ListDataSchema, nested),
              },
            },
          },
        ],
      }),
    });

    expect(outer.asList).toEqual([["red", "green", "blue"]]);
  });
});
