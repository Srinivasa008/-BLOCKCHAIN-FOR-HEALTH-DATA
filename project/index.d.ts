import type { Provider } from "web3/providers";
import type { WorkflowCompileResult } from "@truffle/compile-common";
import type { ContractObject } from "@truffle/contract-schema/spec";
import * as Process from "../process";
import { Db, NamedCollectionName, Input, IdObject } from "../resources/index";
import * as Batch from "./batch";
export { Batch };
import * as Initialize from "./initialize/index";
import * as AssignNames from "./assignNames/index";
import * as LoadCompile from "./loadCompile/index";
import * as LoadMigrate from "./loadMigrate/index";
export { Initialize, AssignNames, LoadCompile, LoadMigrate };
export declare type InitializeOptions = {
    project: Input<"projects">;
} & ({
    db: Db;
} | ReturnType<typeof Process.Run.forDb>);
/**
 * Construct abstraction and idempotentally add a project resource
 *
 * @category Constructor
 */
export declare function initialize(options: InitializeOptions): Promise<Project>;
/**
 * Abstraction for connecting @truffle/db to a Truffle project
 *
 * This class affords an interface between Truffle and @truffle/db,
 * specifically for the purposes of ingesting @truffle/workflow-compile results
 * and contract instance information from @truffle/contract-schema artifact
 * files.
 *
 * Unless you are building tools that work with Truffle's various packages
 * directly, you probably don't need to use this class.
 *
 * @example To instantiate this abstraction:
 * ```typescript
 * import { connect, Project } from "@truffle/db";
 *
 * const db = connect({
 *   // ...
 * });
 *
 * const project = await Project.initialize({
 *   db,
 *   project: {
 *     directory: "/path/to/project/dir"
 *   }
 * });
 * ```
 */
export declare class Project {
    get id(): string;
    /**
     * Accept a compilation result and process it to save all relevant resources
     * ([[DataModel.Source | Source]], [[DataModel.Bytecode | Bytecode]],
     * [[DataModel.Compilation | Compilation]],
     * [[DataModel.Contract | Contract]])
     *
     * This returns the same WorkflowCompileResult but with additional
     * references to each of the added resources.
     *
     * @category Truffle-specific
     */
    loadCompile(options: {
        result: WorkflowCompileResult;
    }): Promise<{
        compilations: LoadCompile.Compilation[];
        contracts: LoadCompile.Contract[];
    }>;
    /**
     * Update name pointers for this project. Currently affords name-keeping for
     * [[DataModel.Network | Network]] and [[DataModel.Contract | Contract]]
     * resources (e.g., naming [[DataModel.ContractInstance | ContractInstance]]
     * resources is not supported directly)
     *
     * This saves [[DataModel.NameRecord | NameRecord]] and
     * [[DataModel.ProjectName | ProjectName]] resources to @truffle/db.
     *
     * Returns a list of NameRecord resources for completeness, although these
     * may be regarded as an internal concern. ProjectName resources are not
     * returned because they are mutable; returned representations would be
     * impermanent.
     *
     * @typeParam N
     * Either `"contracts"`, `"networks"`, or `"contracts" | "networks"`.
     *
     * @param options.assignments
     * Object whose keys belong to the set of named collection names and whose
     * values are [[IdObject | IdObjects]] for resources of that collection.
     *
     * @example
     * ```typescript
     * await project.assignNames({
     *   assignments: {
     *     contracts: [
     *       { id: "<contract1-id>" },
     *       { id: "<contract2-id>" },
     *       // ...
     *     }
     *   }
     * });
     * ```
     */
    assignNames<N extends NamedCollectionName>(options: {
        assignments: {
            [K in N]: IdObject<K>[];
        };
    }): Promise<{
        assignments: {
            [K in N]: IdObject<"nameRecords">[];
        };
    }>;
    /**
     * Accept a provider to enable workflows that require communicating with the
     * underlying blockchain network.
     * @category Constructor
     */
    connect(options: {
        provider: Provider;
    }): ConnectedProject;
    /**
     * Run a given [[Process.Processor | Processor]] with specified arguments.
     *
     * This method is a [[Meta.Process.ProcessorRunner | ProcessorRunner]] and
     * can be used to `await` (e.g.) the processors defined by
     * [[Process.resources | Process's `resources`]].
     *
     * @category Processor
     */
    run<A extends unknown[], T = any, R extends Process.RequestType | undefined = undefined>(processor: Process.Processor<A, T, R>, ...args: A): Promise<T>;
    /**
     * @hidden
     */
    private forProvider;
    /**
     * @hidden
     */
    private project;
    /**
     * @hidden
     */
    private _run;
    /**
     * @ignore
     */
    constructor(options: {
        project: IdObject<"projects">;
        run: Process.ProcessorRunner;
        forProvider?: (provider: Provider) => {
            run: Process.ProcessorRunner;
        };
    });
}
export declare class ConnectedProject extends Project {
    /**
     * Process artifacts after a migration. Uses provider to determine most
     * relevant network information directly, but still requires
     * project-specific information about the network (i.e., name)
     *
     * This adds potentially multiple [[DataModel.Network | Network]] resources
     * to @truffle/db, creating individual networks for the historic blocks in
     * which each [[DataModel.ContractInstance | ContractInstance]] was first
     * created on-chain.
     *
     * This saves [[DataModel.Network | Network]] and
     * [[DataModel.ContractInstance | ContractInstance]] resources to
     * \@truffle/db.
     *
     * Returns `artifacts` with network objects populated with IDs for each
     * [[DataModel.ContractInstance | ContractInstance]], along with a
     * `network` object containing the ID of whichever
     * [[DataModel.Network | Network]] was added with the highest block height.
     * @category Truffle-specific
     */
    loadMigrate(options: {
        network: Pick<Input<"networks">, "name">;
        artifacts: (ContractObject & {
            db: {
                contract: IdObject<"contracts">;
                callBytecode: IdObject<"bytecodes">;
                createBytecode: IdObject<"bytecodes">;
            };
        })[];
    }): Promise<{
        network: IdObject<"networks">;
        artifacts: LoadMigrate.Artifact[];
    }>;
    private populateNetworks;
}
