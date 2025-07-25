/// <reference types="pouchdb-find" />
/// <reference types="pouchdb-core" />
import type { Collections, CollectionName } from "../collections";
import type * as Id from "../id/index";
declare type Identified = PouchDB.Core.IdMeta;
declare type Retrieved = PouchDB.Core.GetMeta;
/**
 * An object is a Record<T> if it has identification info
 * (i.e., `{ _id: string }`)
 */
export declare type Record<T> = T & Identified;
/**
 * SavedRecord<T> objects additionally contain PouchDB revision info, etc.
 */
export declare type SavedRecord<T> = Record<T> & Retrieved;
/**
 * A reference has only identification information
 */
export declare type RecordReference<T> = Pick<Record<T>, "_id">;
/**
 * Low-level interface for PouchDB adapters - allows basic CRUD operations
 * for arbitrary (weakly-typed) data types.
 */
export interface Adapter<C extends Collections> {
    /**
     * Retrieve and return every saved record for a given collection name
     */
    every<N extends CollectionName<C>, T>(collectionName: N): Promise<SavedRecord<T>[]>;
    /**
     * Retrieve specific saved records of a given collection name by list of
     * references.
     *
     * @param references - Can be sparse
     * @return - Items in list correspond to `references` by index (also sparse)
     */
    retrieve<N extends CollectionName<C>, T>(collectionName: N, references: (RecordReference<T> | undefined)[]): Promise<(SavedRecord<T> | undefined)[]>;
    /**
     * Search for saved records of a given collection name by PouchDB find
     * syntax
     */
    search<N extends CollectionName<C>, T>(collectionName: N, options: PouchDB.Find.FindRequest<{}>): Promise<SavedRecord<T>[]>;
    /**
     * Create or update saved records of a given collection name.
     *
     * @param records - Can be sparse
     * @return - Items in list correspond to `records` by index (also sparse)
     */
    save<N extends CollectionName<C>, T>(collectionName: N, records: (Record<T> | undefined)[], options: {
        overwrite?: boolean;
    }): Promise<(SavedRecord<T> | undefined)[]>;
    /**
     * Delete saved records
     *
     * @param references - Can be sparse
     */
    delete<N extends CollectionName<C>, T>(collectionName: N, references: (RecordReference<T> | undefined)[]): Promise<void>;
}
/**
 * @category Definitions
 */
export declare type Definitions<C extends Collections> = {
    [N in CollectionName<C>]: Definition<C, N>;
};
/**
 * @category Definitions
 */
export declare type Definition<C extends Collections, N extends CollectionName<C>> = {
    createIndexes: PouchDB.Find.CreateIndexOptions["index"][];
} & Id.Definition<C, N>;
export {};
