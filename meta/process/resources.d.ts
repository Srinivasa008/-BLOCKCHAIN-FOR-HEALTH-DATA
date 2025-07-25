import * as graphql from "graphql";
import type { CollectionName, Collections, Input, Resource } from "../collections";
import { IdObject } from "../id/index";
import type { Definitions, Process } from "./types";
export interface ResourceProcessorsOptions<C extends Collections> {
    definitions: Definitions<C>;
}
export interface ResourceProcessors<C extends Collections> {
    load: <N extends CollectionName<C>>(collectionName: N, inputs: (Input<C, N> | undefined)[]) => Process<C, (IdObject<C, N> | undefined)[]>;
    get: <N extends CollectionName<C>>(collectionName: N, id: string, document: graphql.DocumentNode) => Process<C, Resource<C, N> | undefined>;
    find: <N extends CollectionName<C>>(collectionName: N, ids: (string | undefined)[], document: graphql.DocumentNode) => Process<C, (Resource<C, N> | undefined)[]>;
    all: <N extends CollectionName<C>>(collectionName: N, document: graphql.DocumentNode) => Process<C, Resource<C, N>[]>;
}
export declare const resourceProcessorsForDefinitions: <C extends Collections>(definitions: Definitions<C>) => ResourceProcessors<C>;
