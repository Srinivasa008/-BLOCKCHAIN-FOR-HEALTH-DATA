/// <reference types="pouchdb-find" />
import type { CollectionName, Collections, MutationInput, MutationPayload, MutableCollectionName, SavedInput } from "../collections";
import * as Id from "../id/index";
import type { Workspace } from "../data";
import type { Adapter, Definitions } from "./types";
export interface AdapterWorkspaceConstructorOptions<C extends Collections> {
    adapter: Adapter<C>;
    definitions: Definitions<C>;
}
export declare class AdapterWorkspace<C extends Collections> implements Workspace<C> {
    private adapter;
    private generateId;
    constructor({ adapter, definitions }: AdapterWorkspaceConstructorOptions<C>);
    all<N extends CollectionName<C>>(collectionName: N): Promise<SavedInput<C, N>[]>;
    find<N extends CollectionName<C>>(collectionName: N, options: (Id.IdObject<C, N> | undefined)[] | PouchDB.Find.FindRequest<{}>): Promise<(SavedInput<C, N> | undefined)[]>;
    get<N extends CollectionName<C>>(collectionName: N, id: string | undefined): Promise<SavedInput<C, N> | undefined>;
    add<N extends CollectionName<C>>(collectionName: N, input: MutationInput<C, N>): Promise<MutationPayload<C, N>>;
    update<M extends MutableCollectionName<C>>(collectionName: M, input: MutationInput<C, M>): Promise<MutationPayload<C, M>>;
    remove<M extends MutableCollectionName<C>>(collectionName: M, input: MutationInput<C, M>): Promise<void>;
    private marshal;
    private unmarshal;
}
