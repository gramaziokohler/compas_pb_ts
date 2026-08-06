import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";

export interface FaceList {
  indices: number[];
}

export class MeshFaceList {
  public readonly data: FaceList;

  constructor(input: { bytes: Uint8Array } | { data: FaceList }) {
    let faceListData: FaceList;
    if ("bytes" in input) {
      faceListData = bytesToFaceList(input.bytes);
    } else {
      faceListData = input.data;
    }

    if (!faceListData.indices) {
      throw new Error("Invalid FaceList: Missing required property 'faces'.");
    }
    this.data = faceListData;
  }

  get bytes(): Uint8Array {
    return faceListToBytes(this.data);
  }

  get indices(): number[] {
    return this.data.indices!;
  }
}

export function bytesToFaceList(bytes: Uint8Array): FaceList {
  const reader = new BinaryReader(bytes);
  const indices: number[] = [];
  while (reader.pos < reader.len) {
    const tag = reader.uint32();
    if (tag === 8) {
      indices.push(reader.uint32());
    } else if (tag === 10) {
      const end = reader.uint32() + reader.pos;
      while (reader.pos < end) {
        indices.push(reader.uint32());
      }
    } else {
      reader.skip(tag & 7);
    }
  }
  return { indices };
}

export function faceListToBytes(faceList: FaceList): Uint8Array {
  const writer = new BinaryWriter();
  writer.uint32(10).fork();
  for (const index of faceList.indices) {
    writer.uint32(index);
  }
  return writer.join().finish();
}
