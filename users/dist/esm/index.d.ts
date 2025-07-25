import { grpc } from "@improbable-eng/grpc-web";
import { ContextInterface } from "@textile/context";
import { GrpcConnection } from "@textile/grpc-connection";
import { GetThreadResponse } from "@textile/hub-threads-client";
import { Identity, Public } from "@textile/crypto";
import { CopyAuthOptions, GrpcAuthentication, WithKeyInfoOptions, WithUserAuthOptions } from "@textile/grpc-authentication";
import { KeyInfo, UserAuth } from "@textile/security";
/**
 * Global settings for mailboxes
 */
declare const MailConfig: {
    ThreadName: string;
    InboxCollectionName: string;
    SentboxCollectionName: string;
};
/**
 * The status query filter of an inbox message.
 */
declare enum Status {
    ALL = 0,
    READ = 1,
    UNREAD = 2
}
/**
 * Sentbox query options
 */
interface SentboxListOptions {
    seek?: string;
    limit?: number;
    ascending?: boolean;
}
/**
 * Inbox query options
 */
interface InboxListOptions {
    seek?: string;
    limit?: number;
    ascending?: boolean;
    status?: Status;
}
/**
 * @deprecated
 */
type GetThreadResponseObj = GetThreadResponse;
interface Usage {
    description: string;
    units: number;
    total: number;
    free: number;
    grace: number;
    cost: number;
    period?: Period;
}
interface CustomerUsage {
    usageMap: [string, Usage][];
}
/**
 * GetUsage options
 */
interface UsageOptions {
    /**
     * Public key of the user. Only available when authenticated using an account key.
     */
    dependentUserKey?: string;
}
interface Period {
    unixStart: number;
    unixEnd: number;
}
/**
 * The response type from getUsage
 */
interface CustomerResponse {
    key: string;
    customerId: string;
    parentKey: string;
    email: string;
    accountType: number;
    accountStatus: string;
    subscriptionStatus: string;
    balance: number;
    billable: boolean;
    delinquent: boolean;
    createdAt: number;
    gracePeriodEnd: number;
    invoicePeriod?: Period;
    dailyUsageMap: Array<[
        string,
        Usage
    ]>;
    dependents: number;
}
interface GetUsageResponse {
    customer?: CustomerResponse;
    usage?: CustomerUsage;
}
/**
 * The message format returned from inbox or sentbox
 */
interface UserMessage {
    id: string;
    to: string;
    from: string;
    body: Uint8Array;
    signature: Uint8Array;
    createdAt: number;
    readAt?: number;
}
/**
 * The mailbox event type. CREATE, SAVE, or DELETE
 */
declare enum MailboxEventType {
    CREATE = 0,
    SAVE = 1,
    DELETE = 2
}
/**
 * The event type returned from inbox and sentbox subscriptions
 */
interface MailboxEvent {
    type: MailboxEventType;
    messageID: string;
    message?: UserMessage;
}
/**
 * @internal
 */
declare function listThreads(api: GrpcConnection, ctx?: ContextInterface): Promise<Array<GetThreadResponse>>;
/**
 * @internal
 */
declare function getThread(api: GrpcConnection, name: string, ctx?: ContextInterface): Promise<GetThreadResponse>;
/**
 * @internal
 */
declare function setupMailbox(api: GrpcConnection, ctx?: ContextInterface): Promise<string>;
/**
 * @internal
 */
declare function getMailboxID(api: GrpcConnection, ctx?: ContextInterface): Promise<string>;
/**
 * @internal
 */
declare function sendMessage(api: GrpcConnection, from: string, to: string, toBody: Uint8Array, toSignature: Uint8Array, fromBody: Uint8Array, fromSignature: Uint8Array, ctx?: ContextInterface): Promise<UserMessage>;
/**
 * @internal
 */
declare function listInboxMessages(api: GrpcConnection, opts?: InboxListOptions, ctx?: ContextInterface): Promise<Array<UserMessage>>;
/**
 * @internal
 */
declare function listSentboxMessages(api: GrpcConnection, opts?: SentboxListOptions, ctx?: ContextInterface): Promise<Array<UserMessage>>;
/**
 * @internal
 */
declare function readInboxMessage(api: GrpcConnection, id: string, ctx?: ContextInterface): Promise<{
    readAt: number;
}>;
/**
 * @internal
 */
declare function deleteInboxMessage(api: GrpcConnection, id: string, ctx?: ContextInterface): Promise<void>;
/**
 * @internal
 */
declare function deleteSentboxMessage(api: GrpcConnection, id: string, ctx?: ContextInterface): Promise<void>;
/**
 * @internal
 */
