"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BucketsGrpcClient = exports.bucketsArchiveWatch = exports.bucketsArchives = exports.bucketsArchive = exports.bucketsSetDefaultArchiveConfig = exports.bucketsDefaultArchiveConfig = exports.bucketsPullPathAccessRoles = exports.bucketsPushPathAccessRoles = exports.bucketsRemovePath = exports.bucketsRemove = exports.bucketsPullIpfsPath = exports.bucketsPullPath = exports.bucketsSetPath = exports.bucketsPushPaths = exports.bucketsPushPath = exports.bucketsMovePath = exports.bucketsListIpfsPath = exports.bucketsListPath = exports.bucketsList = exports.bucketsLinks = exports.bucketsRoot = exports.bucketsCreate = exports.genChunks = exports.CHUNK_SIZE = void 0;
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const grpc_web_1 = require("@improbable-eng/grpc-web");
const repeater_1 = require("@repeaterjs/repeater");
const bucketsd_pb_1 = require("@textile/buckets-grpc/api/bucketsd/pb/bucketsd_pb");
const bucketsd_pb_service_1 = require("@textile/buckets-grpc/api/bucketsd/pb/bucketsd_pb_service");
const context_1 = require("@textile/context");
const grpc_transport_1 = require("@textile/grpc-transport");
const cids_1 = __importDefault(require("cids"));
const it_drain_1 = __importDefault(require("it-drain"));
const loglevel_1 = __importDefault(require("loglevel"));
// @ts-expect-error: missing types
const paramap_it_1 = __importDefault(require("paramap-it"));
const types_1 = require("../types");
const normalize_1 = require("./normalize");
const logger = loglevel_1.default.getLogger('buckets-api');
function fromPbRootObject(root) {
    return {
        key: root.getKey(),
        name: root.getName(),
        path: root.getPath(),
        createdAt: root.getCreatedAt(),
        updatedAt: root.getUpdatedAt(),
        thread: root.getThread(),
    };
}
function fromPbRootObjectNullable(root) {
    if (!root)
        return;
    return fromPbRootObject(root);
}
function fromPbMetadata(metadata) {
    if (!metadata)
        return;
    const roles = metadata.getRolesMap();
    const typedRoles = new Map();
    roles.forEach((entry, key) => typedRoles.set(key, entry));
    const response = {
        updatedAt: metadata.getUpdatedAt(),
        roles: typedRoles,
    };
    return response;
}
exports.CHUNK_SIZE = 1024;
function fromPbPathItem(item) {
    const list = item.getItemsList();
    return {
        cid: item.getCid(),
        name: item.getName(),
        path: item.getPath(),
        size: item.getSize(),
        isDir: item.getIsDir(),
        items: list ? list.map(fromPbPathItem) : [],
        count: item.getItemsCount(),
        metadata: fromPbMetadata(item.getMetadata()),
    };
}
function fromPbPathItemNullable(item) {
    if (!item)
        return;
    return fromPbPathItem(item);
}
function fromProtoArchiveRenew(item) {
    return Object.assign({}, item);
}
function fromProtoArchiveConfig(item) {
    return Object.assign(Object.assign({}, item), { countryCodes: item.countryCodesList, excludedMiners: item.excludedMinersList, trustedMiners: item.trustedMinersList, renew: item.renew ? fromProtoArchiveRenew(item.renew) : undefined });
}
function toProtoArchiveConfig(config) {
    const protoConfig = new bucketsd_pb_1.ArchiveConfig();
    protoConfig.setCountryCodesList(config.countryCodes);
    protoConfig.setDealMinDuration(config.dealMinDuration);
    protoConfig.setDealStartOffset(config.dealStartOffset);
    protoConfig.setExcludedMinersList(config.excludedMiners);
    protoConfig.setFastRetrieval(config.fastRetrieval);
    protoConfig.setMaxPrice(config.maxPrice);
    protoConfig.setRepFactor(config.repFactor);
    protoConfig.setTrustedMinersList(config.trustedMiners);
    protoConfig.setVerifiedDeal(config.verifiedDeal);
    if (config.renew) {
        const renew = new bucketsd_pb_1.ArchiveRenew();
        renew.setEnabled(config.renew.enabled);
        renew.setThreshold(config.renew.threshold);
        protoConfig.setRenew(renew);
    }
    return protoConfig;
}
function fromPbDealInfo(item) {
    return Object.assign({}, item);
}
function fromPbArchiveStatus(item) {
    switch (item) {
        case bucketsd_pb_1.ArchiveStatus.ARCHIVE_STATUS_CANCELED:
            return types_1.ArchiveStatus.Canceled;
        case bucketsd_pb_1.ArchiveStatus.ARCHIVE_STATUS_EXECUTING:
            return types_1.ArchiveStatus.Executing;
        case bucketsd_pb_1.ArchiveStatus.ARCHIVE_STATUS_FAILED:
            return types_1.ArchiveStatus.Failed;
        case bucketsd_pb_1.ArchiveStatus.ARCHIVE_STATUS_QUEUED:
            return types_1.ArchiveStatus.Queued;
        case bucketsd_pb_1.ArchiveStatus.ARCHIVE_STATUS_SUCCESS:
            return types_1.ArchiveStatus.Success;
        case bucketsd_pb_1.ArchiveStatus.ARCHIVE_STATUS_UNSPECIFIED:
            return types_1.ArchiveStatus.Unspecified;
        default:
            throw new Error('unknown status');
    }
}
function fromPbArchive(item) {
    return Object.assign(Object.assign({}, item), { 
        // TODO: standardize units coming from server.
        createdAt: new Date(item.createdAt * 1000), status: fromPbArchiveStatus(item.archiveStatus), dealInfo: item.dealInfoList.map(fromPbDealInfo) });
}
/**
 * Ensures that a Root | string | undefined is converted into a string
 */
