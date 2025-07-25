"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.process = void 0;
/**
 * @category Internal processor
 * @packageDocumentation
 */
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:network:load:networksForBlocks");
const process_1 = require("../../process");
function* process(options) {
    debug("Processing adding networks for blocks...");
    const { network, blocks } = options;
    const networks = yield* process_1.resources.load("networks", blocks.map(block => block
        ? {
            name: network.name,
            networkId: network.networkId,
            historicBlock: block
        }
        : undefined));
    debug("Processed adding networks for blocks.");
    return networks.map((reference, index) => reference
        ? Object.assign(Object.assign({}, network), { id: reference.id, historicBlock: blocks[index] })
        : undefined);
}
exports.process = process;
//# sourceMappingURL=networksForBlocks.js.map