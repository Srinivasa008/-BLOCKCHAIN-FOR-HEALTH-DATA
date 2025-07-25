"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddBytecode = exports.GetBytecode = exports.GetAllBytecodes = exports.GetExpectedBytecodeId = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.GetExpectedBytecodeId = graphql_tag_1.default `
  query GetExpectedBytecodeId($bytecodeInput: BytecodeInput!) {
    bytecodeId(input: $bytecodeInput)
  }
`;
exports.GetAllBytecodes = graphql_tag_1.default `
  query GetAllBytecodes {
    bytecodes {
      id
      bytes
      linkReferences {
        id
        offsets
        length
      }
      sourceMap
      instructions {
        opcode
      }
    }
  }
`;
exports.GetBytecode = graphql_tag_1.default `
  query GetBytecode($id: ID!) {
    bytecode(id: $id) {
      id
      bytes
      linkReferences {
        offsets
        name
        length
      }
    }
  }
`;
exports.AddBytecode = graphql_tag_1.default `
  mutation AddBytecode($bytes: Bytes!, $linkReferences: [LinkReferenceInput]) {
    bytecodesAdd(
      input: { bytecodes: [{ bytes: $bytes, linkReferences: $linkReferences }] }
    ) {
      bytecodes {
        id
        bytes
        linkReferences {
          offsets
          name
          length
        }
      }
    }
  }
`;
//# sourceMappingURL=bytecode.graphql.js.map