"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sources = void 0;
const logger_1 = require("../logger");
const debug = logger_1.logger("db:resources:sources");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.sources = {
    names: {
        resource: "source",
        Resource: "Source",
        resources: "sources",
        Resources: "Sources",
        resourcesMutate: "sourcesAdd",
        ResourcesMutate: "SourcesAdd"
    },
    createIndexes: [],
    idFields: ["contents", "sourcePath"],
    typeDefs: graphql_tag_1.default `
    type Source implements Resource {
      sourcePath: String
      contents: String!
    }

    input SourceInput {
      contents: String!
      sourcePath: String
    }
  `
};
//# sourceMappingURL=sources.js.map