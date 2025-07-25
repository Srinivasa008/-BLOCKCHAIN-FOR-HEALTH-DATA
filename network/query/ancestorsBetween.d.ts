import type { Resource } from "../../resources/index";
import { Process } from "../../process";
/**
 * Find all ancestors of provided latest network back to provided earliest
 * network.
 */
export declare function process(options: {
    earliest: Resource<"networks"> | undefined;
    latest: Resource<"networks"> | undefined;
}): Process<Resource<"networks">[]>;
