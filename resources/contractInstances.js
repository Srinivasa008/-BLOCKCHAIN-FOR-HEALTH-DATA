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
exports.contractInstances = void 0;
const logger_1 = require("../logger");
const debug = logger_1.logger("db:resources:contractInstances");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.contractInstances = {
    names: {
        resource: "contractInstance",
        Resource: "ContractInstance",
        resources: "contractInstances",
        Resources: "ContractInstances",
        resourcesMutate: "contractInstancesAdd",
        ResourcesMutate: "ContractInstancesAdd"
    },
    createIndexes: [{ fields: ["contract.id"] }],
    idFields: ["contract", "address", "creation"],
    typeDefs: graphql_tag_1.default `
    type ContractInstance implements Resource {
      address: Address!
      network: Network!
      creation: ContractInstanceCreation
      callBytecode: LinkedBytecode!
      contract: Contract
    }

    scalar Address

    type ContractInstanceCreation {
      transactionHash: TransactionHash
      constructor: Constructor
    }

    scalar TransactionHash

    scalar ConstructorArgument

    type Constructor {
      createBytecode: LinkedBytecode
      calldata: Bytes
    }

    type LinkedBytecode {
      bytecode: Bytecode!
      linkValues: [LinkValue]!
    }

    type LinkValue {
      linkReference: LinkReference!
      value: Bytes
    }

    input ContractInstanceInput {
      address: Address!
      network: ResourceReferenceInput
      creation: ContractInstanceCreationInput
      contract: ResourceReferenceInput
      callBytecode: LinkedBytecodeInput
    }

    input ContractInstanceCreationInput {
      transactionHash: TransactionHash
      constructor: ConstructorInput!
    }

    input ConstructorInput {
      createBytecode: LinkedBytecodeInput!
    }

    input LinkedBytecodeInput {
      bytecode: ResourceReferenceInput
      linkValues: [LinkValueInput]
    }

    input LinkValueInput {
      value: Address!
      linkReference: LinkValueLinkReferenceInput!
    }

    input LinkValueLinkReferenceInput {
      bytecode: ResourceReferenceInput!
      index: Int
    }
  `,
    resolvers: {
        ContractInstance: {
            network: {
                resolve: ({ network: { id } }, _, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving ContractInstance.network...");
                    const result = yield workspace.get("networks", id);
                    debug("Resolved ContractInstance.network.");
                    return result;
                })
            },
            contract: {
                resolve: ({ contract: { id } }, _, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving ContractInstance.contract...");
                    const result = yield workspace.get("contracts", id);
                    debug("Resolved ContractInstance.contract.");
                    return result;
                })
            },
            callBytecode: {
                resolve: ({ callBytecode }, _, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving ContractInstance.callBytecode...");
                    const bytecode = yield workspace.get("bytecodes", callBytecode.bytecode.id);
                    if (!bytecode) {
                        return;
                    }
                    const linkValues = callBytecode.linkValues.map(({ value, linkReference }) => {
                        return {
                            value: value,
                            linkReference: (bytecode.linkReferences || [])[linkReference.index]
                        };
                    });
                    debug("Resolved ContractInstance.callBytecode.");
                    return {
                        bytecode: bytecode,
                        linkValues: linkValues
                    };
                })
            },
            creation: {
                resolve: (input, _, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving ContractInstance.creation...");
                    let bytecode = yield workspace.get("bytecodes", input.creation.constructor.createBytecode.bytecode.id);
                    let transactionHash = input.creation.transactionHash;
                    let linkValues = input.creation.constructor.createBytecode.linkValues.map(({ value, linkReference }) => {
                        return {
                            value: value,
                            linkReference: ((bytecode === null || bytecode === void 0 ? void 0 : bytecode.linkReferences) || [])[linkReference.index]
                        };
                    });
                    debug("Resolved ContractInstance.creation.");
                    return {
                        transactionHash: transactionHash,
                        constructor: {
                            createBytecode: {
                                bytecode: bytecode,
                                linkValues: linkValues
                            }
                        }
                    };
                })
            }
        }
    }
};
//# sourceMappingURL=contractInstances.js.map