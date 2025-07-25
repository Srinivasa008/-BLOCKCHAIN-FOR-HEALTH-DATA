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
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../logger");
const debug = logger_1.logger("db:test:networkGenealogy");
const utils_1 = require("./utils");
const networkGenealogy_graphql_1 = require("./networkGenealogy.graphql");
const network_graphql_1 = require("./network.graphql");
// findBlockByNumber mocks the bare-bones return of a call to web3,
// to check whether a network resource is a part of the network we're connected to
const findBlockByNumber = blockNumber => {
    const blockHeaders = {
        1: {
            number: 1,
            hash: "0xcba0b90a5e65512202091c12a2e3b328f374715b9f1c8f32cb4600c726fe2aa6"
        },
        2: {
            number: 2,
            hash: "0xcba0b90a5e65512202091c12a2e3b328f374715b9f1c8f32cb4600c726fe2aa9"
        },
        3: {
            number: 3,
            hash: "0xcba0b90a5e65512202091c12a2e3b328f374715b9f1c8f32cb4600c726fe2aa1"
        },
        4: {
            number: 4,
            hash: "0xcba0b90a5e65512202091c12a2e3b328f374715b9f1c8f32cb4600c726fe2aa2"
        },
        5: {
            number: 5,
            hash: "0xcba0b90a5e65512202091c12a2e3b328f374715b9f1c8f32cb4600c726fe2aa3"
        }
    };
    return blockHeaders[blockNumber];
};
describe("Network Genealogy", () => {
    let wsClient;
    let loneNetworkResult, secondAncestorNetworkResult, firstDescendantNetworkResult, mainNetworkResourceResult;
    let genealogyCheck;
    let ancestors, descendants, addNetworkGenealogyRecord;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        wsClient = new utils_1.WorkspaceClient();
        // in reality this function would need some more looping through if there are more than
        // 5 results but that logic can be handled in the loader tests
        genealogyCheck = (id, alreadyTried, type, limit) => __awaiter(void 0, void 0, void 0, function* () {
            let result;
            let possibleMatches;
            const queryLimit = limit ? limit : 5;
            if (type === "ancestor") {
                result = yield wsClient.execute(networkGenealogy_graphql_1.FindAncestors, {
                    id: id,
                    alreadyTried: alreadyTried,
                    limit: queryLimit
                });
                possibleMatches = result.network.possibleAncestors.networks;
                debug("possibleMatches %o", possibleMatches);
            }
            else if (type === "descendant") {
                result = yield wsClient.execute(networkGenealogy_graphql_1.FindDescendants, {
                    id: id,
                    alreadyTried: alreadyTried,
                    limit: queryLimit
                });
                possibleMatches = result.network.possibleDescendants.networks;
            }
            const networks = [];
            // spoofing the logic that will be happening in  the loaders to check whether
            // there's a match to make this a possible match
            for (const match of possibleMatches) {
                let header = findBlockByNumber(match.historicBlock.height);
                if (header.hash === match.historicBlock.hash) {
                    networks.push(match);
                }
            }
            return { networks, alreadyTried: result.alreadyTried };
        });
        //add networks to test with
        loneNetworkResult = yield wsClient.execute(network_graphql_1.AddNetworks, {
            name: "ganache",
            networkId: "5777",
            height: 1,
            hash: "0xcba0b90a5e65512202091c12a2e3b328f374715b9f1c8f32cb4600c726fe2aa8"
        });
        yield wsClient.execute(network_graphql_1.AddNetworks, {
            name: "ganache",
            networkId: "5778",
            height: 1,
            hash: "0xcba0b90a5e65512202091c12a2e3b328f374715b9f1c8f32cb4600c726fe2aa6"
        });
        secondAncestorNetworkResult = yield wsClient.execute(network_graphql_1.AddNetworks, {
            name: "ganache",
            networkId: "5778",
            height: 2,
            hash: "0xcba0b90a5e65512202091c12a2e3b328f374715b9f1c8f32cb4600c726fe2aa9"
        });
        // this is the main network we're testing with. It has two ancestors and two decendants
        mainNetworkResourceResult = yield wsClient.execute(network_graphql_1.AddNetworks, {
            name: "ganache",
            networkId: "5778",
            height: 3,
            hash: "0xcba0b90a5e65512202091c12a2e3b328f374715b9f1c8f32cb4600c726fe2aa1"
        });
        firstDescendantNetworkResult = yield wsClient.execute(network_graphql_1.AddNetworks, {
            name: "ganache",
            networkId: "5778",
            height: 4,
            hash: "0xcba0b90a5e65512202091c12a2e3b328f374715b9f1c8f32cb4600c726fe2aa2"
        });
        yield wsClient.execute(network_graphql_1.AddNetworks, {
            name: "ganache",
            networkId: "5778",
            height: 5,
            hash: "0xcba0b90a5e65512202091c12a2e3b328f374715b9f1c8f32cb4600c726fe2aa3"
        });
        // check for ancestors using main network
        ({ networks: ancestors } = yield genealogyCheck(mainNetworkResourceResult.networksAdd.networks[0].id, [], "ancestor"));
        // check for descendants using main network
        ({ networks: descendants } = yield genealogyCheck(mainNetworkResourceResult.networksAdd.networks[0].id, [], "descendant"));
        // add networkGenealogy record using ancestor and descendant results
        addNetworkGenealogyRecord = yield wsClient.execute(networkGenealogy_graphql_1.AddNetworkGenealogies, {
            ancestor: ancestors[0].id,
            descendant: descendants[0].id
        });
    }));
    test("can query for ancestors", () => __awaiter(void 0, void 0, void 0, function* () {
        //two possible ancestors on the same network
        expect(ancestors).toHaveLength(2);
        //sorted by block height, descending
        expect(ancestors[0].historicBlock.height).toBeGreaterThan(ancestors[1].historicBlock.height);
        //since this is all our responses and they are sorted in descending order, the first one is the ancestor
        let { id, historicBlock: { hash, height }, networkId } = ancestors[0];
        expect(id).toEqual(secondAncestorNetworkResult.networksAdd.networks[0].id);
        expect(hash).toEqual(secondAncestorNetworkResult.networksAdd.networks[0].historicBlock.hash);
        expect(height).toEqual(secondAncestorNetworkResult.networksAdd.networks[0].historicBlock.height);
        expect(height).toBeGreaterThan(ancestors[1].historicBlock.height);
        expect(networkId).toEqual(secondAncestorNetworkResult.networksAdd.networks[0].networkId);
    }));
    test("can query for descendants", () => __awaiter(void 0, void 0, void 0, function* () {
        // two possible descendants on the same network
        expect(descendants).toHaveLength(2);
        //since this is all our responses and they are sorted in ascending order, the first one is the descendent
        let { id, historicBlock: { hash, height }, networkId } = descendants[0];
        // matches the id of the network that should have been found
        expect(id).toEqual(firstDescendantNetworkResult.networksAdd.networks[0].id);
        expect(hash).toEqual(firstDescendantNetworkResult.networksAdd.networks[0].historicBlock.hash);
        expect(height).toEqual(firstDescendantNetworkResult.networksAdd.networks[0].historicBlock.height);
        expect(height).toBeLessThan(descendants[1].historicBlock.height);
        expect(networkId).toEqual(firstDescendantNetworkResult.networksAdd.networks[0].networkId);
    }));
    test("can be added", () => __awaiter(void 0, void 0, void 0, function* () {
        //add a networkGenealogy record!
        expect(addNetworkGenealogyRecord).toHaveProperty("networkGenealogiesAdd");
        expect(addNetworkGenealogyRecord.networkGenealogiesAdd).toHaveProperty("networkGenealogies");
        expect(addNetworkGenealogyRecord.networkGenealogiesAdd.networkGenealogies.length).toEqual(1);
        const networkGenealogyRecordId = utils_1.generateId("networkGenealogies", {
            ancestor: { id: ancestors[0].id },
            descendant: { id: descendants[0].id }
        });
        let { id, ancestor: { id: ancestorId }, descendant: { id: descendantId } } = addNetworkGenealogyRecord.networkGenealogiesAdd.networkGenealogies[0];
        expect(id).toEqual(networkGenealogyRecordId);
        expect(ancestorId).toEqual(ancestors[0].id);
        expect(descendantId).toEqual(descendants[0].id);
    }));
    test("respects limit on ancestor query", () => __awaiter(void 0, void 0, void 0, function* () {
        let { networks: ancestorsWithLimit } = yield genealogyCheck(mainNetworkResourceResult.networksAdd.networks[0].id, [], "ancestor", 1);
        expect(ancestorsWithLimit.length).toEqual(1);
    }));
    test("respects limit on descendant query", () => __awaiter(void 0, void 0, void 0, function* () {
        let { networks: descendantsWithLimit } = yield genealogyCheck(mainNetworkResourceResult.networksAdd.networks[0].id, [], "descendant", 1);
        expect(descendantsWithLimit.length).toEqual(1);
    }));
    test("accepts and respects alreadyTried array", () => __awaiter(void 0, void 0, void 0, function* () {
        const ancestorAlreadyTried = ancestors[1].id;
        let { networks: ancestorsWithAlreadyTried } = yield genealogyCheck(mainNetworkResourceResult.networksAdd.networks[0].id, [ancestorAlreadyTried], "ancestor");
        expect(ancestorsWithAlreadyTried.length).toEqual(1);
    }));
    test("returns empty array when no network candidates are an ancestor or descendant", () => __awaiter(void 0, void 0, void 0, function* () {
        const { networks: ancestors } = yield genealogyCheck(loneNetworkResult.networksAdd.networks[0].id, [], "ancestor");
        expect(ancestors).toEqual([]);
        const { networks: descendants } = yield genealogyCheck(loneNetworkResult.networksAdd.networks[0].id, [], "descendant");
        expect(descendants).toEqual([]);
    }));
});
//# sourceMappingURL=networkGenealogy.spec.js.map