import type { Resource, Input, IdObject } from "../../resources/index";
import { Process } from "../../process";
/**
 * Query for latest descendants of a given network and match against what's
 * on chain.
 */
export declare function process<Network extends Pick<Resource<"networks">, "id" | keyof Input<"networks">>>(options: {
    network: IdObject<"networks">;
}): Process<Network | undefined>;
