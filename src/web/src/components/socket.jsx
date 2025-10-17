import { useCallback } from "react"
import { useWRTCContext } from "../contexts/useWRTCContext"

export function Socket({ socketID }) {
  const { connect } = useWRTCContext()

  const handleClick = useCallback(() => {
    connect(socketID)
  }, [connect, socketID])


  return (
    <button onClick={handleClick}>Connect to {socketID}</button>
  )
}