declare function watchMailbox(api: GrpcConnection, id: string, box: "inbox" | "sentbox", callback: (reply?: MailboxEvent, err?: Error) => void, ctx?: ContextInterface): grpc.Request;
/**
 * @internal
 */
declare function getUsage(api: GrpcConnection, options?: UsageOptions, ctx?: ContextInterface): Promise<GetUsageResponse>;
/**
 * Users a client wrapper for interacting with the Textile Users API.
 *
 * This API has the ability to:
 *
 *   - Register new users with a User Group key and obtain a new API Token
 *
 *   - Get and List all Threads created for/by the user in your app.
 *
 *   - Create an inbox for the user or send message to another user's inbox.
 *
 *   - Check, read, and delete messages in a user's inbox.
 *
 * @example
 * Initialize a the User API and list their threads.
 * ```typescript
 * import { Users, UserAuth } from '@textile/hub'
 *
 * const example = async (auth: UserAuth) => {
 *   const api = Users.withUserAuth(auth)
 *   const list = api.listThreads()
 *   return list
 * }
 * ```
 *
 * @example
 * Create a new inbox for the user
 * ```typescript
 * import { Users } from '@textile/hub'
 *
 * // This method requires you already authenticate the Users object.
 * async function setupMailbox (users: Users) {
 *   await users.setupMailbox()
 * }
 * ```
 *
 * @example
 * Send a message to a public key
 * ```typescript
 * import { Users, Identity, PublicKey  } from "@textile/hub"
 *
 * // This method requires you already authenticate the Users object.
 *
 * async function example(users: Users, from: Identity, to: PublicKey, message: string) {
 *   const encoder = new TextEncoder()
 *   const body = encoder.encode(message)
 *   return await users.sendMessage(from, to, body)
 * }
 * ```
 */
