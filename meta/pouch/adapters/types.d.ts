import type { Collections } from "../../collections";
import type { Definitions } from "../types";
import type { Databases } from "./base";
export declare namespace Generic {
    type Adapters = {
        [adapterName: string]: {
            databases: typeof Databases;
            settings: any;
        };
    };
    type AdapterName<A extends Adapters> = string & keyof A;
    type Adapter<A extends Adapters, N extends AdapterName<A>> = A[N];
    type AdapterDatabases<A extends Adapters = Adapters, N extends AdapterName<A> = AdapterName<A>> = Adapter<A, N>["databases"];
    type AdapterSettings<A extends Adapters = Adapters, N extends AdapterName<A> = AdapterName<A>> = Adapter<A, N>["settings"];
    type AdapterConstructorOptions<C extends Collections, A extends Adapters = Adapters, N extends AdapterName<A> = AdapterName<A>> = {
        definitions: Definitions<C>;
        settings: AdapterSettings<A, N>;
    };
    type AdapterConstructor<_C extends Collections, A extends Adapters = Adapters, N extends AdapterName<A> = AdapterName<A>> = AdapterDatabases<A, N>;
    type AdapterOptions<A extends Adapters, N extends AdapterName<A> = AdapterName<A>> = {
        [K in N]: {
            name: K;
            settings?: AdapterSettings<A, K>;
        };
    }[N];
    interface AttachOptions<A extends Adapters, N extends AdapterName<A> = AdapterName<A>> {
        adapter?: AdapterOptions<A, N>;
    }
    interface ConcretizeResult<C extends Collections, A extends Adapters, N extends AdapterName<A> = AdapterName<A>> {
        constructor: AdapterConstructor<C, A, N>;
        settings: AdapterSettings<A, N>;
    }
}
export declare type GetDefaultSettings = <A extends Generic.Adapters, N extends Generic.AdapterName<A>>() => Generic.AdapterSettings<A, N>;
