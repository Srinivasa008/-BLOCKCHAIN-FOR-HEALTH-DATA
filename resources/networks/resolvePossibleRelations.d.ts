import type { IdObject } from "../types";
export declare const resolvePossibleAncestors: ({ id }: IdObject<"networks">, { limit, alreadyTried, disableIndex }: {
    limit?: number | undefined;
    alreadyTried: any;
    disableIndex: any;
}, { workspace }: {
    workspace: any;
}) => Promise<{
    networks: (import("../../meta/index").SavedInput<import("../types").Collections, "networks"> | undefined)[];
    alreadyTried: any[];
}>;
export declare const resolvePossibleDescendants: ({ id }: IdObject<"networks">, { limit, alreadyTried, disableIndex }: {
    limit?: number | undefined;
    alreadyTried: any;
    disableIndex: any;
}, { workspace }: {
    workspace: any;
}) => Promise<{
    networks: (import("../../meta/index").SavedInput<import("../types").Collections, "networks"> | undefined)[];
    alreadyTried: any[];
}>;
export declare function resolvePossibleRelations(relationship: "ancestor" | "descendant"): ({ id }: IdObject<"networks">, { limit, alreadyTried, disableIndex }: {
    limit?: number | undefined;
    alreadyTried: any;
    disableIndex: any;
}, { workspace }: {
    workspace: any;
}) => Promise<{
    networks: (import("../../meta/index").SavedInput<import("../types").Collections, "networks"> | undefined)[];
    alreadyTried: any[];
}>;
