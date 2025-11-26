/**
 * Initializes the Presence
 * @param {Channel} channel - The Channel
 * @param {Object} opts - The options,
 *        for example `{events: {state: "state", diff: "diff"}}`
 */
export default class Presence {
    /**
     * Used to sync the list of presences on the server
     * with the client's state. An optional `onJoin` and `onLeave` callback can
     * be provided to react to changes in the client's local presences across
     * disconnects and reconnects with the server.
     *
     * @returns {Presence}
     */
    static syncState(currentState: any, newState: any, onJoin: any, onLeave: any): Presence;
    /**
     *
     * Used to sync a diff of presence join and leave
     * events from the server, as they happen. Like `syncState`, `syncDiff`
     * accepts optional `onJoin` and `onLeave` callbacks to react to a user
     * joining or leaving from a device.
     *
     * @returns {Presence}
     */
    static syncDiff(state: any, diff: any, onJoin: any, onLeave: any): Presence;
    /**
     * Returns the array of presences, with selected metadata.
     *
     * @param {Object} presences
     * @param {Function} chooser
     *
     * @returns {Presence}
     */
    static list(presences: Object, chooser: Function): Presence;
    static map(obj: any, func: any): any[];
    static clone(obj: any): any;
    constructor(channel: any, opts?: {});
    state: {};
    pendingDiffs: any[];
    channel: any;
    joinRef: any;
    caller: {
        onJoin: () => void;
        onLeave: () => void;
        onSync: () => void;
    };
    onJoin(callback: any): void;
    onLeave(callback: any): void;
    onSync(callback: any): void;
    list(by: any): Presence;
    inPendingSyncState(): boolean;
}
//# sourceMappingURL=presence.d.ts.map