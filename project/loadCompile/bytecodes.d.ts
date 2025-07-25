import type { IdObject, Input } from "../../resources/index";
import * as Batch from "./batch";
export declare const process: <I extends Batch.Contract<{
    compilation: {};
    contract: {
        bytecode: Input<"bytecodes">;
        deployedBytecode: Input<"bytecodes">;
    };
    source: {};
    resources: {
        callBytecode: IdObject<"bytecodes"> | undefined;
        createBytecode: IdObject<"bytecodes"> | undefined;
    };
    entry: {
        callBytecode: Input<"bytecodes">;
        createBytecode: Input<"bytecodes">;
    };
    result: {
        callBytecode: IdObject<"bytecodes"> | undefined;
        createBytecode: IdObject<"bytecodes"> | undefined;
    };
}>, O extends import("@truffle/compile-common").CompiledContract & {
    bytecode: Input<"bytecodes">;
    deployedBytecode: Input<"bytecodes">;
} & {
    db: {
        callBytecode: IdObject<"bytecodes"> | undefined;
        createBytecode: IdObject<"bytecodes"> | undefined;
    };
}>(inputs: {
    db?: {} | undefined;
    sources: {
        sourcePath: string;
        contents: string;
        ast?: object | undefined;
        legacyAST?: object | undefined;
        language: string;
    }[];
    compiler: {
        name: string | undefined;
        version: string | undefined;
    };
    sourceIndexes: string[];
    contracts: I[];
}[]) => Generator<import("../../meta/process/types").GraphQlRequest | import("../../meta/process/types").Web3Request, {
    db?: {} | undefined;
    sources: {
        sourcePath: string;
        contents: string;
        ast?: object | undefined;
        legacyAST?: object | undefined;
        language: string;
    }[];
    compiler: {
        name: string | undefined;
        version: string | undefined;
    };
    sourceIndexes: string[];
    contracts: (I & O)[];
}[], any>;
