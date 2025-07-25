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
exports.nameRecords = void 0;
const logger_1 = require("../logger");
const debug = logger_1.logger("db:definitions:nameRecords");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const change_case_1 = require("change-case");
const pluralize_1 = require("pluralize");
exports.nameRecords = {
    names: {
        resource: "nameRecord",
        Resource: "NameRecord",
        resources: "nameRecords",
        Resources: "NameRecords",
        resourcesMutate: "nameRecordsAdd",
        ResourcesMutate: "NameRecordsAdd"
    },
    createIndexes: [],
    idFields: ["resource", "previous"],
    typeDefs: graphql_tag_1.default `
    type NameRecord implements Resource {
      resource: Named!
      previous: NameRecord

      history(limit: Int, includeSelf: Boolean): [NameRecord]!
    }

    input NameRecordInput {
      resource: TypedResourceReferenceInput!
      previous: ResourceReferenceInput
    }
  `,
    resolvers: {
        NameRecord: {
            resource: {
                resolve: ({ resource: { id, type } }, _, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving NameRecord.resource...");
                    const collectionName = change_case_1.camelCase(pluralize_1.plural(type));
                    const result = yield workspace.get(collectionName, id);
                    debug("Resolved NameRecord.resource.");
                    return result;
                })
            },
            previous: {
                resolve: ({ previous }, _, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving NameRecord.previous...");
                    if (!previous) {
                        return;
                    }
                    const { id } = previous;
                    const result = yield workspace.get("nameRecords", id);
                    debug("Resolved NameRecord.previous.");
                    return result;
                })
            },
            history: {
                resolve({ id, resource, previous }, { limit, includeSelf = false }, { workspace }) {
                    return __awaiter(this, void 0, void 0, function* () {
                        debug("Resolving NameRecord.history with limit: %s...", typeof limit === "number" ? `${limit}` : "none");
                        let depth = 0;
                        const nameRecords = includeSelf ? [{ id, resource, previous }] : [];
                        debug("previous %o", previous);
                        while (previous && (typeof limit !== "number" || depth < limit)) {
                            const nameRecord = yield workspace.get("nameRecords", previous.id);
                            if (!nameRecord) {
                                break;
                            }
                            nameRecords.push(nameRecord);
                            previous = nameRecord.previous;
                            depth++;
                        }
                        debug("Resolved NameRecord.history with limit: %s.", typeof limit === "number" ? `${limit}` : "none");
                        return nameRecords;
                    });
                }
            }
        }
    }
};
//# sourceMappingURL=nameRecords.js.map