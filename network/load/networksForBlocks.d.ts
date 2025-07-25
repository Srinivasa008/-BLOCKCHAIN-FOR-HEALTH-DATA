import type { DataModel, Resource, Input } from "../../resources/index";
import { Process } from "../../process";
export declare function process<Network extends Pick<Resource<"networks">, "id" | keyof Input<"networks">>>(options: {
    network: Omit<Input<"networks">, "historicBlock">;
    blocks: DataModel.Block[];
}): Process<(Network | undefined)[]>;
