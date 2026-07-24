import { describe, expect, it } from "vitest";

import { List, bytesToListData, listDataToBytes } from "../src/messages/list";
import {
  ListData,
  type AnyData,
} from "../src/generated/compas_pb/data/message";

describe("List", () => {
  const items: AnyData[] = [{ value: 1 }, { value: "two" }, { value: true }];
  const listData: ListData = { items };

  it("round trips through bytes", () => {
    const bytes = listDataToBytes(listData);
    const decoded = bytesToListData(bytes);

    expect(decoded.items).toEqual(items);
  });

  it("constructs from bytes or data and exposes asList as plain values", () => {
    const fromData = new List({ data: listData });
    const fromBytes = new List({ bytes: listDataToBytes(listData) });

    expect(fromData.asList).toEqual([1, "two", true]);
    expect(fromBytes.asList).toEqual([1, "two", true]);
    expect(fromBytes.bytes).toEqual(listDataToBytes(listData));
  });

  it("resolves a nested ListData packed as Any", () => {
    const nested: ListData = {
      items: [{ value: "red" }, { value: "green" }, { value: "blue" }],
    };
    const outer = new List({
      data: {
        items: [
          {
            message: {
              typeUrl: "type.googleapis.com/compas_pb.data.ListData",
              value: ListData.encode(nested).finish(),
            },
          },
        ],
      },
    });

    expect(outer.asList).toEqual([["red", "green", "blue"]]);
  });
});
