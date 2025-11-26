/**
* @template T
* @typedef {import("./serializer.js").Message<T>} Message<T>
* @ignore
*/
/**
* @typedef {typeof WebSocket | typeof LongPoll} Transport
* @typedef {() => Record<string, any> | Record<string, any>} Params
* @typedef {() => void} OnOpenCallback
* @typedef {(event: CloseEvent) => void} OnCloseCallback
* @typedef {(error, transportBefore, establishedBefore) => void} OnErrorCallback
* @typedef {(rawMessage: MessageEvent<any>) => void} OnMessageCallback
* @typedef {({
    open: [string, OnOpenCallback][]
    close: [string, OnCloseCallback][]
    error: [string, OnErrorCallback][]
    message: [string, OnMessageCallback][]
  })} StateChangeCallbacks
*/
/**
 * @typedef {Object} SocketOptions
 * @property {Transport} [opts.transport] - The Websocket Transport, for example WebSocket or Phoenix.LongPoll.
 *
 * @property {number} [opts.longPollFallbackMs] - The millisecond time to attempt the primary transport
 * before falling back to the LongPoll transport. Disabled by default.
 *
 * @property {boolean} [opts.debug] - When true, enables debug logging. Default false.
 *
 * @property {import("./serializer").Encode<any>} [opts.encode] - The function to encode outgoing messages.
 * Defaults to JSON encoder.
 *
 * @property {import("./serializer").Decode<any>} [opts.decode] - The function to decode incoming messages.
 * Defaults to JSON:
 *
 * ```javascript
 * (payload, callback) => callback(JSON.parse(payload))
 * ```
 *
 * @property {number} [opts.timeout] - The default timeout in milliseconds to trigger push timeouts.
 * Defaults `DEFAULT_TIMEOUT`
 * @property {number} [opts.heartbeatIntervalMs] - The millisec interval to send a heartbeat message
 *
 * @property {(tries: number) => number} [opts.reconnectAfterMs] - The optional function that returns the
 * socket reconnect interval, in milliseconds.
 *
 * Defaults to stepped backoff of:
 *
 * ```javascript
 * function(tries){
 *   return [10, 50, 100, 150, 200, 250, 500, 1000, 2000][tries - 1] || 5000
 * }
 * ````
 *
 * @property {(tries: number) => number} [opts.rejoinAfterMs] - The optional function that returns the millisec
 * rejoin interval for individual channels.
 *
 * ```javascript
 * function(tries){
 *   return [1000, 2000, 5000][tries - 1] || 10000
 * }
 * ````
 *
 * @property {(kind: string, msg: string, data: any) => void} [opts.logger] - The optional function for specialized logging, ie:
 *
 * ```javascript
 * function(kind, msg, data) {
 *   console.log(`${kind}: ${msg}`, data)
 * }
 * ```
 *
 * @property {} [opts.params] - The optional params to pass when connecting
 *
 * @property {string} [opts.authToken] - the optional authentication token to be exposed on the server
 * under the `:auth_token` connect_info key.
 *
 * @property {BinaryType} [opts.binaryType] - The binary type to use for binary WebSocket frames.
 *
 * Defaults to "arraybuffer"
 *
 * @property {import("./constants").Vsn} [opts.vsn] - The serializer's protocol version to send on connect.
 *
 * Defaults to DEFAULT_VSN.
 *
 * @property {Storage} [opts.sessionStorage] - An optional Storage compatible object
 * Phoenix uses sessionStorage for longpoll fallback history. Overriding the store is
 * useful when Phoenix won't have access to `sessionStorage`. For example, This could
 * happen if a site loads a cross-domain channel in an iframe. Example usage:
 *
 *     class InMemoryStorage {
 *       constructor() { this.storage = {} }
 *       getItem(keyName) { return this.storage[keyName] || null }
 *       removeItem(keyName) { delete this.storage[keyName] }
 *       setItem(keyName, keyValue) { this.storage[keyName] = keyValue }
 *     }
 *
 */
