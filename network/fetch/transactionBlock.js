"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.process = void 0;
/**
 * @category Internal processor
 * @packageDocumentation
 */
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:network:fetch:transactionBlock");
function* process(options) {
    const { transactionHash } = options;
    const response = yield {
        type: "web3",
        method: "eth_getTransactionByHash",
        params: [transactionHash]
    };
    if (!response || !response.result || !response.result.blockNumber) {
        return;
    }
    const { blockHash: hash, blockNumber } = response.result;
    const height = parseInt(blockNumber);
    return { height, hash };
}
exports.process = process;
//# sourceMappingURL=transactionBlock.js.map