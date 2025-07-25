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
const debug = logger_1.logger("db:network:query:ancestorsBetween");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const process_1 = require("../../process");
let fragmentIndex = 0;
/**
 * Find all ancestors of provided latest network back to provided earliest
 * network.
 */
function* process(options) {
    if (!options.latest) {
        return [];
    }
    const { earliest: { historicBlock: { height: minimumHeight } } = {
        historicBlock: { height: 0 }
    }, latest: { id } } = options;
    const latest = yield* process_1.resources.get("networks", id, graphql_tag_1.default `
    fragment AncestorsAbove_${fragmentIndex++} on Network {
      ancestors(
        minimumHeight: ${minimumHeight}
        includeSelf: true
      ) {
        id
        historicBlock {
          height
          hash
        }
      }
    }
  `);
    if (!latest) {
        throw new Error("Error getting network ancestors");
    }
    const { ancestors: networks } = latest;
    debug("networks %O", networks);
    return networks.reverse();
}
exports.process = process;
//# sourceMappingURL=ancestorsBetween.js.map