export default class Socket {
    /** Initializes the Socket *
     *
     * For IE8 support use an ES5-shim (https://github.com/es-shims/es5-shim)
     *
     * @constructor
     * @param {string} endPoint - The string WebSocket endpoint, ie, `"ws://example.com/socket"`,
     *                                               `"wss://example.com"`
     *                                               `"/socket"` (inherited host & protocol)
     * @param {SocketOptions} [opts] - Optional configuration
     */
    constructor(endPoint: string, opts?: SocketOptions);
    /** @type{StateChangeCallbacks} */
    stateChangeCallbacks: StateChangeCallbacks;
    channels: any[];
    sendBuffer: any[];
    ref: number;
    fallbackRef: string | null;
    /** @type{number} */
    timeout: number;
    /** @type{Transport} */
    transport: Transport;
    primaryPassedHealthCheck: boolean;
    /** @type{number | undefined} */
    longPollFallbackMs: number | undefined;
    fallbackTimer: NodeJS.Timeout | null;
    /** @type{Storage} */
    sessionStore: Storage;
    establishedConnections: number;
    defaultEncoder: import("./serializer").Encode<T>;
    defaultDecoder: import("./serializer").Decode<T>;
    closeWasClean: boolean;
    disconnecting: boolean;
    /** @type{BinaryType} */
    binaryType: BinaryType;
    connectClock: number;
    pageHidden: boolean;
    encode: import("./serializer").Encode<T>;
    decode: import("./serializer").Decode<T>;
    /** @type{number} */
    heartbeatIntervalMs: number;
    /** @type{(tries: number) => number} */
    rejoinAfterMs: (tries: number) => number;
    /** @type{(tries: number) => number} */
    reconnectAfterMs: (tries: number) => number;
    /** @type{(kind: string, msg: string, data: any) => void} */
    logger: (kind: string, msg: string, data: any) => void;
    longpollerTimeout: any;
    /** @type{() => Record<string, any>} */
    params: () => Record<string, any>;
    endPoint: string;
    /** @type{import("./constants").Vsn} */
    vsn: import("./constants").Vsn;
    heartbeatTimeoutTimer: NodeJS.Timeout | null;
    heartbeatTimer: NodeJS.Timeout | null;
    pendingHeartbeatRef: string | null;
    reconnectTimer: Timer;
    /** @type{[string]} */
    authToken: [string];
    /**
     * Returns the LongPoll transport reference
     */
    getLongPollTransport(): typeof LongPoll;
    /**
     * Disconnects and replaces the active transport
     *
     * @param {Transport} newTransport - The new transport class to instantiate
     *
     */
    replaceTransport(newTransport: Transport): void;
    conn: LongPoll | WebSocket | null | undefined;
    /**
     * Returns the socket protocol
     *
     * @returns {"wss" | "ws"}
     */
    protocol(): "wss" | "ws";
    /**
     * The fully qualified socket url
     *
     * @returns {string}
     */
    endPointURL(): string;
    /**
     * Disconnects the socket
     *
     * See https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes for valid status codes.
     *
     * @param {() => void} callback - Optional callback which is called after socket is disconnected.
     * @param {number} [code] - A status code for disconnection (Optional).
     * @param {string} [reason] - A textual description of the reason to disconnect. (Optional)
     */
    disconnect(callback: () => void, code?: number, reason?: string): void;
    /**
     * @param {Params} [params] - [DEPRECATED] The params to send when connecting, for example `{user_id: userToken}`
     *
     * Passing params to connect is deprecated; pass them in the Socket constructor instead:
     * `new Socket("/socket", {params: {user_id: userToken}})`.
     */
    connect(params?: Params): void;
    /**
     * Logs the message. Override `this.logger` for specialized logging. noops by default
     * @param {string} kind
     * @param {string} msg
     * @param {Object} data
     */
    log(kind: string, msg: string, data: Object): void;
    /**
     * Returns true if a logger has been set on this socket.
     */
    hasLogger(): boolean;
    /**
     * Registers callbacks for connection open events
     *
     * @example socket.onOpen(function(){ console.info("the socket was opened") })
     *
     * @param {OnOpenCallback} callback
     */
    onOpen(callback: OnOpenCallback): string;
    /**
     * Registers callbacks for connection close events
     * @param {OnCloseCallback} callback
     */
    onClose(callback: OnCloseCallback): string;
    /**
     * Registers callbacks for connection error events
     *
     * @example socket.onError(function(error){ alert("An error occurred") })
     *
     * @param {OnErrorCallback} callback
     */
    onError(callback: OnErrorCallback): string;
    /**
     * Registers callbacks for connection message events
     * @param {OnMessageCallback} callback
     */
    onMessage(callback: OnMessageCallback): string;
    /**
     * Pings the server and invokes the callback with the RTT in milliseconds
     * @param {(timeDelta: number) => void} callback
     *
     * Returns true if the ping was pushed or false if unable to be pushed.
     */
    ping(callback: (timeDelta: number) => void): boolean;
    /**
     * @private
     */
    private transportConnect;
    getSession(key: any): string | null;
    storeSession(key: any, val: any): void;
    connectWithFallback(fallbackTransport: any, fallbackThreshold?: number): void;
    clearHeartbeats(): void;
    onConnOpen(): void;
    /**
     * @private
     */
    private heartbeatTimeout;
    resetHeartbeat(): void;
    teardown(callback: any, code: any, reason: any): any;
    waitForBufferDone(callback: any, tries?: number): void;
    waitForSocketClosed(callback: any, tries?: number): void;
    /**
    * @param {CloseEvent} event
    */
    onConnClose(event: CloseEvent): void;
    /**
     * @private
     * @param {Event} error
     */
    private onConnError;
    /**
     * @private
     */
    private triggerChanError;
    /**
     * @returns {string}
     */
    connectionState(): string;
    /**
     * @returns {boolean}
     */
    isConnected(): boolean;
    /**
     * @private
     *
     * @param {Channel}
     */
    private remove;
    /**
     * Removes `onOpen`, `onClose`, `onError,` and `onMessage` registrations.
     *
     * @param {string[]} refs - list of refs returned by calls to
     *                 `onOpen`, `onClose`, `onError,` and `onMessage`
     */
    off(refs: string[]): void;
    /**
     * Initiates a new channel for the given topic
     *
     * @param {string} topic
     * @param {Record<string, unknown> | () => Record<string, unknown>} [chanParams]- Parameters for the channel
     * @returns {Channel}
     */
    channel(topic: string, chanParams?: Record<string, unknown> | (() => Record<string, unknown>)): Channel;
    /**
     * @param {Message<Record<string, any>>} data
     */
    push(data: Message<Record<string, any>>): void;
    /**
     * Return the next message ref, accounting for overflows
     * @returns {string}
     */
    makeRef(): string;
    sendHeartbeat(): void;
    flushSendBuffer(): void;
    /**
    * @param {MessageEvent<any>} rawMessage
    */
    onConnMessage(rawMessage: MessageEvent<any>): void;
    leaveOpenTopic(topic: any): void;
}
/**
 * <T>
 */
