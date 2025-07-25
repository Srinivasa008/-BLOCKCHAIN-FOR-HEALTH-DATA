"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = exports.Action = exports.maybeLocalAddr = exports.getFunctionBody = exports.ComparisonJSON = exports.ReadTransaction = exports.WriteTransaction = exports.Where = exports.Query = void 0;
/**
 * @packageDocumentation
 * @module @textile/threads-client
 */
const grpc_web_1 = require("@improbable-eng/grpc-web");
const context_1 = require("@textile/context");
const grpc_transport_1 = require("@textile/grpc-transport");
const multiaddr_1 = require("@textile/multiaddr");
const security_1 = require("@textile/security");
const pb = __importStar(require("@textile/threads-client-grpc/threads_pb"));
const threads_pb_service_1 = require("@textile/threads-client-grpc/threads_pb_service");
const threads_id_1 = require("@textile/threads-id");
require("fastestsmallesttextencoderdecoder");
const to_json_schema_1 = __importDefault(require("to-json-schema"));
const models_1 = require("./models");
Object.defineProperty(exports, "ComparisonJSON", { enumerable: true, get: function () { return models_1.ComparisonJSON; } });
Object.defineProperty(exports, "Query", { enumerable: true, get: function () { return models_1.Query; } });
Object.defineProperty(exports, "ReadTransaction", { enumerable: true, get: function () { return models_1.ReadTransaction; } });
Object.defineProperty(exports, "Where", { enumerable: true, get: function () { return models_1.Where; } });
Object.defineProperty(exports, "WriteTransaction", { enumerable: true, get: function () { return models_1.WriteTransaction; } });
function isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}
function getFunctionBody(fn) {
    // https://stackoverflow.com/a/25229488/1256988
    function removeCommentsFromSource(str) {
        return str.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, '$1');
    }
    const s = removeCommentsFromSource(fn.toString());
    return s.substring(s.indexOf('{') + 1, s.lastIndexOf('}'));
}
exports.getFunctionBody = getFunctionBody;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
function maybeLocalAddr(ip) {
    return (['localhost', '', '::1'].includes(ip) ||
        ip.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/) ||
        ip.startsWith('192.168.') ||
        ip.startsWith('10.0.') ||
        ip.endsWith('.local'));
}
exports.maybeLocalAddr = maybeLocalAddr;
var Action;
(function (Action) {
    Action[Action["CREATE"] = 0] = "CREATE";
    Action[Action["SAVE"] = 1] = "SAVE";
    Action[Action["DELETE"] = 2] = "DELETE";
})(Action = exports.Action || (exports.Action = {}));
/**
 * Client is a web-gRPC wrapper client for communicating with a webgRPC-enabled Threads server.
 * This client library can be used to interact with a local or remote Textile gRPC-service
 * It is a wrapper around Textile Thread's 'DB' API, which is defined here:
 * https://github.com/textileio/go-threads/blob/master/api/pb/api.proto.
 *
 * @example
 * ```typescript
 * import {Client, Identity, UserAuth} from '@textile/threads'
 *
 * async function setupDB(auth: UserAuth, identity: Identity) {
 *   // Initialize the client
 *   const client = Client.withUserAuth(auth)
 *
 *   // Connect the user to your API
 *   const userToken = await client.getToken(identity)
 *
 *   // Create a new DB
 *   const threadID = await client.newDB(undefined, 'nasa')
 *
 *   // Create a new Collection from an Object
 *   const buzz = {
 *     name: 'Buzz',
 *     missions: 2,
 *     _id: '',
 *   }
 *   await client.newCollectionFromObject(threadID, buzz, { name: 'astronauts' })
 *
 *   // Store the buzz object in the new collection
 *   await client.create(threadID, 'astronauts', [buzz])
 *
 *   return threadID
 * }
 * ```
 */
