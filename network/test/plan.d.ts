import { IdObject } from "../../resources/index";
import { Batch, Model } from "../../../test/arbitraries/networks";
export declare const plan: (options: {
    model: Model;
    batches: Batch[];
}) => {
    expectedLatestDescendants: IdObject<"networks">[];
};
