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
exports.projectNames = void 0;
const logger_1 = require("../logger");
const debug = logger_1.logger("db:resources:projectNames");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.projectNames = {
    names: {
        resource: "projectName",
        Resource: "ProjectName",
        resources: "projectNames",
        Resources: "ProjectNames",
        resourcesMutate: "projectNamesAssign",
        ResourcesMutate: "ProjectNamesAssign"
    },
    createIndexes: [
        {
            fields: ["project.id"]
        },
        {
            fields: ["project.id", "key.type"]
        },
        {
            fields: ["project.id", "key.name", "key.type"]
        }
    ],
    idFields: ["project", "key"],
    mutable: true,
    typeDefs: graphql_tag_1.default `
    type ProjectName implements Resource {
      project: Project!
      key: ProjectNameKey!
      nameRecord: NameRecord!
    }

    type ProjectNameKey {
      name: String!
      type: String!
    }

    input ProjectNameInput {
      project: ResourceReferenceInput!
      key: ProjectNameKeyInput!
      nameRecord: ResourceReferenceInput!
    }

    input ProjectNameKeyInput {
      name: String!
      type: String!
    }
  `,
    resolvers: {
        ProjectName: {
            project: {
                resolve: ({ project: { id } }, _, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving ProjectName.project...");
                    const result = yield workspace.get("projects", id);
                    debug("Resolved ProjectName.project.");
                    return result;
                })
            },
            nameRecord: {
                resolve: ({ nameRecord: { id } }, _, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    debug("Resolving ProjectName.nameRecord...");
                    const result = yield workspace.get("nameRecords", id);
                    debug("Resolved ProjectName.nameRecord.");
                    return result;
                })
            }
        }
    }
};
//# sourceMappingURL=projectNames.js.map