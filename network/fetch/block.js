"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.process = void 0;
/**
 * @category Internal processor
 * @packageDocumentation
 */
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:network:fetch:block");
/**
 * Issue web3 requests to retrieve block hashes for a given list of heights.
 */
function* process(options) {
    const { block: input, settings: { skipComplete = false } = {} } = options;
    if (input.hash && typeof input.height === "number" && skipComplete) {
        return input;
    }
    const heightParam = typeof input.height === "number"
        ? `0x${input.height.toString(16)}`
        : input.height;
    const response = yield {
        type: "web3",
        method: "eth_getBlockByNumber",
        params: [heightParam, false]
    };
    debug("response %O", response);
    if (response && response.result && response.result.hash) {
        const { hash } = response.result;
        const height = parseInt(response.result.number);
        if (input.hash && input.hash !== hash) {
            throw new Error([
                `Input block { height: ${height}, hash: "${input.hash}" } did `,
                `not match fetched hash ${hash}, aborting.`
            ].join(""));
        }
        return { height, hash };
    }
}
exports.process = process;
//# sourceMappingURL=block.js.map