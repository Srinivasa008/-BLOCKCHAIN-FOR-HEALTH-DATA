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
exports.Databases = exports.getDefaultSettings = void 0;
const logger_1 = require("../../../logger");
const debug = logger_1.logger("db:meta:pouch:adapters:memory");
const pouchdb_1 = __importDefault(require("pouchdb"));
const pouchdb_adapter_memory_1 = __importDefault(require("pouchdb-adapter-memory"));
const Base = __importStar(require("./base"));
const getDefaultSettings = () => ({});
exports.getDefaultSettings = getDefaultSettings;
class Databases extends Base.Databases {
    setup(settings) {
        pouchdb_1.default.plugin(pouchdb_adapter_memory_1.default);
        super.setup(settings);
    }
    createDatabase(collectionName) {
        // HACK PouchDB seems to keep memory around even when we do .close()
        // instead: just give each database a unique name
        const databaseName = `${collectionName}__${Databases.counter++}`;
        return new pouchdb_1.default(databaseName, { adapter: "memory" });
    }
}
exports.Databases = Databases;
Databases.counter = 0;
//# sourceMappingURL=memory.js.map