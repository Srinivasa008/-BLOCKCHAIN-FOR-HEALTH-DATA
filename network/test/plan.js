"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plan = void 0;
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:project:migrate:networkGenealogies:test:plan");
const system_1 = require("../../system");
const plan = (options) => {
    const { model, batches } = options;
    // track latest for each descendant in the model
    const latestByDescendantIndex = {};
    // track any networks that have been superseded by later descendants, since
    // it's impossible to know that a given network in our model has further
    // descendants unless we tell it about those descendants.
    const superseded = new Set();
    // for each batch
    for (const batch of batches) {
        const { inputs } = batch;
        const { name, networkId, getBlockByNumber: getBatchBlockByNumber } = model.networks[batch.descendantIndex];
        const genesis = {
            name,
            networkId,
            historicBlock: getBatchBlockByNumber(0)
        };
        // for each input in each batch
        for (const { networkId, historicBlock } of [genesis, ...inputs]) {
            const { height } = historicBlock;
            // for each descendant network in our model
            for (const [descendantIndex, { getBlockByNumber: getComparedBlockByNumber }] of model.networks.entries()) {
                const { network: currentLatestNetwork, height: latestHeight = -1 } = latestByDescendantIndex[descendantIndex] || {};
                const inputComparison = height === latestHeight
                    ? "equal"
                    : height < latestHeight
                        ? "earlier"
                        : "later";
                const id = system_1.generateId("networks", { networkId, historicBlock });
                switch (inputComparison) {
                    case "equal": {
                        // if input is the same height as the latest, don't update any
                        // records
                        break;
                    }
                    case "later": {
                        // if the input is later than current latest for compared network,
                        // check the compared network's equivalent block at input height
                        //
                        // if these match, then the current latest is ancestor to the
                        // input: mark current latest as superseded and update latest
                        const batchBlock = historicBlock;
                        const comparedBlock = getComparedBlockByNumber(height);
                        if (comparedBlock && batchBlock.hash === comparedBlock.hash) {
                            // mark any previously known latest as superseded
                            if (currentLatestNetwork) {
                                debug("superseding current latest");
                                superseded.add(currentLatestNetwork.id);
                            }
                            // update known latest
                            latestByDescendantIndex[descendantIndex] = {
                                network: { id },
                                height
                            };
                        }
                        break;
                    }
                    case "earlier": {
                        // if the input is earlier than the current latest, check that
                        // the current latest block for the compared network matches the
                        // equivalent block for the input batch network
                        //
                        // if these match, then the current latest block is a known
                        // descendant of the input: mark input as superseded
                        const batchBlock = getBatchBlockByNumber(latestHeight);
                        const comparedBlock = getComparedBlockByNumber(latestHeight);
                        if (batchBlock && batchBlock.hash === comparedBlock.hash) {
                            // then mark immediately as superseded (we know this network will
                            // not come back as a latestDescendant)
                            debug("superseding input");
                            superseded.add(id);
                        }
                        break;
                    }
                }
            }
        }
    }
    const ids = new Set(Object.values(latestByDescendantIndex).map(({ network: { id } }) => id));
    debug("superseded %O", superseded);
    return {
        expectedLatestDescendants: [...ids]
            .filter(id => !superseded.has(id))
            .map(id => ({ id }))
    };
};
exports.plan = plan;
//# sourceMappingURL=plan.js.map