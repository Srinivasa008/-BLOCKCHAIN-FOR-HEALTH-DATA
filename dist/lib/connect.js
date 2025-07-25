"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLotusClient = exports.connect = void 0;
const filecoin_js_1 = require("filecoin.js");
function connect(options) {
    return __asyncGenerator(this, arguments, function* connect_1() {
        const { url, token, controls } = options;
        const { step } = controls;
        const task = yield __await(yield* __asyncDelegator(__asyncValues(step({
            message: `Connecting to Filecoin node at ${url}...`
        }))));
        const client = exports.createLotusClient({ url, token });
        try {
            // TODO: Ideally I'd retrieve the version instead of ID, but that RPC method
            // is broken in textile's localnet.
            const id = yield __await(client.common.id());
            yield __await(yield* __asyncDelegator(__asyncValues(task.succeed({
                result: id,
                message: `Connected to Filecoin node at ${url}`
            }))));
        }
        catch (error) {
            yield __await(yield* __asyncDelegator(__asyncValues(task.fail({ error }))));
        }
        return yield __await(client);
    });
}
exports.connect = connect;
const createLotusClient = (options) => {
    const { url, token } = options;
    const connector = url.startsWith("ws")
        ? new filecoin_js_1.WsJsonRpcConnector({ url, token })
        : new filecoin_js_1.HttpJsonRpcConnector({ url, token });
    const client = new filecoin_js_1.LotusClient(connector);
    return client;
};
exports.createLotusClient = createLotusClient;
//# sourceMappingURL=connect.js.map