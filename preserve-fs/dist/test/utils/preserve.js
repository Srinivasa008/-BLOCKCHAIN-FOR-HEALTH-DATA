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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preserveWithEvents = exports.preserve = void 0;
const Preserve = __importStar(require("@truffle/preserve"));
const lib_1 = require("../../lib");
const iter_tools_1 = require("iter-tools");
const preserve = (inputs, settings = {}) => __awaiter(void 0, void 0, void 0, function* () {
    const recipe = new lib_1.Recipe();
    const result = yield Preserve.Control.run({
        name: recipe.name,
        method: recipe.execute.bind(recipe)
    }, { inputs, settings });
    return result;
});
exports.preserve = preserve;
const preserveWithEvents = (inputs, settings = {}) => __awaiter(void 0, void 0, void 0, function* () {
    const recipe = new lib_1.Recipe();
    const emittedEvents = yield iter_tools_1.asyncToArray(Preserve.Control.control({
        name: recipe.name,
        method: recipe.execute.bind(recipe)
    }, { inputs, settings }));
    return emittedEvents;
});
exports.preserveWithEvents = preserveWithEvents;
//# sourceMappingURL=preserve.js.map