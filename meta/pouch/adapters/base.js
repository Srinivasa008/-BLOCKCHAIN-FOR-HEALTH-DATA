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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Databases = void 0;
const logger_1 = require("../../../logger");
const debug = logger_1.logger("db:meta:pouch:adapters:base");
const pouchdb_1 = __importDefault(require("pouchdb"));
const pouchdb_debug_1 = __importDefault(require("pouchdb-debug"));
const pouchdb_find_1 = __importDefault(require("pouchdb-find"));
const Id = __importStar(require("../../id/index"));
/**
 * Aggegrates logic for interacting wth a set of PouchDB databases identified
 * by resource collection name.
 */
class Databases {
    constructor(options) {
        this.setup(options.settings);
        this.definitions = options.definitions;
        this.generateId = Id.forDefinitions(this.definitions);
        pouchdb_1.default.plugin(pouchdb_debug_1.default);
        pouchdb_1.default.plugin(pouchdb_find_1.default);
        this.collections = Object.keys(options.definitions)
            .map((resource) => ({
            [resource]: this.createDatabase(resource)
        }))
            .reduce((a, b) => (Object.assign(Object.assign({}, a), b)), {});
        this.ready = this.initialize();
    }
    setup(_) { }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const [collectionName, definition] of Object.entries(this.definitions)) {
                yield this.initializeCollection(collectionName, definition);
            }
            debug("Databases ready.");
        });
    }
    initializeCollection(collectionName, definition) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.collections[collectionName];
            const { createIndexes } = definition;
            for (let index of createIndexes || []) {
                yield collection.createIndex({ index });
            }
        });
    }
    every(collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ready;
            const { rows } = yield this.collections[collectionName].allDocs({
                include_docs: true
            });
            return (rows
                .map(({ doc }) => doc)
                // filter out any views
                .filter(({ views }) => !views));
        });
    }
    retrieve(collectionName, records) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ready;
            const unorderedSavedRecords = yield this.search(collectionName, {
                selector: {
                    _id: {
                        $in: records
                            .filter((obj) => !!obj)
                            .map(({ _id }) => _id)
                    }
                }
            });
            const savedRecordById = unorderedSavedRecords.reduce((byId, savedRecord) => savedRecord
                ? Object.assign(Object.assign({}, byId), { [savedRecord._id]: savedRecord }) : byId, {});
            return records.map(record => record ? savedRecordById[record._id] : undefined);
        });
    }
    search(collectionName, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ready;
            const { docs } = yield this.collections[collectionName].find(options);
            const savedRecords = docs;
            return savedRecords;
        });
    }
    save(collectionName, records, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ready;
            const { overwrite = false } = options;
            const recordsById = records
                .filter((record) => !!record)
                .map(record => ({
                [record._id]: record
            }))
                .reduce((a, b) => (Object.assign(Object.assign({}, a), b)), {});
            const existingSavedRecordById = (yield this.retrieve(collectionName, Object.keys(recordsById).map(_id => ({ _id }))))
                .filter((existingSavedRecord) => !!existingSavedRecord)
                .map(existingSavedRecord => ({
                [existingSavedRecord._id]: existingSavedRecord
            }))
                .reduce((a, b) => (Object.assign(Object.assign({}, a), b)), {});
            const savedRecordById = (yield Promise.all(Object.entries(recordsById).map(([_id, record]) => __awaiter(this, void 0, void 0, function* () {
                const existingSavedRecord = existingSavedRecordById[_id];
                if (existingSavedRecord && !overwrite) {
                    return existingSavedRecord;
                }
                const { _rev = undefined } = existingSavedRecord || {};
                const { rev } = yield this.collections[collectionName].put(Object.assign(Object.assign({}, record), { _rev }));
                return Object.assign(Object.assign({}, record), { _rev: rev });
            }))))
                .map(savedRecord => ({ [savedRecord._id]: savedRecord }))
                .reduce((a, b) => (Object.assign(Object.assign({}, a), b)), {});
            return records.map(record => record && savedRecordById[record._id]);
        });
    }
    delete(collectionName, references) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ready;
            const savedRecords = yield this.retrieve(collectionName, references);
            const savedRecordById = savedRecords
                .filter((savedRecord) => !!savedRecord)
                .map(savedRecord => ({
                [savedRecord._id]: savedRecord
            }))
                .reduce((a, b) => (Object.assign(Object.assign({}, a), b)), {});
            yield Promise.all(Object.values(savedRecordById).map(({ _id, _rev }) => __awaiter(this, void 0, void 0, function* () {
                yield this.collections[collectionName].put({
                    _rev,
                    _id,
                    _deleted: true
                });
            })));
        });
    }
}
exports.Databases = Databases;
//# sourceMappingURL=base.js.map