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
exports.resolvePossibleRelations = exports.resolvePossibleDescendants = exports.resolvePossibleAncestors = void 0;
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:resources:networks:resolvePossibleRelations");
exports.resolvePossibleAncestors = resolvePossibleRelations("ancestor");
exports.resolvePossibleDescendants = resolvePossibleRelations("descendant");
function resolvePossibleRelations(relationship) {
    const { queryName, heightFilter, heightOrder } = relationshipProperties(relationship);
    const findPossibleNetworks = (options) => __awaiter(this, void 0, void 0, function* () {
        const { network, limit, alreadyTried, workspace, disableIndex } = options;
        // HACK to work around a problem with WebSQL "too many parameters" errors
        //
        // this query tends to fail when there are ~5000 or more networks, likely
        // due to PouchDB's magic use of indexes.
        //
        // so, anticipating this, let's prepare to try the index-based find first,
        // but fallback to a JS in-memory approach because that's better than
        // failing.
        // attempt 1
        if (!disableIndex) {
            try {
                const query = {
                    selector: {
                        "historicBlock.height": {
                            [heightFilter]: network.historicBlock.height,
                            $ne: network.historicBlock.height
                        },
                        "networkId": network.networkId,
                        "id": {
                            $nin: alreadyTried
                        }
                    },
                    sort: [{ "historicBlock.height": heightOrder }],
                    limit
                };
                return yield workspace.find("networks", query);
            }
            catch (error) {
                debug("Network.%s failed using PouchDB indexes. Error: %o", queryName, error);
                debug("Retrying with in-memory comparisons");
            }
        }
        // attempt 2
        {
            const query = {
                selector: {
                    networkId: network.networkId
                }
            };
            const excluded = new Set(alreadyTried);
            return (yield workspace.find("networks", query))
                .filter(network => network)
                .filter(({ historicBlock: { height } }) => relationship === "ancestor"
                ? height < network.historicBlock.height
                : height > network.historicBlock.height)
                .filter(({ id }) => !excluded.has(id))
                .sort((a, b) => relationship === "ancestor"
                ? b.historicBlock.height - a.historicBlock.height
                : a.historicBlock.height - b.historicBlock.height)
                .slice(0, limit);
        }
    });
    return ({ id }, { limit = 5, alreadyTried, disableIndex }, { workspace }) => __awaiter(this, void 0, void 0, function* () {
        const network = yield workspace.get("networks", id);
        const networks = yield findPossibleNetworks({
            network,
            limit,
            alreadyTried,
            workspace,
            disableIndex
        });
        return {
            networks,
            alreadyTried: [
                ...new Set([
                    ...alreadyTried,
                    ...networks.map(({ id }) => id)
                ])
            ]
        };
    });
}
exports.resolvePossibleRelations = resolvePossibleRelations;
function relationshipProperties(relationship) {
    return relationship === "ancestor"
        ? {
            queryName: "possibleAncestors",
            heightFilter: "$lt",
            heightOrder: "desc"
        }
        : {
            queryName: "possibleDescendants",
            heightFilter: "$gt",
            heightOrder: "asc"
        };
}
//# sourceMappingURL=resolvePossibleRelations.js.map