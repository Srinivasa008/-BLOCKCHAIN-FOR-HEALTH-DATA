"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configure = void 0;
const logger_1 = require("../logger");
const debug = logger_1.logger("db:meta:batch");
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
const configure = (options) => {
    return function* (inputs) {
        const { process, extract, convert, iterate, find, initialize, merge } = options;
        // iterate over inputs, collect entries and breadcrumbs
        const entries = [];
        const breadcrumbs = {};
        for (const { input, breadcrumb } of iterate({ inputs })) {
            // extract entry
            const entry = extract({ input, inputs, breadcrumb });
            breadcrumbs[entries.length] = breadcrumb;
            entries.push(entry);
        }
        // process entries into results
        const results = yield* process({ entries, inputs });
        return results.reduce((outputs, result, index) => {
            const breadcrumb = breadcrumbs[index];
            // find original input based on breadcrumb
            const input = find({ inputs, breadcrumb });
            // convert result and input material to output
            const output = convert({ result, input, inputs });
            // merge in output
            return merge({ outputs, output, breadcrumb });
        }, 
        // initialize outputs as starting point
        initialize({ inputs }));
    };
};
exports.configure = configure;
//# sourceMappingURL=batch.js.map