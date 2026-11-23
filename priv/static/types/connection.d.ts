/**
 * @private
 *
 * A connection of the socket over a single transport instance.
 *
 * It owns everything that belongs to this connection, so that nothing about it can
 * affect a later connection: the transport events are only handled while it is the
 * socket's current connection, and its state is gone together with it.
 */
export default class Connection {
    /**
     * @param {Socket} socket
     * @param {Object} transport - The transport instance, for example a WebSocket
     */
    constructor(socket: Socket, transport: Object);
    socket: Socket;
    transport: Object;
    joins: WeakMap<object, any>;
    pings: Map<any, any>;
    closing: boolean;
    ended: boolean;
    channelsErrored: boolean;
    closeHandled: boolean;
    /**
     * Whether this is the connection the socket currently uses. A replaced connection
     * can still emit events while it closes, but they no longer concern the socket.
     */
    isCurrent(): boolean;
    isOpen(): boolean;
    isConnecting(): boolean;
    /**
     * Whether the channel's current join was sent over this connection.
     */
    carried(channel: any, joinRef?: any): boolean;
    /**
     * Closes the transport. Its close event then only confirms our close.
     */
    close(code: any, reason: any): void;
}
//# sourceMappingURL=connection.d.ts.map