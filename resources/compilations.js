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
exports.compilations = void 0;
const logger_1 = require("../logger");
const debug = logger_1.logger("db:resources:compilations");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.compilations = {
    names: {
        resource: "compilation",
        Resource: "Compilation",
        resources: "compilations",
        Resources: "Compilations",
        resourcesMutate: "compilationsAdd",
        ResourcesMutate: "CompilationsAdd"
    },
    createIndexes: [],
    idFields: ["compiler", "sources"],
    typeDefs: graphql_tag_1.default `
    type Compilation implements Resource {
      compiler: Compiler!
      sources: [Source]!
      processedSources: [ProcessedSource]!
      sourceMaps: [SourceMap]
      contracts: [Contract]!
      immutableReferences: [ImmutableReference]!
    }

    type ImmutableReference {
      astNode: String!
      bytecode: Bytecode!
      length: Int!
      offsets: [ByteOffset!]!
    }

    input ImmutableReferenceInput {
      astNode: String!
      bytecode: ResourceReferenceInput!
      length: Int!
      offsets: [ByteOffset!]!
    }

    type Compiler {
      name: String!
      version: String!
      settings: CompilerSettings
    }

    scalar CompilerSettings

    type ProcessedSource {
      source: Source!
      contracts: [Contract!]
      ast: AST
      language: String!
    }

    type AST {
      json: String!
    }

    type SourceMap {
      bytecode: Bytecode!
      data: String!
    }

    input CompilationInput {
      compiler: CompilerInput!
      processedSources: [ProcessedSourceInput]!
      sources: [ResourceReferenceInput]!
      sourceMaps: [SourceMapInput]
      immutableReferences: [ImmutableReferenceInput]
    }

    input CompilerInput {
      name: String!
      version: String!
      settings: CompilerSettings
    }

    input ProcessedSourceInput {
      source: ResourceReferenceInput
      ast: ASTInput
      language: String!
    }

    input ASTInput {
      json: String!
    }

    input SourceMapInput {
      bytecode: ResourceReferenceInput!
      data: String!
    }
  `,
    resolvers: {
        Compilation: {
            sources: {
                resolve: ({ sources }, _, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving Compilation.sources...");
                    const result = yield Promise.all(sources.map(source => source && workspace.get("sources", source.id)));
                    debug("Resolved Compilation.sources.");
                    return result;
                })
            },
            processedSources: {
                resolve: ({ id, processedSources }, _, {}) => {
                    debug("Resolving Compilation.processedSources...");
                    const result = processedSources.map((processedSource, index) => (Object.assign(Object.assign({}, processedSource), { compilation: { id }, index })));
                    debug("Resolved Compilation.processedSources.");
                    return result;
                }
            },
            contracts: {
                resolve: ({ id }, _, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving Compilation.contracts...");
                    const result = yield workspace.find("contracts", {
                        selector: {
                            "compilation.id": id
                        }
                    });
                    debug("Resolved Compilation.contracts.");
                    return result;
                })
            }
        },
        SourceMap: {
            bytecode: {
                resolve({ bytecode: { id } }, _, { workspace }) {
                    return __awaiter(this, void 0, void 0, function* () {
                        debug("Resolving SourceMap.bytecode...");
                        const result = yield workspace.get("bytecodes", id);
                        debug("Resolved SourceMap.bytecode.");
                        return result;
                    });
                }
            }
        },
        ProcessedSource: {
            source: {
                resolve: ({ source: { id } }, _, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving ProcessedSource.source...");
                    const result = yield workspace.get("sources", id);
                    debug("Resolved ProcessedSource.source.");
                    return result;
                })
            },
            contracts: {
                resolve: ({ compilation, index }, _, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving ProcessedSource.compilation...");
                    const result = yield workspace.find("contracts", {
                        selector: {
                            "compilation.id": compilation.id,
                            "processedSource.index": index
                        }
                    });
                    debug("Resolved ProcessedSource.compilation.");
                    return result;
                })
            }
        },
        ImmutableReference: {
            bytecode: {
                resolve: ({ bytecode: { id } }, _, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving ImmutableReference.bytecode");
                    return yield workspace.get("bytecodes", id);
                })
            }
        }
    }
};
//# sourceMappingURL=compilations.js.map