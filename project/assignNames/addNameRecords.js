"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.process = void 0;
/**
 * @category Internal processor
 * @packageDocumentation
 */
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:project:assignNames:addNameRecords");
const process_1 = require("../../process");
const Batch = __importStar(require("./batch"));
exports.process = Batch.configure({
    extract({ input: { resource: { id }, type, current } }) {
        if (!current) {
            debug("no previous");
            return { resource: { id, type } };
        }
        if (current.resource.id === id) {
            debug("re-assigning same resource");
            return { resource: { id, type }, previous: current.previous };
        }
        debug("including previous");
        debug("previous id %o", current.resource.id);
        debug("id %o", id);
        return { resource: { id, type }, previous: { id: current.id } };
    },
    *process({ entries }) {
        return yield* process_1.resources.load("nameRecords", entries);
    },
    convert({ result, input }) {
        debug("converting %o", result);
        return Object.assign(Object.assign({}, input), { nameRecord: result });
    }
});
//# sourceMappingURL=addNameRecords.js.map