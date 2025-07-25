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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.process = void 0;
/**
 * @category Internal processor
 * @packageDocumentation
 */
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:project:loadMigrate:contracts");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const process_1 = require("../../process");
const Batch = __importStar(require("./batch"));
exports.process = Batch.configure({
    extract({ inputs: { artifacts }, breadcrumb: { artifactIndex } }) {
        return artifacts[artifactIndex].db.contract;
    },
    // @ts-ignore to accommodate non-obvious mismatch
    *process({ entries }) {
        const contracts = yield* process_1.resources.find("contracts", entries.map(({ id }) => id), graphql_tag_1.default `
        fragment Bytecode on Bytecode {
          linkReferences {
            name
          }
        }

        fragment ContractBytecodes on Contract {
          callBytecode {
            ...Bytecode
          }
          createBytecode {
            ...Bytecode
          }
        }
      `);
        return contracts;
    },
    convert({ result, input }) {
        return Object.assign(Object.assign({}, input), result);
    }
});
//# sourceMappingURL=contracts.js.map