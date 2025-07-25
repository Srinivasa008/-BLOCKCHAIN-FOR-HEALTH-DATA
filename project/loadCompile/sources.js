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
const debug = logger_1.logger("db:project:loadCompile:sources");
const Meta = __importStar(require("../../meta/index"));
const process_1 = require("../../process");
const process = (inputs) => configure(inputs);
exports.process = process;
const configure = Meta.Batch.configure({
    *iterate({ inputs }) {
        for (const [compilationIndex, { sources, contracts }] of inputs.entries()) {
            for (const [sourceIndex, source] of sources.entries()) {
                yield {
                    input: source,
                    breadcrumb: {
                        compilationIndex,
                        sourcePointer: {
                            sourceIndex
                        }
                    }
                };
            }
            for (const [contractIndex, contract] of contracts.entries()) {
                for (const property of [
                    "generatedSources",
                    "deployedGeneratedSources"
                ]) {
                    const generatedSources = contract[property];
                    if (generatedSources) {
                        for (const [generatedSourceIndex, source] of generatedSources.entries()) {
                            yield {
                                input: source,
                                breadcrumb: {
                                    compilationIndex,
                                    sourcePointer: {
                                        contractIndex,
                                        property,
                                        generatedSourceIndex
                                    }
                                }
                            };
                        }
                    }
                }
            }
        }
    },
    find({ inputs, breadcrumb }) {
        const { compilationIndex, sourcePointer } = breadcrumb;
        const compilation = inputs[compilationIndex];
        if ("generatedSourceIndex" in sourcePointer) {
            const { contractIndex, property, generatedSourceIndex } = sourcePointer;
            // @ts-ignore
            return compilation.contracts[contractIndex][property][generatedSourceIndex];
        }
        const { sourceIndex } = sourcePointer;
        return compilation.sources[sourceIndex];
    },
    extract({ input }) {
        return {
            contents: input.contents,
            sourcePath: "sourcePath" in input ? input["sourcePath"] : input["name"]
        };
    },
    *process({ entries }) {
        return yield* process_1.resources.load("sources", entries);
    },
    // @ts-ignore
    initialize({ inputs }) {
        return inputs.map(compilation => (Object.assign(Object.assign({}, compilation), { sources: compilation.sources.map(source => (Object.assign({}, source))), contracts: compilation.contracts.map(contract => (Object.assign({}, contract))) })));
    },
    convert({ result, input }) {
        return Object.assign(Object.assign({}, input), { db: {
                source: result
            } });
    },
    merge({ outputs, breadcrumb, output }) {
        const { compilationIndex, sourcePointer } = breadcrumb;
        const compilationsBefore = outputs.slice(0, compilationIndex);
        const compilation = outputs[compilationIndex];
        const compilationsAfter = outputs.slice(compilationIndex + 1);
        if ("generatedSourceIndex" in sourcePointer) {
            const { contractIndex, property, generatedSourceIndex } = sourcePointer;
            const contractsBefore = compilation.contracts.slice(0, contractIndex);
            const contract = compilation.contracts[contractIndex];
            const contractsAfter = compilation.contracts.slice(contractIndex + 1);
            // @ts-ignore this will always be defined because we are looking it up
            // via breadcrumb
            const generatedSourcesBefore = contract[property].slice(0, generatedSourceIndex);
            const generatedSource = output;
            // @ts-ignore this will always be defined because we are looking it up
            // via breadcrumb
            const generatedSourcesAfter = contract[property].slice(generatedSourceIndex + 1);
            return [
                ...compilationsBefore,
                Object.assign(Object.assign({}, compilation), { contracts: [
                        ...contractsBefore,
                        Object.assign(Object.assign({}, contract), { [property]: [
                                ...generatedSourcesBefore,
                                generatedSource,
                                ...generatedSourcesAfter
                            ] }),
                        ...contractsAfter
                    ] }),
                ...compilationsAfter
            ];
        }
        const { sourceIndex } = sourcePointer;
        const sourcesBefore = compilation.sources.slice(0, sourceIndex);
        const source = output;
        const sourcesAfter = compilation.sources.slice(sourceIndex + 1);
        return [
            ...compilationsBefore,
            Object.assign(Object.assign({}, compilation), { sources: [...sourcesBefore, source, ...sourcesAfter] }),
            ...compilationsAfter
        ];
    }
});
//# sourceMappingURL=sources.js.map