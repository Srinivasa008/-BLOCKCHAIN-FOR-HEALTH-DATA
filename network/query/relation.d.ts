import type { IdObject, Resource } from "../../resources/index";
import type { Process } from "../../process";
/**
 * Issue GraphQL requests and eth_getBlockByNumber requests to determine if any
 * existing Network resources are ancestor or descendant of the connected
 * Network.
 *
 * Iteratively, this queries all possibly-related Networks for known historic
 * block. For each possibly-related Network, issue a corresponding web3 request
 * to determine if the known historic block is, in fact, the connected
 * blockchain's record of the block at that historic height.
 *
 * This queries @truffle/db for possibly-related Networks in batches, keeping
 * track of new candidates vs. what has already been tried.
 */
export declare function process(options: {
    relationship: "ancestor" | "descendant";
    network: IdObject<"networks">;
    exclude?: IdObject<"networks">[];
    disableIndex?: boolean;
}): Process<Resource<"networks"> | undefined>;
