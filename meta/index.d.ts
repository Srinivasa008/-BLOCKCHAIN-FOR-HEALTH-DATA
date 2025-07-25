export { IdObject, toIdObject } from "./id/index";
export { Collections, CollectionName, NamedCollectionName, MutableCollectionName, Resource, Input, IdFields, MutableResource, NamedResource, SavedInput } from "./collections";
export { Db, ConnectOptions } from "./interface";
export { Workspace } from "./data";
export { Definition, Definitions } from "./definitions";
import * as Graph from "./graph/index";
export { Graph };
import * as Pouch from "./pouch/index";
export { Pouch };
import * as Process from "./process/index";
export { Process };
import * as Batch from "./batch";
export { Batch };
import * as Id from "./id/index";
export { Id };
import { Collections } from "./collections";
import { Definitions } from "./definitions";
export declare const forDefinitions: <C extends Collections>(definitions: Definitions<C>) => {
    generateId: Id.GenerateId<C>;
    schema: import("graphql").GraphQLSchema;
    attach: <N extends "memory" | "sqlite" | "couch" | "fs">(options?: Pouch.Adapters.AttachOptions<N> | undefined) => import("./data").Workspace<C>;
    connect: (connectOptions?: import("./interface").ConnectOptions<C> | undefined) => import("./interface").Db<C>;
    serve: (serveOptions?: import("./interface").ConnectOptions<C> | undefined) => import("apollo-server").ApolloServer;
    resources: Process.ResourceProcessors<C>;
    forDb: (db: import("./interface").Db<C>) => {
        forProvider(provider: import("web3/providers").Provider): {
            run: Process.ProcessorRunner<C>;
        };
        run: Process.ProcessorRunner<C>;
    };
};
