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
Object.defineProperty(exports, "__esModule", { value: true });
exports.process = void 0;
/**
 * @category Internal processor
 * @packageDocumentation
 */
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:network:load:networkGenealogies");
const resources_1 = require("../../resources/index");
const process_1 = require("../../process");
const Query = __importStar(require("../query/index"));
/**
 * Load NetworkGenealogy records for a given set of networks while connected
 * to a blockchain with a provider.
 *
 * We take, as a **precondition**, that all relevant networks are actually
 * part of the same blockchain; i.e., that networks with later historic blocks
 * do in fact descend from networks with earlier historic blocks in the list.
 *
 * Using this assumption, the process is as follows:
 *
 *   1. Sort input networks by block height, filtering out missing values
 *      (since input array can be sparse)
 *
 *   2. Find up to three existing networks in the system that are valid for
 *      the currently connected blockchain ("anchors"):
 *
 *      a. the ancestor of the earliest input network
 *      b. the ancestor of the latest input network
 *      c. the descendant of the latest input network
 *
 *   3. If **2.a.** and **2.b.** are different, find the existing networks
 *      between those (i.e., all of **2.b.**'s ancestors back to **2.a.***).
 *
 *      *****: _**2.a.** is guaranteed to be an ancestor of **2.b.** because of
 *      the above precondition._
 *
 *   4. Merge the following networks into a sorted list:
 *      - all input networks
 *      - any/all existing networks in range determined by step **3.**,
 *        including the boundary condition networks from **2.a.** and **2.b.**
 *      - network from **2.c.**, if it exists.
 *
 *   5. For each pair of networks in this list, generate a corresponding
 *      [[[DataModel.NetworkGenealogyInput | NetworkGenealogyInput] whose
 *      ancestor/descendant are [[DataModel.Network | Networks]] from the
 *      earlier/later item in the pair, respectively.
 *
 *   6. Load these genealogy inputs.
 */
function* process(options) {
    debug("Processing loading network genealogies...");
    const { settings: { disableIndex = false } = {} } = options;
    // sort by historic block height
    const inputNetworks = collectNetworks(options);
    if (!inputNetworks.length) {
        return [];
    }
    const earliestInputNetwork = inputNetworks[0];
    const latestInputNetwork = inputNetworks[inputNetworks.length - 1];
    const commonOptions = {
        disableIndex,
        exclude: inputNetworks.map(network => resources_1.toIdObject(network))
    };
    // find anchors
    //
    const earliestInputNetworkAncestor = yield* Query.Relation.process(Object.assign(Object.assign({}, commonOptions), { relationship: "ancestor", network: resources_1.toIdObject(earliestInputNetwork) }));
    const latestInputNetworkAncestor = yield* Query.Relation.process(Object.assign(Object.assign({}, commonOptions), { relationship: "ancestor", network: resources_1.toIdObject(latestInputNetwork) }));
    const latestInputNetworkDescendant = yield* Query.Relation.process(Object.assign(Object.assign({}, commonOptions), { relationship: "descendant", network: resources_1.toIdObject(latestInputNetwork) }));
    // find ancestor to latest input network and use that to find ancestors
    // in our input range
    const existingRelationsInRange = yield* Query.AncestorsBetween.process({
        earliest: earliestInputNetworkAncestor,
        latest: latestInputNetworkAncestor
    });
    // sort all these networks by block height and remove missing
    const networks = collectNetworks({
        networks: [
            earliestInputNetworkAncestor,
            ...inputNetworks,
            ...existingRelationsInRange,
            latestInputNetworkDescendant
        ]
    });
    // build pairwise genealogy inputs
    const networkGenealogies = collectPairwiseGenealogies({
        networks
    });
    // and load
    const results = yield* process_1.resources.load("networkGenealogies", networkGenealogies);
    debug("Processing loading network genealogies...");
    return results.filter((resource) => !!resource);
}
exports.process = process;
/**
 * Given a sparsely-populated list of networks from the same blockchain, sort
 * networks by block height.
 */
function collectNetworks(options) {
    debug("networks %O", options.networks);
    // start by ordering non-null networks by block height
    const networks = options.networks
        .filter((network) => !!network)
        .sort((a, b) => a.historicBlock.height - b.historicBlock.height);
    // return sorted networks
    return networks;
}
/**
 * Given a sorted list of networks, form pairwise NetworkGenealogyInputs where
 * the ancestor is the earlier in the pair and descendant is later in the pair.
 */
function collectPairwiseGenealogies(options) {
    const { networks } = options;
    // handle all-null case
    if (networks.length < 1) {
        return [];
    }
    const initialAccumulator = {
        ancestor: resources_1.toIdObject(networks[0]),
        networkGenealogies: []
    };
    // starting after the first ancestor, reduce over each subsequent Network
    // to construct pairwise NetworkGenealogyInputs
    const { networkGenealogies } = networks.slice(1).reduce(({ ancestor, networkGenealogies }, descendant) => ({
        ancestor: resources_1.toIdObject(descendant),
        networkGenealogies: ancestor.id === descendant.id
            ? networkGenealogies
            : [
                ...networkGenealogies,
                {
                    ancestor,
                    descendant: resources_1.toIdObject(descendant)
                }
            ]
    }), initialAccumulator);
    // return pairwise genealogies
    return networkGenealogies;
}
//# sourceMappingURL=networkGenealogies.js.map