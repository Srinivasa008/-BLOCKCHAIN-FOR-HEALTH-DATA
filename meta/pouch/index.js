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
exports.forDefinitions = exports.Adapters = void 0;
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:meta:pouch");
const Adapters = __importStar(require("./adapters/index"));
exports.Adapters = Adapters;
const workspace_1 = require("./workspace");
const forDefinitions = (definitions) => (options) => {
    const { constructor, settings } = Adapters.concretize(options);
    debug("Initializing workspace...");
    // @ts-ignore
    const adapter = new constructor({ definitions, settings });
    const workspace = new workspace_1.AdapterWorkspace({
        adapter,
        definitions
    });
    return workspace;
};
exports.forDefinitions = forDefinitions;
//# sourceMappingURL=index.js.map