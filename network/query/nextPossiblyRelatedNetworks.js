"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.process = void 0;
/**
 * @category Internal processor
 * @packageDocumentation
 */
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:network:query:nextPossiblyRelatedNetworks");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const process_1 = require("../../process");
let fragmentIndex = 0;
/**
 * Issue GraphQL queries for possibly-related networks.
 *
 * This is called repeatedly, passing the resulting `alreadyTried` to the next
 * invocation.
 */
function* process(options) {
    const { relationship, network: { id }, alreadyTried, disableIndex } = options;
    // determine GraphQL query to invoke based on requested relationship
    const query = relationship === "ancestor" ? "possibleAncestors" : "possibleDescendants";
    debug("finding %s", query);
    // query graphql for new candidates
    let result;
    try {
        const network = yield* process_1.resources.get("networks", id, graphql_tag_1.default `
        fragment Possible_${relationship}s_${fragmentIndex++} on Network {
          ${query}(
            alreadyTried: ${JSON.stringify(alreadyTried)}
            ${disableIndex ? "disableIndex: true" : ""}
          ) {
            networks {
              id
              historicBlock {
                hash
                height
              }
            }
            alreadyTried {
              id
            }
          }
        }
      `);
        if (!network) {
            throw new Error(`Error getting ${query}`);
        }
        ({ [query]: result } = network);
    }
    catch (error) {
        debug("error %o", error);
    }
    debug("candidate networks %o", result.networks);
    return result;
}
exports.process = process;
//# sourceMappingURL=nextPossiblyRelatedNetworks.js.map