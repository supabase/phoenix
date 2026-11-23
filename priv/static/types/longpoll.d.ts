export default class LongPoll {
    constructor(endPoint: any, protocols: any);
    authToken: string | undefined;
    endPoint: any;
    token: any;
    skipHeartbeat: boolean;
    reqs: Set<any>;
    messageTimers: Set<any>;
    awaitingBatchAck: boolean;
    currentBatch: any[] | null;
    currentBatchTimer: NodeJS.Timeout | null;
    batchBuffer: any[];
    onopen: () => void;
    onerror: () => void;
    onmessage: () => void;
    onclose: () => void;
    pollEndpoint: any;
    readyState: 0;
    normalizeEndpoint(endPoint: any): any;
    endpointURL(): any;
    closeAndRetry(error: any, code: any, reason: any, wasClean: any): void;
    ontimeout(): void;
    isActive(): boolean;
    poll(): void;
    send(body: any): void;
    batchSend(messages: any, offset?: number): void;
    close(code: any, reason: any, wasClean: any): void;
    /**
     * Cancels the pending requests, queued messages and outgoing batches.
     */
    stop(readyState: any): void;
    /**
     * Emits the close event. Like a WebSocket closed without a code, it reports 1005 (no status)
     * unless one is given, as 1000 would look like the server closing the connection normally.
     */
    emitClose(code: number | undefined, reason: any, wasClean?: boolean): void;
    ajax(method: any, headers: any, body: any, onCallerTimeout: any, callback: any): void;
}
//# sourceMappingURL=longpoll.d.ts.map