function ensureRootString(api, key, root, ctx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (root) {
            return typeof root === 'string' ? root : root.path;
        }
        else {
            /* eslint-disable  @typescript-eslint/no-use-before-define */
            const root = yield bucketsRoot(api, key, ctx);
            return (_a = root === null || root === void 0 ? void 0 : root.path) !== null && _a !== void 0 ? _a : '';
        }
    });
}
function* genChunks(value, size) {
    return yield* Array.from(Array(Math.ceil(value.byteLength / size)), (_, i) => value.slice(i * size, i * size + size));
}
exports.genChunks = genChunks;
/**
 * Creates a new bucket.
 * @public
 * @param name Human-readable bucket name. It is only meant to help identify a bucket in a UI and is not unique.
 * @param isPrivate encrypt the bucket contents (default `false`)
 * @param cid (optional) Bootstrap the bucket with a UnixFS Cid from the IPFS network
 * @example
 * Creates a Bucket called "app-name-files"
 * ```typescript
 * import { Buckets } from '@textile/hub'
 *
 * const create = async (buckets: Buckets) => {
 *     return buckets.create("app-name-files")
 * }
 * ```
 *
 * @internal
 */
function bucketsCreate(api, name, isPrivate = false, cid, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.debug('create request');
        const req = new bucketsd_pb_1.CreateRequest();
        req.setName(name);
        if (cid) {
            req.setBootstrapCid(cid);
        }
        req.setPrivate(isPrivate);
        const res = yield api.unary(bucketsd_pb_service_1.APIService.Create, req, ctx);
        const links = res.getLinks();
        return {
            seed: res.getSeed_asU8(),
            seedCid: res.getSeedCid(),
            root: fromPbRootObjectNullable(res.getRoot()),
            links: links ? links.toObject() : undefined,
        };
    });
}
exports.bucketsCreate = bucketsCreate;
/**
 * Returns the bucket root CID
 * @param key Unique (IPNS compatible) identifier key for a bucket.
 *
 * @internal
 */
