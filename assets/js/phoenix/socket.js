import {
  global,
  phxWindow,
  CHANNEL_EVENTS,
  DEFAULT_TIMEOUT,
  DEFAULT_VSN,
  SOCKET_STATES,
  TRANSPORTS,
  WS_CLOSE_NORMAL,
  AUTH_TOKEN_PREFIX
} from "./constants"

import {
  closure
} from "./utils"

import Ajax from "./ajax"
import Channel from "./channel"
import LongPoll from "./longpoll"
import Serializer from "./serializer"
import Timer from "./timer"
import Connection from "./connection"

/**
* @import { Encode, Decode, Message, Vsn, SocketTransport, Params, SocketOnOpen, SocketOnClose, SocketOnError, SocketOnMessage, SocketOptions, SocketStateChangeCallbacks, HeartbeatCallback } from "./types"
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
  constructor(endPoint, opts = {}){
    /** @type{SocketStateChangeCallbacks} */
    this.stateChangeCallbacks = {open: [], close: [], error: [], message: []}
    /** @type{Channel[]} */
    this.channels = []
    /** @type{(() => void)[]} */
    this.sendBuffer = []
    /** @type{number} */
    this.ref = 0
    /** @type{?string} */
    this.fallbackRef = null
    /** @type{?string} */
    this.fallbackErrorRef = null
    // sends the health check of the current fallback attempt, see connectWithFallback
    /** @type{(() => void) | null} */
    this.fallbackHealthCheck = null
    /** @type{number} */
    this.timeout = opts.timeout || DEFAULT_TIMEOUT
    /** @type{SocketTransport} */
    this.transport = opts.transport || global.WebSocket || LongPoll
    /** @type{boolean} */
    this.primaryPassedHealthCheck = false
    /** @type{number | undefined} */
    this.longPollFallbackMs = opts.longPollFallbackMs
    /** @type{ReturnType<typeof setTimeout>} */
    this.fallbackTimer = null
    // In some environments (sandboxed iframes without `allow-same-origin`,
    // in-app webviews, "block third-party storage" privacy modes), reading
    // `global.sessionStorage` throws SecurityError at the property-access level.
    // Wrap the read so the Socket constructor cannot throw synchronously.
    let envSessionStorage = null
    try { envSessionStorage = global && global.sessionStorage } catch {}
    /** @type{Storage} */
    this.sessionStore = opts.sessionStorage || envSessionStorage
    /** @type{number} */
    this.establishedConnections = 0
    /** @type{Encode<void>} */
    this.defaultEncoder = Serializer.encode.bind(Serializer)
    /** @type{Decode<void>} */
    this.defaultDecoder = Serializer.decode.bind(Serializer)
    // We start with closeWasClean true to avoid the visibility change
    // logic from connecting if the socket was never connected in the first place.
    // transportConnect sets it to false on open.
    /** @type{boolean} */
    this.closeWasClean = true
    /** @type{BinaryType} */
    this.binaryType = opts.binaryType || "arraybuffer"
    // the connection over the current transport instance, see Connection
    /** @type{Connection | null} */
    this.connection = null
    // changes whenever we connect, disconnect or replace the transport, for the code that needs
    // to know whether that happened while there was no connection, see replaceTransport
    /** @type{number} */
    this.connectClock = 1
    // the connection created when the page was shown, see handleVisibilityChange
    /** @type{Connection | null} */
    this.visibilityConnection = null
    /** @type{Encode<void>} */
    this.encode = undefined
    /** @type{Decode<void>} */
    this.decode = undefined
    if(this.transport !== LongPoll){
      this.encode = opts.encode || this.defaultEncoder
      this.decode = opts.decode || this.defaultDecoder
    } else {
      this.encode = this.defaultEncoder
      this.decode = this.defaultDecoder
    }
    /** @type{number | null} */
    let awaitingConnectionOnPageShow = null
    if(phxWindow && phxWindow.addEventListener){
      phxWindow.addEventListener("pagehide", _e => {
        // an ended connection only finishes closing, e.g. after disconnect
        if(this.connection && !this.connection.ended){
          this.disconnect()
          awaitingConnectionOnPageShow = this.connectClock
        }
      })
      phxWindow.addEventListener("pageshow", _e => {
        if(awaitingConnectionOnPageShow === this.connectClock){
          awaitingConnectionOnPageShow = null
          this.connect()
        }
      })
      phxWindow.addEventListener("visibilitychange", () => {
        this.handleVisibilityChange()
      })
      // Chrome 149 started to not reliably fire visibilitychange after resume,
      // see https://issues.chromium.org/issues/547062449.
      phxWindow.document && phxWindow.document.addEventListener("resume", () => {
        this.handleVisibilityChange()
      })
    }
    /** @type{number} */
    this.heartbeatIntervalMs = opts.heartbeatIntervalMs || 30000
    /** @type{boolean} */
    this.autoSendHeartbeat = opts.autoSendHeartbeat ?? true
    /** @type{HeartbeatCallback} */
    this.heartbeatCallback = opts.heartbeatCallback ?? (() => {})
    /** @type{(tries: number) => number} */
    this.rejoinAfterMs = (tries) => {
      if(opts.rejoinAfterMs){
        return opts.rejoinAfterMs(tries)
      } else {
        return [1000, 2000, 5000][tries - 1] || 10000
      }
    }
    /** @type{(tries: number) => number} */
    this.reconnectAfterMs = (tries) => {
      if(opts.reconnectAfterMs){
        return opts.reconnectAfterMs(tries)
      } else {
        return [10, 50, 100, 150, 200, 250, 500, 1000, 2000][tries - 1] || 5000
      }
    }
    /** @type{boolean} */
    this.reconnectWhenHidden = opts.reconnectWhenHidden || false
    /** @type{((kind: string, msg: string, data: any) => void) | null} */
    this.logger = opts.logger || null
    if(!this.logger && opts.debug){
      this.logger = (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
    }
    /** @type{number} */
    this.longpollerTimeout = opts.longpollerTimeout || 20000
    /** @type{() => Params} */
    this.params = closure(opts.params || {})
    /** @type{string} */
    this.endPoint = `${endPoint}/${TRANSPORTS.websocket}`
    /** @type{Vsn} */
    this.vsn = opts.vsn || DEFAULT_VSN
    /** @type{ReturnType<typeof setTimeout>} */
    this.heartbeatTimeoutTimer = null
    /** @type{ReturnType<typeof setTimeout>} */
    this.heartbeatTimer = null
    /** @type{number | null} */
    this.heartbeatSentAt = null
    /** @type{?string} */
    this.pendingHeartbeatRef = null
    /** @type{Timer} */
    this.reconnectTimer = new Timer(() => {
      // handleVisibilityChange reconnects once the page is visible again
      if(this.pageHidden && !this.reconnectWhenHidden){
        this.log("Not reconnecting as page is hidden!")
        this.teardown()
        return
      }
      this.teardownAndReconnect(async () => {
        if(opts.beforeReconnect) await opts.beforeReconnect()
        this.connect()
      })
    }, this.reconnectAfterMs)
    /** @type{(() => string) | undefined} */
    this.authToken = opts.authToken && closure(opts.authToken)
  }

  /**
   * The transport instance of the current connection, for example a WebSocket
   * @type{InstanceType<SocketTransport> | null}
   */
  get conn(){ return this.connection && this.connection.transport }

  /**
   * @internal
   */
  get pageHidden(){
    return phxWindow && phxWindow.document ? phxWindow.document.visibilityState === "hidden" : false
  }

  /**
   * @internal
   */
  handleVisibilityChange(){
    if(this.pageHidden){
      this.visibilityConnection = null
      return
    }
    // resume and visibilitychange can both fire when the page is shown again, so we keep
    // the connection created for the first one while it is still connecting
    const connection = this.connection
    if(connection && connection === this.visibilityConnection && connection.isConnecting()){ return }
    // reconnect immediately
    if(!this.isConnected() && !this.closeWasClean){
      // a reconnect that was scheduled before would tear down the connection we create here
      this.reconnectTimer.reset()
      this.teardownAndReconnect(() => {
        this.connect()
        this.visibilityConnection = this.connection
      })
    }
  }

  /**
   * Returns the LongPoll transport reference
   */
  getLongPollTransport(){ return LongPoll }

  /**
   * Disconnects and replaces the active transport
   *
   * @param {SocketTransport} newTransport - The new transport class to instantiate
   *
   */
  replaceTransport(newTransport){
    const connectClock = ++this.connectClock
    this.closeWasClean = true
    clearTimeout(this.fallbackTimer)
    this.reconnectTimer.reset()
    // replaced first, as channel error callbacks below can already connect again
    this.transport = newTransport
    const connection = this.connection
    if(connection){
      const wasOpen = connection.isOpen()
      // the old transport closes asynchronously, but its events no longer concern us
      this.connection = null
      connection.ended = true
      connection.close()
      this.clearHeartbeats()
      // any in-flight pushes on the old connection are lost, so channels need to rejoin
      if(wasOpen){ this.triggerChanError("connection_closed", connection) }
    }
    return connectClock
  }

  /**
   * Returns the socket protocol
   *
   * @returns {"wss" | "ws"}
   */
  protocol(){ return location.protocol.match(/^https/) ? "wss" : "ws" }

  /**
   * The fully qualified socket url
   *
   * @returns {string}
   */
  endPointURL(){
    let uri = Ajax.appendParams(
      Ajax.appendParams(this.endPoint, this.params()), {vsn: this.vsn})
    if(uri.charAt(0) !== "/"){ return uri }
    if(uri.charAt(1) === "/"){ return `${this.protocol()}:${uri}` }

    return `${this.protocol()}://${location.host}${uri}`
  }

  /**
   * Disconnects the socket
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes for valid status codes.
   *
   * @param {() => void} [callback] - Optional callback which is called after socket is disconnected.
   * @param {number} [code] - A status code for disconnection (Optional).
   * @param {string} [reason] - A textual description of the reason to disconnect. (Optional)
   */
  disconnect(callback, code, reason){
    this.connectClock++
    this.closeWasClean = true
    clearTimeout(this.fallbackTimer)
    this.reconnectTimer.reset()
    // connecting again creates a new connection right away instead of waiting for this one to close
    if(this.connection){ this.connection.ended = true }
    this.teardown(callback, code, reason)
  }

  /**
   * @param {Params} [params] - [DEPRECATED] The params to send when connecting, for example `{user_id: userToken}`
   *
   * Passing params to connect is deprecated; pass them in the Socket constructor instead:
   * `new Socket("/socket", {params: {user_id: userToken}})`.
   */
  connect(params){
    if(params){
      console && console.log("passing params to connect is deprecated. Instead pass :params to the Socket constructor")
      this.params = closure(params)
    }
    // the current connection is kept, including while it reconnects, until the socket is done with it
    if(this.connection && !this.connection.ended){ return }
    if(this.longPollFallbackMs && this.transport !== LongPoll){
      this.connectWithFallback(LongPoll, this.longPollFallbackMs)
    } else {
      this.transportConnect()
    }
  }

  /**
   * Logs the message. Override `this.logger` for specialized logging. noops by default
   * @param {string} kind
   * @param {string} msg
   * @param {Object} data
   */
  log(kind, msg, data){ this.logger && this.logger(kind, msg, data) }

  /**
   * Returns true if a logger has been set on this socket.
   */
  hasLogger(){ return this.logger !== null }

  /**
   * Registers callbacks for connection open events
   *
   * @example socket.onOpen(function(){ console.info("the socket was opened") })
   *
   * @param {SocketOnOpen} callback
   */
  onOpen(callback){
    let ref = this.makeRef()
    this.stateChangeCallbacks.open.push([ref, callback])
    return ref
  }

  /**
   * Registers callbacks for connection close events
   * @param {SocketOnClose} callback
   * @returns {string}
   */
  onClose(callback){
    let ref = this.makeRef()
    this.stateChangeCallbacks.close.push([ref, callback])
    return ref
  }

  /**
   * Registers callbacks for connection error events
   *
   * @example socket.onError(function(error){ alert("An error occurred") })
   *
   * @param {SocketOnError} callback
   * @returns {string}
   */
  onError(callback){
    let ref = this.makeRef()
    this.stateChangeCallbacks.error.push([ref, callback])
    return ref
  }

  /**
   * Registers callbacks for connection message events
   * @param {SocketOnMessage} callback
   * @returns {string}
   */
  onMessage(callback){
    let ref = this.makeRef()
    this.stateChangeCallbacks.message.push([ref, callback])
    return ref
  }

  /**
   * Sets a callback that receives lifecycle events for internal heartbeat messages.
   * Useful for instrumenting connection health (e.g. sent/ok/timeout/disconnected).
   * @param {HeartbeatCallback} callback
   */
  onHeartbeat(callback){
    this.heartbeatCallback = callback
  }

  /**
   * Pings the server and invokes the callback with the RTT in milliseconds
   * @param {(timeDelta: number) => void} callback
   *
   * Returns true if the ping was pushed or false if unable to be pushed.
   */
  ping(callback){
    if(!this.isConnected()){ return false }
    let ref = this.makeRef()
    let startTime = Date.now()
    this.connection.pings.set(ref, () => callback(Date.now() - startTime))
    this.push({topic: "phoenix", event: "heartbeat", payload: {}, ref: ref})
    return true
  }

  /**
   * @private
   *
   * @param {Function}
   */
  transportName(transport){
    // JavaScript minification, enabled by default in production in Phoenix
    // projects, renames symbols to reduce code size.
    // See https://esbuild.github.io/api/#keep-names.
    // This helper ensures we return the correct name for the LongPoll transport
    // even after minification. The other common transport is WebSocket, which
    // is native to browsers and does not need special handling.
    switch(transport){
      case LongPoll: return "LongPoll"
      default: return transport.name
    }
  }

  /**
   * @private
   */
  transportConnect(){
    const previous = this.connection
    this.connectClock++
    this.closeWasClean = false
    // a reconnect scheduled before would tear down the new connection, but we keep
    // its tries, which only reset once a connection opens
    clearTimeout(this.reconnectTimer.timer)
    let protocols = undefined
    // Sec-WebSocket-Protocol based token
    // (longpoll uses Authorization header instead)
    if(this.authToken){
      protocols = ["phoenix", `${AUTH_TOKEN_PREFIX}${btoa(this.authToken()).replace(/=/g, "")}`]
    }
    const transport = new this.transport(this.endPointURL(), protocols)
    transport.binaryType = this.binaryType
    transport.timeout = this.longpollerTimeout
    this.connection = new Connection(this, transport)
    // connect can replace an ended connection that is still open while its buffer drains, but the
    // channels joined over it need to rejoin on the new connection instead of waiting for it to close
    if(previous && previous.isOpen()){ this.triggerChanError("connection_closed", previous) }
  }

  getSession(key){ return this.sessionStore && this.sessionStore.getItem(key) }

  storeSession(key, val){ this.sessionStore && this.sessionStore.setItem(key, val) }

  connectWithFallback(fallbackTransport, fallbackThreshold = 2500){
    // the callbacks of a previous attempt must not act on this one, e.g. an attempt
    // that never opened would otherwise fall back again on the next error
    this.cancelFallback()
    let established = false
    let primaryTransport = true
    let errorRef
    let connectClock
    const isCurrent = () => connectClock === this.connectClock && !this.closeWasClean
    let fallbackTransportName = this.transportName(fallbackTransport)
    // the fallback timer is cleared whenever the attempt ends, and the callbacks below
    // only fall back while the attempt is current
    let fallback = (reason) => {
      this.log("transport", `falling back to ${fallbackTransportName}...`, reason)
      // the open callback stays registered to remember the fallback once it connects
      this.off([errorRef])
      primaryTransport = false
      const replaceClock = this.replaceTransport(fallbackTransport)
      if(replaceClock !== this.connectClock){ return }
      this.transportConnect()
    }
    if(this.getSession(`phx:fallback:${fallbackTransportName}`)){ return fallback("memorized") }

    this.fallbackTimer = setTimeout(fallback, fallbackThreshold)

    errorRef = this.fallbackErrorRef = this.onError(reason => {
      if(!isCurrent()){ return }
      this.log("transport", "error", reason)
      if(primaryTransport && !established){
        clearTimeout(this.fallbackTimer)
        fallback(reason)
      }
    })
    this.fallbackRef = this.onOpen(() => {
      if(!primaryTransport){
        // reconnects keep using the fallback transport, so a later successful connection
        // must still be remembered, unless an earlier callback disconnected it
        if(this.transport !== fallbackTransport || this.closeWasClean){ return }
        let fallbackTransportName = this.transportName(fallbackTransport)
        // only memorize LP if we never connected to primary
        if(!this.primaryPassedHealthCheck){ this.storeSession(`phx:fallback:${fallbackTransportName}`, "true") }
        return this.log("transport", `established ${fallbackTransportName} fallback`)
      }
      if(!isCurrent()){ return }
      established = true
      // the health check went out when the connection opened, so give the fallback a new period for its reply
      clearTimeout(this.fallbackTimer)
      this.fallbackTimer = setTimeout(fallback, fallbackThreshold)
    })
    // onConnOpen sends the health check before it flushes the send buffer. The transport process
    // blocks in Channel.Server.join until the join returns, so a ping sent after a buffered join
    // is only answered once the join is, and a slow join would fall back on a socket that is fine.
    this.fallbackHealthCheck = () => {
      if(!isCurrent()){ return }
      this.ping(rtt => {
        this.log("transport", "connected to primary after", rtt)
        this.primaryPassedHealthCheck = true
        clearTimeout(this.fallbackTimer)
      })
    }
    this.transportConnect()
    connectClock = this.connectClock
  }

  /**
   * @private
   *
   * Stops the fallback of the current connection attempt, see connectWithFallback
   */
  cancelFallback(){
    clearTimeout(this.fallbackTimer)
    this.off([this.fallbackRef, this.fallbackErrorRef])
    this.fallbackHealthCheck = null
  }

  clearHeartbeats(){
    clearTimeout(this.heartbeatTimer)
    clearTimeout(this.heartbeatTimeoutTimer)
    // a late reply to the pending heartbeat must not start the heartbeats again
    this.pendingHeartbeatRef = null
  }

  onConnOpen(){
    if(this.hasLogger()) this.log("transport", `connected to ${this.endPointURL()}`)
    this.closeWasClean = false
    this.establishedConnections++
    // the health check has to leave before the buffered joins, see connectWithFallback
    if(this.fallbackHealthCheck){ this.fallbackHealthCheck() }
    this.flushSendBuffer()
    this.reconnectTimer.reset()
    if(this.autoSendHeartbeat){
      this.resetHeartbeat()
    }
    this.triggerStateCallbacks("open")
  }

  /**
   * @private
   */

  heartbeatTimeout(){
    if(this.pendingHeartbeatRef){
      const connection = this.connection
      this.pendingHeartbeatRef = null
      this.heartbeatSentAt = null
      if(this.hasLogger()){ this.log("transport", "heartbeat timeout. Attempting to re-establish connection") }
      try {
        this.heartbeatCallback("timeout")
      } catch (e){
        this.log("error", "error in heartbeat callback", e)
      }
      this.closeWasClean = false
      // the connection is presumed dead, so we close it right away instead of waiting for its
      // buffer to drain, which also ensures that it is no longer considered connected when the
      // channels error (LiveView would report a server error otherwise)
      if(connection){ connection.close(WS_CLOSE_NORMAL, "heartbeat timeout") }
      // some transports emit their close event synchronously, and callbacks of it as well as
      // channel error callbacks can disconnect or connect, which takes precedence over reconnecting
      if(!this.stillUses(connection)){ return }
      this.triggerChanError("heartbeat_timeout")
      if(!this.stillUses(connection)){ return }
      this.teardownAndReconnect(() => this.reconnectTimer.scheduleTimeout())
    }
  }

  resetHeartbeat(){
    if(this.conn && this.conn.skipHeartbeat){ return }
    this.clearHeartbeats()
    this.heartbeatTimer = setTimeout(() => this.sendHeartbeat(), this.heartbeatIntervalMs)
  }

  /**
   * @private
   *
   * Tears down the current connection to reconnect afterwards, unless the socket was
   * disconnected or connected again in the meantime, which takes precedence.
   */
  teardownAndReconnect(reconnect){
    const connection = this.connection
    const connectClock = this.connectClock
    this.teardown(() => {
      // the socket was disconnected or connected again in the meantime, which the connection does not
      // tell once an overlapping teardown gave up on it
      if(connectClock !== this.connectClock || (connection && connection.ended)){ return }
      reconnect()
    })
  }

  /**
   * @private
   *
   * Whether the socket still uses the connection and did not give up on it. User callbacks
   * can disconnect or connect, so code continuing after them checks this first.
   */
  stillUses(connection){
    return this.connection === connection && !(connection && connection.ended)
  }

  teardown(callback, code, reason){
    // If someone calls connect before we finish tearing down,
    // we create a new connection, but we still want to finish tearing down the old one.
    const connection = this.connection
    if(!connection){
      return callback && callback()
    }
    // onConnClose is not called when the close event arrives late, so we stop the
    // heartbeats here, as a heartbeat timeout would otherwise reconnect the socket
    this.clearHeartbeats()

    this.waitForBufferDone(connection.transport, () => {
      // a connection we already closed, e.g. on a heartbeat timeout or in an
      // overlapping teardown, also errored its channels already
      if(!connection.closing){
        const wasOpened = !connection.isConnecting()
        connection.close(code, reason)
        // channels joined over this connection need to rejoin on the next one, but we cannot rely
        // on onConnClose for that, as the close event may arrive after we stopped waiting for it
        // or after a new connection already replaced this one
        if(wasOpened){ this.triggerChanError("connection_closed", connection) }
      }

      this.waitForSocketClosed(connection.transport, () => {
        if(this.connection === connection){ this.connection = null }
        callback && callback()
      })
    })
  }

  waitForBufferDone(conn, callback, tries = 1){
    // there is no point in waiting for a conn that is already closing
    if(tries === 5 || !conn.bufferedAmount || conn.readyState !== SOCKET_STATES.open){
      callback()
      return
    }

    setTimeout(() => {
      this.waitForBufferDone(conn, callback, tries + 1)
    }, 150 * tries)
  }

  waitForSocketClosed(conn, callback, tries = 1){
    if(tries === 5 || conn.readyState === SOCKET_STATES.closed){
      callback()
      return
    }

    setTimeout(() => {
      this.waitForSocketClosed(conn, callback, tries + 1)
    }, 150 * tries)
  }

  /**
  * @param {CloseEvent} event
  */
  onConnClose(event){
    const connection = this.connection
    if(this.hasLogger()) this.log("transport", "close", event)
    this.clearHeartbeats()
    // we only close a connection to disconnect or to reconnect, which the code closing it takes
    // care of, so its close event only confirms our close. Any other close is reconnected, whatever
    // its code, as the server, proxies and load balancers also close with 1000 (normal closure)
    const closedByUs = !!(connection && connection.closing)
    // channel callbacks may disconnect or create a new connection, so finish cleaning up
    // this connection first and do not schedule a reconnect for its replacement
    this.triggerChanError("connection_closed", connection, event)
    if(this.stillUses(connection) && !closedByUs && !this.closeWasClean){
      this.reconnectTimer.scheduleTimeout()
    }
    this.triggerStateCallbacks("close", event)
  }

  /**
   * @private
   * @param {Event} error
   */
  onConnError(error){
    const connection = this.connection
    if(this.hasLogger()) this.log("transport", "error", error)
    let transportBefore = this.transport
    let establishedBefore = this.establishedConnections
    this.triggerStateCallbacks("error", error, transportBefore, establishedBefore)
    // callbacks can replace the connection, in which case only its own joins are errored
    this.triggerChanError("connection_error", connection, error)
  }

  /**
   * @private
   *
   * Errors the channels, as they need to rejoin once the given connection stopped being open.
   *
   * Channel error listeners receive `{source: "transport", reason}`, plus `event` with the
   * underlying close/error event when there is one.
   *
   * @param {string} reason
   * @param {Connection | null} [connection]
   * @param {unknown} [event] underlying close/error event forwarded to channel error listeners
   */
  triggerChanError(reason, connection = this.connection, event = undefined){
    // several places notice that a connection stopped being open (onConnError, onConnClose,
    // teardown and heartbeatTimeout). After the first, only channels whose join it carried
    // are errored, as error callbacks may have joined channels that join over another connection.
    let erroredBefore = false
    if(connection && !connection.isOpen()){
      erroredBefore = connection.channelsErrored
      connection.channelsErrored = true
    }
    const payload = event === undefined ? {source: "transport", reason} : {source: "transport", reason, event}
    const joins = this.channels.map(channel => [channel, channel.joinRef()])
    joins.forEach(([channel, joinRef]) => {
      // an earlier error callback can rejoin a later channel, so check its join
      // again immediately before dispatching rather than filtering the list first
      if(channel.joinRef() !== joinRef){ return }
      // the joins of a replaced connection are not the only ones anymore
      if(connection && (erroredBefore || !connection.isCurrent()) && !connection.carried(channel, joinRef)){ return }
      if(!(channel.isErrored() || channel.isLeaving() || channel.isClosed())){
        channel.trigger(CHANNEL_EVENTS.error, payload)
      }
    })
  }

  /**
   * @returns {string}
   */
  connectionState(){
    switch(this.conn && this.conn.readyState){
      case SOCKET_STATES.connecting: return "connecting"
      case SOCKET_STATES.open: return "open"
      case SOCKET_STATES.closing: return "closing"
      default: return "closed"
    }
  }

  /**
   * @returns {boolean}
   */
  isConnected(){ return this.connectionState() === "open" }

  /**
   *
   * @param {Channel} channel
   */
  remove(channel){
    this.off(channel.stateChangeRefs)
    this.channels = this.channels.filter(c => c !== channel)
  }

  /**
   * Removes `onOpen`, `onClose`, `onError,` and `onMessage` registrations.
   *
   * @param {string[]} refs - list of refs returned by calls to
   *                 `onOpen`, `onClose`, `onError,` and `onMessage`
   */
  off(refs){
    for(let key in this.stateChangeCallbacks){
      this.stateChangeCallbacks[key] = this.stateChangeCallbacks[key].filter(([ref]) => {
        return refs.indexOf(ref) === -1
      })
    }
  }

  /**
   * Initiates a new channel for the given topic
   *
   * @param {string} topic
   * @param {Params | (() => Params)} [chanParams]- Parameters for the channel
   * @returns {Channel}
   */
  channel(topic, chanParams = {}){
    let chan = new Channel(topic, chanParams, this)
    this.channels.push(chan)
    return chan
  }

  /**
   * @param {Message<Record<string, any>>} data
   * @param {Channel} [channel] - The channel the push belongs to, if any
   */
  push(data, channel){
    if(this.hasLogger()){
      let {topic, event, payload, ref, join_ref} = data
      this.log("push", `${topic} ${event} (${join_ref}, ${ref})`, payload)
    }

    if(this.isConnected()){
      this.send(data, channel)
    } else {
      this.sendBuffer.push(() => {
        // the channel may have errored or left while the push was buffered, e.g. when the
        // connection failed before opening, in which case its rejoin supersedes the buffered join
        if(!this.isOutdated(data, channel)){ this.send(data, channel) }
      })
    }
  }

  /**
   * @private
   */
  send(data, channel){
    const connection = this.connection
    // the join counts as carried by this connection while it is still encoded, so that the
    // channel rejoins when the connection is torn down before the encoding finished
    if(channel && data.event === CHANNEL_EVENTS.join){ connection.joins.set(channel, data.join_ref) }
    this.encode(data, result => {
      // let encodes finish while this connection drains, but never send on a
      // replacement or after the original connection has started closing
      if(!connection.isCurrent() || !connection.isOpen()){ return }
      // a leave still needs to reach the server after its channel was removed locally
      if(data.event !== CHANNEL_EVENTS.leave && this.isOutdated(data, channel)){ return }
      connection.transport.send(result)
    })
  }

  /**
   * @private
   *
   * Whether the push was made for an earlier join of its channel, or the channel left since.
   */
  isOutdated(data, channel){
    return !!channel && (data.join_ref !== channel.joinRef() || channel.isClosed())
  }

  /**
   * Return the next message ref, accounting for overflows
   * @returns {string}
   */
  makeRef(){
    let newRef = this.ref + 1
    if(newRef === this.ref){ this.ref = 0 } else { this.ref = newRef }

    return this.ref.toString()
  }

  sendHeartbeat(){
    if(!this.isConnected()){
      try {
        this.heartbeatCallback("disconnected")
      } catch (e){
        this.log("error", "error in heartbeat callback", e)
      }
      return
    }
    if(this.pendingHeartbeatRef){
      this.heartbeatTimeout()
      return
    }
    this.pendingHeartbeatRef = this.makeRef()
    this.heartbeatSentAt = Date.now()
    this.push({topic: "phoenix", event: "heartbeat", payload: {}, ref: this.pendingHeartbeatRef})
    try {
      this.heartbeatCallback("sent")
    } catch (e){
      this.log("error", "error in heartbeat callback", e)
    }
    this.heartbeatTimeoutTimer = setTimeout(() => this.heartbeatTimeout(), this.heartbeatIntervalMs)
  }

  flushSendBuffer(){
    if(this.isConnected() && this.sendBuffer.length > 0){
      this.sendBuffer.forEach(callback => callback())
      this.sendBuffer = []
    }
  }

  /**
  * @param {MessageEvent<any>} rawMessage
  */
  onConnMessage(rawMessage){
    const connection = this.connection
    const wasOpen = connection && connection.isOpen()
    this.decode(rawMessage.data, msg => {
      // the transport event can be current even though its asynchronous decode is not, as the
      // connection may have been replaced or closed in the meantime (browsers also drop messages
      // that arrive once a WebSocket is closing)
      if(connection !== this.connection || (wasOpen && !connection.isOpen())){ return }
      let {topic, event, payload, ref, join_ref} = msg
      if(ref && ref === this.pendingHeartbeatRef){
        const latency = this.heartbeatSentAt ? Date.now() - this.heartbeatSentAt : undefined
        this.clearHeartbeats()
        try {
          this.heartbeatCallback(payload.status === "ok" ? "ok" : "error", latency)
        } catch (e){
          this.log("error", "error in heartbeat callback", e)
        }
        this.heartbeatSentAt = null
        if(this.autoSendHeartbeat){
          this.heartbeatTimer = setTimeout(() => this.sendHeartbeat(), this.heartbeatIntervalMs)
        }
      }

      if(this.hasLogger()) this.log("receive", `${payload.status || ""} ${topic} ${event} ${ref && "(" + ref + ")" || ""}`.trim(), payload)

      // removing a channel or callback while dispatching replaces the list instead of
      // changing it, so we iterate over the lists from before to not skip any of them
      const channels = this.channels
      for(let i = 0; i < channels.length; i++){
        const channel = channels[i]
        if(!channel.isMember(topic, event, payload, join_ref)){ continue }
        channel.trigger(event, payload, ref, join_ref)
      }

      this.triggerStateCallbacks("message", msg)

      const ping = ref && connection.pings.get(ref)
      if(ping){
        connection.pings.delete(ref)
        ping()
      }
    })
  }

  /**
   * @private
   * @template {keyof SocketStateChangeCallbacks} K
   * @param {K} event
   * @param {...Parameters<SocketStateChangeCallbacks[K][number][1]>} args
   * @returns {void}
   */
  triggerStateCallbacks(event, ...args){
    try {
      this.stateChangeCallbacks[event].forEach(([_, callback]) => {
        try {
          callback(...args)
        } catch (e){
          this.log("error", `error in ${event} callback`, e)
        }
      })
    } catch (e){
      this.log("error", `error triggering ${event} callbacks`, e)
    }
  }

  leaveOpenTopic(topic){
    let dupChannel = this.channels.find(c => c.topic === topic && (c.isJoined() || c.isJoining()))
    if(dupChannel){
      if(this.hasLogger()) this.log("transport", `leaving duplicate topic "${topic}"`)
      dupChannel.leave()
    }
  }
}
