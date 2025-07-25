import type { Provider } from "web3/providers";
import * as Process from "../process";
import { Db, DataModel, Input, Resource, IdObject } from "../resources/index";
import * as Fetch from "./fetch/index";
import * as Query from "./query/index";
import * as Load from "./load/index";
export { Fetch, Query, Load };
declare type NetworkResource = Pick<Resource<"networks">, "id" | keyof Input<"networks">>;
/**
 * As described in the documentation for
 * [[Network.includeBlocks | `Network.includeBlocks()`]], these
 * settings may help mitigate unforeseen problems with large data sets.
 */
export declare type IncludeSettings = {
    /**
     * Skip final query at end of this operation that determines canonical known
     * latest after the operation completes.
     *
     * If set to `true`, this operation will update [[Network.knownLatest]]
     * using only information already present in the abstraction instance as well
     * as information passed as input.
     *
     * @default false
     */
    skipKnownLatest?: boolean;
    /**
     * Force the underlying persistence adapter to disable use of certain
     * database indexes. This option exists for purposes of testing fallback
     * behavior for persistence query generation failure. You probably don't
     * need to use this, but it may help diagnose problems when using the SQLite
     * adapter if you see errors about excessive SQL query parameters.
     *
     * @default false
     */
    disableIndex?: boolean;
};
/**
 * Options for constructing a [[Network]] abstraction, required by
 * [[initialize | `initialize()`]].
 *
 * These options must include either:
 *   - `db`, a [[Db]] instance and `provider`, JSON-RPC provider
 *     (for normal use), or
 *   - `run`, a provider-enabled [[Process.ProcessorRunner]] function, e.g. one
 *     instantiated via [[Process.Run.forDb]] (for internal/special-case use).
 *
 * In addition, these options must contain `network` with `name` information,
 * as per the [[DataModel.NetworkInput | Network input]] specification.
 *
 * Optionally this may include `settings` to specify [[IncludeSettings]].
 *
 * @category Constructor
 */
export declare type InitializeOptions = {
    network: Omit<Input<"networks">, "networkId" | "historicBlock">;
    settings?: IncludeSettings;
} & ({
    db: Db;
    provider: Provider;
} | ReturnType<ReturnType<typeof Process.Run.forDb>["forProvider"]>);
/**
 * Construct a [[Network]] abstraction for given [[InitializeOptions]].
 *
 * Example:
 * ```typescript
 * import type { Provider } from "web3/providers";
 * import { db, Network } from "@truffle/db";
 *
 * declare const provider: Provider; // obtain this somehow
 *
 * const db = connect({
 *   // ...
 * });
 *
 * const network = await Network.initialize({
 *   db,
 *   provider,
 *   network: {
 *     name: "mainnet"
 *   }
 * });
 * ```
 *
 * @category Constructor
 */
export declare function initialize(options: InitializeOptions): Promise<Network>;
/**
 * @category Abstraction
 */
export declare class Network {
    /**
     * Network resource ([[DataModel.Network | Resources.Resource<"networks">]])
     * representing the genesis block for the connected blockchain.
     *
     * @category Resource accessors
     */
    get genesis(): NetworkResource;
    /**
     * Network resource ([[DataModel.Network | Resources.Resource<"networks">]])
     * representing the latest known block for the connected blockchain.
     *
     * After [[initialize | `Network.initialize()`]], [[`includeLatest`]],
     * [[`includeBlocks`]], and [[`includeTransactions`]], by default this value
     * will be computed (or re-computed) based on inputs as well as queried
     * records in \@truffle/db already. Use `skipKnownLatest` option in
     * [[IncludeSettings]] to update based only on existing known latest and
     * additional inputs.
     *
     * @category Resource accessors
     */
    get knownLatest(): NetworkResource;
    /**
     * Fetch the latest block for the connected blockchain and load relevant
     * resources into @truffle/db in order to link with existing records.
     *
     * See [[includeBlocks]] for more detail.
     *
     * @category Methods
     */
    includeLatest(options?: {
        settings?: IncludeSettings;
    }): Promise<IdObject<"networks"> | undefined>;
    /**
     * Fetch blocks for given transaction hashes for the connected blockchain
     * and load relevant resources into @truffle/db in order to link with
     * existing records.
     *
     * See [[includeBlocks]] for more detail.
     *
     * @category Methods
     */
    includeTransactions(options: {
        transactionHashes: (string | undefined)[];
        settings?: IncludeSettings;
    }): Promise<(IdObject<"networks"> | undefined)[]>;
    /**
     * **Load relevant resources into @truffle/db for a given set of blocks for
     * the connected blockchain.** Provide either height or height and hash for
     * each block; this method will fetch hashes for block heights for any blocks
     * provided without hash.
     *
     * This method queries @truffle/db for existing resources to build a sparse
     * model of the relationships between blockchain networks. This mechanism
     * identifies blockchain networks as
     * [[DataModel.Network | Network]] resources and
     * utilizes a system of
     * [[DataModel.NetworkGenealogy | NetworkGenealogy]]
     * resources to identify blocks as being ancestor or descendant to one
     * another. **This allows @truffle/db to maintain a continuous view of any
     * particular blockchain while respecting that networks may hard-fork or
     * re-organize in the future.**
     *
     * To complete these linkages, this method alternately queries @truffle/db
     * for candidate ancestors/descendants and fetches actual records from the
     * connected blockchain itself until it finds an optimal match.
     * This process operates in logarithmic time and logarithmic space based on
     * the number of existing known blocks in the system and the number of blocks
     * provided as input.
     *
     * **Note**: Despite optimizing for speed and memory usage, this process can
     * nonetheless still perform a significant number of network requests and
     * internal database reads. Although this system has been tested to perform
     * satisfactorily against tens of thousands of blocks with multiple hardfork
     * scenarios, this abstraction provides a few [[IncludeSettings]] to migitate
     * unforeseen issues.
     *
     * This returns an [[IdObject]] for each [[DataModel.Network]] resource added
     * in the process. Return values are ordered so that indexes of returned IDs
     * correspond to indexes of provided blocks; any blocks that fail to load
     * successfully will correspond to values of `null` or `undefined` in the
     * resulting array.
     *
     * @category Methods
     */
    includeBlocks<Block extends DataModel.Block | Omit<DataModel.Block, "hash">>(options: {
        blocks: (Block | undefined)[];
        settings?: IncludeSettings;
    }): Promise<(IdObject<"networks"> | undefined)[]>;
    /**
     * @hidden
     */
    private _genesis;
    /**
     * @hidden
     */
    private _knownLatest;
    /**
     * @hidden
     */
    private run;
    /**
     * @hidden
     */
    static collectBlocks(options: {
        run: Process.ProcessorRunner;
        network: Pick<Input<"networks">, "name" | "networkId">;
        blocks: (DataModel.Block | undefined)[];
        settings?: {
            skipKnownLatest?: boolean;
            disableIndex?: boolean;
        };
    }): Promise<{
        networks: (NetworkResource | undefined)[];
        latest: NetworkResource | undefined;
    }>;
    /**
     * @ignore
     */
    constructor(options: {
        genesis: NetworkResource;
        latest?: NetworkResource;
        run: Process.ProcessorRunner;
    });
}
