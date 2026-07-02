import { TransformationData } from "../generated/compas_pb/data/geometry";

export class Transformation {
    public readonly data: TransformationData;

    constructor(input: { bytes: Uint8Array } | { data: TransformationData }) {
        let transformationData: TransformationData;
        if ("bytes" in input) {
            transformationData = bytesToTransformationData(input.bytes);
        } else {
            transformationData = input.data;
        }

        this.data = transformationData;
    }

    get bytes(): Uint8Array {
        return transformationDataToBytes(this.data);
    }

    get guid(): string {
        return this.data.guid;
    }

    get name(): string {
        return this.data.name;
    }

    get matrix(): number[] {
        return this.data.matrix;
    }
}

export function bytesToTransformationData(bytes: Uint8Array): TransformationData {
    return TransformationData.decode(bytes);
}

export function transformationDataToBytes(data: TransformationData): Uint8Array {
    return TransformationData.encode(data).finish();
}
