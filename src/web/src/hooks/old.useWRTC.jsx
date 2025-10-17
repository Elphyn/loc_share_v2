import { useCallback, useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";

export function useWRTC(socket, localID) {
  const peerRef = useRef(null)
  const [connection, setConnection] = useState("Disconnected")

  useEffect(() => {
    if (!socket) return
    const handleOfffer = ({ from, data }) => {
      setConnection("Connecting")
      console.log(`Got offer from: ${from}, offer: ${data}`)

      if (!peerRef.current) peerRef.current = new SimplePeer({ initiator: false, trickle: false })

      let peer = peerRef.current

      peer.signal(data)

      peer.on('signal', answer => {
        const message = {
          from: localID,
          to: from,
          data: answer
        }
        socket.emit('signal', message)
      })

      peer.on("connect", () => {
        console.log("P2P is connected!")
        setConnection("Connected")
      })

    }
    socket.on('signal', handleOfffer)

    return () => {
      socket.off('signal', handleOfffer)
    }
  }, [socket])

  const connect = useCallback((to) => {
    setConnection("Connecting")
    console.log(`Called connect, trying to signal: ${to}`)
    const peer = new SimplePeer({ initiator: true, trickle: false })
    peerRef.current = peer

    peer.on('signal', offer => {
      const message = {
        from: localID,
        to: to,
        data: offer
      }
      console.log("Message before sending: ", message)
      socket.emit('signal', message)
    })

  }, [socket, localID])

  return { connect, connection }
}
