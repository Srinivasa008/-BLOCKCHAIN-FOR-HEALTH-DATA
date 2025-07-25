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
exports.process = exports.AddContractInstances = exports.GetContracts = exports.Batch = void 0;
/**
 * @category Internal processor
 * @packageDocumentation
 */
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:project:loadMigrate");
const Batch = __importStar(require("./batch"));
exports.Batch = Batch;
const GetContracts = __importStar(require("./contracts"));
exports.GetContracts = GetContracts;
const AddContractInstances = __importStar(require("./contractInstances"));
exports.AddContractInstances = AddContractInstances;
function* process(options) {
    const withContracts = yield* GetContracts.process(options);
    const { artifacts } = yield* AddContractInstances.process(withContracts);
    return {
        artifacts: artifacts.map(artifact => (Object.assign(Object.assign({}, artifact), { networks: artifact.networks })))
    };
}
exports.process = process;
//# sourceMappingURL=index.js.map