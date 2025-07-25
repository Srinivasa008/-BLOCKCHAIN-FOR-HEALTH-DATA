import type { DataModel } from "../../resources/index";
import type { Process } from "../../process";
/**
 * Issue web3 requests to retrieve block hashes for a given list of heights.
 */
export declare function process<Height extends number | "latest">(options: {
    block: {
        hash?: string;
        height: Height;
    };
    settings?: {
        skipComplete?: boolean;
    };
}): Process<DataModel.Block | undefined, {
    web3: "eth_getBlockByNumber";
}>;
