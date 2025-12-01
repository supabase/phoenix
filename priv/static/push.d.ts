/**
 * @import Channel from "./channel"
 * @import { ChannelEvent } from "./constants"
 */
export default class Push {
    /**
     * Initializes the Push
     * @param {Channel} channel - The Channel
     * @param {ChannelEvent} event - The event, for example `"phx_join"`
     * @param {() => Record<string, unknown>} payload - The payload, for example `{user_id: 123}`
     * @param {number} timeout - The push timeout in milliseconds
     */
    constructor(channel: Channel, event: ChannelEvent, payload: () => Record<string, unknown>, timeout: number);
    /** @type{Channel} */
    channel: Channel;
    /** @type{ChannelEvent} */
    event: ChannelEvent;
    /** @type{() => Record<string, unknown>} */
    payload: () => Record<string, unknown>;
    receivedResp: unknown;
    /** @type{number} */
    timeout: number;
    /** @type{(ReturnType<typeof setTimeout>) | null} */
    timeoutTimer: (ReturnType<typeof setTimeout>) | null;
    recHooks: any[];
    /** @type{boolean} */
    sent: boolean;
    /** @type{number} */
    ref: number;
    /**
     *
     * @param {number} timeout
     */
    resend(timeout: number): void;
    /**
     *
     */
    send(): void;
    /**
     *
     * @param {string} status
     * @param {(response: any) => void} callback
     */
    receive(status: string, callback: (response: any) => void): this;
    /**
     * @private
     */
    private reset;
    refEvent: string | null | undefined;
    /**
     * @private
     */
    private matchReceive;
    /**
     * @private
     */
    private cancelRefEvent;
    /**
     * @private
     */
    private cancelTimeout;
    /**
     * @private
     */
    private startTimeout;
    /**
     * @private
     */
    private hasReceived;
    /**
     * @private
     */
    private trigger;
}
import type Channel from "./channel";
import type { ChannelEvent } from "./constants";
//# sourceMappingURL=push.d.ts.map