function bucketsRoot(api, key, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.debug('root request');
        const req = new bucketsd_pb_1.RootRequest();
        req.setKey(key);
        const res = yield api.unary(bucketsd_pb_service_1.APIService.Root, req, ctx);
        return fromPbRootObjectNullable(res.getRoot());
    });
}
exports.bucketsRoot = bucketsRoot;
/**
 * Returns a list of bucket links.
 * @param key Unique (IPNS compatible) identifier key for a bucket.
 * @example
 * Generate the HTTP, IPNS, and IPFS links for a Bucket
 * ```typescript
 * import { Buckets } from '@textile/hub'
 *
 * const getLinks = async (buckets: Buckets) => {
 *    const links = buckets.links(bucketKey)
 *    return links.ipfs
 * }
 *
 * const getIpfs = async (buckets: Buckets) => {
 *    const links = buckets.links(bucketKey)
 *    return links.ipfs
 * }
 * ```
 *
 * @internal
 */
function bucketsLinks(api, key, path, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.debug('link request');
        const req = new bucketsd_pb_1.LinksRequest();
        req.setKey(key);
        req.setPath(path);
        const res = yield api.unary(bucketsd_pb_service_1.APIService.Links, req, ctx);
        return res.toObject();
    });
}
exports.bucketsLinks = bucketsLinks;
/**
 * Returns a list of all bucket roots.
 * @example
 * Find an existing Bucket named "app-name-files"
 * ```typescript
 * import { Buckets } from '@textile/hub'
 *
 * const exists = async (buckets: Buckets) => {
 *     const roots = await buckets.list();
 *     return roots.find((bucket) => bucket.name ===  "app-name-files")
 * }
 * ```
 *
 * @internal
 */
function bucketsList(api, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.debug('list request');
        const req = new bucketsd_pb_1.ListRequest();
        const res = yield api.unary(bucketsd_pb_service_1.APIService.List, req, ctx);
        const roots = res.getRootsList();
        const map = roots ? roots.map((m) => m).map((m) => fromPbRootObject(m)) : [];
        return map;
    });
}
exports.bucketsList = bucketsList;
/**
 * Returns information about a bucket path.
 * @param key Unique (IPNS compatible) identifier key for a bucket.
 * @param path A file/object (sub)-path within a bucket.
 *
 * @internal
 */
function bucketsListPath(api, key, path, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.debug('list path request');
        const req = new bucketsd_pb_1.ListPathRequest();
        req.setKey(key);
        req.setPath(path);
        const res = yield api.unary(bucketsd_pb_service_1.APIService.ListPath, req, ctx);
        return {
            item: fromPbPathItemNullable(res.getItem()),
            root: fromPbRootObjectNullable(res.getRoot()),
        };
    });
}
exports.bucketsListPath = bucketsListPath;
/**
 * listIpfsPath returns items at a particular path in a UnixFS path living in the IPFS network.
 * @param path UnixFS path
 *
 * @internal
 */
function bucketsListIpfsPath(api, path, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.debug('list path request');
        const req = new bucketsd_pb_1.ListIpfsPathRequest();
        req.setPath(path);
        const res = yield api.unary(bucketsd_pb_service_1.APIService.ListIpfsPath, req, ctx);
        return fromPbPathItemNullable(res.getItem());
    });
}
exports.bucketsListIpfsPath = bucketsListIpfsPath;
/**
 * Move a file or subpath to a new path.
 * @internal
 */
function bucketsMovePath(api, key, fromPath, toPath, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const request = new bucketsd_pb_1.MovePathRequest();
        request.setKey(key);
        request.setFromPath(fromPath);
        request.setToPath(toPath);
        yield api.unary(bucketsd_pb_service_1.APIService.MovePath, request, ctx);
    });
}
exports.bucketsMovePath = bucketsMovePath;
/**
 * Pushes a file to a bucket path.
 * @param key Unique (IPNS compatible) identifier key for a bucket.
 * @param path A file/object (sub)-path within a bucket.
 * @param input The input file/stream/object.
 * @param opts Options to control response stream.
 * @remarks
 * This will return the resolved path and the bucket's new root path.
 * @example
 * Push a file to the root of a bucket
 * ```typescript
 * import { Buckets } from '@textile/hub'
 *
 * const pushFile = async (content: string, bucketKey: string) => {
 *    const file = { path: '/index.html', content: Buffer.from(content) }
 *    return await buckets.pushPath(bucketKey!, 'index.html', file)
 * }
 * ```
 * @internal
 */
