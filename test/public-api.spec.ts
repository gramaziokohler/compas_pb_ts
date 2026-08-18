import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import { describe, expect, it } from "vitest";

import {
  Box,
  COMPAS_PB_VERSION,
  CompasMessages,
  CompasGeometry,
  Dictionary,
  List,
  Point,
  bytesToPointData,
  getObjectFromMessage,
  pbDumpBytes,
  pbLoadBytes,
  pointDataToBytes,
} from "../src";

describe("public API", () => {
  it("exports geometry wrappers and generated data namespaces", () => {
    const data = create(CompasGeometry.PointDataSchema, {
      guid: "point-guid",
      name: "Point",
      x: 1,
      y: 2,
      z: 3,
    });

    const point = new Point({ data });
    const decoded = bytesToPointData(pointDataToBytes(point.data));

    expect(point).toBeInstanceOf(Point);
    expect(Box).toBeTypeOf("function");
    expect(decoded).toEqual(data);
  });

  it("dumps a wrapper into a complete message envelope", () => {
    const box = new Box({
      data: create(CompasGeometry.BoxDataSchema, {
        guid: "box-guid",
        name: "Box",
        frame: {
          guid: "frame-guid",
          name: "Frame",
          point: { guid: "point-guid", name: "Point", x: 0, y: 0, z: 0 },
          xaxis: { guid: "xaxis-guid", name: "Vector", x: 1, y: 0, z: 0 },
          yaxis: { guid: "yaxis-guid", name: "Vector", x: 0, y: 1, z: 0 },
        },
        xsize: 1,
        ysize: 2,
        zsize: 3,
      }),
    });

    const bytes = pbDumpBytes(box);
    const decoded = getObjectFromMessage(bytes);

    expect(fromBinary(CompasMessages.MessageDataSchema, bytes).version).toBe(
      COMPAS_PB_VERSION,
    );
    expect(decoded).toBeInstanceOf(Box);
    expect(decoded.guid).toBe("box-guid");
    expect(decoded.xsize).toBe(1);
    expect(decoded.ysize).toBe(2);
    expect(decoded.zsize).toBe(3);
  });

  it("rejects objects outside the supported wrapper registry", () => {
    expect(() => pbDumpBytes({ bytes: new Uint8Array() })).toThrow(
      "Unsupported protobuf object",
    );
  });

  it("loads geometry messages as wrapper instances", () => {
    const box = new Box({
      data: create(CompasGeometry.BoxDataSchema, {
        guid: "box-guid",
        name: "Box",
        frame: {
          point: { x: 0, y: 0, z: 0 },
          xaxis: { x: 1, y: 0, z: 0 },
          yaxis: { x: 0, y: 1, z: 0 },
        },
        xsize: 1,
        ysize: 2,
        zsize: 3,
      }),
    });

    const loaded = pbLoadBytes(pbDumpBytes(box));

    expect(loaded).toBeInstanceOf(Box);
    expect(loaded.xsize).toBe(1);
    expect(loaded.ysize).toBe(2);
    expect(loaded.zsize).toBe(3);
  });

  it("loads lists and dictionaries as recursive plain JavaScript values", () => {
    const nestedDictionary = new Dictionary({
      data: create(CompasMessages.DictDataSchema, {
        items: {
          enabled: {
            data: {
              case: "value",
              value: { kind: { case: "boolValue", value: true } },
            },
          },
          count: {
            data: {
              case: "value",
              value: { kind: { case: "numberValue", value: 3 } },
            },
          },
        },
      }),
    });
    const list = new List({
      data: create(CompasMessages.ListDataSchema, {
        items: [
          {
            data: {
              case: "value",
              value: { kind: { case: "stringValue", value: "first" } },
            },
          },
          {
            data: {
              case: "message",
              value: {
                typeUrl: "type.googleapis.com/compas_pb.data.DictData",
                value: nestedDictionary.bytes,
              },
            },
          },
        ],
      }),
    });
    const dictionary = new Dictionary({
      data: create(CompasMessages.DictDataSchema, {
        items: {
          name: {
            data: {
              case: "value",
              value: { kind: { case: "stringValue", value: "example" } },
            },
          },
          values: {
            data: {
              case: "message",
              value: {
                typeUrl: "type.googleapis.com/compas_pb.data.ListData",
                value: list.bytes,
              },
            },
          },
        },
      }),
    });

    const loadedList = pbLoadBytes(pbDumpBytes(list));
    const loadedDictionary = pbLoadBytes(pbDumpBytes(dictionary));

    expect(loadedList).toEqual(["first", { enabled: true, count: 3 }]);
    expect(Array.isArray(loadedList)).toBe(true);
    expect(loadedDictionary).toEqual({
      name: "example",
      values: ["first", { enabled: true, count: 3 }],
    });
    expect(Object.getPrototypeOf(loadedDictionary)).toBe(Object.prototype);
    expect(Object.getPrototypeOf(loadedDictionary.values[1])).toBe(
      Object.prototype,
    );
  });

  it("loads Python-style native containers and numeric values", () => {
    const bytes = toBinary(
      CompasMessages.MessageDataSchema,
      create(CompasMessages.MessageDataSchema, {
        version: COMPAS_PB_VERSION,
        data: {
          data: {
            case: "dictValue",
            value: {
              items: {
                integer: { data: { case: "intValue", value: 3n } },
                floatingPoint: { data: { case: "doubleValue", value: 3 } },
                nested: {
                  data: {
                    case: "listValue",
                    value: {
                      items: [
                        {
                          data: {
                            case: "value",
                            value: {
                              kind: { case: "stringValue", value: "text" },
                            },
                          },
                        },
                        {
                          data: {
                            case: "dictValue",
                            value: {
                              items: {
                                enabled: {
                                  data: {
                                    case: "value",
                                    value: {
                                      kind: { case: "boolValue", value: true },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      }),
    );

    const loaded = pbLoadBytes(bytes);

    expect(loaded).toEqual({
      integer: 3,
      floatingPoint: 3,
      nested: ["text", { enabled: true }],
    });
    expect(Object.getPrototypeOf(loaded)).toBe(Object.prototype);
    expect(Array.isArray(loaded.nested)).toBe(true);

    const wrappedForLegacyConsumers = getObjectFromMessage(bytes);
    expect(wrappedForLegacyConsumers).toBeInstanceOf(Dictionary);
    expect(wrappedForLegacyConsumers.asDict).toEqual(loaded);
  });

  it("accepts compatible patch versions and rejects unsafe envelopes", () => {
    const list = new List({
      data: create(CompasMessages.ListDataSchema, {
        items: [
          {
            data: {
              case: "value",
              value: { kind: { case: "numberValue", value: 1 } },
            },
          },
        ],
      }),
    });
    const message = fromBinary(
      CompasMessages.MessageDataSchema,
      pbDumpBytes(list),
    );

    const compatibleBytes = toBinary(CompasMessages.MessageDataSchema, {
      ...message,
      version: "1.99.99",
    });
    expect(pbLoadBytes(compatibleBytes)).toEqual([1]);

    const unversionedBytes = toBinary(CompasMessages.MessageDataSchema, {
      ...message,
      version: undefined,
    });
    expect(() => pbLoadBytes(unversionedBytes)).toThrow("No version tag");

    const incompatibleBytes = toBinary(CompasMessages.MessageDataSchema, {
      ...message,
      version: "2.0.0",
    });
    expect(() => pbLoadBytes(incompatibleBytes)).toThrow(
      "Incompatible compas_pb wire format",
    );
    expect(() => pbLoadBytes(new Uint8Array())).toThrow("Binary data is empty");
  });
});
