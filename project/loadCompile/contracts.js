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
const debug = logger_1.logger("db:project:loadCompile:contracts");
const process_1 = require("../../process");
const Batch = __importStar(require("./batch"));
exports.process = Batch.Contracts.configure({
    extract({ input, inputs, breadcrumb }) {
        debug("inputs %o", inputs);
        debug("breadcrumb %o", breadcrumb);
        const { compilationIndex } = breadcrumb;
        const { db: { compilation } } = inputs[compilationIndex];
        const { contractName: name, db: { createBytecode, callBytecode }, generatedSources, deployedGeneratedSources } = input;
        const abi = {
            json: JSON.stringify(input.abi)
        };
        const processedSource = {
            index: inputs[compilationIndex].sourceIndexes.findIndex(sourcePath => sourcePath === input.sourcePath)
        };
        const createBytecodeGeneratedSources = toGeneratedSourcesInput({
            generatedSources: generatedSources
        });
        const callBytecodeGeneratedSources = toGeneratedSourcesInput({
            generatedSources: deployedGeneratedSources
        });
        return {
            name,
            abi,
            compilation,
            processedSource,
            createBytecode,
            callBytecode,
            createBytecodeGeneratedSources,
            callBytecodeGeneratedSources
        };
    },
    *process({ entries }) {
        return yield* process_1.resources.load("contracts", entries);
    },
    convert({ result, input: contract }) {
        return Object.assign(Object.assign({}, contract), { db: Object.assign(Object.assign({}, contract.db), { contract: result }) });
    }
});
function toGeneratedSourcesInput({ generatedSources }) {
    debug("generatedSources %O", generatedSources);
    const processedGeneratedSources = (generatedSources || []).reduce((generatedSources, input) => {
        generatedSources[input.id] = {
            source: input.db.source,
            ast: { json: JSON.stringify(input.ast) },
            language: input.language
        };
        return generatedSources;
    }, []);
    return processedGeneratedSources;
}
//# sourceMappingURL=contracts.js.map