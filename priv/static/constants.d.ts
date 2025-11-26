export const globalSelf: (Window & typeof globalThis) | null;
export const phxWindow: (Window & typeof globalThis) | null;
export const global: typeof globalThis;
export const DEFAULT_VSN: "2.0.0";
export namespace SOCKET_STATES {
    let connecting: number;
    let open: number;
    let closing: number;
    let closed: number;
}
export const DEFAULT_TIMEOUT: 10000;
export const WS_CLOSE_NORMAL: 1000;
export namespace CHANNEL_STATES {
    let closed_1: string;
    export { closed_1 as closed };
    export let errored: string;
    export let joined: string;
    export let joining: string;
    export let leaving: string;
}
export namespace CHANNEL_EVENTS {
    let close: string;
    let error: string;
    let join: string;
    let reply: string;
    let leave: string;
}
export namespace TRANSPORTS {
    let longpoll: string;
    let websocket: string;
}
export namespace XHR_STATES {
    let complete: number;
}
export const AUTH_TOKEN_PREFIX: "base64url.bearer.phx.";
//# sourceMappingURL=constants.d.ts.map