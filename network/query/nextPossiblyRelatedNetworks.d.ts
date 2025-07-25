import type { DataModel, IdObject } from "../../resources/index";
import { Process } from "../../process";
/**
 * Issue GraphQL queries for possibly-related networks.
 *
 * This is called repeatedly, passing the resulting `alreadyTried` to the next
 * invocation.
 */
export declare function process(options: {
    relationship: "ancestor" | "descendant";
    network: IdObject<"networks">;
    alreadyTried: string[];
    disableIndex?: boolean;
}): Process<DataModel.CandidateSearchResult>;
