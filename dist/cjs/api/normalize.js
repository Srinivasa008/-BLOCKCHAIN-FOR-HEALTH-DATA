"use strict";
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normaliseInput = void 0;
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-use-before-define */
const buffer_1 = require("buffer");
/**
 * Transform types
 *
 * @remarks
 * This function comes from {@link https://github.com/ipfs/js-ipfs-utils/blob/master/src/files/normalise-input.js}
 * @example
 * Supported types
 * ```yaml
 * // INPUT TYPES
 * Bytes (Buffer|ArrayBuffer|TypedArray) [single file]
 * Bloby (Blob|File) [single file]
 * String [single file]
 * { path, content: Bytes } [single file]
 * { path, content: Bloby } [single file]
 * { path, content: String } [single file]
 * { path, content: Iterable<Number> } [single file]
 * { path, content: Iterable<Bytes> } [single file]
 * { path, content: AsyncIterable<Bytes> } [single file]
 * Iterable<Number> [single file]
 * Iterable<Bytes> [single file]
 * Iterable<Bloby> [multiple files]
 * Iterable<String> [multiple files]
 * Iterable<{ path, content: Bytes }> [multiple files]
 * Iterable<{ path, content: Bloby }> [multiple files]
 * Iterable<{ path, content: String }> [multiple files]
 * Iterable<{ path, content: Iterable<Number> }> [multiple files]
 * Iterable<{ path, content: Iterable<Bytes> }> [multiple files]
 * Iterable<{ path, content: AsyncIterable<Bytes> }> [multiple files]
 * AsyncIterable<Bytes> [single file]
 * AsyncIterable<Bloby> [multiple files]
 * AsyncIterable<String> [multiple files]
 * AsyncIterable<{ path, content: Bytes }> [multiple files]
 * AsyncIterable<{ path, content: Bloby }> [multiple files]
 * AsyncIterable<{ path, content: String }> [multiple files]
 * AsyncIterable<{ path, content: Iterable<Number> }> [multiple files]
 * AsyncIterable<{ path, content: Iterable<Bytes> }> [multiple files]
 * AsyncIterable<{ path, content: AsyncIterable<Bytes> }> [multiple files]
 *
 * // OUTPUT
 * AsyncIterable<{ path, content: AsyncIterable<Buffer> }>
 * ```
 *
 * @public
 *
 * @param {Object} input
 * @return AsyncInterable<{ path, content: AsyncIterable<Buffer> }>
 */
