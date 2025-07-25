"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.process = void 0;
/**
 * @category Internal processor
 * @packageDocumentation
 */
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:network:fetch:networkId");
function* process() {
    debug("Generating networkId fetch...");
    const response = yield {
        type: "web3",
        method: "net_version",
        params: []
    };
    const { result } = response;
    const networkId = parseInt(result);
    debug("Generated networkId fetch.");
    return networkId;
}
exports.process = process;
//# sourceMappingURL=networkId.js.map