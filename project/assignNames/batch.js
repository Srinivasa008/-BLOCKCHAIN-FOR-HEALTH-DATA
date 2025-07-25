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
exports.configure = void 0;
/**
 * @category Internal boilerplate
 * @packageDocumentation
 */
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:project:assignNames:batch");
const Base = __importStar(require("../batch"));
const configure = (options) => {
    const processCollection = configureForCollection(options);
    return function* (options) {
        const { project } = options;
        const result = {
            project,
            assignments: {}
        };
        for (const [collectionName, assignments] of Object.entries(options.assignments)) {
            debug("collectionName %o", collectionName);
            const outputs = yield* processCollection({
                project,
                collectionName,
                assignments
            });
            debug("outputs %o", outputs);
            result.assignments[collectionName] = outputs.assignments;
        }
        debug("result %o", result);
        return result;
    };
};
exports.configure = configure;
const configureForCollection = (options) => Base.configure(Object.assign({ *iterate({ inputs }) {
        for (const [assignmentIndex, assignment] of inputs.assignments.entries()) {
            yield {
                input: assignment,
                breadcrumb: {
                    assignmentIndex
                }
            };
        }
    },
    find({ inputs, breadcrumb }) {
        const { assignmentIndex } = breadcrumb;
        return inputs.assignments[assignmentIndex];
    },
    initialize({ inputs }) {
        return {
            project: inputs.project,
            collectionName: inputs.collectionName,
            assignments: inputs.assignments.map(assignment => assignment)
        };
    },
    merge({ outputs, breadcrumb, output }) {
        const { assignmentIndex } = breadcrumb;
        const assignmentsBefore = outputs.assignments.slice(0, assignmentIndex);
        const assignment = output;
        const assignmentsAfter = outputs.assignments.slice(assignmentIndex + 1);
        return {
            project: outputs.project,
            collectionName: outputs.collectionName,
            assignments: [...assignmentsBefore, assignment, ...assignmentsAfter]
        };
    } }, options));
//# sourceMappingURL=batch.js.map