/** Initializes the Socket *
 *
 * For IE8 support use an ES5-shim (https://github.com/es-shims/es5-shim)
 *
 * @param {string} endPoint - The string WebSocket endpoint, ie, `"ws://example.com/socket"`,
 *                                               `"wss://example.com"`
 *                                               `"/socket"` (inherited host & protocol)
 * @param {Object} [opts] - Optional configuration
 * @param {Function} [opts.transport] - The Websocket Transport, for example WebSocket or Phoenix.LongPoll.
 *
 * Defaults to WebSocket with automatic LongPoll fallback if WebSocket is not defined.
 * To fallback to LongPoll when WebSocket attempts fail, use `longPollFallbackMs: 2500`.
 *
 * @param {number} [opts.longPollFallbackMs] - The millisecond time to attempt the primary transport
 * before falling back to the LongPoll transport. Disabled by default.
 *
 * @param {boolean} [opts.debug] - When true, enables debug logging. Default false.
 *
 * @param {Function} [opts.encode] - The function to encode outgoing messages.
 *
 * Defaults to JSON encoder.
 *
 * @param {Function} [opts.decode] - The function to decode incoming messages.
 *
 * Defaults to JSON:
 *
 * ```javascript
 * (payload, callback) => callback(JSON.parse(payload))
 * ```
 *
 * @param {number} [opts.timeout] - The default timeout in milliseconds to trigger push timeouts.
 *
 * Defaults `DEFAULT_TIMEOUT`
 * @param {number} [opts.heartbeatIntervalMs] - The millisec interval to send a heartbeat message
 * @param {Function} [opts.reconnectAfterMs] - The optional function that returns the
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
 * @param {Function} [opts.rejoinAfterMs] - The optional function that returns the millisec
 * rejoin interval for individual channels.
 *
 * ```javascript
 * function(tries){
 *   return [1000, 2000, 5000][tries - 1] || 10000
 * }
 * ````
 *
 * @param {Function} [opts.logger] - The optional function for specialized logging, ie:
 *
 * ```javascript
 * function(kind, msg, data) {
 *   console.log(`${kind}: ${msg}`, data)
 * }
 * ```
 *
 * @param {number} [opts.longpollerTimeout] - The maximum timeout of a long poll AJAX request.
 *
 * Defaults to 20s (double the server long poll timer).
 *
 * @param {(Object|function)} [opts.params] - The optional params to pass when connecting
 * @param {string} [opts.authToken] - the optional authentication token to be exposed on the server
 * under the `:auth_token` connect_info key.
 * @param {string} [opts.binaryType] - The binary type to use for binary WebSocket frames.
 *
 * Defaults to "arraybuffer"
 *
 * @param {vsn} [opts.vsn] - The serializer's protocol version to send on connect.
 *
 * Defaults to DEFAULT_VSN.
 *
 * @param {Object} [opts.sessionStorage] - An optional Storage compatible object
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
    constructor(endPoint: any, opts?: {});
    stateChangeCallbacks: {
        open: never[];
        close: never[];
        error: never[];
        message: never[];
    };
    channels: any[];
    sendBuffer: any[];
    ref: number;
    fallbackRef: string | null;
    timeout: any;
    transport: any;
    primaryPassedHealthCheck: boolean;
    longPollFallbackMs: any;
    fallbackTimer: NodeJS.Timeout | null;
    sessionStore: any;
    establishedConnections: number;
    defaultEncoder: (msg: any, callback: any) => any;
    defaultDecoder: (rawPayload: any, callback: any) => any;
    closeWasClean: boolean;
    disconnecting: boolean;
    binaryType: any;
    connectClock: number;
    pageHidden: boolean;
    encode: any;
    decode: any;
    heartbeatIntervalMs: any;
    rejoinAfterMs: (tries: any) => any;
    reconnectAfterMs: (tries: any) => any;
    logger: any;
    longpollerTimeout: any;
    params: any;
    endPoint: string;
    vsn: any;
    heartbeatTimeoutTimer: NodeJS.Timeout | null;
    heartbeatTimer: NodeJS.Timeout | null;
    pendingHeartbeatRef: string | null;
    reconnectTimer: Timer;
    authToken: any;
    /**
     * Returns the LongPoll transport reference
     */
    getLongPollTransport(): typeof LongPoll;
    /**
     * Disconnects and replaces the active transport
     *
     * @param {Function} newTransport - The new transport class to instantiate
     *
     */
    replaceTransport(newTransport: Function): void;
    conn: any;
    /**
     * Returns the socket protocol
     *
     * @returns {string}
     */
    protocol(): string;
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
     * @param {Function} callback - Optional callback which is called after socket is disconnected.
     * @param {integer} code - A status code for disconnection (Optional).
     * @param {string} reason - A textual description of the reason to disconnect. (Optional)
     */
    disconnect(callback: Function, code: integer, reason: string): void;
    /**
     *
     * @param {Object} params - The params to send when connecting, for example `{user_id: userToken}`
     *
     * Passing params to connect is deprecated; pass them in the Socket constructor instead:
     * `new Socket("/socket", {params: {user_id: userToken}})`.
     */
    connect(params: Object): void;
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
     * @param {Function} callback
     */
    onOpen(callback: Function): string;
    /**
     * Registers callbacks for connection close events
     * @param {Function} callback
     */
    onClose(callback: Function): string;
    /**
     * Registers callbacks for connection error events
     *
     * @example socket.onError(function(error){ alert("An error occurred") })
     *
     * @param {Function} callback
     */
    onError(callback: Function): string;
    /**
     * Registers callbacks for connection message events
     * @param {Function} callback
     */
    onMessage(callback: Function): string;
    /**
     * Pings the server and invokes the callback with the RTT in milliseconds
     * @param {Function} callback
     *
     * Returns true if the ping was pushed or false if unable to be pushed.
     */
    ping(callback: Function): boolean;
    /**
     * @private
     */
    private transportConnect;
    getSession(key: any): any;
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
    onConnClose(event: any): void;
    /**
     * @private
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
     * @param {refs} - list of refs returned by calls to
     *                 `onOpen`, `onClose`, `onError,` and `onMessage`
     */
    off(refs: any): void;
    /**
     * Initiates a new channel for the given topic
     *
     * @param {string} topic
     * @param {Object} chanParams - Parameters for the channel
     * @returns {Channel}
     */
    channel(topic: string, chanParams?: Object): Channel;
    /**
     * @param {Object} data
     */
    push(data: Object): void;
    /**
     * Return the next message ref, accounting for overflows
     * @returns {string}
     */
    makeRef(): string;
    sendHeartbeat(): void;
    flushSendBuffer(): void;
    onConnMessage(rawMessage: any): void;
    leaveOpenTopic(topic: any): void;
}
import Timer from "./timer";
import LongPoll from "./longpoll";
import Channel from "./channel";
//# sourceMappingURL=socket.d.ts.map