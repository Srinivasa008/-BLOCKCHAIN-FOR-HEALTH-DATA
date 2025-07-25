import * as Meta from "../meta/index";
import * as DataModel from "./data";
export { DataModel };
/**
 * @category Internal
 */
export declare type Collections = {
    sources: {
        resource: DataModel.Source;
        input: DataModel.SourceInput;
        idFields: ["contents", "sourcePath"];
        names: {
            resource: "source";
            Resource: "Source";
            resources: "sources";
            Resources: "Sources";
            resourcesMutate: "sourcesAdd";
            ResourcesMutate: "SourcesAdd";
        };
    };
    bytecodes: {
        resource: DataModel.Bytecode;
        input: DataModel.BytecodeInput;
        idFields: ["bytes", "linkReferences"];
        names: {
            resource: "bytecode";
            Resource: "Bytecode";
            resources: "bytecodes";
            Resources: "Bytecodes";
            resourcesMutate: "bytecodesAdd";
            ResourcesMutate: "BytecodesAdd";
        };
    };
    compilations: {
        resource: DataModel.Compilation;
        input: DataModel.CompilationInput;
        idFields: ["compiler", "sources"];
        names: {
            resource: "compilation";
            Resource: "Compilation";
            resources: "compilations";
            Resources: "Compilations";
            resourcesMutate: "compilationsAdd";
            ResourcesMutate: "CompilationsAdd";
        };
    };
    contractInstances: {
        resource: DataModel.ContractInstance;
        input: DataModel.ContractInstanceInput;
        idFields: ["contract", "address", "creation"];
        names: {
            resource: "contractInstance";
            Resource: "ContractInstance";
            resources: "contractInstances";
            Resources: "ContractInstances";
            resourcesMutate: "contractInstancesAdd";
            ResourcesMutate: "ContractInstancesAdd";
        };
    };
    contracts: {
        resource: DataModel.Contract;
        input: DataModel.ContractInput;
        idFields: ["name", "abi", "processedSource", "compilation"];
        named: true;
        names: {
            resource: "contract";
            Resource: "Contract";
            resources: "contracts";
            Resources: "Contracts";
            resourcesMutate: "contractsAdd";
            ResourcesMutate: "ContractsAdd";
        };
    };
    nameRecords: {
        resource: DataModel.NameRecord;
        input: DataModel.NameRecordInput;
        idFields: ["resource", "previous"];
        names: {
            resource: "nameRecord";
            Resource: "NameRecord";
            resources: "nameRecords";
            Resources: "NameRecords";
            resourcesMutate: "nameRecordsAdd";
            ResourcesMutate: "NameRecordsAdd";
        };
    };
    networks: {
        resource: DataModel.Network;
        input: DataModel.NetworkInput;
        idFields: ["networkId", "historicBlock"];
        named: true;
        names: {
            resource: "network";
            Resource: "Network";
            resources: "networks";
            Resources: "Networks";
            resourcesMutate: "networksAdd";
            ResourcesMutate: "NetworksAdd";
        };
    };
    projects: {
        resource: DataModel.Project;
        input: DataModel.ProjectInput;
        idFields: ["directory"];
        names: {
            resource: "project";
            Resource: "Project";
            resources: "projects";
            Resources: "Projects";
            resourcesMutate: "projectsAdd";
            ResourcesMutate: "ProjectsAdd";
        };
    };
    projectNames: {
        resource: DataModel.ProjectName;
        input: DataModel.ProjectNameInput;
        idFields: ["project", "key"];
        mutable: true;
        names: {
            resource: "projectName";
            Resource: "ProjectName";
            resources: "projectNames";
            Resources: "ProjectNames";
            resourcesMutate: "projectNamesAssign";
            ResourcesMutate: "ProjectNamesAssign";
        };
    };
    networkGenealogies: {
        resource: DataModel.NetworkGenealogy;
        input: DataModel.NetworkGenealogyInput;
        idFields: ["ancestor", "descendant"];
        names: {
            resource: "networkGenealogy";
            Resource: "NetworkGenealogy";
            resources: "networkGenealogies";
            Resources: "NetworkGenealogies";
            resourcesMutate: "networkGenealogiesAdd";
            ResourcesMutate: "NetworkGenealogiesAdd";
        };
    };
};
/**
 * An instance of @truffle/db
 *
 * Defines the [[Meta.Db.execute | `db.execute()`]] method, which accepts
 * GraphQL requests and returns GraphQL responses.
 *
 * See [[connect | connect()]] for how to instantiate this interface.
 *
 * @example
 * ```typescript
 * import gql from "graphql-tag";
 * import { connect, Db } from "@truffle/db";
 *
 * const db: Db = connect({
 *   // ...
 * });
 *
 * const {
 *   project: {
 *     contract: {
 *       id,
 *       abi,
 *       processedSource,
 *       callBytecode
 *     }
 *   }
 * } = await db.execute(gql`
 *   query {
 *     project(id: "0x...") {
 *       contract(name: "MagicSquare") {
 *         id
 *         abi { json }
 *         processedSource {
 *           source { contents }
 *           ast { json }
 *         }
 *         callBytecode {
 *           bytes
 *           linkReferences { name length offsets }
 *           instructions { opcode programCounter pushData }
 *         }
 *       }
 *     }
 *   }
 * `);
 * ```
 */
