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
Object.defineProperty(exports, "__esModule", { value: true });
exports.bytesToOptions = exports.bytesToTuples = exports.stringFromBytes = exports.bytesFromAddr = void 0;
const codec = __importStar(require("./codec"));
function bytesFromAddr(addr) {
    // default
    if (addr == null) {
        addr = '';
    }
    let bytes = new Uint8Array(0);
    if (addr instanceof Uint8Array) {
        bytes = codec.fromBytes(addr);
    }
    else if (typeof addr === 'string') {
        if (addr.length > 0 && addr.charAt(0) !== '/') {
            throw new Error(`multiaddr "${addr}" must start with a "/"`);
        }
        bytes = codec.fromString(addr);
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
    }
    else if (addr.bytes && addr.protos && addr.protoCodes) {
        // Multiaddr
        bytes = codec.fromBytes(addr.bytes); // validate + copy bytes
    }
    else {
        throw new Error('addr must be a string, Uint8Array, or another Multiaddr');
    }
    return bytes;
}
exports.bytesFromAddr = bytesFromAddr;
function stringFromBytes(bytes) {
    return codec.bytesToString(bytes);
}
exports.stringFromBytes = stringFromBytes;
function bytesToTuples(bytes) {
    const t = codec.bytesToTuples(bytes);
    return codec.tuplesToStringTuples(t);
}
exports.bytesToTuples = bytesToTuples;
function bytesToOptions(bytes) {
    const parsed = stringFromBytes(bytes).split('/');
    const opts = {
        family: parsed[1] === 'ip4' ? 'ipv4' : 'ipv6',
        host: parsed[2],
        transport: parsed[3],
        port: parseInt(parsed[4]),
    };
    return opts;
}
exports.bytesToOptions = bytesToOptions;
//# sourceMappingURL=index.js.map