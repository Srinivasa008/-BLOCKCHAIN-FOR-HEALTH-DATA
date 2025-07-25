"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Network = exports.initialize = exports.Load = exports.Query = exports.Fetch = void 0;
/**
 * # Network abstraction for @truffle/db
 *
 * This provides a TypeScript (or JavaScript) interface for loading blockchain
 * network information into a running [[Db]].
 *
 * See the [Network abstraction](../#network-abstraction) section of this
 * documentation's index page for an overview of the purpose this abstraction
 * serves, or see the [[Network.includeBlocks | `Network.includeBlocks()`]]
 * method documentation for a bit more detail.
 *
 * @packageDocumentation
 */
const logger_1 = require("../logger");
const debug = logger_1.logger("db:network");
const Process = __importStar(require("../process"));
const resources_1 = require("../resources/index");
const Fetch = __importStar(require("./fetch/index"));
exports.Fetch = Fetch;
const Query = __importStar(require("./query/index"));
exports.Query = Query;
const Load = __importStar(require("./load/index"));
exports.Load = Load;
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
function initialize(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { run } = "db" in options && "provider" in options
            ? Process.Run.forDb(options.db).forProvider(options.provider)
            : options;
        const { network: { name }, settings } = options;
        const networkId = yield run(Fetch.NetworkId.process);
        const genesisBlock = yield run(Fetch.Block.process, { block: { height: 0 } });
        const { latest, networks: [genesis] } = yield Network.collectBlocks({
            run,
            network: { name, networkId },
            blocks: [genesisBlock],
            settings
        });
        if (!genesis) {
            throw new Error("Unable to fetch genesis block");
        }
        return new Network({ genesis, latest, run });
    });
}
exports.initialize = initialize;
/**
 * @category Abstraction
 */
class Network {
    /**
     * @ignore
     */
    constructor(options) {
        this._genesis = options.genesis;
        this._knownLatest = options.latest || options.genesis;
        this.run = options.run;
    }
    /**
     * Network resource ([[DataModel.Network | Resources.Resource<"networks">]])
     * representing the genesis block for the connected blockchain.
     *
     * @category Resource accessors
     */
    get genesis() {
        return this._genesis;
    }
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
    get knownLatest() {
        return this._knownLatest;
    }
    /**
     * Fetch the latest block for the connected blockchain and load relevant
     * resources into @truffle/db in order to link with existing records.
     *
     * See [[includeBlocks]] for more detail.
     *
     * @category Methods
     */
    includeLatest(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { settings } = options;
            const block = yield this.run(Fetch.Block.process, {
                block: { height: "latest" }
            });
            debug("block %O", block);
            const [network] = yield this.includeBlocks({
                blocks: [block],
                settings
            });
            return network;
        });
    }
    /**
     * Fetch blocks for given transaction hashes for the connected blockchain
     * and load relevant resources into @truffle/db in order to link with
     * existing records.
     *
     * See [[includeBlocks]] for more detail.
     *
     * @category Methods
     */
    includeTransactions(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options.transactionHashes.length === 0) {
                return [];
            }
            const { transactionHashes } = options;
            const blocks = yield Promise.all(transactionHashes.map((transactionHash) => __awaiter(this, void 0, void 0, function* () {
                return transactionHash
                    ? yield this.run(Fetch.TransactionBlock.process, { transactionHash })
                    : undefined;
            })));
            return yield this.includeBlocks({ blocks });
        });
    }
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
    includeBlocks(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options.blocks.length === 0) {
                return [];
            }
            const { settings } = options;
            const blocks = yield Promise.all(options.blocks.map((block) => __awaiter(this, void 0, void 0, function* () {
                return block
                    ? yield this.run(Fetch.Block.process, {
                        block,
                        settings: { skipComplete: true }
                    })
                    : undefined;
            })));
            const { networks, latest } = yield Network.collectBlocks({
                run: this.run,
                network: this.genesis,
                blocks,
                settings
            });
            debug("latest %O", latest);
            if (latest &&
                latest.historicBlock.height > this._knownLatest.historicBlock.height) {
                this._knownLatest = latest;
            }
            return networks.map((network) => resources_1.toIdObject(network));
        });
    }
    /**
     * @hidden
     */
    static collectBlocks(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options.blocks.length === 0) {
                throw new Error("Zero blocks provided.");
            }
            const { run, network: { name, networkId }, blocks, settings: { skipKnownLatest = false, disableIndex = false } = {} } = options;
            debug("blocks %O", blocks);
            const networks = yield run(Load.NetworksForBlocks.process, {
                network: { name, networkId },
                blocks
            });
            yield run(Load.NetworkGenealogies.process, {
                networks,
                settings: { disableIndex }
            });
            debug("networks %O", networks);
            const definedNetworks = networks.filter((network) => !!network);
            const loadedLatest = definedNetworks
                .slice(1)
                .reduce((a, b) => (a.historicBlock.height > b.historicBlock.height ? a : b), definedNetworks[0]);
            const latest = !loadedLatest
                ? undefined
                : skipKnownLatest
                    ? loadedLatest
                    : yield run(Fetch.KnownLatest.process, { network: loadedLatest });
            return {
                networks,
                latest
            };
        });
    }
}
exports.Network = Network;
//# sourceMappingURL=index.js.map