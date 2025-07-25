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
exports.process = exports.UpdateProjectNames = exports.AddNameRecords = exports.GetCurrent = exports.LookupNames = exports.Batch = void 0;
/**
 * @category Internal processor
 * @packageDocumentation
 */
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:project:assignNames");
const Batch = __importStar(require("./batch"));
exports.Batch = Batch;
const LookupNames = __importStar(require("./lookupNames"));
exports.LookupNames = LookupNames;
const GetCurrent = __importStar(require("./getCurrent"));
exports.GetCurrent = GetCurrent;
const AddNameRecords = __importStar(require("./addNameRecords"));
exports.AddNameRecords = AddNameRecords;
const UpdateProjectNames = __importStar(require("./updateProjectNames"));
exports.UpdateProjectNames = UpdateProjectNames;
/**
 * generator function to load nameRecords and project names into Truffle DB
 */
function* process(options) {
    const { project } = options;
    const assignments = Object.entries(options.assignments)
        .map(([collectionName, resources]) => ({
        [collectionName]: resources.map(resource => ({ resource }))
    }))
        .reduce((a, b) => (Object.assign(Object.assign({}, a), b)), {});
    const withNameAndType = yield* LookupNames.process({
        project,
        assignments
    });
    const withCurrentNameRecords = yield* GetCurrent.process(withNameAndType);
    const withNameRecords = yield* AddNameRecords.process(withCurrentNameRecords);
    const withProjectNames = yield* UpdateProjectNames.process(withNameRecords);
    return withProjectNames;
}
exports.process = process;
//# sourceMappingURL=index.js.map