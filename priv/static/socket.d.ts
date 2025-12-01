/**
* @import { Message, Vsn, Transport, Params, OnOpenCallback, OnCloseCallback, OnErrorCallback, OnMessageCallback, SocketOptions, StateChangeCallbacks } from "./types"
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
    defaultEncoder: <T>(msg: ArrayBuffer | string, callback: (msg: Message<unknown>) => T) => T;
    defaultDecoder: <T>(rawPayload: Message<Record<string, any>>, callback: (msg: ArrayBuffer | string) => T) => T;
    closeWasClean: boolean;
    disconnecting: boolean;
    /** @type{BinaryType} */
    binaryType: BinaryType;
    connectClock: number;
    pageHidden: boolean;
    encode: import("./types").Encode<any> | (<T>(msg: ArrayBuffer | string, callback: (msg: Message<unknown>) => T) => T);
    decode: import("./types").Decode<any> | (<T>(rawPayload: Message<Record<string, any>>, callback: (msg: ArrayBuffer | string) => T) => T);
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
    /** @type{Vsn} */
    vsn: Vsn;
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
    conn: any;
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
import type { StateChangeCallbacks } from "./types";
import type { Transport } from "./types";
import type { Message } from "./types";
import type { Vsn } from "./types";
import Timer from "./timer";
import LongPoll from "./longpoll";
import type { Params } from "./types";
import type { OnOpenCallback } from "./types";
import type { OnCloseCallback } from "./types";
import type { OnErrorCallback } from "./types";
import type { OnMessageCallback } from "./types";
import Channel from "./channel";
import type { SocketOptions } from "./types";
//# sourceMappingURL=socket.d.ts.map