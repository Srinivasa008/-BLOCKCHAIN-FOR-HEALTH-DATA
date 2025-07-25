import type { Input, IdObject } from "../../resources/index";
import { Process } from "../../process";
export declare function process(options: {
    input: Input<"projects">;
}): Process<IdObject<"projects">>;
