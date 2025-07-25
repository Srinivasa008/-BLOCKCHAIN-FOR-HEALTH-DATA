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
exports.Contracts = exports.Compilations = void 0;
/**
 * @category Internal boilerplate
 * @packageDocumentation
 */
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:project:loadCompile:batch");
const Base = __importStar(require("../batch"));
var Compilations;
(function (Compilations) {
    Compilations.configure = (options) => Base.configure(Object.assign({ *iterate({ inputs }) {
            for (const [compilationIndex, compilation] of inputs.entries()) {
                yield {
                    input: compilation,
                    breadcrumb: { compilationIndex }
                };
            }
        },
        find({ inputs, breadcrumb }) {
            const { compilationIndex } = breadcrumb;
            return inputs[compilationIndex];
        }, initialize({ inputs }) {
            return inputs.map(input => (Object.assign(Object.assign({}, input), { db: Object.assign({}, (input.db || {})) })));
        }, merge({ outputs, breadcrumb, output }) {
            debug("outputs %o", outputs);
            const { compilationIndex } = breadcrumb;
            const compilationsBefore = outputs.slice(0, compilationIndex);
            const compilation = output;
            const compilationsAfter = outputs.slice(compilationIndex + 1);
            return [...compilationsBefore, compilation, ...compilationsAfter];
        } }, options));
})(Compilations = exports.Compilations || (exports.Compilations = {}));
var Contracts;
(function (Contracts) {
    Contracts.configure = (options) => Base.configure(Object.assign({ *iterate({ inputs }) {
            for (const [compilationIndex, { contracts }] of inputs.entries()) {
                for (const [contractIndex, contract] of contracts.entries()) {
                    yield {
                        input: contract,
                        breadcrumb: { contractIndex, compilationIndex }
                    };
                }
            }
        },
        find({ inputs, breadcrumb }) {
            const { compilationIndex, contractIndex } = breadcrumb;
            return inputs[compilationIndex].contracts[contractIndex];
        }, initialize({ inputs }) {
            return inputs.map(compilation => (Object.assign(Object.assign({}, compilation), { contracts: [] })));
        },
        merge({ outputs, breadcrumb, output }) {
            const { compilationIndex, contractIndex } = breadcrumb;
            const compilationsBefore = outputs.slice(0, compilationIndex);
            const compilation = outputs[compilationIndex];
            const compilationsAfter = outputs.slice(compilationIndex + 1);
            const contractsBefore = compilation.contracts.slice(0, contractIndex);
            const contract = output;
            const contractsAfter = compilation.contracts.slice(contractIndex + 1);
            return [
                ...compilationsBefore,
                Object.assign(Object.assign({}, compilation), { contracts: [...contractsBefore, contract, ...contractsAfter] }),
                ...compilationsAfter
            ];
        } }, options));
})(Contracts = exports.Contracts || (exports.Contracts = {}));
//# sourceMappingURL=batch.js.map