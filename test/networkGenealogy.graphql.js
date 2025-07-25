"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindDescendants = exports.FindAncestors = exports.AddNetworkGenealogies = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.AddNetworkGenealogies = graphql_tag_1.default `
  mutation AddNetworkGenealogies($ancestor: ID!, $descendant: ID!) {
    networkGenealogiesAdd(
      input: {
        networkGenealogies: [
          { ancestor: { id: $ancestor }, descendant: { id: $descendant } }
        ]
      }
    ) {
      networkGenealogies {
        id
        ancestor {
          id
          name
        }
        descendant {
          id
          name
        }
      }
    }
  }
`;
exports.FindAncestors = graphql_tag_1.default `
  query findAncestorCandidates($id: ID!, $alreadyTried: [ID]!, $limit: Int) {
    network(id: $id) {
      possibleAncestors(alreadyTried: $alreadyTried, limit: $limit) {
        networks {
          id
          historicBlock {
            hash
            height
          }
          networkId
        }
        alreadyTried {
          id
        }
      }
    }
  }
`;
exports.FindDescendants = graphql_tag_1.default `
  query findDescendantCandidates($id: ID!, $alreadyTried: [ID]!, $limit: Int) {
    network(id: $id) {
      possibleDescendants(alreadyTried: $alreadyTried, limit: $limit) {
        networks {
          id
          historicBlock {
            hash
            height
          }
          networkId
        }
        alreadyTried {
          id
        }
      }
    }
  }
`;
//# sourceMappingURL=networkGenealogy.graphql.js.map