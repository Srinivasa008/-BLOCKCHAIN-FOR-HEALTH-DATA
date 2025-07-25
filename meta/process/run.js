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
Object.defineProperty(exports, "__esModule", { value: true });
exports.runForDefinitions = void 0;
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:meta:process:run");
const util_1 = require("util");
const runForDefinitions = (_definitions // this is only used for type inference
) => (db) => {
    const connections = {
        db
    };
    return {
        run(processor, ...args) {
            return run(connections, processor, ...args);
        },
        forProvider(provider) {
            const connections = {
                db,
                provider
            };
            return {
                run: (processor, ...args) => run(connections, processor, ...args)
            };
        }
    };
};
exports.runForDefinitions = runForDefinitions;
const run = (connections, processor, ...args) => __awaiter(void 0, void 0, void 0, function* () {
    const saga = processor(...args);
    let current = saga.next();
    while (!current.done) {
        const loadRequest = current.value;
        switch (loadRequest.type) {
            case "graphql": {
                const { db } = connections;
                const { request, variables } = loadRequest;
                const response = yield db.execute(request, variables);
                current = saga.next(response);
                break;
            }
            case "web3": {
                if (!connections.provider) {
                    throw new Error("Missing provider; cannot communicate with network");
                }
                const { provider } = connections;
                const { method, params } = loadRequest;
                const payload = {
                    jsonrpc: "2.0",
                    id: new Date().getTime(),
                    method,
                    params
                };
                const response = yield util_1.promisify(provider.send)(payload);
                current = saga.next(response);
                break;
            }
            default: {
                throw new Error(`Unknown request type ${loadRequest.type}`);
            }
        }
    }
    return current.value;
});
//# sourceMappingURL=run.js.map