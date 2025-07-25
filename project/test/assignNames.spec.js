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
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:project:test:assignNames");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const db_1 = require("../../index");
const helpers = (db, project) => ({
    addContract(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data: { contractsAdd: { contracts: [contract] } } } = yield db.execute(graphql_tag_1.default `
        mutation AddContract($input: ContractInput!) {
          contractsAdd(input: { contracts: [$input] }) {
            contracts {
              id
            }
          }
        }
      `, { input });
            return contract;
        });
    },
    resolveContractNameRecord(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data: { project: { resolve } } } = yield db.execute(graphql_tag_1.default `
        query ResolveContractNameRecord($name: String!) {
          project(id: "${project.id}") {
            resolve(name: $name, type: "Contract") {
              id
              resource {
                id
              }
              previous {
                id
                resource {
                  id
                }
              }
            }
          }
        }
      `, { name });
            debug("resolve %O", resolve);
            const [nameRecord] = resolve;
            return nameRecord;
        });
    }
});
describe("Project.assignNames", () => {
    let db, project;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const config = {
            working_directory: "/Project.assignNames",
            db: {
                adapter: {
                    name: "memory"
                }
            }
        };
        // @ts-ignore
        db = yield db_1.connect(config);
        project = yield db_1.Project.initialize({
            db,
            project: {
                directory: config.working_directory
            }
        });
    }));
    it("aborts if specified resources don't exist", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(project.assignNames({
            assignments: {
                networks: [{ id: "0xdeadbeef" }, { id: "pizza" }]
            }
        })).rejects.toThrow("Unknown networks: 0xdeadbeef, pizza");
    }));
    it("resolves to new contract with no prior contract", () => __awaiter(void 0, void 0, void 0, function* () {
        const { addContract, resolveContractNameRecord } = helpers(db, project);
        const contract = yield addContract({
            name: "A",
            abi: {
                json: "[]"
            },
            callBytecodeGeneratedSources: [],
            createBytecodeGeneratedSources: []
        });
        debug("contract %o", contract);
        yield project.assignNames({
            assignments: {
                contracts: [contract]
            }
        });
        const nameRecord = yield resolveContractNameRecord("A");
        debug("nameRecord %o", nameRecord);
        const { resource } = nameRecord;
        debug("resource %o", resource);
        expect(resource).toEqual(contract);
    }));
    it("is idempotent", () => __awaiter(void 0, void 0, void 0, function* () {
        const { addContract, resolveContractNameRecord } = helpers(db, project);
        const contract = yield addContract({
            name: "B",
            abi: {
                json: "[]"
            },
            callBytecodeGeneratedSources: [],
            createBytecodeGeneratedSources: []
        });
        yield project.assignNames({
            assignments: {
                contracts: [contract]
            }
        });
        const first = yield resolveContractNameRecord("B");
        yield project.assignNames({
            assignments: {
                contracts: [contract]
            }
        });
        const second = yield resolveContractNameRecord("B");
        expect(second).toEqual(first);
    }));
    it("resolves to new contract with prior contract", () => __awaiter(void 0, void 0, void 0, function* () {
        const { addContract, resolveContractNameRecord } = helpers(db, project);
        const first = yield addContract({
            name: "C",
            abi: {
                json: "[]"
            },
            callBytecodeGeneratedSources: [],
            createBytecodeGeneratedSources: []
        });
        debug("first %o", first);
        yield project.assignNames({
            assignments: {
                contracts: [first]
            }
        });
        const second = yield addContract({
            name: "C",
            abi: {
                json: `[{ type: "constructor", inputs: [] }]`
            },
            callBytecodeGeneratedSources: [],
            createBytecodeGeneratedSources: []
        });
        debug("second %o", second);
        yield project.assignNames({
            assignments: {
                contracts: [second]
            }
        });
        const { id, resource, previous } = yield resolveContractNameRecord("C");
        debug("nameRecord %o", id);
        debug("resource %o", resource);
        debug("previous.resource %o", previous.resource);
        expect(resource).toEqual(second);
        expect(previous.resource).toEqual(first);
    }));
});
//# sourceMappingURL=assignNames.spec.js.map