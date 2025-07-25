"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.definitions = exports.toIdObject = void 0;
/**
 * Namespace that represents the kinds of entities managed by @truffle/db
 *
 * A number of the types defined by this namespace are useful when working
 * with @truffle/db programmatically in TypeScript projects. In particular,
 * see [[Resource]], [[Input]], and [[IdObject]].
 *
 * @example Using helper types to save and retrieve a source:
 *
 * ```typescript
 * import gql from "graphql-tag";
 * import { connect, Process, Resources } from "@truffle/db";
 *
 * const db = connect({
 *   // ...
 * });
 *
 * const { run } = Process.Run.forDb(db);
 *
 * const [ { id } ]: Resources.IdObject<"sources">[] = await run(
 *   Process.resources.load,
 *   "sources",
 *   [{ contents: "pragma solidity ..." }]
 * );
 *
 * const { contents }: Resources.Resource<"sources"> = await run(
 *   Process.resources.get,
 *   "sources",
 *   id,
 *   gql`fragment Contents on Source { contents }`
 * );
 * ```
 *
 * See also [[connect]], [[Process.Run.forDb]], and [[Process.resources]].
 *
 * @category Primary
 * @packageDocumentation
 */
const logger_1 = require("../logger");
const debug = logger_1.logger("db:resources");
var types_1 = require("./types");
Object.defineProperty(exports, "toIdObject", { enumerable: true, get: function () { return types_1.toIdObject; } });
const sources_1 = require("./sources");
const bytecodes_1 = require("./bytecodes");
const compilations_1 = require("./compilations");
const contracts_1 = require("./contracts");
const contractInstances_1 = require("./contractInstances");
const networks_1 = require("./networks/index");
const nameRecords_1 = require("./nameRecords");
const projects_1 = require("./projects/index");
const projectNames_1 = require("./projectNames");
const networkGenealogies_1 = require("./networkGenealogies");
/**
 * @category Internal
 */
exports.definitions = {
    sources: sources_1.sources,
    bytecodes: bytecodes_1.bytecodes,
    compilations: compilations_1.compilations,
    contracts: contracts_1.contracts,
    contractInstances: contractInstances_1.contractInstances,
    networks: networks_1.networks,
    nameRecords: nameRecords_1.nameRecords,
    projects: projects_1.projects,
    projectNames: projectNames_1.projectNames,
    networkGenealogies: networkGenealogies_1.networkGenealogies
};
//# sourceMappingURL=index.js.map