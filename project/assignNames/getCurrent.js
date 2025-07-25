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
const debug = logger_1.logger("db:project:assignNames:getCurrent");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const process_1 = require("../../process");
const Batch = __importStar(require("./batch"));
exports.process = Batch.configure({
    extract({ input: { name, type } }) {
        return { name, type };
    },
    *process({ entries, inputs: { project: { id } } }) {
        const nameRecords = [];
        for (const { name, type } of entries) {
            const project = yield* process_1.resources.get("projects", id, graphql_tag_1.default `
        fragment Resolve_${type}_${name.replace(/[^0-9a-zA-Z_]/, "")} on Project {
          resolve(type: "${type}", name: "${name}") {
            id
            resource {
              id
              type
            }
            previous {
              id
            }
          }
        }
      `);
            if (!project || !project.resolve) {
                continue;
            }
            const { resolve: [nameRecord] } = project;
            nameRecords.push(nameRecord);
        }
        return nameRecords;
    },
    convert({ result, input }) {
        return Object.assign(Object.assign({}, input), { current: result });
    }
});
//# sourceMappingURL=getCurrent.js.map