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
exports.resourceProcessorsForDefinitions = void 0;
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:process");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const graphql = __importStar(require("graphql"));
const change_case_1 = require("change-case");
const pluralize_1 = require("pluralize");
const id_1 = require("../id/index");
const resourceProcessorsForDefinitions = (definitions) => {
    const names = (collectionName) => {
        const { mutable } = definitions[collectionName];
        const resources = collectionName;
        const Resources = change_case_1.pascalCase(resources);
        const resource = pluralize_1.singular(resources);
        const Resource = change_case_1.pascalCase(resource);
        const Mutate = mutable ? "Assign" : "Add";
        const resourcesMutate = `${resources}${Mutate}`;
        const ResourcesMutate = change_case_1.pascalCase(resourcesMutate);
        return {
            resource,
            resources,
            Resource,
            Resources,
            resourcesMutate,
            ResourcesMutate
        };
    };
    return {
        *load(collectionName, inputs) {
            const { Resource, Resources, resources, resourcesMutate } = names(collectionName);
            const response = yield {
                type: "graphql",
                request: graphql_tag_1.default `
          mutation Load${Resources}(
            $inputs: [${Resource}Input]!
          ) {
            ${resourcesMutate}(input: { ${resources}: $inputs }) {
              ${resources} {
                id
              }
            }
          }
        `,
                variables: { inputs }
            };
            debug("response %o", response);
            return response.data[resourcesMutate][resources].map(id_1.toIdObject);
        },
        *get(collectionName, id, document) {
            debug("get");
            const { Resource, resource } = names(collectionName);
            const fragments = document.definitions
                .filter(({ kind }) => kind === "FragmentDefinition")
                .filter(({ typeCondition }) => typeCondition.name.value === Resource)
                .map(({ name: { value } }) => `...${value}`)
                .join("\n");
            const response = yield {
                type: "graphql",
                request: graphql_tag_1.default `
          ${document}
          query Get${Resource}($id: ID!) {
            ${resource}(id: $id) {
              ${fragments}
            }
          }
        `,
                variables: {
                    id
                }
            };
            debug("response %o", response);
            return response.data[resource];
        },
        *find(collectionName, ids, document) {
            debug("find collectionName %o, ids: %o", collectionName, ids);
            const { Resource, Resources, resources } = names(collectionName);
            const fragments = document.definitions
                .filter(({ kind }) => kind === "FragmentDefinition")
                .filter(({ typeCondition }) => typeCondition.name.value === Resource)
                .map(({ name: { value } }) => `...${value}`)
                .join("\n");
            const request = graphql_tag_1.default `
        ${document}
        query Find${Resources}($ids: [ID!]!) {
          ${resources}(filter: { ids: $ids }) {
            ${fragments}
          }
        }
      `;
            debug("request: %s", graphql.print(request));
            const response = yield {
                type: "graphql",
                request,
                variables: {
                    ids
                }
            };
            debug("response %o", response);
            return response.data[resources];
        },
        *all(collectionName, document) {
            const { Resource, Resources, resources } = names(collectionName);
            const fragments = document.definitions
                .filter(({ kind }) => kind === "FragmentDefinition")
                .filter(({ typeCondition }) => typeCondition.name.value === Resource)
                .map(({ name: { value } }) => `...${value}`)
                .join("\n");
            const response = yield {
                type: "graphql",
                request: graphql_tag_1.default `
          ${document}
          query All${Resources} {
            ${resources} {
              ${fragments}
            }
          }
        `,
                variables: {}
            };
            return response.data[resources];
        }
    };
};
exports.resourceProcessorsForDefinitions = resourceProcessorsForDefinitions;
//# sourceMappingURL=resources.js.map