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
exports.AdapterWorkspace = void 0;
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:meta:pouch:workspace");
const Id = __importStar(require("../id/index"));
class AdapterWorkspace {
    constructor({ adapter, definitions }) {
        this.adapter = adapter;
        this.generateId = Id.forDefinitions(definitions);
    }
    all(collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = debug.extend(`${collectionName}:all`);
            log("Fetching all...");
            try {
                const savedRecords = yield this.adapter.every(collectionName);
                log("Found.");
                return savedRecords.map(savedRecord => this.unmarshal(collectionName, savedRecord));
            }
            catch (error) {
                log("Error fetching all %s, got error: %O", collectionName, error);
                throw error;
            }
        });
    }
    find(collectionName, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = debug.extend(`${collectionName}:find`);
            log("Finding...");
            // allows searching with `id` instead of pouch's internal `_id`,
            // since we call the field `id` externally, and this approach avoids
            // an extra index
            const fixIdSelector = (selector) => Object.entries(selector)
                .map(([field, predicate]) => field === "id" ? { _id: predicate } : { [field]: predicate })
                .reduce((a, b) => (Object.assign(Object.assign({}, a), b)), {});
            try {
                // handle convenient interface for getting a bunch of IDs while preserving
                // order of input request
                const savedRecords = Array.isArray(options)
                    ? yield this.adapter.retrieve(collectionName, options.map(reference => reference
                        ? { _id: reference.id }
                        : undefined))
                    : yield this.adapter.search(collectionName, Object.assign(Object.assign({}, options), { selector: fixIdSelector(options.selector) }));
                log("Found.");
                return savedRecords.map(savedRecord => savedRecord ? this.unmarshal(collectionName, savedRecord) : undefined);
            }
            catch (error) {
                log("Error fetching all %s, got error: %O", collectionName, error);
                throw error;
            }
        });
    }
    get(collectionName, id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof id === "undefined") {
                return;
            }
            const [savedRecord] = yield this.adapter.retrieve(collectionName, [{ _id: id }]);
            if (savedRecord) {
                return this.unmarshal(collectionName, savedRecord);
            }
        });
    }
    add(collectionName, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = debug.extend(`${collectionName}:add`);
            log("Adding...");
            const records = input[collectionName].map(input => input ? this.marshal(collectionName, input) : undefined);
            const savedRecords = yield this.adapter.save(collectionName, records, { overwrite: false });
            const addedInputs = savedRecords.map(savedRecord => savedRecord ? this.unmarshal(collectionName, savedRecord) : undefined);
            log("Added ids: %o", addedInputs
                .filter((input) => !!input)
                .map(({ id }) => id));
            return {
                [collectionName]: addedInputs
            };
        });
    }
    update(collectionName, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = debug.extend(`${collectionName}:update`);
            log("Updating...");
            const records = input[collectionName].map(input => input ? this.marshal(collectionName, input) : undefined);
            const savedRecords = yield this.adapter.save(collectionName, records, { overwrite: true });
            const updatedInputs = savedRecords.map(savedRecord => savedRecord ? this.unmarshal(collectionName, savedRecord) : undefined);
            log("Updated ids: %o", updatedInputs
                .filter((input) => !!input)
                .map(({ id }) => id));
            return {
                [collectionName]: updatedInputs
            };
        });
    }
    remove(collectionName, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = debug.extend(`${collectionName}:remove`);
            log("Removing...");
            const records = input[collectionName].map(input => input ? this.marshal(collectionName, input) : undefined);
            yield this.adapter.delete(collectionName, records);
            log("Removed.");
        });
    }
    marshal(collectionName, input) {
        const id = this.generateId(collectionName, input);
        if (typeof id === "undefined") {
            throw new Error(`Unable to generate ID for "${collectionName}" resource`);
        }
        return Object.assign(Object.assign({}, input), { _id: id });
    }
    unmarshal(collectionName, record) {
        const id = record._id;
        // remove internal properties:
        //   - PouchDB properties (begin with _)
        //   - ours (begin with $, reserved for future use)
        const fieldNamePattern = /^[^_$]/;
        const input = Object.entries(record)
            .filter(([propertyName]) => propertyName.match(fieldNamePattern))
            .map(([fieldName, value]) => ({ [fieldName]: value }))
            .reduce((a, b) => (Object.assign(Object.assign({}, a), b)), {});
        return Object.assign(Object.assign({}, input), { id });
    }
}
exports.AdapterWorkspace = AdapterWorkspace;
//# sourceMappingURL=workspace.js.map