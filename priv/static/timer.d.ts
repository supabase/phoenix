/**
 *
 * Creates a timer that accepts a `timerCalc` function to perform
 * calculated timeout retries, such as exponential backoff.
 *
 * @example
 * let reconnectTimer = new Timer(() => this.connect(), function(tries){
 *   return [1000, 5000, 10000][tries - 1] || 10000
 * })
 * reconnectTimer.scheduleTimeout() // fires after 1000
 * reconnectTimer.scheduleTimeout() // fires after 5000
 * reconnectTimer.reset()
 * reconnectTimer.scheduleTimeout() // fires after 1000
 *
 * @param {Function} callback
 * @param {Function} timerCalc
 */
export default class Timer {
    constructor(callback: any, timerCalc: any);
    callback: any;
    timerCalc: any;
    timer: NodeJS.Timeout | null;
    tries: number;
    reset(): void;
    /**
     * Cancels any previous scheduleTimeout and schedules callback
     */
    scheduleTimeout(): void;
}
//# sourceMappingURL=timer.d.ts.map