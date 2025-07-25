import * as fc from "fast-check";
import { DataModel, Input } from "../../src/resources/index";
export interface Network extends Input<"networks"> {
    getBlockByNumber(height: number): DataModel.BlockInput;
}
export declare class Model {
    private byDescendantIndexThenHeight;
    extendNetwork(descendantIndex: number, hash: string): void;
    addNetwork(network: Input<"networks">): void;
    forkNetwork(descendantIndex: number, leftHash: string, rightHash: string): void;
    get networks(): Network[];
}
export declare const Networks: () => fc.Arbitrary<Model>;
export interface Batch {
    descendantIndex: number;
    inputs: Input<"networks">[];
}
export declare const Batch: (model: Model) => fc.Arbitrary<Batch>;
export declare const Batches: (model: Model) => fc.Arbitrary<Batch[]>;
