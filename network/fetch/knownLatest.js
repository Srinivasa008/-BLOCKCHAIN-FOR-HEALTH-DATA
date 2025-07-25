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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
const debug = logger_1.logger("db:network:fetch:knownLatest");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const process_1 = require("../../process");
const FetchBlock = __importStar(require("./block"));
let fragmentIndex = 0;
/**
 * Query for latest descendants of a given network and match against what's
 * on chain.
 */
function* process(options) {
    const { network: { id } } = options;
    const resource = yield* process_1.resources.get("networks", id, graphql_tag_1.default `
    fragment LatestDescendants__${fragmentIndex++} on Network {
      id
      name
      networkId
      historicBlock {
        height
        hash
      }
      descendants(
        includeSelf: true
        onlyLatest: true
      ) {
        id
        name
        networkId
        historicBlock {
          height
          hash
        }
      }
    }
  `);
    if (!resource) {
        return;
    }
    const { descendants } = resource, network = __rest(resource, ["descendants"]);
    debug("descendants %O", descendants);
    for (const descendant of descendants.reverse()) {
        const { historicBlock } = descendant;
        const block = yield* FetchBlock.process({
            block: {
                height: historicBlock.height
            }
        });
        if (block && block.hash === historicBlock.hash) {
            // @ts-ignore
            return descendant;
        }
    }
    // @ts-ignore
    return network;
}
exports.process = process;
//# sourceMappingURL=knownLatest.js.map