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
exports.fake = void 0;
const fc = __importStar(require("fast-check"));
const faker_1 = __importDefault(require("faker"));
const change_case_1 = require("change-case");
// borrowed from https://runkit.com/dubzzz/faker-to-fast-check
const fake = (template, transform = change_case_1.camelCase) => fc.integer()
    .noBias()
    .noShrink()
    .map(seed => {
    faker_1.default.seed(seed);
    return transform(faker_1.default.fake(template));
});
exports.fake = fake;
//# sourceMappingURL=fake.js.map