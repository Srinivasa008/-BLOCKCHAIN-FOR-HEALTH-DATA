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
const debug = logger_1.logger("db:project:loadCompile:compilations");
const process_1 = require("../../process");
const Batch = __importStar(require("./batch"));
exports.process = Batch.Compilations.configure({
    extract({ input }) {
        return toCompilationInput({
            compiler: input.compiler,
            contracts: input.contracts,
            sourceIndexes: input.sourceIndexes,
            sources: input.sources
        });
    },
    *process({ entries }) {
        debug("entries %o", entries);
        return yield* process_1.resources.load("compilations", entries);
    },
    convert({ result, input: compilation }) {
        return Object.assign(Object.assign({}, compilation), { db: Object.assign(Object.assign({}, (compilation.db || {})), { compilation: result }) });
    }
});
function toCompilationInput(options) {
    const { compiler } = options;
    return {
        compiler,
        processedSources: toProcessedSourceInputs(options),
        sources: toSourceInputs(options),
        sourceMaps: toSourceMapInputs(options),
        immutableReferences: toImmutableReferencesInputs(options)
    };
}
function toProcessedSourceInputs(options) {
    return options.sourceIndexes.map(sourcePath => {
        const source = options.sources.find(source => source.sourcePath === sourcePath);
        if (!source) {
            return null;
        }
        const ast = source.ast ? { json: JSON.stringify(source.ast) } : undefined;
        const language = source.language;
        return {
            source: source.db.source,
            ast,
            language
        };
    });
}
function toSourceInputs(options) {
    return options.sourceIndexes.map(sourcePath => {
        const compiledSource = options.sources.find(source => source.sourcePath === sourcePath);
        if (!compiledSource) {
            return null;
        }
        const { db: { source } } = compiledSource;
        return source;
    });
}
function toSourceMapInputs(options) {
    return options.contracts
        .map(contract => {
        const sourceMaps = [];
        if (contract.sourceMap && contract.db.createBytecode) {
            sourceMaps.push({
                bytecode: contract.db.createBytecode,
                data: contract.sourceMap
            });
        }
        if (contract.deployedSourceMap) {
            sourceMaps.push({
                bytecode: contract.db.callBytecode,
                data: contract.deployedSourceMap
            });
        }
        return sourceMaps;
    })
        .flat();
}
function toImmutableReferencesInputs(options) {
    const immutableReferences = options.contracts
        .filter(contract => contract)
        .filter(({ immutableReferences = {} }) => {
        return Object.keys(immutableReferences).length > 0;
    })
        .map(contract => {
        return Object.entries(contract.immutableReferences)
            .map(([astNode, slices]) => {
            // HACK start/length might actually be required, but contract-schema
            // is wrong?
            const definedSlices = slices.filter((slice) => typeof slice.start === "number" &&
                typeof slice.length === "number");
            if (definedSlices.length === 0) {
                return;
            }
            return {
                astNode,
                bytecode: contract.db.callBytecode,
                length: definedSlices[0].length,
                offsets: definedSlices.map(({ start }) => start)
            };
        })
            .filter((immutableReference) => !!immutableReference);
    })
        .flat();
    return immutableReferences;
}
//# sourceMappingURL=compilations.js.map