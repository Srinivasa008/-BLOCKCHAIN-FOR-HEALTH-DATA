"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.networks = void 0;
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:resources:networks");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const resolveRelations_1 = require("./resolveRelations");
const resolvePossibleRelations_1 = require("./resolvePossibleRelations");
exports.networks = {
    names: {
        resource: "network",
        Resource: "Network",
        resources: "networks",
        Resources: "Networks",
        resourcesMutate: "networksAdd",
        ResourcesMutate: "NetworksAdd"
    },
    createIndexes: [
        { fields: ["networkId"] },
        { fields: ["historicBlock.height"] },
        { fields: ["networkId", "historicBlock.height"] }
    ],
    idFields: ["networkId", "historicBlock"],
    typeDefs: graphql_tag_1.default `
    type Network implements Resource & Named {
      name: String!
      networkId: NetworkId!
      historicBlock: Block!

      genesis: Network!

      ancestors(
        limit: Int # default all
        minimumHeight: Int # default any height
        includeSelf: Boolean # default false
        onlyEarliest: Boolean # default false
        batchSize: Int # default 10
      ): [Network!]!

      descendants(
        limit: Int # default all
        maximumHeight: Int # default no height
        includeSelf: Boolean # default false
        onlyLatest: Boolean # default false
        batchSize: Int # default 10
      ): [Network!]!

      possibleAncestors(
        alreadyTried: [ID]!
        limit: Int # will default to 5
        disableIndex: Boolean # for internal use
      ): CandidateSearchResult!

      possibleDescendants(
        alreadyTried: [ID]!
        limit: Int # will default to 5
        disableIndex: Boolean # for internal use
      ): CandidateSearchResult!
    }

    scalar NetworkId

    type Block {
      height: Int!
      hash: String!
    }

    input NetworkInput {
      name: String!
      networkId: NetworkId!
      historicBlock: BlockInput!
    }

    input BlockInput {
      height: Int!
      hash: String!
    }

    type CandidateSearchResult {
      networks: [Network!]!
      alreadyTried: [ID!]! #will include all networks returned
    }
  `,
    resolvers: {
        Network: {
            genesis: {
                resolve(network, _, context) {
                    return __awaiter(this, void 0, void 0, function* () {
                        debug("Resolving Network.genesis...");
                        const results = yield resolveRelations_1.resolveAncestors(network, { onlyEarliest: true, includeSelf: true }, context);
                        const result = results[results.length - 1];
                        if (!result || result.historicBlock.height !== 0) {
                            throw new Error(`No known genesis for network with ID: ${network.id}`);
                        }
                        debug("Resolved Network.genesis.");
                        return result;
                    });
                }
            },
            ancestors: {
                resolve(network, options, context) {
                    return __awaiter(this, void 0, void 0, function* () {
                        debug("Resolving Network.ancestors...");
                        const result = yield resolveRelations_1.resolveAncestors(network, options, context);
                        debug("Resolved Network.ancestors.");
                        return result;
                    });
                }
            },
            descendants: {
                resolve(network, options, context) {
                    return __awaiter(this, void 0, void 0, function* () {
                        debug("Resolving Network.descendants...");
                        const result = yield resolveRelations_1.resolveDescendants(network, options, context);
                        debug("Resolved Network.descendants.");
                        return result;
                    });
                }
            },
            possibleAncestors: {
                resolve(network, options, context) {
                    return __awaiter(this, void 0, void 0, function* () {
                        debug("Resolving Network.possibleAncestors...");
                        const result = yield resolvePossibleRelations_1.resolvePossibleAncestors(network, options, context);
                        debug("Resolved Network.possibleAncestors.");
                        return result;
                    });
                }
            },
            possibleDescendants: {
                resolve(network, options, context) {
                    return __awaiter(this, void 0, void 0, function* () {
                        debug("Resolving Network.possibleDescendants...");
                        const result = yield resolvePossibleRelations_1.resolvePossibleDescendants(network, options, context);
                        debug("Resolved Network.possibleDescendants.");
                        return result;
                    });
                }
            }
        },
        CandidateSearchResult: {
            networks: {
                resolve: (parent, __, {}) => __awaiter(void 0, void 0, void 0, function* () {
                    return parent.networks;
                })
            },
            alreadyTried: {
                resolve: (parent, __, {}) => {
                    return parent.alreadyTried;
                }
            }
        }
    }
};
//# sourceMappingURL=index.js.map