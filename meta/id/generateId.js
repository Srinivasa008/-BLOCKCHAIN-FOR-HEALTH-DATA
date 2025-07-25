"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forDefinitions = void 0;
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:meta:id:generateId");
const hash_1 = require("./hash");
const forDefinitions = (definitions) => (collectionName, input) => {
    if (!input) {
        return;
    }
    const { idFields } = definitions[collectionName];
    const plucked = idFields.reduce((obj, field) => (Object.assign(Object.assign({}, obj), { [field]: input[field] })), {});
    return hash_1.hash(plucked);
};
exports.forDefinitions = forDefinitions;
//# sourceMappingURL=generateId.js.map