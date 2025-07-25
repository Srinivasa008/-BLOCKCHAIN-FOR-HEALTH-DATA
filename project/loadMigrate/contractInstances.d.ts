import type { Input, IdObject } from "../../resources/index";
import * as Batch from "./batch";
export declare const process: <I extends Batch.ArtifactNetwork<{
    artifact: {
        db: {
            contract: IdObject<"contracts">;
            callBytecode: IdObject<"bytecodes">;
            createBytecode: IdObject<"bytecodes">;
        };
    };
    requires: {
        callBytecode?: {
            linkReferences: {
                name: string | null;
            }[] | null;
        };
        createBytecode?: {
            linkReferences: {
                name: string | null;
            }[] | null;
        };
        db?: {
            network: IdObject<"networks">;
        };
    };
    produces: {
        db?: {
            contractInstance: IdObject<"contractInstances">;
        };
    };
    entry: Input<"contractInstances"> | undefined;
    result: IdObject<"contractInstances"> | undefined;
}>, O extends Batch.Output<{
    artifact: {
        db: {
            contract: IdObject<"contracts">;
            callBytecode: IdObject<"bytecodes">;
            createBytecode: IdObject<"bytecodes">;
        };
    };
    requires: {
        callBytecode?: {
            linkReferences: {
                name: string | null;
            }[] | null;
        };
        createBytecode?: {
            linkReferences: {
                name: string | null;
            }[] | null;
        };
        db?: {
            network: IdObject<"networks">;
        };
    };
    produces: {
        db?: {
            contractInstance: IdObject<"contractInstances">;
        };
    };
    entry: Input<"contractInstances"> | undefined;
    result: IdObject<"contractInstances"> | undefined;
}>>(inputs: {
    network: {
        networkId: string;
    };
    artifacts: {
        [x: string]: string | number | boolean | any[] | {
            [x: string]: any;
        };
        contractName?: string | undefined;
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
        metadata?: string | undefined;
        bytecode?: string | undefined;
        deployedBytecode?: string | undefined;
        sourceMap?: string | undefined;
        deployedSourceMap?: string | undefined;
        source?: string | undefined;
        sourcePath?: string | undefined;
        ast?: {
            [x: string]: any;
        } | undefined;
        legacyAST?: {
            [x: string]: any;
        } | undefined;
        compiler?: {
            [x: string]: any;
            name?: string | undefined;
            version?: string | undefined;
        } | undefined;
        networks?: {
            [x: string]: I;
        } | undefined;
        schemaVersion?: string | undefined;
        updatedAt?: string | undefined;
        networkType?: string | undefined;
        devdoc?: {
            [x: string]: any;
        } | undefined;
        userdoc?: {
            [x: string]: any;
        } | undefined;
        immutableReferences?: {
            [x: string]: {
                start?: number | undefined;
                length?: number | undefined;
            }[];
        } | undefined;
        generatedSources?: {
            id?: number | undefined;
            language?: string | undefined;
            name?: string | undefined;
            contents?: string | undefined;
            ast?: {
                [x: string]: any;
            } | undefined;
        }[] | undefined;
        deployedGeneratedSources?: {
            id?: number | undefined;
            language?: string | undefined;
            name?: string | undefined;
            contents?: string | undefined;
            ast?: {
                [x: string]: any;
            } | undefined;
        }[] | undefined;
        db: {
            [x: string]: {
                [x: string]: any;
                id?: string | undefined;
            };
            contract: {
                name: never;
                abi: never;
                compilation: never;
                processedSource: never;
                createBytecode: never;
                callBytecode: never;
                callBytecodeGeneratedSources: never;
                createBytecodeGeneratedSources: never;
                id: string;
                type: never;
            } | {
                id: string;
                name: never;
                compilation: never;
                abi: never;
                processedSource: never;
                callBytecode: never;
                createBytecode: never;
                callBytecodeGeneratedSources: never;
                createBytecodeGeneratedSources: never;
            };
            callBytecode: {
                bytes: never;
                linkReferences: never;
                instructions: never;
                id: string;
                type: never;
            } | {
                id: string;
                bytes: never;
                linkReferences: never;
            };
            createBytecode: {
                bytes: never;
                linkReferences: never;
                instructions: never;
                id: string;
                type: never;
            } | {
                id: string;
                bytes: never;
                linkReferences: never;
            };
        };
    }[];
}) => Generator<import("../../meta/process/types").GraphQlRequest | import("../../meta/process/types").Web3Request, {
    network: {
        networkId: string;
    };
    artifacts: {
        [x: string]: string | number | boolean | any[] | {
            [x: string]: any;
        };
        contractName?: string | undefined;
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
        metadata?: string | undefined;
        bytecode?: string | undefined;
        deployedBytecode?: string | undefined;
        sourceMap?: string | undefined;
        deployedSourceMap?: string | undefined;
        source?: string | undefined;
        sourcePath?: string | undefined;
        ast?: {
            [x: string]: any;
        } | undefined;
        legacyAST?: {
            [x: string]: any;
        } | undefined;
        compiler?: {
            [x: string]: any;
            name?: string | undefined;
            version?: string | undefined;
        } | undefined;
        networks?: {
            [x: string]: I & O;
        } | undefined;
        schemaVersion?: string | undefined;
        updatedAt?: string | undefined;
        networkType?: string | undefined;
        devdoc?: {
            [x: string]: any;
        } | undefined;
        userdoc?: {
            [x: string]: any;
        } | undefined;
        immutableReferences?: {
            [x: string]: {
                start?: number | undefined;
                length?: number | undefined;
            }[];
        } | undefined;
        generatedSources?: {
            id?: number | undefined;
            language?: string | undefined;
            name?: string | undefined;
            contents?: string | undefined;
            ast?: {
                [x: string]: any;
            } | undefined;
        }[] | undefined;
        deployedGeneratedSources?: {
            id?: number | undefined;
            language?: string | undefined;
            name?: string | undefined;
            contents?: string | undefined;
            ast?: {
                [x: string]: any;
            } | undefined;
        }[] | undefined;
        db: {
            [x: string]: {
                [x: string]: any;
                id?: string | undefined;
            };
            contract: {
                name: never;
                abi: never;
                compilation: never;
                processedSource: never;
                createBytecode: never;
                callBytecode: never;
                callBytecodeGeneratedSources: never;
                createBytecodeGeneratedSources: never;
                id: string;
                type: never;
            } | {
                id: string;
                name: never;
                compilation: never;
                abi: never;
                processedSource: never;
                callBytecode: never;
                createBytecode: never;
                callBytecodeGeneratedSources: never;
                createBytecodeGeneratedSources: never;
            };
            callBytecode: {
                bytes: never;
                linkReferences: never;
                instructions: never;
                id: string;
                type: never;
            } | {
                id: string;
                bytes: never;
                linkReferences: never;
            };
            createBytecode: {
                bytes: never;
                linkReferences: never;
                instructions: never;
                id: string;
                type: never;
            } | {
                id: string;
                bytes: never;
                linkReferences: never;
            };
        };
    }[];
}, any>;