function bucketsPushPath(api, key, path, input, opts, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var e_1, _a;
            var _b;
            // Only process the first input if there are more than one
            const source = (yield normalize_1.normaliseInput(input).next()).value;
            if (!source) {
                return reject(types_1.AbortError);
            }
            const clientjs = new bucketsd_pb_service_1.APIServiceClient(api.serviceHost, api.rpcOptions);
            const metadata = Object.assign(Object.assign({}, api.context.toJSON()), ctx === null || ctx === void 0 ? void 0 : ctx.toJSON());
            const stream = clientjs.pushPath(metadata);
            if ((opts === null || opts === void 0 ? void 0 : opts.signal) !== undefined) {
                opts.signal.addEventListener('abort', () => {
                    stream.cancel();
                    return reject(types_1.AbortError);
                });
            }
            stream.on('data', (message) => {
                var _a, _b, _c, _d;
                // Let's just make sure we haven't aborted this outside this function
                if ((_a = opts === null || opts === void 0 ? void 0 : opts.signal) === null || _a === void 0 ? void 0 : _a.aborted) {
                    stream.cancel();
                    return reject(types_1.AbortError);
                }
                if (message.hasEvent()) {
                    const event = (_b = message.getEvent()) === null || _b === void 0 ? void 0 : _b.toObject();
                    if (event === null || event === void 0 ? void 0 : event.path) {
                        // TODO: Is there an standard library/tool for this step in JS?
                        const pth = event.path.startsWith('/ipfs/')
                            ? event.path.split('/ipfs/')[1]
                            : event.path;
                        const cid = new cids_1.default(pth);
                        const res = {
                            path: {
                                path: `/ipfs/${cid === null || cid === void 0 ? void 0 : cid.toString()}`,
                                cid,
                                root: cid,
                                remainder: '',
                            },
                            root: (_d = (_c = event.root) === null || _c === void 0 ? void 0 : _c.path) !== null && _d !== void 0 ? _d : '',
                        };
                        return resolve(res);
                    }
                    else if (opts === null || opts === void 0 ? void 0 : opts.progress) {
                        opts.progress(event === null || event === void 0 ? void 0 : event.bytes);
                    }
                }
                else {
                    return reject(new Error('Invalid reply'));
                }
            });
            stream.on('end', (status) => {
                if (status && status.code !== grpc_web_1.grpc.Code.OK) {
                    return reject(new Error(status.details));
                }
                else {
                    return reject(new Error('undefined result'));
                }
            });
            stream.on('status', (status) => {
                if (status && status.code !== grpc_web_1.grpc.Code.OK) {
                    return reject(new Error(status.details));
                }
                else {
                    return reject(new Error('undefined result'));
                }
            });
            const head = new bucketsd_pb_1.PushPathRequest.Header();
            head.setPath(source.path || path);
            head.setKey(key);
            // Setting root here ensures pushes will error if root is out of date
            const root = yield ensureRootString(api, key, opts === null || opts === void 0 ? void 0 : opts.root, ctx);
            head.setRoot(root);
            const req = new bucketsd_pb_1.PushPathRequest();
            req.setHeader(head);
            stream.write(req);
            if (source.content) {
                try {
                    for (var _c = __asyncValues(source.content), _d; _d = yield _c.next(), !_d.done;) {
                        const chunk = _d.value;
                        if ((_b = opts === null || opts === void 0 ? void 0 : opts.signal) === null || _b === void 0 ? void 0 : _b.aborted) {
                            // Let's just make sure we haven't aborted this outside this function
                            try {
                                // Should already have been handled
                                stream.cancel();
                            }
                            catch (_e) { } // noop
                            return reject(types_1.AbortError);
                        }
                        // Naively chunk into chunks smaller than CHUNK_SIZE bytes
                        for (const chunklet of genChunks(chunk, exports.CHUNK_SIZE)) {
                            const part = new bucketsd_pb_1.PushPathRequest();
                            part.setChunk(chunklet);
                            stream.write(part);
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) yield _a.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            stream.end();
        }));
    });
}
exports.bucketsPushPath = bucketsPushPath;
/**
 * Pushes an iterable of files to a bucket.
 * @param key Unique (IPNS compatible) identifier key for a bucket.
 * @param input The input array of file/stream/objects.
 * @param opts Options to control response stream.
 * @internal
 */
