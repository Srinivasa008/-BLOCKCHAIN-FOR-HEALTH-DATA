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
exports.networkGenealogies = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.networkGenealogies = {
    names: {
        resource: "networkGenealogy",
        Resource: "NetworkGenealogy",
        resources: "networkGenealogies",
        Resources: "NetworkGenealogies",
        resourcesMutate: "networkGenealogiesAdd",
        ResourcesMutate: "NetworkGenealogiesAdd"
    },
    createIndexes: [
        {
            fields: ["ancestor.id"]
        },
        {
            fields: ["descendant.id"]
        }
    ],
    idFields: ["ancestor", "descendant"],
    typeDefs: graphql_tag_1.default `
    type NetworkGenealogy implements Resource {
      ancestor: Network
      descendant: Network
    }

    input NetworkGenealogyInput {
      ancestor: ResourceReferenceInput!
      descendant: ResourceReferenceInput!
    }
  `,
    resolvers: {
        NetworkGenealogy: {
            ancestor: {
                resolve: ({ ancestor }, __, { workspace }) => __awaiter(void 0, void 0, void 0, function* () {
                    const result = yield workspace.get("networks", ancestor.id);
                    return result;
                })
            },
            descendant: {
                resolve: ({ descendant }, __, { workspace }) => __awaiter(void 0, void 0, void 0, function* () { return yield workspace.get("networks", descendant.id); })
            }
        }
    }
};
//# sourceMappingURL=networkGenealogies.js.map