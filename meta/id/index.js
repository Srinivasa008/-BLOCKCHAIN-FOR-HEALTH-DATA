"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toIdObject = exports.forDefinitions = void 0;
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:meta:id");
var generateId_1 = require("./generateId");
Object.defineProperty(exports, "forDefinitions", { enumerable: true, get: function () { return generateId_1.forDefinitions; } });
const toIdObject = (resource) => 
// @ts-ignore since this runtime check doesn't seem to play nice with the
// generic
resource
    ? {
        id: resource.id
    }
    : undefined;
exports.toIdObject = toIdObject;
//# sourceMappingURL=index.js.map