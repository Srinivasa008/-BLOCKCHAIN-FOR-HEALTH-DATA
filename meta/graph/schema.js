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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forDefinitions = void 0;
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:meta:graph:schema");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const schema_1 = require("@graphql-tools/schema");
const Id = __importStar(require("../id/index"));
const forDefinitions = (definitions) => {
    const { typeDefs, resolvers } = new DefinitionsSchema({ definitions });
    return schema_1.makeExecutableSchema({ typeDefs, resolvers });
};
exports.forDefinitions = forDefinitions;
class DefinitionsSchema {
    constructor(options) {
        this.definitions = options.definitions;
        this.generateId = Id.forDefinitions(options.definitions);
        // @ts-ignore
        this.collections = Object.keys(options.definitions)
            .map((resource) => ({
            [resource]: this.createSchema(resource)
        }))
            .reduce((a, b) => (Object.assign(Object.assign({}, a), b)), {});
    }
    get typeDefs() {
        const log = debug.extend("typeDefs");
        log("Generating...");
        const common = graphql_tag_1.default `
      type Query
      type Mutation

      interface Resource {
        id: ID!
        type: String!
      }

      interface Named {
        id: ID!
        type: String!
        name: String!
      }

      input ResourceReferenceInput {
        id: ID!
      }

      input ResourceNameInput {
        name: String!
      }

      input TypedResourceReferenceInput {
        id: ID!
        type: String!
      }

      input QueryFilter {
        ids: [ID]!
      }
    `;
        const result = Object.values(this.collections)
            .map(schema => schema.typeDefs)
            .reduce((a, b) => [...a, ...b], [common]);
        log("Generated.");
        return result;
    }
    get resolvers() {
        const log = debug.extend("resolvers");
        log("Generating...");
        const common = {
            Query: {},
            Mutation: {},
            // HACK bit messy to put this here
            Named: {
                __resolveType: obj => {
                    if (obj.networkId) {
                        return "Network";
                    }
                    else if (obj.abi) {
                        return "Contract";
                    }
                    else {
                        return null;
                    }
                }
            }
        };
        const result = Object.values(this.collections).reduce((a, { resolvers: b }) => (Object.assign(Object.assign(Object.assign({}, a), b), { Query: Object.assign(Object.assign({}, a.Query), b.Query), Mutation: Object.assign(Object.assign({}, a.Mutation), b.Mutation) })), common);
        log("Generated.");
        return result;
    }
    createSchema(resource) {
        debug("Creating DefinitonSchema for %s...", resource);
        const generateId = input => this.generateId(resource, input);
        const definition = this.definitions[resource];
        if (definition.mutable) {
            const result = new MutableDefinitionSchema({
                resource,
                definition,
                generateId
            });
            debug("Created MutableDefinitonSchema for %s.", resource);
            return result;
        }
        const result = new ImmutableDefinitionSchema({
            resource,
            definition,
            generateId
        });
        debug("Created ImmutableDefinitionSchema for %s.", resource);
        return result;
    }
}
class DefinitionSchema {
    constructor(options) {
        this.resource = options.resource;
        this.definition = options.definition;
        this.generateId = options.generateId;
    }
    get typeDefs() {
        const log = debug.extend(`${this.resource}:typeDefs`);
        log("Generating...");
        const { typeDefs } = this.definition;
        const { resource, resources, Resource, resourcesMutate, ResourcesMutate } = this.definition.names;
        const result = [
            graphql_tag_1.default `
      ${typeDefs}

      extend type ${Resource} {
        id: ID!
        type: String!
      }

      extend type Query {
        ${resources}(filter: QueryFilter): [${Resource}]!
        ${resource}(id: ID!): ${Resource}
        ${resource}Id(input: ${Resource}Input!): ID!
      }

      input ${ResourcesMutate}Input {
        ${resources}: [${Resource}Input]!
      }

      type ${ResourcesMutate}Payload {
        ${resources}: [${Resource}]!
      }

      extend type Mutation {
        ${resourcesMutate}(
          input: ${ResourcesMutate}Input!
        ): ${ResourcesMutate}Payload!
      }
    `
        ];
        log("Generated.");
        return result;
    }
    get resolvers() {
        const log = debug.extend(`${this.resource}:resolvers`);
        log("Generating...");
        // setup loggers for specific resolvers
        const logGet = log.extend("get");
        const logAll = log.extend("all");
        const logFilter = log.extend("filter");
        const { resource, resources, Resource } = this.definition.names;
        const { resolvers = {} } = this.definition;
        const result = Object.assign(Object.assign({}, resolvers), { [Resource]: Object.assign(Object.assign({}, resolvers[Resource]), { type: () => Resource }), Query: {
                [resource]: {
                    resolve: (_, { id }, { workspace }) => __awaiter(this, void 0, void 0, function* () {
                        logGet("Getting id: %s...", id);
                        const result = yield workspace.get(resources, id);
                        logGet("Got id: %s.", id);
                        return result;
                    })
                },
                [resources]: {
                    resolve: (_, { filter }, { workspace }) => __awaiter(this, void 0, void 0, function* () {
                        if (filter) {
                            logFilter("Filtering for ids: %o...", filter.ids);
                            const results = yield workspace.find(resources, filter.ids.map(id => ({ id })));
                            logFilter("Filtered for ids: %o", filter.ids);
                            return results;
                        }
                        else {
                            logAll("Fetching all...");
                            const result = yield workspace.all(resources);
                            logAll("Fetched all.");
                            return result;
                        }
                    })
                },
                [`${resource}Id`]: {
                    resolve: (_, { input }) => {
                        debug("resolving %O id", Resource);
                        return this.generateId(input);
                    }
                }
            } });
        log("Generated.");
        return result;
    }
}
class ImmutableDefinitionSchema extends DefinitionSchema {
    get resolvers() {
        const log = debug.extend(`${this.resource}:resolvers`);
        log("Generating...");
        const logMutate = log.extend("add");
        const { resources, resourcesMutate } = this.definition.names;
        const result = Object.assign(Object.assign({}, super.resolvers), { Mutation: {
                [resourcesMutate]: (_, { input }, { workspace }) => __awaiter(this, void 0, void 0, function* () {
                    logMutate("Mutating...");
                    const result = yield workspace.add(resources, input);
                    logMutate("Mutated.");
                    return result;
                })
            } });
        log("Generated.");
        return result;
    }
}
class MutableDefinitionSchema extends DefinitionSchema {
    get resolvers() {
        const log = debug.extend(`${this.resource}:resolvers`);
        log("Generating...");
        const logMutate = log.extend("assign");
        const { resources, resourcesMutate } = this.definition.names;
        const result = Object.assign(Object.assign({}, super.resolvers), { Mutation: {
                [resourcesMutate]: (_, { input }, { workspace }) => __awaiter(this, void 0, void 0, function* () {
                    logMutate("Mutating...");
                    const result = yield workspace.update(resources, input);
                    logMutate("Mutated.");
                    return result;
                })
            } });
        log("Generated.");
        return result;
    }
}
//# sourceMappingURL=schema.js.map