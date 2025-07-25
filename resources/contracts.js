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
exports.contracts = void 0;
const logger_1 = require("../logger");
const debug = logger_1.logger("db:resources:contracts");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const change_case_1 = require("change-case");
const abi_utils_1 = require("@truffle/abi-utils");
exports.contracts = {
    names: {
        resource: "contract",
        Resource: "Contract",
        resources: "contracts",
        Resources: "Contracts",
        resourcesMutate: "contractsAdd",
        ResourcesMutate: "ContractsAdd"
    },
    createIndexes: [
        {
            fields: ["compilation.id"]
        },
        {
            fields: ["compilation.id", "processedSource.index"]
        }
    ],
    idFields: ["name", "abi", "processedSource", "compilation"],
    typeDefs: graphql_tag_1.default `
    type Contract implements Resource & Named {
      name: String!
      abi: ABI
      compilation: Compilation
      processedSource: ProcessedSource
      createBytecode: Bytecode
      callBytecode: Bytecode
      callBytecodeGeneratedSources: [ProcessedSource]
      createBytecodeGeneratedSources: [ProcessedSource]
    }

    type ABI {
      json: String!
      entries: [Entry]
    }

    input ContractInput {
      name: String!
      abi: ABIInput
      compilation: ResourceReferenceInput
      processedSource: IndexReferenceInput
      createBytecode: ResourceReferenceInput
      callBytecode: ResourceReferenceInput
      callBytecodeGeneratedSources: [ProcessedSourceInput]
      createBytecodeGeneratedSources: [ProcessedSourceInput]
    }

    input IndexReferenceInput {
      index: Int!
    }

    input ABIInput {
      json: String!
    }

    interface Entry {
      type: String!
    }

    enum StateMutability {
      pure
      view
      nonpayable
      payable
    }

    type FunctionEntry implements Entry {
      type: String!
      name: String!
      inputs: [Parameter]!
      outputs: [Parameter]!
      stateMutability: StateMutability!
    }

    type ConstructorEntry implements Entry {
      type: String!
      inputs: [Parameter]!
      stateMutability: StateMutability!
    }

    type FallbackEntry implements Entry {
      type: String!
      stateMutability: StateMutability!
    }

    type ReceiveEntry implements Entry {
      type: String!
      stateMutability: StateMutability!
    }

    type EventEntry implements Entry {
      type: String!
      name: String!
      inputs: [EventParameter]!
      anonymous: Boolean!
    }

    type Parameter {
      name: String!
      type: String!
      components: [Parameter]
      internalType: String
    }

    type EventParameter {
      name: String!
      type: String!
      components: [Parameter]
      internalType: String
      indexed: Boolean!
    }
  `,
    resolvers: {
        Contract: {
            compilation: {
                resolve: (contract, _, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving Contract.compilation...");
                    if (!contract.compilation) {
                        return;
                    }
                    const result = workspace.get("compilations", contract.compilation.id);
                    debug("Resolved Contract.compilation.");
                    return result;
                })
            },
            processedSource: {
                fragment: `... on Contract { compilation { id } }`,
                resolve(contract, _, { workspace }) {
                    return __awaiter(this, void 0, void 0, function* () {
                        debug("Resolving Contract.processedSource...");
                        if (!contract.compilation || !contract.processedSource) {
                            return;
                        }
                        const compilation = yield workspace.get("compilations", contract.compilation.id);
                        if (!compilation) {
                            return;
                        }
                        const { processedSources } = compilation;
                        debug("processedSources %O", processedSources);
                        debug("Resolved Contract.processedSource.");
                        return processedSources[contract.processedSource.index];
                    });
                }
            },
            createBytecode: {
                resolve: ({ createBytecode }, _, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving Contract.createBytecode...");
                    if (!createBytecode) {
                        return;
                    }
                    const { id } = createBytecode;
                    const result = yield workspace.get("bytecodes", id);
                    debug("Resolved Contract.createBytecode.");
                    return result;
                })
            },
            callBytecode: {
                resolve: ({ callBytecode }, _, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving Contract.callBytecode...");
                    if (!callBytecode) {
                        return;
                    }
                    const { id } = callBytecode;
                    const result = yield workspace.get("bytecodes", id);
                    debug("Resolved Contract.callBytecode.");
                    return result;
                })
            }
        },
        ABI: {
            entries: {
                resolve({ json }) {
                    return abi_utils_1.normalize(JSON.parse(json));
                }
            }
        },
        Entry: {
            __resolveType(obj) {
                return `${change_case_1.pascalCase(obj.type)}Entry`;
            }
        }
    }
};
//# sourceMappingURL=contracts.js.map