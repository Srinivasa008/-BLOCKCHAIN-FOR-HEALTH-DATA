"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddNameRecord = exports.GetAllNameRecords = exports.GetNameRecord = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.GetNameRecord = graphql_tag_1.default `
  query GetNameRecord($id: ID!) {
    nameRecord(id: $id) {
      id
      resource {
        id
        name
        ... on Network {
          networkId
        }
      }
    }
  }
`;
exports.GetAllNameRecords = graphql_tag_1.default `
  query GetAllNameRecords {
    nameRecords {
      id
      resource {
        id
        name
        ... on Network {
          networkId
        }
      }
    }
  }
`;
exports.AddNameRecord = graphql_tag_1.default `
  mutation AddNameRecord(
    $resource: TypedResourceReferenceInput!
    $previous: ResourceReferenceInput
  ) {
    nameRecordsAdd(
      input: { nameRecords: [{ resource: $resource, previous: $previous }] }
    ) {
      nameRecords {
        id
        resource {
          id
          name
          ... on Network {
            networkId
          }
          ... on Contract {
            abi {
              json
            }
          }
        }
      }
    }
  }
`;
//# sourceMappingURL=nameRecord.graphql.js.map