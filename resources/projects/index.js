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
exports.projects = void 0;
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:resources:projects");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const resolveNameRecords_1 = require("./resolveNameRecords");
const resolveContractInstances_1 = require("./resolveContractInstances");
exports.projects = {
    names: {
        resource: "project",
        Resource: "Project",
        resources: "projects",
        Resources: "Projects",
        resourcesMutate: "projectsAdd",
        ResourcesMutate: "ProjectsAdd"
    },
    createIndexes: [],
    idFields: ["directory"],
    typeDefs: graphql_tag_1.default `
    type Project implements Resource {
      directory: String!

      contract(name: String!): Contract
      contracts: [Contract!]!

      network(name: String!): Network
      networks: [Network!]!

      contractInstance(
        contract: ResourceNameInput
        address: Address
        network: ResourceNameInput!
      ): ContractInstance
      contractInstances(
        contract: ResourceNameInput
        network: ResourceNameInput
      ): [ContractInstance!]!

      resolve(type: String, name: String): [NameRecord!] # null means unknown type
    }

    input ProjectInput {
      directory: String!
    }
  `,
    resolvers: {
        Project: {
            resolve: {
                resolve: (...args) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving Project.resolve...");
                    const result = yield resolveNameRecords_1.resolveNameRecords(...args);
                    debug("Resolved Project.resolve.");
                    return result;
                })
            },
            network: {
                resolve: (project, { name }, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving Project.network...");
                    const [nameRecord] = yield resolveNameRecords_1.resolveNameRecords(project, { name, type: "Network" }, { workspace });
                    if (!nameRecord) {
                        return;
                    }
                    const { resource } = nameRecord;
                    const result = yield workspace.get("networks", resource.id);
                    debug("Resolved Project.network.");
                    return result;
                })
            },
            networks: {
                resolve: (project, _, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving Project.networks...");
                    const nameRecords = yield resolveNameRecords_1.resolveNameRecords(project, { type: "Network" }, { workspace });
                    const result = yield workspace.find("networks", nameRecords.map(nameRecord => nameRecord
                        ? nameRecord.resource
                        : undefined));
                    debug("Resolved Project.networks.");
                    return result;
                })
            },
            contract: {
                resolve: (project, inputs, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving Project.contract...");
                    const [nameRecord] = yield resolveNameRecords_1.resolveNameRecords(project, inputs, {
                        workspace
                    });
                    if (!nameRecord) {
                        return;
                    }
                    const { resource } = nameRecord;
                    const result = yield workspace.get("contracts", resource.id);
                    debug("Resolved Project.contract.");
                    return result;
                })
            },
            contracts: {
                resolve: (project, _, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving Project.contracts...");
                    const nameRecords = yield resolveNameRecords_1.resolveNameRecords(project, { type: "Contract" }, { workspace });
                    const result = yield workspace.find("contracts", nameRecords.map(nameRecord => nameRecord
                        ? nameRecord.resource
                        : undefined));
                    debug("Resolved Project.contracts.");
                    return result;
                })
            },
            contractInstance: {
                resolve(project, inputs, context, info) {
                    return __awaiter(this, void 0, void 0, function* () {
                        debug("Resolving Project.contractInstance...");
                        const [result] = yield resolveContractInstances_1.resolveContractInstances(project, inputs, context, info);
                        debug("Resolved Project.contractInstance.");
                        return result;
                    });
                }
            },
            contractInstances: {
                resolve(project, inputs, context, info) {
                    return __awaiter(this, void 0, void 0, function* () {
                        debug("Resolving Project.contractInstances...");
                        const result = yield resolveContractInstances_1.resolveContractInstances(project, inputs, context, info);
                        debug("Resolved Project.contractInstances.");
                        return result;
                    });
                }
            }
        }
    }
};
//# sourceMappingURL=index.js.map