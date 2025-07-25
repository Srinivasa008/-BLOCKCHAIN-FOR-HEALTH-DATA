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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveContractInstances = void 0;
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:resources:projects:resolveContractInstances");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const delegate_1 = require("@graphql-tools/delegate");
const resolveNameRecords_1 = require("./resolveNameRecords");
/**
 * For given contract and/or network names, find all contract instances
 * matching either/both of those filters.
 *
 * Returns contract instances for the most current contract according to that
 * contract's name record history - i.e., if a contract has been revised since
 * being deployed to mainnet, this function will return the contract instance
 * for that past revision.
 */
function resolveContractInstances(project, inputs, context, info) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        const { workspace } = context;
        const contractNameRecords = yield resolveNameRecords_1.resolveNameRecords(project, Object.assign(Object.assign({}, inputs.contract), { type: "Contract" }), { workspace });
        const contractInstances = [];
        debug("inputs %O", inputs);
        try {
            for (var _b = __asyncValues(findResourcesHistories({
                collectionName: "contracts",
                nameRecords: contractNameRecords,
                workspace
            })), _c; _c = yield _b.next(), !_c.done;) {
                const { skip, contracts } = _c.value;
                let stepContractInstances = (yield workspace.find("contractInstances", {
                    selector: {
                        "contract.id": {
                            $in: contracts
                                .filter((contract) => !!contract)
                                .map(({ id }) => id)
                        }
                    }
                })).filter((contractInstance) => !!contractInstance);
                if (inputs.network) {
                    const ancestors = yield filterProjectNetworkAncestors({
                        project,
                        network: inputs.network,
                        candidates: stepContractInstances.map(({ network }) => network),
                        workspace,
                        info
                    });
                    const ancestorIds = new Set([...ancestors.map(({ id }) => id)]);
                    stepContractInstances = stepContractInstances.filter(({ network }) => network && ancestorIds.has(network.id));
                }
                const byContractId = stepContractInstances
                    .filter((contractInstance) => !!contractInstance.contract)
                    .reduce((byContractId, contractInstance) => (Object.assign(Object.assign({}, byContractId), { [contractInstance.contract.id]: contractInstance })), {});
                const found = contracts
                    .map((contract, index) => contract && contract.id in byContractId ? index : undefined)
                    .filter((index) => typeof index === "number");
                debug("skipping found indexes: %O", found);
                skip(...found);
                contractInstances.push(...stepContractInstances);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (!inputs.address) {
            return contractInstances;
        }
        else {
            return contractInstances.filter(contractInstance => contractInstance.address === inputs.address);
        }
    });
}
exports.resolveContractInstances = resolveContractInstances;
/**
 * Steps backwards through name record history for a given set of name records,
 * yielding an array of past resources in a breadth-first search manner.
 *
 * At each step, yields a [somewhat HACKy] `skip` function, to omit specific
 * indexes from further consideration.
 *
 * Returns when all name records histories have been exhausted.
 */
function findResourcesHistories(options) {
    return __asyncGenerator(this, arguments, function* findResourcesHistories_1() {
        const { collectionName, workspace } = options;
        let { nameRecords } = options;
        do {
            const skip = (...indexes) => {
                for (const index of indexes) {
                    if (typeof index === "number") {
                        nameRecords[index] = undefined;
                    }
                }
            };
            yield yield __await({
                skip,
                [collectionName]: nameRecords.map(nameRecord => nameRecord && nameRecord.resource
                    ? { id: nameRecord.resource.id }
                    : undefined)
            });
            // preserving order, iterate to next set of previous records
            nameRecords = yield __await(workspace.find("nameRecords", nameRecords.map(nameRecord => nameRecord && nameRecord.previous
                ? nameRecord.previous
                : undefined)));
        } while (nameRecords.find(nameRecord => nameRecord));
    });
}
/**
 * Given a list of candidate networks, returns a subset list that are each
 * ancestor to the network currently known to a project as a given name.
 */
function filterProjectNetworkAncestors(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { project, network, candidates: candidateReferences, workspace, info } = options;
        // short-circuit early to avoid extra queries and to avoid index lookup guard
        if (candidateReferences.length === 0) {
            return [];
        }
        const candidates = (yield workspace.find("networks", candidateReferences)).filter((network) => !!network);
        // find earliest among candidates to specify minimumHeight to ancestors query
        const earliestCandidate = candidates
            .slice(1)
            .reduce((earliest, network) => earliest.historicBlock.height < network.historicBlock.height
            ? earliest
            : network, candidates[0]);
        // query ancestors for project network name
        const { network: { ancestors = [] } = {} } = yield delegate_1.delegateToSchema({
            schema: info.schema,
            operation: "query",
            fieldName: "project",
            returnType: info.schema.getType("Project"),
            args: project,
            info,
            context: { workspace },
            selectionSet: extractSelectionSet(graphql_tag_1.default `{
      network(name: "${network.name}") {
        ancestors(
          includeSelf: true
          minimumHeight: ${earliestCandidate.historicBlock.height}
        ) {
          id
        }
      }
    }`)
        });
        // filter candidates
        const ancestorIds = new Set([...ancestors.map(({ id }) => id)]);
        return candidates.filter((candidate) => candidate && ancestorIds.has(candidate.id));
    });
}
/**
 * Converts a normal gql`` expression into its (preconditional) subset
 * selection set.
 *
 * (To make it easier to construct `delegateToSchema` calls)
 */
function extractSelectionSet(document) {
    return document.definitions
        .map(({ selectionSet }) => selectionSet)
        .find(selectionSet => selectionSet);
}
//# sourceMappingURL=resolveContractInstances.js.map