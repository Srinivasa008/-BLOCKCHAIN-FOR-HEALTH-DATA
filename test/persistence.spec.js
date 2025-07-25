"use strict";
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
const path_1 = __importDefault(require("path"));
const system_1 = require("../system");
const utils_1 = require("./utils");
const tmp_1 = __importDefault(require("tmp"));
const tempDir = tmp_1.default.dirSync({ unsafeCleanup: true });
const bytecode = {
    bytes: "deadbeef",
    linkReferences: []
};
const id = utils_1.generateId("bytecodes", bytecode);
const memoryAdapter = {
    name: "memory"
};
const fsAdapter = {
    name: "fs",
    settings: {
        directory: path_1.default.join(tempDir.name, "json")
    }
};
const sqliteAdapter = {
    name: "sqlite",
    settings: {
        directory: path_1.default.join(tempDir.name, "sqlite")
    }
};
describe("Memory-based Workspace", () => {
    it("does not persist data", () => __awaiter(void 0, void 0, void 0, function* () {
        // create first workspace and add to it
        const workspace1 = system_1.attach({ adapter: memoryAdapter });
        yield workspace1.add("bytecodes", {
            bytecodes: [bytecode]
        });
        // make sure we can get data out of that workspace
        expect(yield workspace1.get("bytecodes", id)).toBeDefined();
        // create a second workspace and don't add anything
        const workspace2 = system_1.attach({ adapter: memoryAdapter });
        // and don't get data out!
        expect(yield workspace2.get("bytecodes", id)).toBeUndefined();
    }));
});
describe("FS-based Workspace", () => {
    it("does persist data", () => __awaiter(void 0, void 0, void 0, function* () {
        // create first workspace and add to it
        const workspace1 = system_1.attach({ adapter: fsAdapter });
        yield workspace1.add("bytecodes", {
            bytecodes: [bytecode]
        });
        // make sure we can get data out of that workspace
        expect(yield workspace1.get("bytecodes", id)).toBeDefined();
        // create a second workspace and don't add anything
        const workspace2 = system_1.attach({ adapter: fsAdapter });
        // but DO get data out
        expect(yield workspace2.get("bytecodes", id)).toBeDefined();
    }));
});
describe("SQLite-based Workspace", () => {
    it("does persist data", () => __awaiter(void 0, void 0, void 0, function* () {
        // create first workspace and add to it
        const workspace1 = system_1.attach({ adapter: sqliteAdapter });
        yield workspace1.add("bytecodes", {
            bytecodes: [bytecode]
        });
        // make sure we can get data out of that workspace
        expect(yield workspace1.get("bytecodes", id)).toBeDefined();
        // create a second workspace and don't add anything
        const workspace2 = system_1.attach({ adapter: sqliteAdapter });
        // but DO get data out
        expect(yield workspace2.get("bytecodes", id)).toBeDefined();
    }));
});
//# sourceMappingURL=persistence.spec.js.map