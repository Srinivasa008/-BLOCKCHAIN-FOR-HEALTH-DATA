import type * as Common from "@truffle/compile-common";
import type { IdObject } from "../../resources/index";
import type { Process } from "../../process";
import * as Batch from "./batch";
export { Batch };
import * as AddSources from "./sources";
import * as AddBytecodes from "./bytecodes";
import * as AddCompilations from "./compilations";
import * as AddContracts from "./contracts";
export { AddSources, AddBytecodes, AddCompilations, AddContracts };
export declare type Compilation = Common.Compilation & {
    contracts: Contract[];
    sources: Source[];
    compiler: {
        name: string;
        version: string;
    };
    db: {
        compilation: IdObject<"compilations">;
    };
};
export declare type Source = Common.Source & {
    db: {
        source: IdObject<"sources">;
    };
};
export declare type Contract = Common.CompiledContract & {
    db: {
        contract: IdObject<"contracts">;
        source: IdObject<"sources">;
        callBytecode: IdObject<"bytecodes">;
        createBytecode: IdObject<"bytecodes">;
    };
};
/**
 * For a compilation result from @truffle/workflow-compile/new, generate a
 * sequence of GraphQL requests to submit to Truffle DB
 *
 * Returns a generator that yields requests to forward to Truffle DB.
 * When calling `.next()` on this generator, pass any/all responses
 * and ultimately returns nothing when complete.
 */
export declare function process(result: Common.WorkflowCompileResult): Process<{
    compilations: Compilation[];
    contracts: Contract[];
}>;
