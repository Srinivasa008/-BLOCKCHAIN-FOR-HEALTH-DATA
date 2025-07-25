import type { Process } from "../../process";
import type { IdObject, NamedCollectionName } from "../../resources/index";
import * as Batch from "./batch";
export { Batch };
import * as LookupNames from "./lookupNames";
import * as GetCurrent from "./getCurrent";
import * as AddNameRecords from "./addNameRecords";
import * as UpdateProjectNames from "./updateProjectNames";
export { LookupNames, GetCurrent, AddNameRecords, UpdateProjectNames };
/**
 * generator function to load nameRecords and project names into Truffle DB
 */
export declare function process<N extends NamedCollectionName>(options: {
    project: IdObject<"projects">;
    assignments: {
        [K in N]: IdObject<K>[];
    };
}): Process<{
    project: IdObject<"projects">;
    assignments: {
        [collectionName: string]: {
            resource: IdObject;
            name: string;
            type: string;
            nameRecord: IdObject<"nameRecords">;
            projectName: IdObject<"projectNames">;
        }[];
    };
}>;
