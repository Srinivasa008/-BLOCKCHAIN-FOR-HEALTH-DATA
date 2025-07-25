import type { Input, IdObject } from "../../resources/index";
import * as Batch from "./batch";
export declare const process: <I extends Batch.Contract<{
    compilation: {
        db: {
            compilation: IdObject<"compilations">;
        };
    };
    source: {};
    contract: {
        contractName: string;
        abi: any;
        sourcePath: string;
        generatedSources?: {
            id: number;
            name: string;
            language: string;
            contents: string;
            ast: any;
        }[];
        deployedGeneratedSources?: {
            id: number;
            ast: any;
            contents: string;
            language: string;
            name: string;
        }[];
        db: {
            callBytecode: IdObject<"bytecodes">;
            createBytecode: IdObject<"bytecodes">;
        };
    };
    resources: {
        contract: IdObject<"contracts"> | undefined;
    };
    entry: Input<"contracts">;
    result: IdObject<"contracts"> | undefined;
}>, O extends import("@truffle/compile-common").CompiledContract & {
    contractName: string;
    abi: any;
    sourcePath: string;
    generatedSources?: {
        id: number;
        name: string;
        language: string;
        contents: string;
        ast: any;
    }[] | undefined;
    deployedGeneratedSources?: {
        id: number;
        ast: any;
        contents: string;
        language: string;
        name: string;
    }[] | undefined;
    db: {
        callBytecode: IdObject<"bytecodes">;
        createBytecode: IdObject<"bytecodes">;
    };
} & {
    db: {
        contract: IdObject<"contracts"> | undefined;
    };
}>(inputs: {
    db: {
        compilation: {
            compiler: never;
            sources: never;
            processedSources: never;
            sourceMaps: never;
            contracts: never;
            immutableReferences: never;
            id: string;
            type: never;
        } | {
            id: string;
            sources: never;
            compiler: never;
            processedSources: never;
            sourceMaps: never;
            immutableReferences: never;
        };
    };
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
    db: {
        compilation: {
            compiler: never;
            sources: never;
            processedSources: never;
            sourceMaps: never;
            contracts: never;
            immutableReferences: never;
            id: string;
            type: never;
        } | {
            id: string;
            sources: never;
            compiler: never;
            processedSources: never;
            sourceMaps: never;
            immutableReferences: never;
        };
    };
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
