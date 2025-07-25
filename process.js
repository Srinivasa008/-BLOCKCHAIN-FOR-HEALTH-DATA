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
exports.Run = exports.resources = void 0;
/**
 * @category Primary
 * @packageDocumentation
 */
const logger_1 = require("./logger");
const debug = logger_1.logger("db:process");
const System = __importStar(require("./system"));
/**
 * Programmatic interfaces for reading/writing resources.
 *
 * **Note**: These functions return generators. For `async` behavior, use
 * with a [[Meta.Process.ProcessorRunner | ProcessorRunner]] such as
 * that returned by [[Run.forDb]] or [[Project.run]].
 *
 * For full documentation, please see [[ResourceProcessors]] or links to
 * specific function types below.
 *
 * @example
 * ```typescript
 * import { Process } from "@truffle/db";
 * const { resources } = Process;
 * ```
 */
exports.resources = System.resources;
var Run;
(function (Run) {
    Run.forDb = System.forDb;
})(Run = exports.Run || (exports.Run = {}));
//# sourceMappingURL=process.js.map