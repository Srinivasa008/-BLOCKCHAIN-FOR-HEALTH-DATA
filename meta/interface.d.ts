import { GraphQLSchema, DocumentNode, ExecutionResult } from "graphql";
import { ApolloServer } from "apollo-server";
import type { Collections } from "./collections";
import type { Workspace } from "./data";
import * as Pouch from "./pouch/index";
export interface Db<_C extends Collections> {
    /**
     * Perform a query or mutation via GraphQL interface
     */
    execute(request: DocumentNode | string, variables: any): Promise<ExecutionResult>;
}
export interface ConnectOptions<_C extends Collections> {
    adapter?: Pouch.Adapters.AdapterOptions;
}
export declare const forAttachAndSchema: <C extends Collections>(options: {
    attach: (options: Pouch.Adapters.AttachOptions<"memory" | "sqlite" | "couch" | "fs">) => Workspace<C>;
    schema: GraphQLSchema;
}) => {
    connect: (connectOptions?: ConnectOptions<C> | undefined) => Db<C>;
    serve: (serveOptions?: ConnectOptions<C> | undefined) => ApolloServer;
};
