import type { ImmutableReferences } from "@truffle/contract-schema/spec";
import type { Input, IdObject } from "../../resources/index";
import * as Batch from "./batch";
interface Contract {
    sourcePath: string;
    ast: any;
    sourceMap: string;
    deployedSourceMap: string;
    immutableReferences: ImmutableReferences;
    db: {
        source: IdObject<"sources">;
        callBytecode: IdObject<"bytecodes">;
        createBytecode: IdObject<"bytecodes">;
    };
}
interface Source {
    sourcePath: string;
    contents: string;
    language: string;
    ast: any;
    legacyAST: any;
    db: {
        source: IdObject<"sources">;
    };
}
export declare const process: <I extends Batch.Compilation<{
    compilation: {
        compiler: {
            name: string;
            version: string;
        };
        sources: {};
        sourceIndexes: string[];
    };
    source: Source;
    contract: Contract;
    resources: {
        compilation: IdObject<"compilations"> | undefined;
    };
    entry: Input<"compilations">;
    result: IdObject<"compilations"> | undefined;
}>, O extends import("@truffle/compile-common").Compilation & {
    compiler: {
        name: string;
        version: string;
    };
    sources: {};
    sourceIndexes: string[];
} & {
    contracts: Batch.Contract<{
        compilation: {
            compiler: {
                name: string;
                version: string;
            };
            sources: {};
            sourceIndexes: string[];
        };
        source: Source;
        contract: Contract;
        resources: {
            compilation: IdObject<"compilations"> | undefined;
        };
        entry: Input<"compilations">;
        result: IdObject<"compilations"> | undefined;
    }>[];
    sources: Source[];
} & {
    db: {
        compilation: IdObject<"compilations"> | undefined;
    };
}>(inputs: I[]) => Generator<import("../../meta/process/types").GraphQlRequest | import("../../meta/process/types").Web3Request, (I & O)[], any>;
export {};
