import { PolylineData } from "../generated/compas_pb/data/geometry";
import { Point } from "./point";
import * as THREE from "three";

export class Polyline {
    public readonly data: PolylineData;
    private _points?: Point[];

    constructor(input: { bytes: Uint8Array } | { data: PolylineData }) {
        let polylineData: PolylineData;
        if ("bytes" in input) {
            polylineData = bytesToPolylineData(input.bytes);
        } else {
            polylineData = input.data;
        }

        if (!polylineData.points || polylineData.points.length === 0) {
            throw new Error("Invalid PolylineData: Missing required property points.");
        }
        this.data = polylineData;
    }

    get bytes(): Uint8Array {
        return polylineDataToBytes(this.data);
    }

    get guid(): string {
        return this.data.guid;
    }

    get name(): string {
        return this.data.name;
    }

    get points(): Point[] {
        if (!this._points) {
            this._points = [];
            for (const pointData of this.data.points) {
                const point = new Point({ data: pointData! });
                this._points.push(point);
            }
        }
        return this._points;
    }
}

export function bytesToPolylineData(bytes: Uint8Array): PolylineData {
    return PolylineData.decode(bytes);
}

export function polylineDataToBytes(data: PolylineData): Uint8Array {
    return PolylineData.encode(data).finish();
}
