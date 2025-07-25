"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.process = void 0;
/**
 * @category Internal processor
 * @packageDocumentation
 */
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:project:initialize");
const process_1 = require("../../process");
function* process(options) {
    const { input } = options;
    const [project] = yield* process_1.resources.load("projects", [input]);
    if (!project) {
        throw new Error("Error loading Project");
    }
    return project;
}
exports.process = process;
//# sourceMappingURL=index.js.map