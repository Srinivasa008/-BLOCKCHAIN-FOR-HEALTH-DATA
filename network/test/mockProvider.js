"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockProvider = void 0;
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:network:test:mockProvider");
const mockProvider = (options) => {
    const { model, batch } = options;
    const { networkId, getBlockByNumber } = model.networks[batch.descendantIndex];
    return {
        send(payload, callback) {
            const { jsonrpc, id, method, params } = payload;
            switch (method) {
                case "eth_getBlockByNumber": {
                    const [blockNumber] = params;
                    const height = parseInt(blockNumber);
                    debug("intercepting eth_getBlockByNumber %o", height);
                    const block = getBlockByNumber(height);
                    debug("block %o", block);
                    const result = block
                        ? {
                            number: `0x${height.toString(16)}`,
                            hash: block.hash
                        }
                        : undefined;
                    return callback(null, {
                        jsonrpc,
                        id,
                        result
                    });
                }
                case "net_version": {
                    const result = networkId;
                    debug("result %o", result);
                    return callback(null, {
                        jsonrpc,
                        id,
                        result
                    });
                }
            }
        }
    };
};
exports.mockProvider = mockProvider;
//# sourceMappingURL=mockProvider.js.map