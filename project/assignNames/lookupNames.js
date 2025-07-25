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
const debug = logger_1.logger("db:project:assignNames:lookupNames");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const change_case_1 = require("change-case");
const pluralize_1 = require("pluralize");
const process_1 = require("../../process");
const Batch = __importStar(require("./batch"));
exports.process = Batch.configure({
    extract({ input: { resource } }) {
        return resource;
    },
    *process({ entries, inputs: { collectionName } }) {
        const type = change_case_1.pascalCase(pluralize_1.singular(collectionName));
        const results = yield* process_1.resources.find(collectionName, entries.map(({ id }) => id), graphql_tag_1.default `
        fragment ${type}Name on ${type} {
          name
        }
      `);
        // catch unknown resources so we can abort
        const missing = results
            .map((resource, index) => !resource && entries[index].id)
            .filter((id) => !!id);
        if (missing.length > 0) {
            throw new Error(`Unknown ${collectionName}: ${missing.join(", ")}`);
        }
        return results.map(({ name }) => ({
            name,
            type
        }));
    },
    convert({ result, input }) {
        return Object.assign(Object.assign({}, input), result);
    }
});
//# sourceMappingURL=lookupNames.js.map