class Client {
    /**
     * Creates a new gRPC client instance for accessing the Textile Threads API.
     * @param context The context to use for interacting with the APIs. Can be modified later.
     * @param debug Should we run in debug mode. Defaults to false.
     */
    constructor(context = new context_1.Context(), debug = false) {
        this.context = context;
        this.serviceHost = context.host;
        this.rpcOptions = {
            transport: grpc_transport_1.WebsocketTransport(),
            debug,
        };
    }
    /**
     * Create a new gRPC client instance from a supplied user auth object.
     * Assumes all default gRPC settlings. For customization options, use a context object directly.
     * The callback method will automatically refresh expiring credentials.
     * @param auth The user auth object or an async callback that returns a user auth object.
     * @example
     * ```typescript
     * import {UserAuth, Client} from '@textile/threads'
     *
     * function create (auth: UserAuth) {
     *   return Client.withUserAuth(auth)
     * }
     * ```
     * @example
     * ```typescript
     * import {UserAuth, Client} from '@textile/threads'
     *
     * function setCallback (callback: () => Promise<UserAuth>) {
     *   return Client.withUserAuth(callback)
     * }
     * ```
     */
    static withUserAuth(auth, host = context_1.defaultHost, debug = false) {
        const context = typeof auth === 'object'
            ? context_1.Context.fromUserAuth(auth, host)
            : context_1.Context.fromUserAuthCallback(auth, host);
        return new Client(context, debug);
    }
    /**
     * Create a new gRPC client instance from a supplied key and secret
     * @param key The KeyInfo object containing {key: string, secret: string, type: 0}. 0 === User Group Key, 1 === Account Key
     * @param host The remote gRPC host to connect with. Should be left as default.
     * @param debug Whether to run in debug mode. Defaults to false.
     * @example
     * ```typescript
     * import {KeyInfo, Client} from '@textile/threads'
     *
     * async function create (keyInfo: KeyInfo) {
     *   return await Client.withKeyInfo(keyInfo)
     * }
     * ```
     */
    static withKeyInfo(key, host = context_1.defaultHost, debug = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Client(yield new context_1.Context(host).withKeyInfo(key), debug);
        });
    }
    /**
     * Obtain a token per user (identity) for interacting with the remote API.
     * @param identity A user identity to use for creating records in the database. A random identity
     * can be created with `Client.randomIdentity(), however, it is not easy/possible to migrate
     * identities after the fact. Please store or otherwise persist any identity information if
     * you wish to retrieve user data later, or use an external identity provider.
     * @param ctx Context object containing web-gRPC headers and settings.
     * @example
     * ```typescript
     * import {Client, Identity} from '@textile/threads'
     *
     * async function newToken (client: Client, user: Identity) {
     *   // Token is added to the client connection at the same time
     *   const token = await client.getToken(user)
     *   return token
     * }
     * ```
     */
    getToken(identity, ctx) {
        return this.getTokenChallenge(identity.public.toString(), (challenge) => __awaiter(this, void 0, void 0, function* () {
            return identity.sign(challenge);
        }), ctx);
    }
    /**
     * Obtain a token per user (identity) for interacting with the remote API.
     * @param publicKey The public key of a user identity to use for creating records in the database.
     * A random identity can be created with `Client.randomIdentity(), however, it is not
     * easy/possible to migrate identities after the fact. Please store or otherwise persist any
     * identity information if you wish to retrieve user data later, or use an external identity
     * provider.
     * @param callback A callback function that takes a `challenge` argument and returns a signed
     * message using the input challenge and the private key associated with `publicKey`.
     * @param ctx Context object containing web-gRPC headers and settings.
     * @remarks `publicKey` must be the corresponding public key of the private key used in `callback`.
     */
    getTokenChallenge(publicKey, callback, ctx) {
        const client = grpc_web_1.grpc.client(threads_pb_service_1.API.GetToken, {
            host: this.serviceHost,
            transport: this.rpcOptions.transport,
            debug: this.rpcOptions.debug,
        });
        return new Promise((resolve, reject) => {
            let token = '';
            client.onMessage((message) => __awaiter(this, void 0, void 0, function* () {
                if (message.hasChallenge()) {
                    const challenge = message.getChallenge_asU8();
                    let signature;
                    try {
                        signature = yield callback(challenge);
                    }
                    catch (err) {
                        reject(err);
                    }
                    const req_ = new pb.GetTokenRequest();
                    if (signature)
                        req_.setSignature(signature);
                    client.send(req_);
                    client.finishSend();
                }
                else if (message.hasToken()) {
                    token = message.getToken();
                }
            }));
            client.onEnd((code, message /** trailers: grpc.Metadata */) => {
                client.close();
                if (code === grpc_web_1.grpc.Code.OK) {
                    this.context.withToken(token);
                    resolve(token);
                }
                else {
                    reject(new Error(message));
                }
            });
            const req = new pb.GetTokenRequest();
            req.setKey(publicKey);
            this.context.toMetadata(ctx).then((metadata) => {
                client.start(metadata);
                client.send(req);
            });
        });
    }
    /**
     * newDB creates a new store on the remote node.
     * @param threadID the ID of the database
     * @param name The human-readable name for the database
     * @example
     * ```typescript
     * import {Client, ThreadID} from '@textile/threads'
     *
     * async function createDB (client: Client) {
     *   const threadID: ThreadID = await client.newDB()
     *   return threadID
     * }
     * ```
     */
    newDB(threadID, name) {
        const dbID = threadID !== null && threadID !== void 0 ? threadID : threads_id_1.ThreadID.fromRandom();
        const req = new pb.NewDBRequest();
        req.setDbid(dbID.toBytes());
        if (name !== undefined) {
            this.context.withThreadName(name);
            req.setName(name);
        }
        return this.unary(threads_pb_service_1.API.NewDB, req, () => {
            // Update our context with out new thread id
            this.context.withThread(dbID.toString());
            return dbID;
        });
    }
    /**
     * open creates and enters a new store on the remote node.
     * @param threadID the ID of the database
     * @param name The human-readable name for the database
     * @example
     * ```typescript
     * import {Client, ThreadID} from '@textile/threads'
     *
     * async function openDB (client: Client, threadID: ThreadID) {
     *   await client.open(threadID)
     * }
     * ```
     */
    open(threadID, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const req = new pb.ListDBsRequest();
            // Check if we already have this thread on the client...
            const found = yield this.unary(threads_pb_service_1.API.ListDBs, req, (res) => {
                for (const db of res.getDbsList()) {
                    const id = threads_id_1.ThreadID.fromBytes(db.getDbid_asU8());
                    if (id === threadID) {
                        this.context.withThread(threadID.toString());
                        return true;
                    }
                }
                return false;
            });
            // If yes, use that one...
            if (found)
                return;
            // Otherwise, try to create a new one
            yield this.newDB(threadID, name);
            this.context.withThread(threadID.toString());
        });
    }
    /**
     * Deletes an entire DB.
     * @param threadID the ID of the database.
     * @example
     * ```typescript
     * import {Client, ThreadID} from '@textile/threads'
     *
     * async function deleteDB (client: Client, threadID: ThreadID) {
     *   await client.deleteDB(threadID)
     *   return
     * }
     * ```
     */
    deleteDB(threadID) {
        const req = new pb.DeleteDBRequest();
        req.setDbid(threadID.toBytes());
        return this.unary(threads_pb_service_1.API.DeleteDB, req);
    }
    /**
     * Lists all known DBs.
     */
    listDBs() {
        const req = new pb.ListDBsRequest();
        return this.unary(threads_pb_service_1.API.ListDBs, req, (res) => {
            var _a;
            const dbs = [];
            for (const db of res.getDbsList()) {
                const id = threads_id_1.ThreadID.fromBytes(db.getDbid_asU8()).toString();
                dbs.push({
                    id,
                    name: (_a = db.getInfo()) === null || _a === void 0 ? void 0 : _a.getName(),
                });
            }
            return dbs;
        });
    }
    /**
     * Lists the collections in a thread
     * @param thread the ID of the database
     */
    listCollections(thread) {
        const req = new pb.ListCollectionsRequest();
        req.setDbid(thread.toBytes());
        return this.unary(threads_pb_service_1.API.ListCollections, req, (res) => res.toObject().collectionsList);
    }
    /**
     * newCollection registers a new collection schema under the given name.
     * The schema must be a valid json-schema.org schema, and can be a JSON string or object.
     * @param threadID the ID of the database
     * @param config A configuration object for the collection. See {@link CollectionConfig}. Note
     * that the validator and filter functions can also be provided as strings.
     *
     * @example
     * Create a new astronauts collection
     * ```typescript
     * import {Client, ThreadID} from '@textile/threads'
     *
     * const astronauts = {
     *   title: "Astronauts",
     *   type: "object",
     *   required: ["_id"],
     *   properties: {
     *     _id: {
     *       type: "string",
     *       description: "The instance's id.",
     *     },
     *     name: {
     *       type: "string",
     *       description: "The astronauts name.",
     *     },
     *     missions: {
     *       description: "The number of missions.",
     *       type: "integer",
     *       minimum: 0,
     *     },
     *   },
     * }
     *
     * async function newCollection (client: Client, threadID: ThreadID) {
     *   return await client.updateCollection(threadID, { name: 'astronauts', schema: astronauts })
     * }
     * ```
     * @example
     * Create a collection with writeValidator and readFilter functions
     * ```typescript
     * import {Client, ThreadID} from '@textile/threads'
     *
     * const schema = {
     *   title: "Person",
     *   type: "object",
     *   required: ["_id"],
     *   properties: {
     *     _id: { type: "string" },
     *     name: { type: "string" },
     *     age: { type: "integer" },
     *   },
     * }
     *
     * // We'll create a helper interface for type-safety
     * interface Person {
     *   _id: string
     *   age: number
     *   name: string
     * }
     *
     * const writeValidator = (writer: string, event: any, instance: Person) => {
     *   var type = event.patch.type
     *   var patch = event.patch.json_patch
     *   switch (type) {
     *     case "delete":
     *       if (writer != "the_boss") {
     *         return false // Not the boss? No deletes for you.
     *       }
     *     default:
     *       return true
     *   }
     * }
     *
     * const readFilter = (reader: string, instance: Person) => {
     *   if (instance.age > 50) {
     *     delete instance.age // Let's just hide their age for them ;)
     *   }
     *   return instance
     * }
     *
     * async function newCollection (client: Client, threadID: ThreadID) {
     *   return await client.updateCollection(threadID, {
     *     name: 'Person', schema, writeValidator, readFilter
     *   })
     * }
     * ```
     */
    newCollection(threadID, config) {
        var _a;
        const req = new pb.NewCollectionRequest();
        const conf = new pb.CollectionConfig();
        conf.setName(config.name);
        if (config.schema === undefined || isEmpty(config.schema)) {
            // We'll use our default schema
            config.schema = { properties: { _id: { type: 'string' } } };
        }
        conf.setSchema(encoder.encode(JSON.stringify(config.schema)));
        if (config.writeValidator) {
            conf.setWritevalidator(getFunctionBody(config.writeValidator));
        }
        if (config.readFilter) {
            conf.setReadfilter(getFunctionBody(config.readFilter));
        }
        const idx = [];
        for (const item of (_a = config.indexes) !== null && _a !== void 0 ? _a : []) {
            const index = new pb.Index();
            index.setPath(item.path);
            index.setUnique(item.unique);
            idx.push(index);
        }
        conf.setIndexesList(idx);
        req.setDbid(threadID.toBytes());
        req.setConfig(conf);
        return this.unary(threads_pb_service_1.API.NewCollection, req);
    }
    /**
     * newCollectionFromObject creates and registers a new collection under the given name.
     * The input object must be serializable to JSON, and contain only json-schema.org types.
     * @param threadID the ID of the database
     * @param obj The actual object to attempt to extract a schema from.
     * @param config A configuration object for the collection. See {@link CollectionConfig}.
     *
     * @example
     * Change a new astronauts collection based of Buzz
     * ```typescript
     * import {Client, ThreadID} from '@textile/threads'
     *
     * async function newCollection (client: Client, threadID: ThreadID) {
     *   const buzz = {
     *     name: 'Buzz',
     *     missions: 2,
     *     _id: '',
     *   }
     *   return await client.newCollectionFromObject(threadID, buzz, { name: 'astronauts' })
     * }
     * ```
     */
    newCollectionFromObject(threadID, obj, config) {
        const schema = to_json_schema_1.default(obj);
        return this.newCollection(threadID, Object.assign(Object.assign({}, config), { schema }));
    }
    /**
     * updateCollection updates an existing collection.
     * Currently, updates can include name and schema.
     * @todo Allow update of indexing information.
     * @param threadID the ID of the database
     * @param config A configuration object for the collection. See {@link CollectionConfig}.
     *
     * @example
     * Change the name of our astronauts collection
     * ```typescript
     * import {Client, ThreadID} from '@textile/threads'
     *
     * const astronauts = {
     *   title: "Astronauts",
     *   type: "object",
     *   required: ["_id"],
     *   properties: {
     *     _id: {
     *       type: "string",
     *       description: "The instance's id.",
     *     },
     *     name: {
     *       type: "string",
     *       description: "The astronauts name.",
     *     },
     *     missions: {
     *       description: "The number of missions.",
     *       type: "integer",
     *       minimum: 0,
     *     },
     *   },
     * }
     *
     * async function changeName (client: Client, threadID: ThreadID) {
     *   return await client.updateCollection(threadID, { name: 'toy-story-characters', schema: astronauts })
     * }
     * ```
     */
    updateCollection(threadID, 
    // Everything except "name" is optional here
    config) {
        var _a;
        const req = new pb.UpdateCollectionRequest();
        const conf = new pb.CollectionConfig();
        conf.setName(config.name);
        if (config.schema === undefined || isEmpty(config.schema)) {
            // We'll use our default schema
            config.schema = { properties: { _id: { type: 'string' } } };
        }
        conf.setSchema(encoder.encode(JSON.stringify(config.schema)));
        if (config.writeValidator) {
            conf.setWritevalidator(getFunctionBody(config.writeValidator));
        }
        if (config.readFilter) {
            conf.setReadfilter(getFunctionBody(config.readFilter));
        }
        const idx = [];
        for (const item of (_a = config.indexes) !== null && _a !== void 0 ? _a : []) {
            const index = new pb.Index();
            index.setPath(item.path);
            index.setUnique(item.unique);
            idx.push(index);
        }
        conf.setIndexesList(idx);
        req.setDbid(threadID.toBytes());
        req.setConfig(conf);
        return this.unary(threads_pb_service_1.API.UpdateCollection, req);
    }
    /**
     * Deletes an existing collection.
     * @param threadID the ID of the database.
     * @param name The human-readable name for the collection.
     * @param schema The actual json-schema.org compatible schema object.
     * @example
     * ```typescript
     * import {Client, ThreadID} from '@textile/threads'
     *
     * async function deleteAstronauts (client: Client, thread: ThreadID) {
     *   await client.deleteCollection(thread, 'astronauts')
     *   return
     * }
     * ```
     */
    deleteCollection(threadID, name) {
        const req = new pb.DeleteCollectionRequest();
        req.setDbid(threadID.toBytes());
        req.setName(name);
        return this.unary(threads_pb_service_1.API.DeleteCollection, req);
    }
    /**
     * Returns an existing indexes for a collection.
     * @param threadID the ID of the database.
     * @param name The human-readable name for the collection.
     *
     * @example
     * Return a set of indexes for our astronauts collection
     * ```typescript
     * import {Client, ThreadID} from '@textile/threads'
     *
     * async function getIndexes (client: Client, threadID: ThreadID) {
     *   return await client.getCollectionIndexes(threadID, 'astronauts')
     * }
     * ```
     */
    getCollectionIndexes(threadID, name) {
        const req = new pb.GetCollectionIndexesRequest();
        req.setDbid(threadID.toBytes());
        req.setName(name);
        return this.unary(threads_pb_service_1.API.GetCollectionIndexes, req, (res) => res.toObject().indexesList);
    }
    getCollectionInfo(threadID, name) {
        const req = new pb.GetCollectionInfoRequest();
        req.setDbid(threadID.toBytes());
        req.setName(name);
        return this.unary(threads_pb_service_1.API.GetCollectionInfo, req, (res) => {
            const result = {
                schema: JSON.parse(decoder.decode(res.getSchema_asU8())),
                name: res.getName(),
                indexes: res.getIndexesList().map((index) => index.toObject()),
                // We'll always return strings in this case for safety reasons
                writeValidator: res.getWritevalidator(),
                readFilter: res.getReadfilter(),
            };
            return result;
        });
    }
    /**
     * newDBFromAddr initializes the client with the given store, connecting to the given
     * thread address (database). It should be called before any operation on the store, and is an
     * alternative to start, which creates a local store. newDBFromAddr should also include the
     * read/follow key, which should be a Uint8Array or base32-encoded string.
     * @remarks
     * See getDBInfo for a possible source of the address and keys. See {@link ThreadKey} for
     * information about thread keys.
     * @param address The address for the thread with which to connect.
     * Should be of the form /ip4/<url/ip-address>/tcp/<port>/p2p/<peer-id>/thread/<thread-id>
     * @param key The set of keys to use to connect to the database
     * @param collections Array of CollectionConfig objects for seeding the DB with collections.
     */
    newDBFromAddr(address, key, collections) {
        const req = new pb.NewDBFromAddrRequest();
        const addr = multiaddr_1.bytesFromAddr(address);
        req.setAddr(addr);
        // Should always be encoded string, but might already be bytes
        req.setKey(typeof key === 'string' ? security_1.ThreadKey.fromString(key).toBytes() : key);
        if (collections !== undefined) {
            req.setCollectionsList(collections.map((c) => {
                const config = new pb.CollectionConfig();
                config.setName(c.name);
                config.setSchema(encoder.encode(JSON.stringify(c.schema)));
                const { indexes } = c;
                if (indexes !== undefined) {
                    const idxs = indexes.map((idx) => {
                        const index = new pb.Index();
                        index.setPath(idx.path);
                        index.setUnique(idx.unique);
                        return index;
                    });
                    config.setIndexesList(idxs);
                }
                return config;
            }));
        }
        return this.unary(threads_pb_service_1.API.NewDBFromAddr, req, ( /** res: pb.NewDBReply */) => {
            // Hacky way to extract threadid from addr that succeeded
            // TODO: Return this directly from the gRPC API on the go side?
            const result = multiaddr_1.bytesToTuples(req.getAddr_asU8()).filter(([key]) => key === 406);
            return threads_id_1.ThreadID.fromString(result[0][1]);
        });
    }
    /**
     * Connect client to an existing database using information in the DBInfo object
     * This should be called before any operation on the store, and is an alternative
     * to open, which re-opens a database already opened by the user.
     * @remarks This is a helper method around newDBFromAddr, which takes the 'raw' output
     * from getDBInfo. See getDBInfo for a possible source of the address and keys.
     * @param info The output from a call to getDBInfo on a separate peer.
     * @param includeLocal Whether to try dialing addresses that appear to be on the local host.
     * Defaults to false, preferring to add from public ip addresses.
     * @param collections Array of `name` and JSON schema pairs for seeding the DB with collections.
     *
     * @example
     * Get DB info and use DB info to join an existing remote thread (e.g. invited)
     * ```typescript
     * import {Client, DBInfo, ThreadID} from '@textile/threads'
     *
     * async function getInfo (client: Client, threadID: ThreadID): Promise<DBInfo> {
     *   return await client.getDBInfo(threadID)
     * }
     *
     * async function joinFromInfo (client: Client, info: DBInfo) {
     *   return await client.joinFromInfo(info)
     * }
     * ```
     */
    joinFromInfo(info, includeLocal = false, collections) {
        const req = new pb.NewDBFromAddrRequest();
        const filtered = info.addrs
            .map(multiaddr_1.bytesFromAddr)
            .filter((addr) => includeLocal || !maybeLocalAddr(multiaddr_1.bytesToOptions(addr).host));
        for (const addr of filtered) {
            req.setAddr(addr);
            // Should always be encoded string, but might already be bytes
            req.setKey(typeof info.key === 'string'
                ? security_1.ThreadKey.fromString(info.key).toBytes()
                : info.key);
            if (collections !== undefined) {
                req.setCollectionsList(collections.map((c) => {
                    const config = new pb.CollectionConfig();
                    config.setName(c.name);
                    config.setSchema(encoder.encode(JSON.stringify(c.schema)));
                    const { indexes } = c;
                    if (indexes !== undefined) {
                        const idxs = indexes.map((idx) => {
                            const index = new pb.Index();
                            index.setPath(idx.path);
                            index.setUnique(idx.unique);
                            return index;
                        });
                        config.setIndexesList(idxs);
                    }
                    return config;
                }));
            }
            // Try to add addrs one at a time, if one succeeds, we are done.
            return this.unary(threads_pb_service_1.API.NewDBFromAddr, req, () => {
                // Hacky way to extract threadid from addr that succeeded
                // @todo: Return this directly from the gRPC API?
                const result = multiaddr_1.bytesToTuples(req.getAddr_asU8()).filter(([key]) => key === 406);
                return threads_id_1.ThreadID.fromString(result[0][1]);
            });
        }
        throw new Error('No viable addresses for dialing');
    }
    /**
     * Returns a DBInfo objection containing metadata required to invite other peers to join a given thread.
     * @param threadID the ID of the database
     * @returns An object with an encoded thread key, and a list of multiaddrs.
     *
     * @example
     * Get DB info and use DB info to join an existing remote thread (e.g. invited)
     * ```typescript
     * import {Client, DBInfo, ThreadID} from '@textile/threads'
     *
     * async function getInfo (client: Client, threadID: ThreadID): Promise<DBInfo> {
     *   return await client.getDBInfo(threadID)
     * }
     *
     * async function joinFromInfo (client: Client, info: DBInfo) {
     *   return await client.joinFromInfo(info)
     * }
     * ```
     */
    getDBInfo(threadID) {
        const req = new pb.GetDBInfoRequest();
        req.setDbid(threadID.toBytes());
        return this.unary(threads_pb_service_1.API.GetDBInfo, req, (res) => {
            const key = security_1.ThreadKey.fromBytes(res.getKey_asU8());
            const addrs = [];
            for (const addr of res.getAddrsList()) {
                const address = multiaddr_1.stringFromBytes(addr);
                addrs.push(address);
            }
            return { key: key.toString(), addrs };
        });
    }
    /**
     * Creates a new model instance in the given store.
     * @param threadID the ID of the database
     * @param collectionName The human-readable name of the model to use.
     * @param values An array of model instances as JSON/JS objects.
     *
     * @example
     * Create a new entry in our collection
     * ```typescript
     * import {Client, ThreadID, Where} from '@textile/threads'
     *
     * interface Astronaut {
     *   name: string
     *   missions: number
     *   _id: string
     * }
     *
     * async function createBuzz (client: Client, threadID: ThreadID) {
     *   const buzz: Astronaut = {
     *     name: 'Buzz',
     *     missions: 2,
     *     _id: '',
     *   }
     *
     *   await client.create(threadID, 'astronauts', [buzz])
     * }
     * ```
     */
    create(threadID, collectionName, values) {
        const req = new pb.CreateRequest();
        req.setDbid(threadID.toBytes());
        req.setCollectionname(collectionName);
        const list = [];
        values.forEach((v) => {
            list.push(encoder.encode(JSON.stringify(v)));
        });
        req.setInstancesList(list);
        return this.unary(threads_pb_service_1.API.Create, req, (res) => res.toObject().instanceidsList);
    }
    /**
     * Saves changes to an existing model instance in the given store.
     * @param threadID the ID of the database
     * @param collectionName The human-readable name of the model to use.
     * @param values An array of model instances as JSON/JS objects.
     * Each model instance must have a valid existing `_id` property.
     *
     * @example
     * Update an existing instance
     * ```typescript
     * import {Client, ThreadID, Where} from '@textile/threads'
     *
     * interface Astronaut {
     *   name: string
     *   missions: number
     *   _id: string
     * }
     *
     * async function updateBuzz (client: Client, threadID: ThreadID) {
     *   const query = new Where('name').eq('Buzz')
     *   const result = await client.find<Astronaut>(threadID, 'astronauts', query)
     *
     *   if (result.length < 1) return
     *
     *   const buzz = result[0]
     *   buzz.missions += 1
     *
     *   return await client.save(threadID, 'astronauts', [buzz])
     * }
     * ```
     */
    save(threadID, collectionName, values) {
        const req = new pb.SaveRequest();
        req.setDbid(threadID.toBytes());
        req.setCollectionname(collectionName);
        const list = [];
        values.forEach((v) => {
            if (!v.hasOwnProperty('_id')) {
                v['_id'] = ''; // The server will add an _id if empty.
            }
            list.push(encoder.encode(JSON.stringify(v)));
        });
        req.setInstancesList(list);
        return this.unary(threads_pb_service_1.API.Save, req);
    }
    /**
     * Deletes an existing model instance from the given store.
     * @param threadID the ID of the database
     * @param collectionName The human-readable name of the model to use.
     * @param IDs An array of instance ids to delete.
     *
     * @example
     * Delete any instances that return from a query
     * ```typescript
     * import {Client, ThreadID, Where} from '@textile/threads'
     *
     * interface Astronaut {
     *   name: string
     *   missions: number
     *   _id: string
     * }
     *
     * async function deleteBuzz (client: Client, threadID: ThreadID) {
     *   const query = new Where('name').eq('Buzz')
     *   const result = await client.find<Astronaut>(threadID, 'astronauts', query)
     *
     *   if (result.length < 1) return
     *
     *   const ids = await result.map((instance) => instance._id)
     *   await client.delete(threadID, 'astronauts', ids)
     * }
     * ```
     */
    delete(threadID, collectionName, IDs) {
        const req = new pb.DeleteRequest();
        req.setDbid(threadID.toBytes());
        req.setCollectionname(collectionName);
        req.setInstanceidsList(IDs);
        return this.unary(threads_pb_service_1.API.Delete, req);
    }
    /**
     * Check if a given instance exists in the collection.
     * @param threadID the ID of the database
     * @param collectionName The human-readable name of the model to use.
     * @param IDs An array of instance ids to check for.
     *
     * @example
     * Check if an instance exists
     * ```typescript
     * import {Client, ThreadID, Where} from '@textile/threads'
     *
     * async function instanceExists (client: Client, threadID: ThreadID, id: string) {
     *   return await client.has(threadID, 'astronauts', [id])
     * }
     * ```
     */
    has(threadID, collectionName, IDs) {
        const req = new pb.HasRequest();
        req.setDbid(threadID.toBytes());
        req.setCollectionname(collectionName);
        req.setInstanceidsList(IDs);
        return this.unary(threads_pb_service_1.API.Has, req, (res) => res.getExists());
    }
    /**
     * Queries a collection for entities matching the given query parameters.
     * @param threadID the ID of the database
     * @param collectionName The human-readable name of the model to use.
     * @param query The object that describes the query. User Query class or primitive QueryJSON type.
     *
     * @example
     * Query with return type
     * ```typescript
     * import {Client, ThreadID, Where} from '@textile/threads'
     *
     * interface Astronaut {
     *   name: string
     *   missions: number
     *   _id: string
     * }
     *
     * async function getAstronautByName (client: Client, threadID: ThreadID, name: string) {
     *   const query = new Where('name').eq(name)
     *   const astronaut = await client.find<Astronaut>(threadID, 'astronauts', query)
     *   return astronaut
     * }
     * ```
     */
    find(threadID, collectionName, query) {
        const req = new pb.FindRequest();
        req.setDbid(threadID.toBytes());
        req.setCollectionname(collectionName);
        // @todo: Find a more isomorphic way to do this base64 round-trip
        req.setQueryjson(encoder.encode(JSON.stringify(query)));
        return this.unary(threads_pb_service_1.API.Find, req, (res) => {
            return res
                .getInstancesList_asU8()
                .map((instance) => JSON.parse(decoder.decode(instance)));
        });
    }
    /**
     * Queries the collection by a known instance ID.
     * @param threadID the ID of the database
     * @param collectionName The human-readable name of the model to use.
     * @param ID The id of the instance to search for.
     *
     * @example
     * Find and cast a known model by instance ID.
     * ```typescript
     * import {Client, ThreadID} from '@textile/threads'
     *
     * interface Astronaut {
     *   name: string
     *   missions: number
     *   _id: string
     * }
     *
     * async function getAstronaut (client: Client, threadID: ThreadID, id: string) {
     *   const astronaut = await client.findByID<Astronaut>(threadID, 'astronauts', id)
     *   return astronaut
     * }
     * ```
     *
     * @example
     * Simple find and return any instance
     * ```typescript
     * import {Client, ThreadID} from '@textile/threads'
     *
     * async function getInstance (client: Client, threadID: ThreadID, id: string) {
     *   return await client.findByID(threadID, 'astronauts', id)
     * }
     * ```
     */
    findByID(threadID, collectionName, ID) {
        const req = new pb.FindByIDRequest();
        req.setDbid(threadID.toBytes());
        req.setCollectionname(collectionName);
        req.setInstanceid(ID);
        return this.unary(threads_pb_service_1.API.FindByID, req, (res) => JSON.parse(decoder.decode(res.getInstance_asU8())));
    }
    /**
     * Verify checks existing instance changes.
     * Each model instance must have a valid existing `_id` property.
     * @param threadID the ID of the database
     * @param collectionName The human-readable name of the model to use.
     * @param values An array of model instances as JSON/JS objects.
     *
     * @example
     * Update an existing instance
     * ```typescript
     * import {Client, ThreadID, Where} from '@textile/threads'
     *
     * interface Astronaut {
     *   name: string
     *   missions: number
     *   _id: string
     * }
     *
     * async function verifyBuzz (client: Client, threadID: ThreadID) {
     *   const query = new Where('name').eq('Buzz')
     *   const result = await client.find<Astronaut>(threadID, 'astronauts', query)
     *
     *   if (result.length < 1) return
     *
     *   const buzz = result[0]
     *   buzz.missions += 1
     *
     *   // Is this going to be a valid update?
     *   return await client.verify(threadID, 'astronauts', [buzz])
     * }
     * ```
     */
    verify(threadID, collectionName, values) {
        const req = new pb.VerifyRequest();
        req.setDbid(threadID.toBytes());
        req.setCollectionname(collectionName);
        const list = values.map((v) => encoder.encode(JSON.stringify(v)));
        req.setInstancesList(list);
        return this.unary(threads_pb_service_1.API.Verify, req);
    }
    /**
     * readTransaction creates a new read-only transaction object. See ReadTransaction for details.
     * @param threadID the ID of the database
     * @param collectionName The human-readable name of the model to use.
     */
    readTransaction(threadID, collectionName) {
        // TODO: We can do this setup much cleaner!
        const client = grpc_web_1.grpc.client(threads_pb_service_1.API.ReadTransaction, {
            host: this.serviceHost,
            transport: this.rpcOptions.transport,
            debug: this.rpcOptions.debug,
        });
        return new models_1.ReadTransaction(this.context, client, threadID, collectionName);
    }
    /**
     * writeTransaction creates a new writeable transaction object. See WriteTransaction for details.
     * @param threadID the ID of the database
     * @param collectionName The human-readable name of the model to use.
     */
    writeTransaction(threadID, collectionName) {
        const client = grpc_web_1.grpc.client(threads_pb_service_1.API.WriteTransaction, {
            host: this.serviceHost,
            transport: this.rpcOptions.transport,
            debug: this.rpcOptions.debug,
        });
        return new models_1.WriteTransaction(this.context, client, threadID, collectionName);
    }
    /**
     * listen opens a long-lived connection with a remote node, running the given callback on each new update to the given instance.
     * The return value is a `close` function, which cleanly closes the connection with the remote node.
     * @param threadID the ID of the database
     * @param filters contains an array of Filters
     * @param callback The callback to call on each update to the given instance.
     *
     * @example
     * ```typescript
     * import {Client, ThreadID, Update} from '@textile/threads'
     *
     * interface Astronaut {
     *   name: string
     *   missions: number
     *   _id: string
     * }
     * function setupListener (client: Client, threadID: ThreadID) {
     *   const callback = (update?: Update<Astronaut>) => {
     *     // Not safe if more than the Astronauts collection existed in the same DB
     *     if (!update || !update.instance) return
     *     console.log('New update:', update.instance.name, update.instance.missions)
     *   }
     *   const closer = client.listen(threadID, [], callback)
     *   return closer
     * }
     * ```
     *
     * @example
     * Listen to only CREATE events on a specific Collection.
     * ```typescript
     * import {Client, ThreadID, Update} from '@textile/threads'
     *
     * interface Astronaut {
     *   name: string
     *   missions: number
     *   _id: string
     * }
     * function setupListener (client: Client, threadID: ThreadID) {
     *   const callback = (update?: Update<Astronaut>) => {
     *     if (!update || !update.instance) return
     *     console.log('New update:', update.instance.name, update.instance.missions)
     *   }
     *   const filters = [
     *     {collectionName: 'Astronauts'},
     *     {actionTypes: ['CREATE']}
     *   ]
     *   const closer = client.listen(threadID, filters, callback)
     *   return closer
     * }
     * ```
     */
    listen(threadID, filters, callback) {
        const req = new pb.ListenRequest();
        req.setDbid(threadID.toBytes());
        for (const filter of filters) {
            const requestFilter = new pb.ListenRequest.Filter();
            if (filter.instanceID) {
                requestFilter.setInstanceid(filter.instanceID);
            }
            else if (filter.collectionName) {
                requestFilter.setCollectionname(filter.collectionName);
            }
            if (filter.actionTypes) {
                for (const at of filter.actionTypes) {
                    switch (at) {
                        case 'ALL': {
                            requestFilter.setAction(pb.ListenRequest.Filter.Action.ALL);
                            break;
                        }
                        case 'CREATE': {
                            requestFilter.setAction(pb.ListenRequest.Filter.Action.CREATE);
                            break;
                        }
                        case 'SAVE': {
                            requestFilter.setAction(pb.ListenRequest.Filter.Action.SAVE);
                            break;
                        }
                        case 'DELETE': {
                            requestFilter.setAction(pb.ListenRequest.Filter.Action.DELETE);
                            break;
                        }
                    }
                }
            }
            else {
                requestFilter.setAction(0);
            }
            req.addFilters(requestFilter);
        }
        const decoder = new TextDecoder();
        const client = grpc_web_1.grpc.client(threads_pb_service_1.API.Listen, {
            host: this.serviceHost,
            transport: this.rpcOptions.transport,
            debug: this.rpcOptions.debug,
        });
        client.onMessage((message) => {
            // Pull it apart explicitly
            const instanceString = decoder.decode(message.getInstance_asU8());
            const actionInt = message.getAction();
            const action = Action[actionInt];
            const collectionName = message.getCollectionname();
            const instanceID = message.getInstanceid();
            const ret = {
                collectionName,
                instanceID,
                action,
                instance: undefined,
            };
            if (instanceString !== '') {
                ret.instance = JSON.parse(instanceString);
            }
            callback(ret);
        });
        client.onEnd((status, message /** trailers: grpc.Metadata */) => {
            if (status !== grpc_web_1.grpc.Code.OK) {
                callback(undefined, new Error(message));
            }
            callback();
        });
        this.context.toMetadata().then((metadata) => {
            client.start(metadata);
            client.send(req);
            client.finishSend();
        });
        return { close: () => client.close() };
    }
    unary(methodDescriptor, req, mapper = () => undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            const metadata = yield this.context.toMetadata();
            return new Promise((resolve, reject) => {
                grpc_web_1.grpc.unary(methodDescriptor, {
                    transport: this.rpcOptions.transport,
                    debug: this.rpcOptions.debug,
                    request: req,
                    host: this.serviceHost,
                    metadata,
                    onEnd: (res) => {
                        const { status, statusMessage, message } = res;
                        if (status === grpc_web_1.grpc.Code.OK) {
                            resolve(mapper(message));
                        }
                        else {
                            reject(new Error(statusMessage));
                        }
                    },
                });
            });
        });
    }
}
exports.Client = Client;
exports.default = Client;
//# sourceMappingURL=index.js.map