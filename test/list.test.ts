import { describe, expect, it } from "vitest";

import { List, bytesToListData, listDataToBytes } from "../src/messages/list";
import type {
  AnyData,
  ListData,
} from "../src/generated/compas_pb/data/message";

describe("List", () => {
  const items: AnyData[] = [{ value: 1 }, { value: "two" }, { value: true }];
  const listData: ListData = { items };

  it("round trips through bytes", () => {
    const bytes = listDataToBytes(listData);
    const decoded = bytesToListData(bytes);

    expect(decoded.items).toEqual(items);
  });

  it("constructs from bytes or data and exposes asList", () => {
    const fromData = new List({ data: listData });
    const fromBytes = new List({ bytes: listDataToBytes(listData) });

    expect(fromData.asList).toEqual(items);
    expect(fromBytes.asList).toEqual(items);
    expect(fromBytes.bytes).toEqual(listDataToBytes(listData));
  });
});
