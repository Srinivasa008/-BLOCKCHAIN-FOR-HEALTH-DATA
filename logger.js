"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("db:logger"); // this could maybe dogfood
const logger = (namespace) => debug_1.default(namespace);
exports.logger = logger;
//# sourceMappingURL=logger.js.map