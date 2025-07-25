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
const debug = logger_1.logger("db:network:query:relation");
const Fetch = __importStar(require("../fetch/index"));
const QueryNextPossiblyRelatedNetworks = __importStar(require("./nextPossiblyRelatedNetworks"));
/**
 * Issue GraphQL requests and eth_getBlockByNumber requests to determine if any
 * existing Network resources are ancestor or descendant of the connected
 * Network.
 *
 * Iteratively, this queries all possibly-related Networks for known historic
 * block. For each possibly-related Network, issue a corresponding web3 request
 * to determine if the known historic block is, in fact, the connected
 * blockchain's record of the block at that historic height.
 *
 * This queries @truffle/db for possibly-related Networks in batches, keeping
 * track of new candidates vs. what has already been tried.
 */
function* process(options) {
    const { relationship, network, exclude = [], disableIndex = false } = options;
    // since we're doing this iteratively, track what we've already tried to
    // exclude from further consideration.
    //
    // use provided `exclude` list for initial value
    let alreadyTried = exclude.map(({ id }) => id);
    let candidates;
    do {
        // query graphql for new candidates
        ({
            networks: candidates,
            alreadyTried
        } = yield* QueryNextPossiblyRelatedNetworks.process({
            relationship,
            network,
            alreadyTried,
            disableIndex
        }));
        // check blockchain to find a matching network
        for (const candidate of candidates) {
            const { historicBlock } = candidate;
            const block = yield* Fetch.Block.process({
                block: {
                    height: historicBlock.height
                }
            });
            if (block && block.hash === historicBlock.hash) {
                return candidate;
            }
        }
    } while (candidates.length > 0);
    // otherwise we got nothin'
}
exports.process = process;
//# sourceMappingURL=relation.js.map