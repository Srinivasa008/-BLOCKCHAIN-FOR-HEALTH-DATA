import type { $ } from "hkts/src";
import type { Collections } from "./collections";
import type { Process } from "./process/index";
export declare type Configure<C extends Collections = Collections> = <B extends Batch>(options: Options<B>) => <I extends Input<B>, O extends Output<B>>(inputs: Inputs<B, I>) => Process<C, Outputs<B, O>>;
/**
 * Configure a batch process to query and/or mutate resources.
 *
 * Batch processes take structured inputs, split those up and extract a list
 * of entries that can be passed to some process. Given the results of that
 * process, each result is then converted back to some output form and arranged
 * into the same given structure as outputs.
 *
 * This abstraction makes it easier to build bulk iteractions with @truffle/db,
 * rather than, say, submitting multiple separate add mutations.
 *
 * For instance, Truffle artifacts each contain two bytecodes - to minimize the
 * number of `bytecodesAdd` queries, one might want to convert each input
 * artifact to a flat list of bytecodes, execute a single mutation request to
 * @truffle/db, and then automatically pair the resulting bytecode IDs with the
 * respective artifact bytecodes.
 *
 * The process is roughly as follows:
 *
 *
 *   ,--------.  iterate()  ,----------.  extract()  ,---------.
 *   | Inputs |     -->     | Input... |     -->     | Entry[] |
 *   `--------'             `----------'             `---------'
 *
 *       |                                            |
 *       |  initialize()                              |  process()
 *       V                                            V
 *
 *   ,---------.  merge()   ,----------.  convert() ,----------.
 *   | Outputs |    <--     | Output[] |     <--    | Result[] |
 *   `---------'            `----------'            `----------'
 *
 *
 */
export declare const configure: Configure;
/**
 * Describes a batch process for querying and/or mutating resources
 */
export declare type Options<B extends Batch, I extends Input<B> = Input<B>, O extends Output<B> = Output<B>> = {
    /**
     * Describes how to traverse the particular Inputs structure to produce
     * an Iterable of each Input along with a breadcrumb to describe how to
     * place that input in the parent structure.
     */
    iterate(options: {
        inputs: Inputs<B, I>;
    }): Iterable<{
        input: I;
        breadcrumb: Breadcrumb<B>;
    }>;
    /**
     */
    find(options: {
        inputs: Inputs<B, I>;
        breadcrumb: Breadcrumb<B>;
    }): I;
    /**
     */
    extract(options: {
        input: I;
        inputs: Inputs<B, I>;
        breadcrumb: Breadcrumb<B>;
    }): Entry<B>;
    /**
     */
    process(options: {
        entries: Entries<B>;
        inputs: Inputs<B, I>;
    }): Process<Collections, Results<B>>;
    /**
     */
    initialize(options: {
        inputs: Inputs<B, I>;
    }): Outputs<B, O>;
    /**
     */
    convert(options: {
        result: Result<B>;
        inputs: Inputs<B, I>;
        input: I;
    }): O;
    /**
     */
    merge(options: {
        outputs: Outputs<B, O>;
        breadcrumb: Breadcrumb<B>;
        output: O;
    }): Outputs<B, O>;
};
export declare type Batch = {
    structure: any;
    breadcrumb: any;
    input: any;
    entry?: any;
    result?: any;
    output: any;
};
declare type Structure<B extends Batch> = B["structure"];
declare type Breadcrumb<B extends Batch> = B["breadcrumb"];
export declare type Input<B extends Batch> = B["input"];
export declare type Inputs<B extends Batch, I extends Input<B>> = $<Structure<B>, [I]>;
declare type Entry<B extends Batch> = B["entry"];
declare type Entries<B extends Batch> = Entry<B>[];
export declare type Output<B extends Batch> = B["output"];
export declare type Outputs<B extends Batch, O extends Output<B>> = $<Structure<B>, [
    O
]>;
declare type Result<B extends Batch> = B["result"];
declare type Results<B extends Batch> = Result<B>[];
export {};
