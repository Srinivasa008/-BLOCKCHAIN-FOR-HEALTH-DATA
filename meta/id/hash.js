"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hash = void 0;
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:meta:id:hash");
const web3_utils_1 = require("web3-utils");
const jsonStableStringify = require("json-stable-stringify");
function hash(obj) {
    const id = web3_utils_1.soliditySha3(jsonStableStringify(removeNullyValues(obj)));
    if (id === null) {
        throw new Error(`Failed to hash ${JSON.stringify(obj)}`);
    }
    return id;
}
exports.hash = hash;
function removeNullyValues(obj) {
    return Object.entries(obj)
        .filter(([_, v]) => v !== null && v !== undefined)
        .map(([k, v]) => ({ [k]: v }))
        .reduce((a, b) => (Object.assign(Object.assign({}, a), b)), {});
}
//# sourceMappingURL=hash.js.map