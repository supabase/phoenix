import {describe, expect, it} from "@jest/globals"
import {Socket} from "../js/phoenix"

describe("worker heartbeat reconnect", () => {
  it("clears stale heartbeat state when automatic heartbeats are disabled", () => {
    const socket = new Socket("/socket", {autoSendHeartbeat: false})

    socket.pendingHeartbeatRef = "stale-ref"
    socket.heartbeatSentAt = 123

    socket.onConnOpen()

    expect(socket.pendingHeartbeatRef).toBe(null)
    expect(socket.heartbeatSentAt).toBe(null)
    expect(socket.heartbeatTimer).toBe(null)
  })
})
