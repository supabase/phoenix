export const globalSelf = typeof self !== "undefined" ? self : null
export const phxWindow = typeof window !== "undefined" ? window : null
export const global = globalSelf || phxWindow || globalThis
export const DEFAULT_VSN = "2.0.0"
export const DEFAULT_TIMEOUT = 10000
export const WS_CLOSE_NORMAL = 1000

/**
 * @typedef {typeof SOCKET_STATES[keyof typeof SOCKET_STATES]} SocketState
 */

export const SOCKET_STATES = /** @type {const} */ ({connecting: 0, open: 1, closing: 2, closed: 3})

/**
 * @typedef {typeof CHANNEL_STATES[keyof typeof CHANNEL_STATES]} ChannelState
 */

export const CHANNEL_STATES = /** @type {const} */ ({
  closed: "closed",
  errored: "errored",
  joined: "joined",
  joining: "joining",
  leaving: "leaving",
})

/**
 * @typedef {typeof CHANNEL_EVENTS[keyof typeof CHANNEL_EVENTS]} ChannelEvent
 */

export const CHANNEL_EVENTS = /** @type {const} */ ({
  close: "phx_close",
  error: "phx_error",
  join: "phx_join",
  reply: "phx_reply",
  leave: "phx_leave"
})


/**
 * @typedef {typeof TRANSPORTS[keyof typeof TRANSPORTS]} Transport
 */

export const TRANSPORTS = /** @type {const} */ ({
  longpoll: "longpoll",
  websocket: "websocket"
})

/**
 * @typedef {typeof XHR_STATES[keyof typeof XHR_STATES]} XhrState
 */

export const XHR_STATES = /** @type {const} */ ({
  complete: 4
})

export const AUTH_TOKEN_PREFIX = "base64url.bearer.phx."
