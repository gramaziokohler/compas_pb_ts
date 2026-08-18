import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import { describe, expect, it } from "vitest";

import {
  CompasGeometry,
  CompasMessages,
  Point,
  findRegistrationForTypeUrl,
  pbDump,
  pbLoadBytes,
  registerType,
  serializeAny,
} from "../src";

const { PointDataSchema } = CompasGeometry;
const { AnyDataSchema } = CompasMessages;

/** The arm of the AnyData oneof a value landed in. */
const armOf = (value: unknown) => serializeAny(value).data.case;

describe("serializeAny", () => {
  it("keeps integers and floats in distinct arms", () => {
    expect(armOf(3)).toBe("intValue");
    expect(armOf(3.5)).toBe("doubleValue");
    // An integral float is indistinguishable from an int in JavaScript, so it takes the
    // int arm -- the one place this cannot round-trip a Python float exactly.
    expect(armOf(3.0)).toBe("intValue");
    expect(armOf(9007199254740993n)).toBe("intValue");
  });

  it("round-trips primitives through a full envelope", () => {
    for (const value of ["hello", true, false, null, 42, 1.25]) {
      expect(pbLoadBytes(pbDump(value))).toEqual(value);
    }
  });

  it("round-trips bytes through the base64 convention", () => {
    const value = new Uint8Array([0, 1, 250, 255]);
    expect(pbLoadBytes(pbDump(value))).toEqual(value);
  });

  it("uses the native container arms and recurses", () => {
    expect(armOf([1, 2])).toBe("listValue");
    expect(armOf({ a: 1 })).toBe("dictValue");

    const value = {
      integer: 3,
      float: 3.5,
      text: "hello",
      enabled: true,
      empty: null,
      nested: [1, 2.5, { answer: 42 }],
    };
    expect(pbLoadBytes(pbDump(value))).toEqual(value);
  });

  it("sends a COMPAS envelope as FallbackData, not a plain dict", () => {
    // Only the fallback arm runs DataDecoder backend-side, so an envelope sent as
    // dict_value would arrive in Python as a bare dict instead of a reconstructed object.
    const frame = {
      dtype: "compas.geometry.Frame",
      data: { point: [0, 0, 0] },
    };
    expect(armOf(frame)).toBe("fallback");
    expect(pbLoadBytes(pbDump(frame))).toEqual(frame);

    // A dict merely containing an envelope-shaped value is still a dict.
    expect(armOf({ label: "ok", nested: frame })).toBe("dictValue");
    // ...and each enveloped item of a list is wrapped individually.
    const list = serializeAny([frame, frame]);
    expect(list.data.case).toBe("listValue");
    if (list.data.case === "listValue") {
      for (const item of list.data.value.items) {
        expect(item.data.case).toBe("fallback");
      }
    }
  });

  it("packs a registered wrapper into the message arm with its full type URL", () => {
    const point = new Point({
      data: create(PointDataSchema, {
        guid: "p",
        name: "Point",
        x: 1,
        y: 2,
        z: 3,
      }),
    });

    const encoded = serializeAny(point);
    expect(encoded.data.case).toBe("message");
    if (encoded.data.case === "message") {
      expect(encoded.data.value.typeUrl).toBe(
        "type.googleapis.com/compas_pb.data.PointData",
      );
    }

    const loaded = pbLoadBytes(pbDump(point));
    expect(loaded).toBeInstanceOf(Point);
    expect([loaded.x, loaded.y, loaded.z]).toEqual([1, 2, 3]);
  });

  it("rejects a value it cannot represent", () => {
    expect(() => serializeAny(() => undefined)).toThrow("Unsupported type");
  });
});

describe("registry", () => {
  // A stand-in for what a plugin package (antikythera_ts, compas_timber_ts) registers:
  // its own class, keyed by the protobuf message name its own schemas declare.
  class Widget {
    constructor(input: { bytes: Uint8Array }) {
      this.bytes = input.bytes;
    }
    readonly bytes: Uint8Array;
  }

  it("routes a third-party type through the shared entry points", () => {
    registerType("example.v1.WidgetData", Widget);

    const payload = toBinary(
      AnyDataSchema,
      create(AnyDataSchema, { data: { case: "intValue", value: 7n } }),
    );
    const widget = new Widget({ bytes: payload });

    const encoded = serializeAny(widget);
    expect(encoded.data.case).toBe("message");
    if (encoded.data.case === "message") {
      expect(encoded.data.value.typeUrl).toBe(
        "type.googleapis.com/example.v1.WidgetData",
      );
    }

    const loaded = pbLoadBytes(pbDump(widget));
    expect(loaded).toBeInstanceOf(Widget);
    expect(loaded.bytes).toEqual(payload);
  });

  it("resolves a registration from a type URL", () => {
    registerType("example.v1.WidgetData", Widget);
    expect(
      findRegistrationForTypeUrl("type.googleapis.com/example.v1.WidgetData")
        ?.constructor,
    ).toBe(Widget);
  });

  it("resolves a subclass through its registered base, as Python's MRO walk does", () => {
    class SpecialWidget extends Widget {}
    registerType("example.v1.WidgetData", Widget);

    const encoded = serializeAny(
      new SpecialWidget({ bytes: new Uint8Array([1]) }),
    );
    expect(encoded.data.case).toBe("message");
    if (encoded.data.case === "message") {
      expect(encoded.data.value.typeUrl).toBe(
        "type.googleapis.com/example.v1.WidgetData",
      );
    }
  });
});

describe("registry codecs", () => {
  // A domain class that knows nothing about protobuf, registered with an explicit codec --
  // the shape antikythera_ts uses, mirroring Python's @pb_serializer / @pb_deserializer.
  class Reading {
    constructor(readonly celsius: number) {}
  }

  it("routes a plain domain class through supplied codec functions", () => {
    registerType("example.v1.ReadingData", Reading, {
      toBytes: (reading) =>
        toBinary(
          AnyDataSchema,
          create(AnyDataSchema, {
            data: { case: "doubleValue", value: reading.celsius },
          }),
        ),
      fromBytes: (bytes) => {
        const decoded = fromBinary(AnyDataSchema, bytes);
        return new Reading(
          decoded.data.case === "doubleValue" ? decoded.data.value : Number.NaN,
        );
      },
    });

    const loaded = pbLoadBytes(pbDump(new Reading(21.5)));

    expect(loaded).toBeInstanceOf(Reading);
    expect(loaded.celsius).toBe(21.5);
  });
});

describe("already-encoded values", () => {
  it("forwards an AnyData byte for byte instead of re-deriving it", () => {
    // How a simulation stand-in echoes a param back as an output: the param may carry a
    // native geometry message, which decoding and re-encoding would not preserve.
    const original = create(AnyDataSchema, {
      data: {
        case: "message",
        value: {
          typeUrl: "type.googleapis.com/some.Native",
          value: new Uint8Array([9, 8, 7]),
        },
      },
    });

    const forwarded = serializeAny(original);

    expect(forwarded).toBe(original);
    expect(pbLoadBytes(pbDump({ echoed: original }))).toEqual({ echoed: null });
  });
});
