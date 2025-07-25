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
exports.SetupMailboxResponse = exports.SetupMailboxRequest = exports.SendMessageResponse = exports.SendMessageRequest = exports.ReadInboxMessageResponse = exports.ReadInboxMessageRequest = exports.ListThreadsRequest = exports.ListSentboxMessagesResponse = exports.ListSentboxMessagesRequest = exports.ListInboxMessagesResponse = exports.ListInboxMessagesRequest = exports.GetThreadRequest = exports.DeleteSentboxMessageResponse = exports.DeleteSentboxMessageRequest = exports.DeleteInboxMessageResponse = exports.DeleteInboxMessageRequest = void 0;
// Exports all API response types for typescript users
var usersd_pb_1 = require("@textile/users-grpc/api/usersd/pb/usersd_pb");
Object.defineProperty(exports, "DeleteInboxMessageRequest", { enumerable: true, get: function () { return usersd_pb_1.DeleteInboxMessageRequest; } });
Object.defineProperty(exports, "DeleteInboxMessageResponse", { enumerable: true, get: function () { return usersd_pb_1.DeleteInboxMessageResponse; } });
Object.defineProperty(exports, "DeleteSentboxMessageRequest", { enumerable: true, get: function () { return usersd_pb_1.DeleteSentboxMessageRequest; } });
Object.defineProperty(exports, "DeleteSentboxMessageResponse", { enumerable: true, get: function () { return usersd_pb_1.DeleteSentboxMessageResponse; } });
Object.defineProperty(exports, "GetThreadRequest", { enumerable: true, get: function () { return usersd_pb_1.GetThreadRequest; } });
Object.defineProperty(exports, "ListInboxMessagesRequest", { enumerable: true, get: function () { return usersd_pb_1.ListInboxMessagesRequest; } });
Object.defineProperty(exports, "ListInboxMessagesResponse", { enumerable: true, get: function () { return usersd_pb_1.ListInboxMessagesResponse; } });
Object.defineProperty(exports, "ListSentboxMessagesRequest", { enumerable: true, get: function () { return usersd_pb_1.ListSentboxMessagesRequest; } });
Object.defineProperty(exports, "ListSentboxMessagesResponse", { enumerable: true, get: function () { return usersd_pb_1.ListSentboxMessagesResponse; } });
Object.defineProperty(exports, "ListThreadsRequest", { enumerable: true, get: function () { return usersd_pb_1.ListThreadsRequest; } });
Object.defineProperty(exports, "ReadInboxMessageRequest", { enumerable: true, get: function () { return usersd_pb_1.ReadInboxMessageRequest; } });
Object.defineProperty(exports, "ReadInboxMessageResponse", { enumerable: true, get: function () { return usersd_pb_1.ReadInboxMessageResponse; } });
Object.defineProperty(exports, "SendMessageRequest", { enumerable: true, get: function () { return usersd_pb_1.SendMessageRequest; } });
Object.defineProperty(exports, "SendMessageResponse", { enumerable: true, get: function () { return usersd_pb_1.SendMessageResponse; } });
Object.defineProperty(exports, "SetupMailboxRequest", { enumerable: true, get: function () { return usersd_pb_1.SetupMailboxRequest; } });
Object.defineProperty(exports, "SetupMailboxResponse", { enumerable: true, get: function () { return usersd_pb_1.SetupMailboxResponse; } });
__exportStar(require("./api"), exports);
__exportStar(require("./users"), exports);
//# sourceMappingURL=index.js.map