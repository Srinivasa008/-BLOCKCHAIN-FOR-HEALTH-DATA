import type { Resource, Input, IdObject } from "../../resources/index";
import * as Batch from "./batch";
export declare const process: <I extends Batch.Assignment<{
    assignment: {
        name: string;
        type: string;
        current: Resource<"nameRecords"> | undefined;
    };
    properties: {
        nameRecord: IdObject<"nameRecords">;
    };
    entry: Input<"nameRecords">;
    result: IdObject<"nameRecords"> | undefined;
}>, O extends Batch.Output<{
    assignment: {
        name: string;
        type: string;
        current: Resource<"nameRecords"> | undefined;
    };
    properties: {
        nameRecord: IdObject<"nameRecords">;
    };
    entry: Input<"nameRecords">;
    result: IdObject<"nameRecords"> | undefined;
}>>(options: {
    project: import("../../meta/index").IdObject<import("../../resources").Collections, "projects", _DataModel.Project> | import("../../meta/index").IdObject<import("../../resources").Collections, "projects", import("../../meta").SavedInput<import("../../resources").Collections, "projects">>;
    assignments: {
        [collectionName: string]: I[];
    };
}) => Generator<import("../../meta/process/types").GraphQlRequest | import("../../meta/process/types").Web3Request, {
    project: import("../../meta/index").IdObject<import("../../resources").Collections, "projects", _DataModel.Project> | import("../../meta/index").IdObject<import("../../resources").Collections, "projects", import("../../meta").SavedInput<import("../../resources").Collections, "projects">>;
    assignments: {
        [collectionName: string]: (I & O)[];
    };
}, any>;
