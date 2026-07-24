import { describe, expect, it } from "vitest";

import { Dictionary } from "../src/messages/dictionary";
import {
  ListData,
  type DictData,
} from "../src/generated/compas_pb/data/message";

describe("Dictionary", () => {
  it("resolves a nested list-of-strings value packed as Any", () => {
    const options: ListData = {
      items: [{ value: "red" }, { value: "green" }, { value: "blue" }],
    };
    const dictData: DictData = {
      items: {
        guid: { value: "1824d5ca-9761-41f6-b577-6b3c8b5a2e55" },
        label: { value: "Select a color" },
        options: {
          message: {
            typeUrl: "type.googleapis.com/compas_pb.data.ListData",
            value: ListData.encode(options).finish(),
          },
        },
      },
    };

    const dictionary = new Dictionary({ data: dictData });

    expect(dictionary.asDict).toEqual({
      guid: "1824d5ca-9761-41f6-b577-6b3c8b5a2e55",
      label: "Select a color",
      options: ["red", "green", "blue"],
    });
  });
});
