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
exports.forDefinitions = exports.Id = exports.Batch = exports.Process = exports.Pouch = exports.Graph = exports.toIdObject = void 0;
/**
 * \@truffle/db Meta system
 *
 * This exposes the [[forDefinitions]] function for building a concrete
 * system for any defined set of resources.
 *
 * @category Internal
 * @packageDocumentation
 */
const logger_1 = require("../logger");
const debug = logger_1.logger("db:meta");
var id_1 = require("./id/index");
Object.defineProperty(exports, "toIdObject", { enumerable: true, get: function () { return id_1.toIdObject; } });
const Graph = __importStar(require("./graph/index"));
exports.Graph = Graph;
const Pouch = __importStar(require("./pouch/index"));
exports.Pouch = Pouch;
const Process = __importStar(require("./process/index"));
exports.Process = Process;
const Batch = __importStar(require("./batch"));
exports.Batch = Batch;
const Id = __importStar(require("./id/index"));
exports.Id = Id;
const interface_1 = require("./interface");
const forDefinitions = (definitions) => {
    const generateId = Id.forDefinitions(definitions);
    const attach = Pouch.forDefinitions(definitions);
    const schema = Graph.forDefinitions(definitions);
    const { connect, serve } = interface_1.forAttachAndSchema({
        attach,
        schema
    });
    const { forDb, resources } = Process.forDefinitions(definitions);
    return {
        generateId,
        schema,
        attach,
        connect,
        serve,
        resources,
        forDb
    };
};
exports.forDefinitions = forDefinitions;
//# sourceMappingURL=index.js.map