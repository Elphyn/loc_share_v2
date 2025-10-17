import { useState, useCallback, useEffect, useRef } from "react"
import SimplePeer from "simple-peer"

export function useWRTC(socket, localID) {
  const peerRef = useRef(null)
  const [connectionState, setConnectionState] = useState("Disconnected")

  // Handle incoming signals
  useEffect(() => {
    if (!socket) return
    console.log("Attaching socket listener for signaling")

    const handleSignal = ({ from, data }) => {
      let peer = peerRef.current

      if (!peer) {
        console.log("No current peer, creating new (initiator: false)")
        peer = new SimplePeer({ initiator: false, trickle: false })
        peerRef.current = peer

        peer.on('signal', answer => {
          socket.emit('signal', {
            from: localID,
            to: from,
            data: answer
          })
        })

        peer.on('connect', () => {
          console.log("Connected (non-initiator)")
          setConnectionState("Connected")
        })

        peer.on('close', () => {
          console.log("Peer closed")
          peerRef.current = null
          setConnectionState("Disconnected")
        })
      }

      console.log("Signaling data received")
      peer.signal(data)
    }

    socket.on('signal', handleSignal)
    return () => socket.off('signal', handleSignal)
  }, [socket, localID])

  // Initiate connection
  const connect = useCallback((to) => {
    if (peerRef.current) throw new Error("Already have a peer!")

    console.log("Creating peer as initiator")
    const peer = new SimplePeer({ initiator: true, trickle: false })
    peerRef.current = peer
    setConnectionState("Connecting")

    peer.on('signal', offer => {
      console.log("Sending offer")
      socket.emit('signal', {
        from: localID,
        to,
        data: offer
      })
    })

    peer.on('connect', () => {
      console.log("Connected (initiator)")
      setConnectionState("Connected")
    })

    peer.on('close', () => {
      console.log("Peer closed")
      peerRef.current = null
      setConnectionState("Disconnected")
    })
  }, [socket, localID])

  return { connect, connectionState }
}