export type Message<T> = import("./serializer.js").Message<T>;
export type Transport = typeof WebSocket | typeof LongPoll;
export type Params = () => Record<string, any> | Record<string, any>;
export type OnOpenCallback = () => void;
export type OnCloseCallback = (event: CloseEvent) => void;
export type OnErrorCallback = (error: any, transportBefore: any, establishedBefore: any) => void;
export type OnMessageCallback = (rawMessage: MessageEvent<any>) => void;
export type StateChangeCallbacks = ({
    open: [string, OnOpenCallback][];
    close: [string, OnCloseCallback][];
    error: [string, OnErrorCallback][];
    message: [string, OnMessageCallback][];
});
export type SocketOptions = {
    /**
     * - The Websocket Transport, for example WebSocket or Phoenix.LongPoll.
     */
    transport?: Transport | undefined;
    /**
     * - The millisecond time to attempt the primary transport
     * before falling back to the LongPoll transport. Disabled by default.
     */
    longPollFallbackMs?: number | undefined;
    /**
     * - When true, enables debug logging. Default false.
     */
    debug?: boolean | undefined;
    /**
     * - The function to encode outgoing messages.
     * Defaults to JSON encoder.
     */
    encode?: import("./serializer").Encode<any> | undefined;
    /**
     * - The function to decode incoming messages.
     * Defaults to JSON:
     *
     * ```javascript
     * (payload, callback) => callback(JSON.parse(payload))
     * ```
     */
    decode?: import("./serializer").Decode<any> | undefined;
    /**
     * - The default timeout in milliseconds to trigger push timeouts.
     * Defaults `DEFAULT_TIMEOUT`
     */
    timeout?: number | undefined;
    /**
     * - The millisec interval to send a heartbeat message
     */
    heartbeatIntervalMs?: number | undefined;
    /**
     * - The optional function that returns the
     * socket reconnect interval, in milliseconds.
     *
     * Defaults to stepped backoff of:
     *
     * ```javascript
     * function(tries){
     * return [10, 50, 100, 150, 200, 250, 500, 1000, 2000][tries - 1] || 5000
     * }
     * ````
     */
    reconnectAfterMs?: ((tries: number) => number) | undefined;
    /**
     * - The optional function that returns the millisec
     * rejoin interval for individual channels.
     *
     * ```javascript
     * function(tries){
     * return [1000, 2000, 5000][tries - 1] || 10000
     * }
     * ````
     */
    rejoinAfterMs?: ((tries: number) => number) | undefined;
    /**
     * - The optional function for specialized logging, ie:
     *
     * ```javascript
     * function(kind, msg, data) {
     * console.log(`${kind}: ${msg}`, data)
     * }
     * ```
     */
    logger?: ((kind: string, msg: string, data: any) => void) | undefined;
    /**
     * - The optional params to pass when connecting
     */
    params?: any;
    /**
     * - the optional authentication token to be exposed on the server
     * under the `:auth_token` connect_info key.
     */
    authToken?: string | undefined;
    /**
     * - The binary type to use for binary WebSocket frames.
     *
     * Defaults to "arraybuffer"
     */
    binaryType?: BinaryType | undefined;
    /**
     * - The serializer's protocol version to send on connect.
     *
     * Defaults to DEFAULT_VSN.
     */
    vsn?: import("./constants").Vsn | undefined;
    /**
     * - An optional Storage compatible object
     * Phoenix uses sessionStorage for longpoll fallback history. Overriding the store is
     * useful when Phoenix won't have access to `sessionStorage`. For example, This could
     * happen if a site loads a cross-domain channel in an iframe. Example usage:
     *
     * class InMemoryStorage {
     * constructor() { this.storage = {} }
     * getItem(keyName) { return this.storage[keyName] || null }
     * removeItem(keyName) { delete this.storage[keyName] }
     * setItem(keyName, keyValue) { this.storage[keyName] = keyValue }
     * }
     */
    sessionStorage?: Storage | undefined;
};
import Timer from "./timer";
import LongPoll from "./longpoll";
import Channel from "./channel";
//# sourceMappingURL=socket.d.ts.map