export declare type Db = Meta.Db<Collections>;
/**
 * @category Internal
 */
export declare type Definitions = Meta.Definitions<Collections>;
/**
 * @category Internal
 */
export declare type Definition<N extends CollectionName> = Definitions[N];
/**
 * `bytecodes`, `contracts`, etc.
 *
 * @category Primary
 */
export declare type CollectionName = Meta.CollectionName<Collections>;
/**
 * Input type for a given collection name
 *
 * @example
 * ```typescript
 * import { Resources } from "@truffle/db";
 *
 * const sourceInput: Resources.Input<"sources"> = {
 *   contents: "echo \"hello world\""
 * }
 * ```
 * @category Primary
 */
export declare type Input<N extends CollectionName = CollectionName> = Meta.Input<Collections, N>;
/**
 * Resource type for a given collection name
 *
 * @example
 * ```typescript
 * import { Resources } from "@truffle/db";
 *
 * const source: Resources.Resource<"sources"> = {
 *   id: "0x...",
 *   contents: "echo \"hello world\""
 * }
 * ```
 * @category Primary
 */
export declare type Resource<N extends CollectionName = CollectionName> = Meta.Resource<Collections, N>;
export declare type SavedInput<N extends CollectionName = CollectionName> = Meta.SavedInput<Collections, N>;
export declare type IdFields<N extends CollectionName = CollectionName> = Meta.IdFields<Collections, N>;
/**
 * Common reference type for resources in the system
 *
 * This exists for type safety purposes. Typically, do not define variables
 * of this type directly; use [[toIdObject]] on existing resources.
 *
 * @example
 * ```typescript
 * import { Resources } from "@truffle/db";
 *
 * declare const source: Resources.Resource<"sources">;
 *
 * const { id }: Resources.IdObject<"sources"> = Resources.toIdObject(source);
 * ```
 * @category Primary
 */
export declare type IdObject<N extends CollectionName = CollectionName> = Meta.IdObject<Collections, N>;
/**
 * Convert a given [[Resource]] to an [[IdObject]]
 *
 * @category Primary
 */
export declare const toIdObject: <N extends "sources" | "bytecodes" | "compilations" | "contractInstances" | "contracts" | "nameRecords" | "networks" | "projects" | "projectNames" | "networkGenealogies", R extends import("../meta/collections").CollectionProperty<"resource", Collections, N> | Meta.SavedInput<Collections, N> = import("../meta/collections").CollectionProperty<"resource", Collections, N> | Meta.SavedInput<Collections, N>, I extends Pick<R, "id"> | null | undefined = Pick<R, "id"> | null | undefined>(resource: I) => Pick<R, "id"> extends I ? Meta.IdObject<Collections, N, R> : Meta.IdObject<Collections, N, R> | undefined;
/**
 * Type akin to [[CollectionName]] but only includes mutable collections
 *
 * @category Primary
 */
export declare type MutableCollectionName = Meta.MutableCollectionName<Collections>;
/**
 * Type akin to [[CollectionName]] but only includes named collections
 *
 * @category Primary
 */
export declare type NamedCollectionName = Meta.NamedCollectionName<Collections>;
/**
 * @category Internal
 */
export declare type Workspace = Meta.Workspace<Collections>;
