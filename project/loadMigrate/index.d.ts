import type { ContractObject } from "@truffle/contract-schema/spec";
import type { IdObject } from "../../resources/index";
import type { Process } from "../../process";
import * as Batch from "./batch";
export { Batch };
import * as GetContracts from "./contracts";
import * as AddContractInstances from "./contractInstances";
export { GetContracts, AddContractInstances };
export declare type Artifact = {
    networks?: {
        [networkId: string]: {
            db?: {
                network: IdObject<"networks">;
                contractInstance: IdObject<"contractInstances">;
            };
        };
    };
};
export declare function process(options: {
    network: {
        networkId: string;
    };
    artifacts: (ContractObject & {
        db: {
            contract: IdObject<"contracts">;
            callBytecode: IdObject<"bytecodes">;
            createBytecode: IdObject<"bytecodes">;
        };
        networks?: {
            [networkId: string]: {
                db?: {
                    network: IdObject<"networks">;
                };
            };
        };
    })[];
}): Process<{
    artifacts: Artifact[];
}>;
