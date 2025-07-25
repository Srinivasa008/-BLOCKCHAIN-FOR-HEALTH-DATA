"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Variant = exports.ThreadID = void 0;
/**
 * A web-gRPC wrapper client for communicating with the web-gRPC enabled Textile ThreadDB & Buckets APIs.
 * @packageDocumentation
 */
__exportStar(require("@textile/buckets"), exports);
__exportStar(require("@textile/crypto"), exports);
__exportStar(require("@textile/grpc-authentication"), exports);
__exportStar(require("@textile/hub-filecoin"), exports);
__exportStar(require("@textile/hub-threads-client"), exports);
__exportStar(require("@textile/security"), exports);
var threads_id_1 = require("@textile/threads-id");
Object.defineProperty(exports, "ThreadID", { enumerable: true, get: function () { return threads_id_1.ThreadID; } });
Object.defineProperty(exports, "Variant", { enumerable: true, get: function () { return threads_id_1.Variant; } });
__exportStar(require("@textile/users"), exports);
//# sourceMappingURL=index.js.map