function bucketsPushPaths(api, key, input, opts, ctx) {
    return new repeater_1.Repeater((push, stop) => __awaiter(this, void 0, void 0, function* () {
        const clientjs = new bucketsd_pb_service_1.APIServiceClient(api.serviceHost, api.rpcOptions);
        const metadata = Object.assign(Object.assign({}, api.context.toJSON()), ctx === null || ctx === void 0 ? void 0 : ctx.toJSON());
        const stream = clientjs.pushPaths(metadata);
        if ((opts === null || opts === void 0 ? void 0 : opts.signal) !== undefined) {
            opts.signal.addEventListener('abort', () => {
                stream.cancel();
                throw types_1.AbortError;
            });
        }
        stream.on('data', (message) => {
            var _a;
            // Let's just make sure we haven't aborted this outside this function
            if ((_a = opts === null || opts === void 0 ? void 0 : opts.signal) === null || _a === void 0 ? void 0 : _a.aborted) {
                stream.cancel();
                return stop(types_1.AbortError);
            }
            const obj = {
                path: message.getPath(),
                root: fromPbRootObjectNullable(message.getRoot()),
                cid: new cids_1.default(message.getCid()),
                pinned: message.getPinned(),
                size: message.getSize(),
            };
            push(obj);
        });
        stream.on('end', (status) => {
            if (status && status.code !== grpc_web_1.grpc.Code.OK) {
                return stop(new Error(status.details));
            }
            return stop();
        });
        stream.on('status', (status) => {
            if (status && status.code !== grpc_web_1.grpc.Code.OK) {
                return stop(new Error(status.details));
            }
            return stop();
        });
        const head = new bucketsd_pb_1.PushPathsRequest.Header();
        head.setKey(key);
        // Setting root here ensures pushes will error if root is out of date
        const root = yield ensureRootString(api, key, opts === null || opts === void 0 ? void 0 : opts.root, ctx);
        head.setRoot(root);
        const req = new bucketsd_pb_1.PushPathsRequest();
        req.setHeader(head);
        stream.write(req);
        // Map the following over the top level inputs for parallel pushes
        const mapper = ({ path, content }) => { var content_1, content_1_1; return __awaiter(this, void 0, void 0, function* () {
            var e_2, _a;
            var _b;
            const req = new bucketsd_pb_1.PushPathsRequest();
            const chunk = new bucketsd_pb_1.PushPathsRequest.Chunk();
            chunk.setPath(path);
            if (content) {
                try {
                    for (content_1 = __asyncValues(content); content_1_1 = yield content_1.next(), !content_1_1.done;) {
                        const data = content_1_1.value;
                        if ((_b = opts === null || opts === void 0 ? void 0 : opts.signal) === null || _b === void 0 ? void 0 : _b.aborted) {
                            // Let's just make sure we haven't aborted this outside this function
                            try {
                                // Should already have been handled
                                stream.cancel();
                            }
                            catch (_c) { } // noop
                            return stop(types_1.AbortError);
                        }
                        // Naively chunk into chunks smaller than CHUNK_SIZE bytes
                        for (const chunklet of genChunks(data, exports.CHUNK_SIZE)) {
                            chunk.setData(chunklet);
                            req.setChunk(chunk);
                            stream.write(req);
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (content_1_1 && !content_1_1.done && (_a = content_1.return)) yield _a.call(content_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            // Close out the file
            const final = new bucketsd_pb_1.PushPathsRequest.Chunk();
            final.setPath(path);
            req.setChunk(final);
            stream.write(req);
        }); };
        // We don't care about the top level order, progress is labeled by path
        yield it_drain_1.default(paramap_it_1.default(normalize_1.normaliseInput(input), mapper, { ordered: false }));
        stream.end();
    }));
}
exports.bucketsPushPaths = bucketsPushPaths;
/**
 * Sets a file at a given bucket path.
 * @internal
 */
function bucketsSetPath(api, key, path, cid, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const request = new bucketsd_pb_1.SetPathRequest();
        request.setKey(key);
        request.setPath(path);
        request.setCid(cid);
        yield api.unary(bucketsd_pb_service_1.APIService.SetPath, request, ctx);
    });
}
exports.bucketsSetPath = bucketsSetPath;
/**
 * Pulls the bucket path, returning the bytes of the given file.
 * @param key Unique (IPNS compatible) identifier key for a bucket.
 * @param path A file/object (sub)-path within a bucket.
 * @param opts Options to control response stream. Currently only supports a progress function.
 *
 * @internal
 */
function bucketsPullPath(api, key, path, opts, ctx) {
    return new repeater_1.Repeater((push, stop) => {
        const metadata = Object.assign(Object.assign({}, api.context.toJSON()), ctx === null || ctx === void 0 ? void 0 : ctx.toJSON());
        const request = new bucketsd_pb_1.PullPathRequest();
        request.setKey(key);
        request.setPath(path);
        let written = 0;
        const resp = grpc_web_1.grpc.invoke(bucketsd_pb_service_1.APIService.PullPath, {
            host: api.serviceHost,
            transport: api.rpcOptions.transport,
            debug: api.rpcOptions.debug,
            request,
            metadata,
            onMessage: (res) => __awaiter(this, void 0, void 0, function* () {
                const chunk = res.getChunk_asU8();
                written += chunk.byteLength;
                if (opts === null || opts === void 0 ? void 0 : opts.progress) {
                    opts.progress(written);
                }
                push(chunk);
            }),
            onEnd: (status, message) => __awaiter(this, void 0, void 0, function* () {
                if (status !== grpc_web_1.grpc.Code.OK) {
                    stop(new Error(message));
                }
                stop();
            }),
        });
        // Cleanup afterwards
        stop.then(() => resp.close());
    });
}
exports.bucketsPullPath = bucketsPullPath;
/**
 * pullIpfsPath pulls the path from a remote UnixFS dag, writing it to writer if it's a file.
 * @param path A file/object (sub)-path within a bucket.
 * @param opts Options to control response stream. Currently only supports a progress function.
 *
 * @internal
 */
function bucketsPullIpfsPath(api, path, opts, ctx) {
    return new repeater_1.Repeater((push, stop) => {
        const metadata = Object.assign(Object.assign({}, api.context.toJSON()), ctx === null || ctx === void 0 ? void 0 : ctx.toJSON());
        const request = new bucketsd_pb_1.PullIpfsPathRequest();
        request.setPath(path);
        let written = 0;
        const resp = grpc_web_1.grpc.invoke(bucketsd_pb_service_1.APIService.PullIpfsPath, {
            host: api.serviceHost,
            transport: api.rpcOptions.transport,
            debug: api.rpcOptions.debug,
            request,
            metadata,
            onMessage: (res) => __awaiter(this, void 0, void 0, function* () {
                const chunk = res.getChunk_asU8();
                push(chunk);
                written += chunk.byteLength;
                if (opts === null || opts === void 0 ? void 0 : opts.progress) {
                    opts.progress(written);
                }
            }),
            onEnd: (status, message) => __awaiter(this, void 0, void 0, function* () {
                if (status !== grpc_web_1.grpc.Code.OK) {
                    stop(new Error(message));
                }
                stop();
            }),
        });
        stop.then(() => resp.close());
    });
}
exports.bucketsPullIpfsPath = bucketsPullIpfsPath;
/**
 * Removes an entire bucket. Files and directories will be unpinned.
 * @param key Unique (IPNS compatible) identifier key for a bucket.
 *
 * @internal
 */
function bucketsRemove(api, key, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.debug('remove request');
        const req = new bucketsd_pb_1.RemoveRequest();
        req.setKey(key);
        yield api.unary(bucketsd_pb_service_1.APIService.Remove, req, ctx);
        return;
    });
}
exports.bucketsRemove = bucketsRemove;
/**
 * Returns information about a bucket path.
 * @param key Unique (IPNS compatible) identifier key for a bucket.
 * @param path A file/object (sub)-path within a bucket.
 * @param root optional to specify a root
 *
 * @internal
 */
function bucketsRemovePath(api, key, path, opts, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.debug('remove path request');
        const req = new bucketsd_pb_1.RemovePathRequest();
        req.setKey(key);
        req.setPath(path);
        const root = yield ensureRootString(api, key, opts === null || opts === void 0 ? void 0 : opts.root, ctx);
        req.setRoot(root);
        const res = yield api.unary(bucketsd_pb_service_1.APIService.RemovePath, req, ctx);
        return {
            pinned: res.getPinned(),
            root: fromPbRootObjectNullable(res.getRoot()),
        };
    });
}
exports.bucketsRemovePath = bucketsRemovePath;
function bucketsPushPathAccessRoles(api, key, path, roles, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.debug('remove path request');
        const req = new bucketsd_pb_1.PushPathAccessRolesRequest();
        req.setKey(key);
        req.setPath(path);
        roles.forEach((value, key) => req.getRolesMap().set(key, value));
        yield api.unary(bucketsd_pb_service_1.APIService.PushPathAccessRoles, req, ctx);
        return;
    });
}
exports.bucketsPushPathAccessRoles = bucketsPushPathAccessRoles;
function bucketsPullPathAccessRoles(api, key, path = '/', ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.debug('remove path request');
        const req = new bucketsd_pb_1.PullPathAccessRolesRequest();
        req.setKey(key);
        req.setPath(path);
        const response = yield api.unary(bucketsd_pb_service_1.APIService.PullPathAccessRoles, req, ctx);
        const roles = response.getRolesMap();
        const typedRoles = new Map();
        roles.forEach((entry, key) => typedRoles.set(key, entry));
        return typedRoles;
    });
}
exports.bucketsPullPathAccessRoles = bucketsPullPathAccessRoles;
/**
 * @internal
 */
