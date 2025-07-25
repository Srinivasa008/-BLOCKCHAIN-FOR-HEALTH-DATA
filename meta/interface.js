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
exports.forAttachAndSchema = void 0;
const logger_1 = require("../logger");
const debug = logger_1.logger("db:meta:interface");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const printer_1 = require("graphql/language/printer");
const graphql_1 = require("graphql");
const apollo_server_1 = require("apollo-server");
const forAttachAndSchema = (options) => {
    const { attach, schema } = options;
    const connect = (connectOptions) => {
        const attachOptions = {
            adapter: (connectOptions || {}).adapter
        };
        const workspace = attach(attachOptions);
        return {
            execute(request, variables = {}) {
                return __awaiter(this, void 0, void 0, function* () {
                    const document = typeof request === "string"
                        ? graphql_tag_1.default `
                ${request}
              `
                        : request;
                    const response = yield graphql_1.execute(schema, document, null, { workspace }, variables);
                    if (response.errors) {
                        debug("request %s", printer_1.print(document));
                        debug("errors %O", response.errors);
                    }
                    return response;
                });
            }
        };
    };
    const serve = (serveOptions) => {
        const attachOptions = {
            adapter: (serveOptions || {}).adapter
        };
        const workspace = attach(attachOptions);
        return new apollo_server_1.ApolloServer({
            tracing: true,
            schema,
            context: { workspace }
        });
    };
    return { connect, serve };
};
exports.forAttachAndSchema = forAttachAndSchema;
//# sourceMappingURL=interface.js.map