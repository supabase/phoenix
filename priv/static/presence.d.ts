/**
 * @import Channel from "./channel"
 * @typedef {{state: string, diff: string}} Events
 * @typedef {(key: string, currentPresence: PresenceState, newPresence: PresenceState) => void} OnJoin
 * @typedef {(key: string, currentPresence: PresenceState, leftPresence: PresenceState) => void} OnLeave
 * @typedef {() => void} OnSync
 * @typedef {Record<string, PresenceState>} State
 * @typedef {({joins: State, leaves: State})} Diff
 * @typedef {(
    {
      metas: {
        phx_ref?: string
        phx_ref_prev?: string
        [key: string]: any
      }[]
    }
  )} PresenceState
 */
export default class Presence {
    /**
     * Used to sync the list of presences on the server
     * with the client's state. An optional `onJoin` and `onLeave` callback can
     * be provided to react to changes in the client's local presences across
     * disconnects and reconnects with the server.
     *
     * @param {State} currentState
     * @param {State} newState
     * @param {OnJoin} onJoin
     * @param {OnLeave} onLeave
     *
     * @returns {State}
     */
    static syncState(currentState: State, newState: State, onJoin: OnJoin, onLeave: OnLeave): State;
    /**
     *
     * Used to sync a diff of presence join and leave
     * events from the server, as they happen. Like `syncState`, `syncDiff`
     * accepts optional `onJoin` and `onLeave` callbacks to react to a user
     * joining or leaving from a device.
     *
     * @param {State} state
     * @param {Diff} diff
     * @param {OnJoin} onJoin
     * @param {OnLeave} onLeave
     *
     * @returns {State}
     */
    static syncDiff(state: State, diff: Diff, onJoin: OnJoin, onLeave: OnLeave): State;
    /**
     * Returns the array of presences, with selected metadata.
     *
     * @template [T=PresenceState]
     * @param {State} presences
     * @param {((key: string, obj: Presence) => T)} [chooser]
     *
     * @returns {T[]}
     */
    static list<T = PresenceState>(presences: State, chooser?: ((key: string, obj: Presence) => T)): T[];
    /**
    * @template T
    * @param {State} obj
    * @param {(key: string, obj: PresenceState) => T} func
    */
    static map<T>(obj: State, func: (key: string, obj: PresenceState) => T): T[];
    /**
    * @template T
    * @param {T} obj
    * @returns {T}
    */
    static clone<T>(obj: T): T;
    /**
     * Initializes the Presence
     * @param {Channel} channel - The Channel
     * @param {{events?: Events}} [opts] - The options,
     *        for example `{events: {state: "state", diff: "diff"}}`
     */
    constructor(channel: Channel, opts?: {
        events?: Events;
    });
    /** @type{State} */
    state: State;
    /** @type{Diff[]} */
    pendingDiffs: Diff[];
    /** @type{Channel} */
    channel: Channel;
    /** @type{number} */
    joinRef: number;
    /** @type{({ onJoin: OnJoin; onLeave: OnLeave; onSync: OnSync })} */
    caller: ({
        onJoin: OnJoin;
        onLeave: OnLeave;
        onSync: OnSync;
    });
    /**
     * @param {OnJoin} callback
     */
    onJoin(callback: OnJoin): void;
    /**
     * @param {OnLeave} callback
     */
    onLeave(callback: OnLeave): void;
    /**
     * @param {OnSync} callback
     */
    onSync(callback: OnSync): void;
    /**
     * Returns the array of presences, with selected metadata.
     *
     * @template [T=PresenceState]
     * @param {((key: string, obj: PresenceState) => T)} [by]
     *
     * @returns {T[]}
     */
    list<T = PresenceState>(by?: ((key: string, obj: PresenceState) => T)): T[];
    inPendingSyncState(): boolean;
}
export type Events = {
    state: string;
    diff: string;
};
export type OnJoin = (key: string, currentPresence: PresenceState, newPresence: PresenceState) => void;
export type OnLeave = (key: string, currentPresence: PresenceState, leftPresence: PresenceState) => void;
export type OnSync = () => void;
export type State = Record<string, PresenceState>;
export type Diff = ({
    joins: State;
    leaves: State;
});
export type PresenceState = ({
    metas: {
        phx_ref?: string;
        phx_ref_prev?: string;
        [key: string]: any;
    }[];
});
import type Channel from "./channel";
//# sourceMappingURL=presence.d.ts.map