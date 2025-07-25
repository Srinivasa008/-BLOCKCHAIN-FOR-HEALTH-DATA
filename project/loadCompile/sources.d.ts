import type { IdObject } from "../../resources/index";
export declare const process: <_I extends {
    contents: string;
    sourcePath: string;
} | {
    contents: string;
    name: string;
}, _O extends _I & {
    db?: {
        source: IdObject<"sources"> | undefined;
    } | undefined;
}>(inputs: any) => Generator<import("../../meta/process/types").GraphQlRequest | import("../../meta/process/types").Web3Request, {
    db?: {} | undefined;
    compiler: {
        name: string | undefined;
        version: string | undefined;
    };
    sourceIndexes: string[];
    sources: {
        db?: {
            source: IdObject<"sources"> | undefined;
        } | undefined;
    }[];
    contracts: {
        db?: {} | undefined;
        sourcePath: string;
        source: string;
        bytecode: {
            bytes: string;
            linkReferences: {
                offsets: number[];
                name: string | null;
                length: number;
            }[];
        };
        compiler: {
            name: string;
            version: string;
        };
        abi: ({
            type: "event";
            name: string;
            inputs: {
                [x: string]: any;
            }[];
            anonymous: boolean;
        } | {
            type: "error";
            name: string;
            inputs: {
                [x: string]: any;
            }[];
        } | {
            [x: string]: any;
        } | {
            [x: string]: any;
        } | {
            [x: string]: any;
        } | {
            [x: string]: any;
        } | {
            type: "receive";
            stateMutability: "payable";
        } | {
            [x: string]: any;
        } | {
            [x: string]: any;
        })[];
        immutableReferences: {
            [x: string]: {
                start?: number | undefined;
                length?: number | undefined;
            }[];
        };
        ast: object;
        legacyAST: object;
        contractName: string;
        sourceMap: string;
        deployedSourceMap: string;
        metadata: string;
        deployedBytecode: {
            bytes: string;
            linkReferences: {
                offsets: number[];
                name: string | null;
                length: number;
            }[];
        };
        devdoc: object;
        userdoc: object;
        generatedSources?: {
            db?: {
                source: IdObject<"sources"> | undefined;
            } | undefined;
        }[] | undefined;
        deployedGeneratedSources?: {
            db?: {
                source: IdObject<"sources"> | undefined;
            } | undefined;
        }[] | undefined;
    }[];
}[], any>;