function normaliseInput(input) {
    // must give us something
    if (input === null || input === undefined) {
        throw new Error(`Unexpected input: ${input}`);
    }
    // String
    if (typeof input === 'string' || input instanceof String) {
        return (function () {
            return __asyncGenerator(this, arguments, function* () {
                // eslint-disable-line require-await
                yield yield __await(toFileObject(input));
            });
        })();
    }
    // Buffer|ArrayBuffer|TypedArray
    // Blob|File
    if (isBytes(input) || isBloby(input)) {
        return (function () {
            return __asyncGenerator(this, arguments, function* () {
                // eslint-disable-line require-await
                yield yield __await(toFileObject(input));
            });
        })();
    }
    // Iterable<?>
    if (input[Symbol.iterator]) {
        return (function () {
            return __asyncGenerator(this, arguments, function* () {
                // eslint-disable-line require-await
                const iterator = input[Symbol.iterator]();
                const first = iterator.next();
                if (first.done)
                    return yield __await(iterator
                    // Iterable<Number>
                    // Iterable<Bytes>
                    );
                // Iterable<Number>
                // Iterable<Bytes>
                if (Number.isInteger(first.value) || isBytes(first.value)) {
                    yield yield __await(toFileObject((function* () {
                        yield first.value;
                        yield* iterator;
                    })()));
                    return yield __await(void 0);
                }
                // Iterable<Bloby>
                // Iterable<String>
                // Iterable<{ path, content }>
                if (isFileObject(first.value) ||
                    isBloby(first.value) ||
                    typeof first.value === 'string') {
                    yield yield __await(toFileObject(first.value));
                    for (const obj of iterator) {
                        yield yield __await(toFileObject(obj));
                    }
                    return yield __await(void 0);
                }
                throw new Error('Unexpected input: ' + typeof input);
            });
        })();
    }
    // window.ReadableStream
    if (typeof input.getReader === 'function') {
        return (function () {
            return __asyncGenerator(this, arguments, function* () {
                var e_1, _a;
                try {
                    for (var _b = __asyncValues(browserStreamToIt(input)), _c; _c = yield __await(_b.next()), !_c.done;) {
                        const obj = _c.value;
                        yield yield __await(toFileObject(obj));
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) yield __await(_a.call(_b));
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            });
        })();
    }
    // AsyncIterable<?>
    if (input[Symbol.asyncIterator]) {
        return (function () {
            return __asyncGenerator(this, arguments, function* () {
                var e_2, _a;
                const iterator = input[Symbol.asyncIterator]();
                const first = yield __await(iterator.next());
                if (first.done)
                    return yield __await(iterator
                    // AsyncIterable<Bytes>
                    );
                // AsyncIterable<Bytes>
                if (isBytes(first.value)) {
                    yield yield __await(toFileObject((function () {
                        return __asyncGenerator(this, arguments, function* () {
                            // eslint-disable-line require-await
                            yield yield __await(first.value);
                            yield __await(yield* __asyncDelegator(__asyncValues(iterator)));
                        });
                    })()));
                    return yield __await(void 0);
                }
                // AsyncIterable<Bloby>
                // AsyncIterable<String>
                // AsyncIterable<{ path, content }>
                if (isFileObject(first.value) ||
                    isBloby(first.value) ||
                    typeof first.value === 'string') {
                    yield yield __await(toFileObject(first.value));
                    try {
                        for (var iterator_1 = __asyncValues(iterator), iterator_1_1; iterator_1_1 = yield __await(iterator_1.next()), !iterator_1_1.done;) {
                            const obj = iterator_1_1.value;
                            yield yield __await(toFileObject(obj));
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (iterator_1_1 && !iterator_1_1.done && (_a = iterator_1.return)) yield __await(_a.call(iterator_1));
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    return yield __await(void 0);
                }
                throw new Error('Unexpected input: ' + typeof input);
            });
        })();
    }
    // { path, content: ? }
    // Note: Detected _after_ AsyncIterable<?> because Node.js streams have a
    // `path` property that passes this check.
    if (isFileObject(input)) {
        return (function () {
            return __asyncGenerator(this, arguments, function* () {
                // eslint-disable-line require-await
                yield yield __await(toFileObject(input));
            });
        })();
    }
    throw new Error('Unexpected input: ' + typeof input);
}
exports.normaliseInput = normaliseInput;
function toFileObject(input) {
    const obj = {
        path: input.path || '',
        mode: input.mode,
        mtime: input.mtime,
    };
    if (input.content) {
        obj.content = toAsyncIterable(input.content);
    }
    else if (!input.path) {
        // Not already a file object with path or content prop
        obj.content = toAsyncIterable(input);
    }
    return obj;
}
function toAsyncIterable(input) {
    // Bytes | String
    if (isBytes(input) || typeof input === 'string') {
        return (function () {
            return __asyncGenerator(this, arguments, function* () {
                // eslint-disable-line require-await
                yield yield __await(toBuffer(input));
            });
        })();
    }
    // Bloby
    if (isBloby(input)) {
        return blobToAsyncGenerator(input);
    }
    // Browser stream
    if (typeof input.getReader === 'function') {
        return browserStreamToIt(input);
    }
    // Iterator<?>
    if (input[Symbol.iterator]) {
        return (function () {
            return __asyncGenerator(this, arguments, function* () {
                // eslint-disable-line require-await
                const iterator = input[Symbol.iterator]();
                const first = iterator.next();
                if (first.done)
                    return yield __await(iterator
                    // Iterable<Number>
                    );
                // Iterable<Number>
                if (Number.isInteger(first.value)) {
                    yield yield __await(toBuffer(Array.from((function* () {
                        yield first.value;
                        yield* iterator;
                    })())));
                    return yield __await(void 0);
                }
                // Iterable<Bytes>
                if (isBytes(first.value)) {
                    yield yield __await(toBuffer(first.value));
                    for (const chunk of iterator) {
                        yield yield __await(toBuffer(chunk));
                    }
                    return yield __await(void 0);
                }
                throw new Error('Unexpected input: ' + typeof input);
            });
        })();
    }
    // AsyncIterable<Bytes>
    if (input[Symbol.asyncIterator]) {
        return (function () {
            return __asyncGenerator(this, arguments, function* () {
                var e_3, _a;
                try {
                    for (var input_1 = __asyncValues(input), input_1_1; input_1_1 = yield __await(input_1.next()), !input_1_1.done;) {
                        const chunk = input_1_1.value;
                        yield yield __await(toBuffer(chunk));
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (input_1_1 && !input_1_1.done && (_a = input_1.return)) yield __await(_a.call(input_1));
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            });
        })();
    }
    throw new Error(`Unexpected input: ${input}`);
}
function toBuffer(chunk) {
    return isBytes(chunk) ? chunk : buffer_1.Buffer.from(chunk);
}
function isBytes(obj) {
    return (buffer_1.Buffer.isBuffer(obj) ||
        ArrayBuffer.isView(obj) ||
        obj instanceof ArrayBuffer);
}
function isBloby(obj) {
    return (typeof globalThis.Blob !== 'undefined' && obj instanceof globalThis.Blob);
}
// An object with a path or content property
function isFileObject(obj) {
    return typeof obj === 'object' && (obj.path || obj.content);
}
function blobToAsyncGenerator(blob) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (typeof blob.stream === 'function') {
        // firefox < 69 does not support blob.stream()
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return browserStreamToIt(blob.stream());
    }
    return readBlob(blob);
}
function browserStreamToIt(stream) {
    return __asyncGenerator(this, arguments, function* browserStreamToIt_1() {
        const reader = stream.getReader();
        while (true) {
            const result = yield __await(reader.read());
            if (result.done) {
                return yield __await(void 0);
            }
            yield yield __await(result.value);
        }
    });
}
function readBlob(blob, options) {
    return __asyncGenerator(this, arguments, function* readBlob_1() {
        options = options || {};
        const reader = new globalThis.FileReader();
        const chunkSize = options.chunkSize || 1024 * 1024;
        let offset = options.offset || 0;
        const getNextChunk = () => new Promise((resolve, reject) => {
            reader.onloadend = (e) => {
                var _a;
                const data = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
                resolve(data.byteLength === 0 ? null : data);
            };
            reader.onerror = reject;
            const end = offset + chunkSize;
            const slice = blob.slice(offset, end);
            reader.readAsArrayBuffer(slice);
            offset = end;
        });
        while (true) {
            const data = yield __await(getNextChunk());
            if (data == null) {
                return yield __await(void 0);
            }
            yield yield __await(buffer_1.Buffer.from(data));
        }
    });
}
//# sourceMappingURL=normalize.js.map