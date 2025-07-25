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
const logger_1 = require("../../../logger");
const debug = logger_1.logger("db:resources:projects:test:contractInstances");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const db_1 = require("../../../index");
const Project = __importStar(require("../../../project/index"));
const process_1 = require("../../../process");
describe("Project.contractInstances", () => {
    describe("for networks with differing contract revisions", () => {
        it("resolves contract-instances correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            /*
             * Setup
             */
            const db = db_1.connect({ adapter: { name: "memory" } });
            const { run } = process_1.Run.forDb(db);
            const project = yield Project.initialize({
                db,
                project: { directory: "/" }
            });
            /*
             * Common definitions: test two contracts on two different networks
             */
            const A = { name: "A" };
            const B = { name: "B" };
            const vnet = { name: "vnet", networkId: "v" };
            const wnet = { name: "wnet", networkId: "w" };
            /*
             * First, simulate deployment of A and B to vnet
             */
            {
                // create network resources
                const vnets = (yield run(process_1.resources.load, "networks", [
                    Object.assign(Object.assign({}, vnet), { historicBlock: { height: 0, hash: "v0" } }),
                    Object.assign(Object.assign({}, vnet), { historicBlock: { height: 1, hash: "v1" } }),
                    Object.assign(Object.assign({}, vnet), { historicBlock: { height: 2, hash: "v2" } })
                ]));
                yield run(process_1.resources.load, "networkGenealogies", [
                    { ancestor: vnets[0], descendant: vnets[1] },
                    { ancestor: vnets[1], descendant: vnets[2] }
                ]);
                // create contracts
                const contracts = (yield run(process_1.resources.load, "contracts", [
                    Object.assign(Object.assign({}, A), { abi: { json: JSON.stringify("a1") } }),
                    Object.assign(Object.assign({}, B), { abi: { json: JSON.stringify("b1") } })
                ]));
                // assign names
                yield project.assignNames({
                    assignments: {
                        contracts,
                        networks: [vnets[2]]
                    }
                });
                // create contract instances
                yield run(process_1.resources.load, "contractInstances", [
                    // Deploy A in first block after genesis (skip genesis for fun)
                    { contract: contracts[0], network: vnets[1], address: "v-a" },
                    // Deploy B after
                    { contract: contracts[1], network: vnets[2], address: "v-b" }
                ]);
            }
            /*
             * Then, revise A and B and deploy new revisions to wnet
             */
            {
                // create network resources
                const wnets = (yield run(process_1.resources.load, "networks", [
                    Object.assign(Object.assign({}, wnet), { historicBlock: { height: 0, hash: "w0" } }),
                    Object.assign(Object.assign({}, wnet), { historicBlock: { height: 1, hash: "w1" } }),
                    Object.assign(Object.assign({}, wnet), { historicBlock: { height: 2, hash: "w2" } })
                ]));
                yield run(process_1.resources.load, "networkGenealogies", [
                    { ancestor: wnets[0], descendant: wnets[1] },
                    { ancestor: wnets[1], descendant: wnets[2] }
                ]);
                // create contracts
                const contracts = (yield run(process_1.resources.load, "contracts", [
                    Object.assign(Object.assign({}, A), { abi: { json: JSON.stringify("a2") } }),
                    Object.assign(Object.assign({}, B), { abi: { json: JSON.stringify("b2") } })
                ]));
                // assign names
                yield project.assignNames({
                    assignments: {
                        contracts,
                        networks: [wnets[2]]
                    }
                });
                // create contract instances
                yield run(process_1.resources.load, "contractInstances", [
                    // Deploy A in first block after genesis (skip genesis for fun)
                    { contract: contracts[0], network: wnets[1], address: "w-a" },
                    // Deploy B after
                    { contract: contracts[1], network: wnets[2], address: "w-b" }
                ]);
            }
            /*
             * Prepare to query results
             */
            let fragmentIndex = 0;
            const forNetwork = networkName => graphql_tag_1.default `
        fragment ForNetwork__${fragmentIndex++} on Project {
          contractInstances(
            network: { name: "${networkName}" }
          ) {
            address
            network {
              networkId
            }
            contract {
              name
              abi { json }
            }
          }
        }
      `;
            /*
             * vnet should have the old versions
             */
            {
                const { contractInstances } = (yield run(process_1.resources.get, "projects", project.id, forNetwork("vnet")));
                const a = contractInstances.find(
                // @ts-ignore covered by expectations
                ({ contract: { name } }) => name === "A");
                expect(a).toBeDefined();
                // @ts-ignore
                expect(a.address).toEqual("v-a");
                // @ts-ignore
                expect(a.network.networkId).toEqual("v");
                // @ts-ignore
                expect(a.contract.abi.json).toEqual(JSON.stringify("a1"));
                const b = contractInstances.find(
                // @ts-ignore covered by expectations
                ({ contract: { name } }) => name === "B");
                expect(b).toBeDefined();
                // @ts-ignore
                expect(b.address).toEqual("v-b");
                // @ts-ignore
                expect(b.network.networkId).toEqual("v");
                // @ts-ignore
                expect(b.contract.abi.json).toEqual(JSON.stringify("b1"));
            }
            /*
             * wnet should have the new versions
             */
            {
                // @ts-ignore
                const { contractInstances } = yield run(process_1.resources.get, "projects", project.id, forNetwork("wnet"));
                const a = contractInstances.find(
                // @ts-ignore covered by expectations
                ({ contract: { name } }) => name === "A");
                expect(a).toBeDefined();
                // @ts-ignore
                expect(a.address).toEqual("w-a");
                // @ts-ignore
                expect(a.network.networkId).toEqual("w");
                // @ts-ignore
                expect(a.contract.abi.json).toEqual(JSON.stringify("a2"));
                const b = contractInstances.find(
                // @ts-ignore covered by expectations
                ({ contract: { name } }) => name === "B");
                expect(b).toBeDefined();
                // @ts-ignore
                expect(b.address).toEqual("w-b");
                // @ts-ignore
                expect(b.network.networkId).toEqual("w");
                // @ts-ignore
                expect(b.contract.abi.json).toEqual(JSON.stringify("b2"));
            }
        }));
    });
});
//# sourceMappingURL=contractInstances.spec.js.map