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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectedProject = exports.Project = exports.initialize = exports.LoadMigrate = exports.LoadCompile = exports.AssignNames = exports.Initialize = exports.Batch = void 0;
const logger_1 = require("../logger");
const debug = logger_1.logger("db:project");
const Process = __importStar(require("../process"));
const resources_1 = require("../resources/index");
const Network = __importStar(require("../network/index"));
const Batch = __importStar(require("./batch"));
exports.Batch = Batch;
const Initialize = __importStar(require("./initialize/index"));
exports.Initialize = Initialize;
const AssignNames = __importStar(require("./assignNames/index"));
exports.AssignNames = AssignNames;
const LoadCompile = __importStar(require("./loadCompile/index"));
exports.LoadCompile = LoadCompile;
const LoadMigrate = __importStar(require("./loadMigrate/index"));
exports.LoadMigrate = LoadMigrate;
/**
 * Construct abstraction and idempotentally add a project resource
 *
 * @category Constructor
 */
function initialize(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { run, forProvider } = "db" in options ? Process.Run.forDb(options.db) : options;
        const { project: input } = options;
        const project = yield run(Initialize.process, { input });
        return new Project({ run, forProvider, project });
    });
}
exports.initialize = initialize;
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
class Project {
    /**
     * @ignore
     */
    constructor(options) {
        this.project = options.project;
        this._run = options.run;
        if (options.forProvider) {
            this.forProvider = options.forProvider;
        }
    }
    get id() {
        return this.project.id;
    }
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
    loadCompile(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { result } = options;
            return yield this.run(LoadCompile.process, result);
        });
    }
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
    assignNames(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { assignments } = yield this.run(AssignNames.process, {
                project: this.project,
                assignments: options.assignments
            });
            return {
                // @ts-ignore
                assignments: Object.entries(assignments)
                    .map(([collectionName, assignments]) => ({
                    [collectionName]: assignments.map(({ nameRecord }) => nameRecord)
                }))
                    .reduce((a, b) => (Object.assign(Object.assign({}, a), b)), {})
            };
        });
    }
    /**
     * Accept a provider to enable workflows that require communicating with the
     * underlying blockchain network.
     * @category Constructor
     */
    connect(options) {
        const { run } = this.forProvider(options.provider);
        return new ConnectedProject({
            run,
            project: this.project
        });
    }
    /**
     * Run a given [[Process.Processor | Processor]] with specified arguments.
     *
     * This method is a [[Meta.Process.ProcessorRunner | ProcessorRunner]] and
     * can be used to `await` (e.g.) the processors defined by
     * [[Process.resources | Process's `resources`]].
     *
     * @category Processor
     */
    run(processor, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._run(processor, ...args);
        });
    }
}
exports.Project = Project;
class ConnectedProject extends Project {
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
    loadMigrate(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const network = yield Network.initialize({
                network: options.network,
                run: (...args) => this.run(...args)
            });
            const { networkId } = network.genesis;
            const transactionHashes = options.artifacts.map(({ networks = {} }) => (networks[networkId] || {}).transactionHash);
            const networks = yield network.includeTransactions({ transactionHashes });
            // if there are any missing networks, fetch the latest as backup data
            if (networks.find((network) => !network)) {
                yield network.includeLatest();
            }
            const { artifacts } = yield this.run(LoadMigrate.process, {
                network: {
                    networkId: network.knownLatest.networkId
                },
                // @ts-ignore HACK to avoid making LoadMigrate.process generic
                artifacts: this.populateNetworks({
                    artifacts: options.artifacts,
                    knownLatest: network.knownLatest,
                    networks
                })
            });
            return {
                network: resources_1.toIdObject(network.knownLatest),
                artifacts
            };
        });
    }
    populateNetworks(options) {
        const { knownLatest, networks, artifacts } = options;
        const { networkId } = knownLatest;
        return artifacts.map((artifact, index) => {
            const network = (artifact.networks || {})[networkId] || {};
            if (!network.address) {
                return artifact;
            }
            return Object.assign(Object.assign({}, artifact), { networks: Object.assign(Object.assign({}, artifact.networks), { [networkId]: Object.assign(Object.assign({}, (artifact.networks || {})[networkId]), { db: {
                            network: networks[index] || resources_1.toIdObject(knownLatest)
                        } }) }) });
        });
    }
}
exports.ConnectedProject = ConnectedProject;
//# sourceMappingURL=index.js.map