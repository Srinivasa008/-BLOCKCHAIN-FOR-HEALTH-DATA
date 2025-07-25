"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllCompilations = exports.GetCompilationProcessedSources = exports.GetCompilationContracts = exports.GetCompilation = exports.AddCompilation = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.AddCompilation = graphql_tag_1.default `
  mutation AddCompilation(
    $compilerName: String!
    $compilerVersion: String!
    $sourceId: ID!
    $bytecodeId: ID!
    $abi: String!
    $sourceMap: String!
    $language: String!
    $astNode: String!
    $length: Int!
    $offset: Int!
    $contractBytecodeId: ID!
  ) {
    compilationsAdd(
      input: {
        compilations: [
          {
            compiler: { name: $compilerName, version: $compilerVersion }
            sourceMaps: [{ bytecode: { id: $bytecodeId }, data: $sourceMap }]
            processedSources: [
              {
                name: "testing"
                ast: { json: $abi }
                source: { id: $sourceId }
                language: $language
              }
            ]
            sources: [{ id: $sourceId }]
            immutableReferences: [
              {
                astNode: $astNode
                bytecode: { id: $contractBytecodeId }
                length: $length
                offsets: [$offset]
              }
            ]
          }
        ]
      }
    ) {
      compilations {
        id
        compiler {
          name
        }
        sources {
          contents
        }
        sourceMaps {
          data
        }
        processedSources {
          source {
            contents
            sourcePath
          }
          ast {
            json
          }
          language
        }
        immutableReferences {
          astNode
          length
          offsets
        }
      }
    }
  }
`;
exports.GetCompilation = graphql_tag_1.default `
  query GetCompilation($id: ID!) {
    compilation(id: $id) {
      id
      compiler {
        name
        version
      }
      sources {
        id
        contents
      }
      processedSources {
        source {
          contents
        }
        language
      }
      immutableReferences {
        astNode
        length
        offsets
      }
    }
  }
`;
exports.GetCompilationContracts = graphql_tag_1.default `
  query GetCompilation($id: ID!) {
    compilation(id: $id) {
      contracts {
        id
        name
      }
    }
  }
`;
exports.GetCompilationProcessedSources = graphql_tag_1.default `
  query GetCompilation($id: ID!) {
    compilation(id: $id) {
      processedSources {
        contracts {
          id
        }
        source {
          contents
        }
        language
      }
    }
  }
`;
exports.GetAllCompilations = graphql_tag_1.default `
  query getAllCompilations {
    compilations {
      compiler {
        name
        version
        settings
      }

      sources {
        id
      }
    }
  }
`;
//# sourceMappingURL=compilation.graphql.js.map