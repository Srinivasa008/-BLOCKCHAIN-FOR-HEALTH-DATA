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
const debug = logger_1.logger("db:project:loadMigrate:contractInstances");
const process_1 = require("../../process");
const Batch = __importStar(require("./batch"));
exports.process = Batch.configure({
    extract({ input, inputs, breadcrumb }) {
        const { artifacts } = inputs;
        const { artifactIndex } = breadcrumb;
        const artifact = artifacts[artifactIndex];
        const { address, transactionHash, links, callBytecode: { linkReferences: callLinkReferences = [] } = {}, createBytecode: { linkReferences: createLinkReferences = [] } = {}, db: { network } = {} } = input;
        if (!network) {
            return;
        }
        const { db: { contract, callBytecode, createBytecode } } = artifact;
        return {
            address,
            network,
            contract,
            callBytecode: link(callBytecode, callLinkReferences, links),
            creation: {
                transactionHash,
                constructor: {
                    createBytecode: link(createBytecode, createLinkReferences, links)
                }
            }
        };
    },
    *process({ entries }) {
        return yield* process_1.resources.load("contractInstances", entries);
    },
    // @ts-ignore to overcome limitations in contract-schema
    convert({ result, input }) {
        return Object.assign(Object.assign({}, input), { db: Object.assign(Object.assign({}, (input.db || {})), { contractInstance: result }) });
    }
});
function link(bytecode, linkReferences, links) {
    if (!links) {
        return {
            bytecode,
            linkValues: []
        };
    }
    const linkValues = Object.entries(links).map(([name, value]) => ({
        value,
        linkReference: {
            bytecode,
            index: (linkReferences || []).findIndex(linkReference => name === linkReference.name)
        }
    }));
    return {
        bytecode,
        linkValues
    };
}
//# sourceMappingURL=contractInstances.js.map