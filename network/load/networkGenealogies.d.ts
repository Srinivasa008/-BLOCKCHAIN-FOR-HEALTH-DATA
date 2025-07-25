import { Resource, IdObject } from "../../resources/index";
import { Process } from "../../process";
/**
 * Load NetworkGenealogy records for a given set of networks while connected
 * to a blockchain with a provider.
 *
 * We take, as a **precondition**, that all relevant networks are actually
 * part of the same blockchain; i.e., that networks with later historic blocks
 * do in fact descend from networks with earlier historic blocks in the list.
 *
 * Using this assumption, the process is as follows:
 *
 *   1. Sort input networks by block height, filtering out missing values
 *      (since input array can be sparse)
 *
 *   2. Find up to three existing networks in the system that are valid for
 *      the currently connected blockchain ("anchors"):
 *
 *      a. the ancestor of the earliest input network
 *      b. the ancestor of the latest input network
 *      c. the descendant of the latest input network
 *
 *   3. If **2.a.** and **2.b.** are different, find the existing networks
 *      between those (i.e., all of **2.b.**'s ancestors back to **2.a.***).
 *
 *      *****: _**2.a.** is guaranteed to be an ancestor of **2.b.** because of
 *      the above precondition._
 *
 *   4. Merge the following networks into a sorted list:
 *      - all input networks
 *      - any/all existing networks in range determined by step **3.**,
 *        including the boundary condition networks from **2.a.** and **2.b.**
 *      - network from **2.c.**, if it exists.
 *
 *   5. For each pair of networks in this list, generate a corresponding
 *      [[[DataModel.NetworkGenealogyInput | NetworkGenealogyInput] whose
 *      ancestor/descendant are [[DataModel.Network | Networks]] from the
 *      earlier/later item in the pair, respectively.
 *
 *   6. Load these genealogy inputs.
 */
export declare function process(options: {
    networks: (Pick<Resource<"networks">, "id" | "historicBlock"> | undefined)[];
    settings?: {
        disableIndex?: boolean;
    };
}): Process<IdObject<"networkGenealogies">[]>;
