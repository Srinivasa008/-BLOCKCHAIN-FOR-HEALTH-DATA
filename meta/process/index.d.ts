import type { Collections } from "../collections";
export type { Process, Processor, ProcessRequest, RequestType, Query, QueryName, Mutation, MutationName } from "./types";
export type { ResourceProcessors, ResourceProcessorsOptions } from "./resources";
export type { ProcessorRunner } from "./run";
export type { Definition, Definitions } from "./types";
import type { Definitions } from "./types";
export declare const forDefinitions: <C extends Collections>(definitions: Definitions<C>) => {
    forDb: (db: import("../index").Db<C>) => {
        forProvider(provider: import("web3/providers").Provider): {
            run: import("./run").ProcessorRunner<C>;
        };
        run: import("./run").ProcessorRunner<C>;
    };
    resources: import("./resources").ResourceProcessors<C>;
};