function bucketsDefaultArchiveConfig(api, key, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.debug('default archive config request');
        const req = new bucketsd_pb_1.DefaultArchiveConfigRequest();
        req.setKey(key);
        const res = yield api.unary(bucketsd_pb_service_1.APIService.DefaultArchiveConfig, req, ctx);
        const config = res.getArchiveConfig();
        if (!config) {
            throw new Error('no archive config returned');
        }
        return fromProtoArchiveConfig(config.toObject());
    });
}
exports.bucketsDefaultArchiveConfig = bucketsDefaultArchiveConfig;
/**
 * @internal
 */
function bucketsSetDefaultArchiveConfig(api, key, config, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.debug('set default archive config request');
        const req = new bucketsd_pb_1.SetDefaultArchiveConfigRequest();
        req.setKey(key);
        req.setArchiveConfig(toProtoArchiveConfig(config));
        yield api.unary(bucketsd_pb_service_1.APIService.SetDefaultArchiveConfig, req, ctx);
        return;
    });
}
exports.bucketsSetDefaultArchiveConfig = bucketsSetDefaultArchiveConfig;
/**
 * archive creates a Filecoin bucket archive.
 * @internal
 * @param key Unique (IPNS compatible) identifier key for a bucket.
 * @param options Options that control the behavior of the bucket archive
 * @param skipAutomaticVerifiedDeal skips logic that automatically uses available datacap to make a verified deal for the archive.
 */
