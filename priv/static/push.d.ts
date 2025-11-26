/**
 * Initializes the Push
 * @param {Channel} channel - The Channel
 * @param {string} event - The event, for example `"phx_join"`
 * @param {Object} payload - The payload, for example `{user_id: 123}`
 * @param {number} timeout - The push timeout in milliseconds
 */
export default class Push {
    constructor(channel: any, event: any, payload: any, timeout: any);
    channel: any;
    event: any;
    payload: any;
    receivedResp: any;
    timeout: any;
    timeoutTimer: NodeJS.Timeout | null;
    recHooks: any[];
    sent: boolean;
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
     * @param {*} status
     * @param {*} callback
     */
    receive(status: any, callback: any): this;
    /**
     * @private
     */
    private reset;
    ref: any;
    refEvent: any;
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
//# sourceMappingURL=push.d.ts.map