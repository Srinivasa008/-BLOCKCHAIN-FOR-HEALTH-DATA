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
exports.process = exports.AddContracts = exports.AddCompilations = exports.AddBytecodes = exports.AddSources = exports.Batch = void 0;
/**
 * @category Internal processor
 * @packageDocumentation
 */
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:project:loadCompile");
const Batch = __importStar(require("./batch"));
exports.Batch = Batch;
const AddSources = __importStar(require("./sources"));
exports.AddSources = AddSources;
const AddBytecodes = __importStar(require("./bytecodes"));
exports.AddBytecodes = AddBytecodes;
const AddCompilations = __importStar(require("./compilations"));
exports.AddCompilations = AddCompilations;
const AddContracts = __importStar(require("./contracts"));
exports.AddContracts = AddContracts;
/**
 * For a compilation result from @truffle/workflow-compile/new, generate a
 * sequence of GraphQL requests to submit to Truffle DB
 *
 * Returns a generator that yields requests to forward to Truffle DB.
 * When calling `.next()` on this generator, pass any/all responses
 * and ultimately returns nothing when complete.
 */
function* process(result) {
    const withSources = yield* AddSources.process(result.compilations);
    // @ts-ignore
    const withSourcesAndBytecodes = yield* AddBytecodes.process(withSources);
    const withCompilations = yield* AddCompilations.process(
    // @ts-ignore
    withSourcesAndBytecodes);
    // @ts-ignore
    const withContracts = yield* AddContracts.process(withCompilations);
    const compilations = withContracts;
    return {
        // @ts-ignore
        compilations,
        contracts: compilations.reduce((a, { contracts }) => [...a, ...contracts], [])
    };
}
exports.process = process;
//# sourceMappingURL=index.js.map