function bucketsArchive(api, key, options, skipAutomaticVerifiedDeal, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.debug('archive request');
        const req = new bucketsd_pb_1.ArchiveRequest();
        req.setKey(key);
        if (skipAutomaticVerifiedDeal !== undefined) {
            req.setSkipAutomaticVerifiedDeal(skipAutomaticVerifiedDeal);
        }
        if (options === null || options === void 0 ? void 0 : options.archiveConfig) {
            req.setArchiveConfig(toProtoArchiveConfig(options.archiveConfig));
        }
        yield api.unary(bucketsd_pb_service_1.APIService.Archive, req, ctx);
        return;
    });
}
exports.bucketsArchive = bucketsArchive;
/**
 * @internal
 */
function bucketsArchives(api, key, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.debug('archives request');
        const req = new bucketsd_pb_1.ArchivesRequest();
        req.setKey(key);
        const res = yield api.unary(bucketsd_pb_service_1.APIService.Archives, req, ctx);
        const current = res.toObject().current;
        return {
            current: current ? fromPbArchive(current) : undefined,
            history: res.toObject().historyList.map(fromPbArchive),
        };
    });
}
exports.bucketsArchives = bucketsArchives;
/**
 * archiveWatch watches status events from a Filecoin bucket archive.
 * @internal
 * @param key Unique (IPNS compatible) identifier key for a bucket.
 */