declare class Users extends GrpcAuthentication {
    /**
     * {@inheritDoc @textile/hub#GrpcAuthentication.copyAuth}
     *
     * @example
     * Copy an authenticated Users api instance to Buckets.
     * ```typescript
     * import { Buckets, Users } from '@textile/hub'
     *
     * const usersToBuckets = async (user: Users) => {
     *   const buckets = Buckets.copyAuth(user)
     *   return buckets
     * }
     * ```
     *
     * @example
     * Copy an authenticated Buckets api instance to Users.
     * ```typescript
     * import { Buckets, Users } from '@textile/hub'
     *
     * const bucketsToUsers = async (buckets: Buckets) => {
     *   const user = Users.copyAuth(buckets)
     *   return user
     * }
     * ```
     */
    static copyAuth(auth: GrpcAuthentication, options?: CopyAuthOptions): Users;
    /**
     * {@inheritDoc @textile/hub#GrpcAuthentication.withUserAuth}
     *
     * @example
     * ```@typescript
     * import { Users, UserAuth } from '@textile/hub'
     *
     * async function example (userAuth: UserAuth) {
     *   const users = await Users.withUserAuth(userAuth)
     * }
     * ```
     */
    static withUserAuth(auth: UserAuth | (() => Promise<UserAuth>), options?: WithUserAuthOptions): Users;
    /**
     * {@inheritDoc @textile/hub#GrpcAuthentication.withKeyInfo}
     *
     * @example
     * ```@typescript
     * import { Users, KeyInfo } from '@textile/hub'
     *
     * async function start () {
     *   const keyInfo: KeyInfo = {
     *     key: '<api key>',
     *     secret: '<api secret>'
     *   }
     *   const users = await Users.withKeyInfo(keyInfo)
     * }
     * ```
     */
    static withKeyInfo(key: KeyInfo, options?: WithKeyInfoOptions): Promise<Users>;
    /**
     * {@inheritDoc @textile/hub#GrpcAuthentication.withThread}
     *
     * @example
     * ```@typescript
     * import { Client, ThreadID } from '@textile/hub'
     *
     * async function example (threadID: ThreadID) {
     *   const id = threadID.toString()
     *   const users = await Users.withThread(id)
     * }
     * ```
     */
    withThread(threadID?: string): void;
    /**
     * {@inheritDoc @textile/hub#GrpcAuthentication.getToken}
     *
     * @example
     * ```@typescript
     * import { Users, PrivateKey } from '@textile/hub'
     *
     * async function example (users: Users, identity: PrivateKey) {
     *   const token = await users.getToken(identity)
     *   return token // already added to `users` scope
     * }
     * ```
     */
    getToken(identity: Identity): Promise<string>;
    /**
     * {@inheritDoc @textile/hub#GrpcAuthentication.getToken}
     */
    setToken(token: string): Promise<void>;
    /**
     * {@inheritDoc @textile/hub#GrpcAuthentication.getTokenChallenge}
     *
     * @example
     * ```typescript
     * import { Users, PrivateKey } from '@textile/hub'
     *
     * async function example (users: Users, identity: PrivateKey) {
     *   const token = await users.getTokenChallenge(
     *     identity.public.toString(),
     *     (challenge: Uint8Array) => {
     *       return new Promise((resolve, reject) => {
     *         // This is where you should program PrivateKey to respond to challenge
     *         // Read more here: https://docs.textile.io/tutorials/hub/production-auth/
     *       })
     *     }
     *   )
     *   return token
     * }
     * ```
     */
    getTokenChallenge(publicKey: string, callback: (challenge: Uint8Array) => Uint8Array | Promise<Uint8Array>): Promise<string>;
    /**
     * GetUsage returns current billing and usage information.
     *
     * @example
     * ```typescript
     * import { Users } from "@textile/hub"
     *
     * async function example(users: Users) {
     *    const usage = await users.getUsage()
     * }
     * ```
     */
    getUsage(options?: UsageOptions): Promise<GetUsageResponse>;
    /**
     * Lists a users existing threads. This method
     * requires a valid user, token, and session.
     *
     * @example
     * ```typescript
     * import { Users } from "@textile/hub"
     *
     * async function example(users: Users) {
     *    const list = await users.listThreads()
     * }
     * ```
     */
    listThreads(): Promise<Array<GetThreadResponse>>;
    /**
     * Gets a users existing thread by name.
     *
     * @example
     * ```typescript
     * import { Users } from "@textile/hub"
     *
     * async function example(users: Users) {
     *    const thread = await users.getThread('thread-name')
     *    return thread
     * }
     * ```
     */
    getThread(name: string): Promise<GetThreadResponse>;
    /**
     * Setup a user's inbox. This is required for each new user.
     * An inbox must be setup by the inbox owner (keys) before
     * messages can be sent to it.
     *
     * @returns mailboxID
     *
     * @example
     * ```typescript
     * import { Users } from "@textile/hub"
     *
     * async function example(users: Users) {
     *    return await users.setupMailbox()
     * }
     * ```
     */
    setupMailbox(): Promise<string>;
    /**
     * Returns the mailboxID of the current user if it exists.
     *
     * @returns {string} mailboxID
     */
    getMailboxID(): Promise<string>;
    /**
     * A local user can author messages to remote user through their public-key
     *
     * @param from defines the local, sending, user. Any object that conforms to the Identity interface.
     * @param to defines the remote, receiving user. Any object that conforms to the Public interface.
     * @param body is the message body bytes in UInt8Array format.
     *
     * @example
     * ```typescript
     * import { Users, Identity, PublicKey  } from "@textile/hub"
     *
     * async function example(users: Users, from: Identity, to: PublicKey, message: string) {
     *   const encoder = new TextEncoder()
     *   const body = encoder.encode(message)
     *   return await users.sendMessage(from, to, body)
     * }
     * ```
     */
    sendMessage(from: Identity, to: Public, body: Uint8Array): Promise<UserMessage>;
    /**
     * List the inbox of the local user
     *
     * @example
     * ```typescript
     * import { Users, Status } from "@textile/hub"
     *
     * async function example(users: Users) {
     *    return await users.listInboxMessages({
     *      limit: 5,
     *      ascending: true,
     *      status: Status.UNREAD,
     *    })
     * }
     * ```
     */
    listInboxMessages(opts?: InboxListOptions): Promise<Array<UserMessage>>;
    /**
     * List the sent messages of the local user
     *
     * @example
     * ```typescript
     * import { Users } from "@textile/hub"
     *
     * async function example(users: Users) {
     *    return await users.listSentboxMessages({
     *      limit: 5,
     *      ascending: true,
     *    })
     * }
     * ```
     */
    listSentboxMessages(opts?: SentboxListOptions): Promise<Array<UserMessage>>;
    /**
     * Mark a message as read
     *
     * @example
     * ```typescript
     * import { Users } from "@textile/hub"
     *
     * async function example(users: Users) {
     *    const res = await users.listInboxMessages({
     *      limit: 1,
     *      ascending: true,
     *    })
     *    if (res.length === 1) users.readInboxMessage(res[0].id)
     * }
     * ```
     */
    readInboxMessage(id: string): Promise<{
        readAt: number;
    }>;
    /**
     * Mark a message as read
     *
     * @example
     * ```typescript
     * import { Users } from "@textile/hub"
     *
     * async function example(users: Users) {
     *    const res = await users.listInboxMessages({
     *      limit: 1,
     *      ascending: true,
     *    })
     *    if (res.length === 1) users.deleteInboxMessage(res[0].id)
     * }
     * ```
     */
    deleteInboxMessage(id: string): Promise<void>;
    /**
     * Mark a message as read
     *
     * @example
     * ```typescript
     * import { Users } from "@textile/hub"
     *
     * async function example(users: Users) {
     *    const res = await users.listSentboxMessages({
     *      limit: 1,
     *      ascending: true,
     *    })
     *    if (res.length === 1) users.deleteInboxMessage(res[0].id)
     * }
     * ```
     */
    deleteSentboxMessage(id: string): Promise<void>;
    /**
     * watchInbox watches the inbox for new mailbox events.
     * Returns a listener of watch connectivity states.
     * @returns listener. listener.close will stop watching.
     * @param id the mailbox id
     * @param callback handles each new mailbox event
     *
     * @example
     * Listen and log all new inbox events
     *
     * ```typescript
     * import { Users, MailboxEvent } from '@textile/hub'
     *
     * const callback = async (reply?: MailboxEvent, err?: Error) => {
     *   if (!reply || !reply.message) return console.log('no message')
     *   console.log(reply.type)
     * }
     *
     * async function example (users: Users) {
     *   const mailboxID = await users.getMailboxID()
     *   const closer = await users.watchInbox(mailboxID, callback)
     *   return closer
     * }
     * ```
     *
     * @example
     * Decrypt a new message in local user's inbox sent by listener callback
     *
     * ```typescript
     * import { Users, MailboxEvent, PrivateKey } from '@textile/hub'
     *
     * const userID = PrivateKey.fromRandom()
     *
     * const callback = async (reply?: MailboxEvent, err?: Error) => {
     *   if (!reply || !reply.message) return console.log('no message')
     *   const bodyBytes = await userID.decrypt(reply.message.body)
     *
     *   const decoder = new TextDecoder()
     *   const body = decoder.decode(bodyBytes)
     *
     *   console.log(body)
     * }
     *
     * // Requires userID already be authenticated to the Users API
     * async function startListener(users: Users) {
     *   const mailboxID = await users.getMailboxID()
     *   const closer = await users.watchInbox(mailboxID, callback)
     * }
     * ```
     */
    watchInbox(id: string, callback: (reply?: MailboxEvent, err?: Error) => void): grpc.Request;
    /**
     * watchSentbox watches the sentbox for new mailbox events.
     * Returns a listener of watch connectivity states.
     * @returns listener. listener.close will stop watching.
     * @param id the mailbox id
     * @param callback handles each new mailbox event.
     *
     * @example
     * The local user's own sentbox can be decrypted with their private key
     *
     * ```typescript
     * import { Users, MailboxEvent, PrivateKey } from '@textile/hub'
     *
     * const userID = PrivateKey.fromRandom()
     *
     * const callback = async (reply?: MailboxEvent, err?: Error) => {
     *   if (!reply || !reply.message) return console.log('no message')
     *   const bodyBytes = await userID.decrypt(reply.message.body)
     *
     *   const decoder = new TextDecoder()
     *   const body = decoder.decode(bodyBytes)
     *
     *   console.log(body)
     * }
     *
     * // Requires userID already be authenticated to the Users API
     * async function startListener(users: Users) {
     *   const mailboxID = await users.getMailboxID()
     *   const closer = await users.watchInbox(mailboxID, callback)
     * }
     * ```
     */
    watchSentbox(id: string, callback: (reply?: MailboxEvent, err?: Error) => void): grpc.Request;
}
export { GetThreadResponse } from '@textile/hub-threads-client';
export { DeleteInboxMessageRequest, DeleteInboxMessageResponse, DeleteSentboxMessageRequest, DeleteSentboxMessageResponse, GetThreadRequest, ListInboxMessagesRequest, ListInboxMessagesResponse, ListSentboxMessagesRequest, ListSentboxMessagesResponse, ListThreadsRequest, ReadInboxMessageRequest, ReadInboxMessageResponse, SendMessageRequest, SendMessageResponse, SetupMailboxRequest, SetupMailboxResponse } from '@textile/users-grpc/api/usersd/pb/usersd_pb';
export { MailConfig, Status, SentboxListOptions, InboxListOptions, GetThreadResponseObj, Usage, CustomerUsage, UsageOptions, Period, CustomerResponse, GetUsageResponse, UserMessage, MailboxEventType, MailboxEvent, listThreads, getThread, setupMailbox, getMailboxID, sendMessage, listInboxMessages, listSentboxMessages, readInboxMessage, deleteInboxMessage, deleteSentboxMessage, watchMailbox, getUsage, Users };