function bucketsArchiveWatch(api, key, callback, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.debug('archive watch request');
        const req = new bucketsd_pb_1.ArchiveWatchRequest();
        req.setKey(key);
        const metadata = Object.assign(Object.assign({}, api.context.toJSON()), ctx === null || ctx === void 0 ? void 0 : ctx.toJSON());
        const res = grpc_web_1.grpc.invoke(bucketsd_pb_service_1.APIService.ArchiveWatch, {
            host: api.context.host,
            request: req,
            metadata,
            onMessage: (rec) => {
                const response = {
                    id: rec.getJsPbMessageId(),
                    msg: rec.getMsg(),
                };
                callback(response);
            },
            onEnd: (status, message /** _trailers: grpc.Metadata */) => {
                if (status !== grpc_web_1.grpc.Code.OK) {
                    return callback(undefined, new Error(message));
                }
                callback();
            },
        });
        return res.close.bind(res);
    });
}
exports.bucketsArchiveWatch = bucketsArchiveWatch;
/**
 * Raw API connected needed by Buckets CI code (compile friendly)
 * see more https://github.com/textileio/github-action-buckets
 */
class BucketsGrpcClient {
    /**
     * Creates a new gRPC client instance for accessing the Textile Buckets API.
     * @param context The context to use for interacting with the APIs. Can be modified later.
     */
    constructor(context = new context_1.Context(), debug = false) {
        this.context = context;
        this.serviceHost = context.host;
        this.rpcOptions = {
            transport: grpc_transport_1.WebsocketTransport(),
            debug,
        };
    }
    unary(methodDescriptor, req, ctx) {
        return new Promise((resolve, reject) => {
            const metadata = Object.assign(Object.assign({}, this.context.toJSON()), ctx === null || ctx === void 0 ? void 0 : ctx.toJSON());
            grpc_web_1.grpc.unary(methodDescriptor, {
                request: req,
                host: this.serviceHost,
                transport: this.rpcOptions.transport,
                debug: this.rpcOptions.debug,
                metadata,
                onEnd: (res) => {
                    const { status, statusMessage, message } = res;
                    if (status === grpc_web_1.grpc.Code.OK) {
                        if (message) {
                            resolve(message);
                        }
                        else {
                            resolve();
                        }
                    }
                    else {
                        reject(new Error(statusMessage));
                    }
                },
            });
        });
    }
}
exports.BucketsGrpcClient = BucketsGrpcClient;
//# sourceMappingURL=index.js.map